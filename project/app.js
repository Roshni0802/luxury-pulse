// ── CONSTANTS ─────────────────────────────────────────────────
const DATA   = {};
const CFG    = { responsive: true, displayModeBar: false };
const GOLD   = '#c9a84c';
const GOLD2  = '#8a6f2e';
const CREAM  = '#f0ead8';
const COLORS = ['#c9a84c','#7eb8c9','#c97a84','#84c99a','#c9b07a','#9a84c9','#7ac9c0','#c9c084'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── PLOTLY BASE LAYOUT ────────────────────────────────────────
function baseLayout(overrides = {}) {
  return Object.assign({
    paper_bgcolor: 'transparent',
    plot_bgcolor:  'transparent',
    font:   { family: 'DM Sans, sans-serif', color: '#777', size: 11 },
    margin: { t: 15, r: 20, b: 40, l: 65 },
    xaxis:  { gridcolor: '#1e1e1e', linecolor: '#272727', tickfont: { color: '#555' }, zeroline: false },
    yaxis:  { gridcolor: '#1e1e1e', linecolor: '#272727', tickfont: { color: '#555' }, zeroline: false },
    legend: { bgcolor: 'transparent', font: { color: '#777', size: 10 } },
    colorway: COLORS,
  }, overrides);
}

// ── HELPERS ───────────────────────────────────────────────────
async function loadJSON(filename) {
  try {
    const res = await fetch(`data/${filename}`);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch(e) {
    console.warn(`Cannot load ${filename}:`, e.message);
    return [];
  }
}

function fmt(n, pre = '$') {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1e6) return pre + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return pre + (n / 1e3).toFixed(1) + 'K';
  return pre + Math.round(n).toLocaleString();
}

function kpi(label, val, unit = '') {
  return `<div class="kpi-card">
    <div class="kpi-label">${label}</div>
    <div class="kpi-value">${val}<span class="kpi-unit">${unit}</span></div>
  </div>`;
}

function ins(icon, html) {
  return `<div class="insight">
    <div class="insight-icon">${icon}</div>
    <div class="insight-text">${html}</div>
  </div>`;
}

function grp(arr, key, aggs) {
  const map = {};
  arr.forEach(r => {
    const k = r[key];
    if (!k) return;
    if (!map[k]) map[k] = { [key]: k, _r: [] };
    map[k]._r.push(r);
  });
  return Object.values(map).map(g => {
    const out = { [key]: g[key] };
    Object.entries(aggs).forEach(([f, fn]) => {
      const v = g._r.map(r => parseFloat(r[f])).filter(v => !isNaN(v));
      out[f] = fn === 'sum'   ? v.reduce((a, b) => a + b, 0)
             : fn === 'mean'  ? v.reduce((a, b) => a + b, 0) / (v.length || 1)
             : fn === 'count' ? g._r.length
             : fn === 'max'   ? Math.max(...v)
             : fn === 'min'   ? Math.min(...v)
             : 0;
    });
    return out;
  });
}

function filt(arr, f = {}) {
  return arr.filter(r => {
    if (f.year     && f.year     !== 'all' && String(r.year)   !== String(f.year))   return false;
    if (f.payment  && f.payment  !== 'all' && r.payment_type   !== f.payment)         return false;
    if (f.tier     && f.tier     !== 'all' && r.price_tier     !== f.tier)            return false;
    if (f.platform && f.platform !== 'all' && r.platform       !== f.platform)        return false;
    return true;
  });
}

// ── LOAD ALL DATA ─────────────────────────────────────────────
async function loadAll() {
  document.getElementById('data-status').textContent = 'Loading...';

  // Load sales and trends first so Page 1 renders immediately
  DATA.sales    = await loadJSON('clean_sales.json');
  DATA.payDat   = await loadJSON('clean_sales_by_payment.json');
  DATA.trends   = await loadJSON('clean_trends.json');
  DATA.trendsYr = await loadJSON('clean_trends_yearly.json');

  // Populate payment filter from real data
  const pays = [...new Set((DATA.sales || []).map(r => r.payment_type).filter(Boolean))].sort();
  const pf = document.getElementById('filter-payment');
  pays.forEach(p => {
    const o = document.createElement('option');
    o.value = p; o.textContent = p;
    pf.appendChild(o);
  });

  // Render Page 1 immediately — don't wait for product data
  const quickTotal = (DATA.sales.length + DATA.trends.length).toLocaleString();
  document.getElementById('data-status').textContent = `${quickTotal} records loaded`;
  renderSales();

  // Load product data in the background
  DATA.nap       = await loadJSON('clean_netaporter.json');
  DATA.napBrands = await loadJSON('clean_netaporter_brands.json');
  DATA.napTiers  = await loadJSON('clean_netaporter_tiers.json');
  DATA.app       = await loadJSON('clean_apparel.json');
  DATA.appCat    = await loadJSON('clean_apparel_by_category.json');
  DATA.appBrnd   = await loadJSON('clean_apparel_by_brand.json');

  const total = [DATA.sales, DATA.nap, DATA.app, DATA.trends]
    .reduce((s, a) => s + (a.length || 0), 0);
  document.getElementById('data-status').textContent = `${total.toLocaleString()} records loaded`;
}

// ── PAGE NAVIGATION ───────────────────────────────────────────
function showPage(tab) {
  const name = tab.dataset.page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  tab.classList.add('active');
  if (name === 'sales')    renderSales();
  if (name === 'products') renderProducts();
  if (name === 'brands')   renderBrands();
  if (name === 'pulse')    renderPulse();
}

// ── PAGE 1: SALES OVERVIEW ────────────────────────────────────
function renderSales() {
  const yr  = document.getElementById('filter-year').value;
  const pay = document.getElementById('filter-payment').value;
  const d   = filt(DATA.sales || [], { year: yr, payment: pay });
  if (!d.length) return;

  const rev  = d.reduce((s, r) => s + (parseFloat(r.order_value_usd) || 0), 0);
  const avgOV = rev / d.length;
  const rs   = d.filter(r => r.review_score).map(r => parseFloat(r.review_score));
  const avgR = rs.reduce((a, b) => a + b, 0) / (rs.length || 1);
  const cats = [...new Set(d.map(r => r.item_purchased).filter(Boolean))].length;

  document.getElementById('kpi-sales').innerHTML =
    kpi('Total Revenue',   fmt(rev),               'USD') +
    kpi('Transactions',    d.length.toLocaleString()     ) +
    kpi('Avg Order Value', fmt(avgOV),             'USD') +
    kpi('Avg Review',      avgR.toFixed(2),        '/ 5') +
    kpi('Categories',      cats,                  'items');

  const topCat = grp(d, 'item_purchased', { order_value_usd: 'sum' }).sort((a, b) => b.order_value_usd - a.order_value_usd)[0];
  const topPay = grp(d, 'payment_type',   { order_value_usd: 'count' }).sort((a, b) => b.order_value_usd - a.order_value_usd)[0];
  const years  = [...new Set(d.map(r => r.year).filter(Boolean))].sort().join(' & ');

  document.getElementById('insight-sales').innerHTML =
    ins('◆', `<strong>${topCat?.item_purchased || '—'}</strong> is the highest revenue category`) +
    ins('◆', `<strong>${topPay?.payment_type   || '—'}</strong> is the most used payment method`) +
    ins('◆', `Avg customer rating: <strong>${avgR.toFixed(1)} / 5</strong> stars`) +
    ins('◆', `Dataset covers years <strong>${years}</strong>`);

  const mon = grp(d, 'month_name', { order_value_usd: 'sum' })
    .sort((a, b) => MONTHS.indexOf(a.month_name) - MONTHS.indexOf(b.month_name));

  Plotly.newPlot('chart-revenue', [{
    x: mon.map(r => r.month_name),
    y: mon.map(r => Math.round(r.order_value_usd)),
    type: 'scatter', mode: 'lines+markers',
    line: { color: GOLD, width: 2.5 }, marker: { color: GOLD, size: 7 },
    fill: 'tozeroy', fillcolor: 'rgba(201,168,76,0.08)',
    hovertemplate: '<b>%{x}</b><br>$%{y:,.0f}<extra></extra>',
  }], baseLayout({ height: 265, margin: { t: 15, r: 15, b: 35, l: 75 } }), CFG);

  const pdat = (DATA.payDat || []).length
    ? DATA.payDat
    : grp(d, 'payment_type', { order_value_usd: 'sum' });

  Plotly.newPlot('chart-payment', [{
    labels: pdat.map(r => r.payment_type),
    values: pdat.map(r => parseFloat(r.total_revenue || r.order_value_usd) || 0),
    type: 'pie', hole: 0.55, marker: { colors: COLORS },
    textinfo: 'label+percent', textfont: { color: '#000', size: 10 },
    hovertemplate: '<b>%{label}</b><br>$%{value:,.0f}<br>%{percent}<extra></extra>',
  }], baseLayout({
    height: 265, margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: false,
    annotations: [{ text: 'Payment<br>Mix', x: 0.5, y: 0.5, showarrow: false,
      font: { size: 11, color: '#555', family: 'DM Sans' } }],
  }), CFG);

  const catData = grp(d, 'item_purchased', { order_value_usd: 'sum' })
    .sort((a, b) => b.order_value_usd - a.order_value_usd).slice(0, 12);

  Plotly.newPlot('chart-categories', [{
    y: catData.map(r => r.item_purchased).reverse(),
    x: catData.map(r => Math.round(r.order_value_usd)).reverse(),
    type: 'bar', orientation: 'h',
    marker: { color: catData.map((_, i) => `rgba(201,168,76,${1 - i * 0.07})`).reverse() },
    hovertemplate: '<b>%{y}</b><br>$%{x:,.0f}<extra></extra>',
  }], baseLayout({ height: 330, margin: { t: 10, r: 15, b: 35, l: 130 },
    xaxis: { tickprefix: '$', gridcolor: '#1e1e1e' } }), CFG);

  const rv   = d.map(r => parseFloat(r.review_score)).filter(v => !isNaN(v));
  const bins = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5.01];
  const bc   = bins.slice(0, -1).map((b, i) => rv.filter(v => v >= b && v < bins[i + 1]).length);

  Plotly.newPlot('chart-reviews', [{
    x: bins.slice(0, -1).map(b => b + 0.25), y: bc,
    type: 'bar', bargap: 0.1,
    marker: { color: bc.map((_, i) => i >= 5 ? GOLD : '#2a2a2a') },
    hovertemplate: 'Score ~%{x:.1f}<br>%{y} reviews<extra></extra>',
  }], baseLayout({ height: 330, margin: { t: 10, r: 15, b: 40, l: 55 },
    xaxis: { title: { text: 'Review Score', font: { size: 10, color: '#555' } } } }), CFG);

  const top5 = grp(d, 'item_purchased', { order_value_usd: 'sum' })
    .sort((a, b) => b.order_value_usd - a.order_value_usd)
    .slice(0, 5).map(r => r.item_purchased);

  const traces = top5.map((cat, ci) => {
    const m = grp(d.filter(r => r.item_purchased === cat), 'month_name', { order_value_usd: 'sum' })
      .sort((a, b) => MONTHS.indexOf(a.month_name) - MONTHS.indexOf(b.month_name));
    return { name: cat, x: m.map(r => r.month_name), y: m.map(r => Math.round(r.order_value_usd)),
      type: 'scatter', mode: 'lines', line: { color: COLORS[ci], width: 2 },
      hovertemplate: `<b>${cat}</b><br>%{x}: $%{y:,.0f}<extra></extra>` };
  });

  Plotly.newPlot('chart-cat-trend', traces, baseLayout({
    height: 265, margin: { t: 10, r: 15, b: 55, l: 75 },
    legend: { orientation: 'h', y: -0.38, font: { size: 10 } },
  }), CFG);
}

// ── PAGE 2: PRODUCT EXPLORER ──────────────────────────────────
function renderProducts() {
  const tier = document.getElementById('filter-tier').value;
  const plat = document.getElementById('filter-platform').value;
  const nap  = filt(DATA.nap || [], { tier, platform: plat });

  const prices = nap.map(r => parseFloat(r.avg_price_usd || r.price_usd)).filter(v => v > 0);
  const avgP   = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
  const inSt   = nap.filter(r => r.availability === 'In Stock').length;
  const brands = [...new Set(nap.map(r => r.brand).filter(Boolean))].length;

  document.getElementById('kpi-products').innerHTML =
    kpi('Products',       nap.length.toLocaleString())      +
    kpi('Unique Brands',  brands)                           +
    kpi('Avg Price',      fmt(avgP),              'USD')    +
    kpi('Max Price',      fmt(Math.max(...prices, 0)), 'USD') +
    kpi('Platforms',      [...new Set(nap.map(r => r.platform).filter(Boolean))].length, 'sources');

  // Price tier donut
  const tierColors = {
    'Entry Luxury': '#4a7a8a',
    'Mid Luxury':   '#7eb8c9',
    'High Luxury':  GOLD2,
    'Ultra Luxury': GOLD,
    'Unknown':      '#2a2a2a',
  };
  const tdat = (DATA.napTiers || []).length ? DATA.napTiers
    : grp(nap, 'price_tier', { avg_price_usd: 'count' });

  Plotly.newPlot('chart-price-tiers', [{
    labels: tdat.map(r => r.price_tier),
    values: tdat.map(r => r.product_count || r.avg_price_usd || 0),
    type: 'pie', hole: 0.5,
    marker: { colors: tdat.map(r => tierColors[r.price_tier] || GOLD) },
    textinfo: 'label+percent', textfont: { size: 10, color: '#000' },
    hovertemplate: '<b>%{label}</b><br>%{value} products<br>%{percent}<extra></extra>',
  }], baseLayout({
    height: 360, margin: { t: 20, r: 20, b: 20, l: 20 }, showlegend: true,
    legend: { font: { color: '#888', size: 10 }, bgcolor: 'transparent',
              orientation: 'v', x: 1, y: 0.5 },
    annotations: [{ text: 'Price<br>Tiers', x: 0.5, y: 0.5, showarrow: false,
      font: { size: 11, color: '#555', family: 'DM Sans' } }],
  }), CFG);

  // Avg price by category
  const byCat = grp(nap.filter(r => r.category && r.category !== 'Unknown'),
    'category', { avg_price_usd: 'mean' })
    .sort((a, b) => b.avg_price_usd - a.avg_price_usd).slice(0, 12);

  Plotly.newPlot('chart-price-by-cat', [{
    y: byCat.map(r => r.category).reverse(),
    x: byCat.map(r => Math.round(r.avg_price_usd)).reverse(),
    type: 'bar', orientation: 'h',
    marker: { color: byCat.map((_, i) => `rgba(201,168,76,${1 - i * 0.07})`).reverse() },
    hovertemplate: '<b>%{y}</b><br>Avg $%{x:,.0f}<extra></extra>',
  }], baseLayout({ height: 360, margin: { t: 10, r: 15, b: 35, l: 150 },
    xaxis: { tickprefix: '$', gridcolor: '#1e1e1e' } }), CFG);

  // Brand bubble chart
  const bdat = (DATA.napBrands || [])
    .filter(r => r.brand !== 'Unknown' && r.product_count >= 2)
    .sort((a, b) => b.avg_price_usd - a.avg_price_usd).slice(0, 25);

  Plotly.newPlot('chart-brand-bubble', [{
    x: bdat.map(r => r.product_count),
    y: bdat.map(r => Math.round(r.avg_price_usd)),
    text: bdat.map(r => r.brand),
    mode: 'markers',
    marker: {
      size:       bdat.map(r => Math.min(Math.sqrt(r.product_count) * 3 + 6, 38)),
      color:      bdat.map(r => r.avg_price_usd),
      colorscale: [[0, '#4a7a8a'], [0.4, '#7eb8c9'], [0.7, GOLD2], [1, GOLD]],
      opacity: 0.9,
      showscale:  true,
      colorbar:   { title: { text: 'Avg Price', font: { size: 9, color: '#555' } },
                    tickfont: { color: '#555', size: 9 }, len: 0.6 },
      line:       { color: '#272727', width: 1 },
    },
    hovertemplate: '<b>%{text}</b><br>Products: %{x}<br>Avg: $%{y:,.0f}<extra></extra>',
  }], baseLayout({ height: 480, margin: { t: 15, r: 120, b: 55, l: 95 },
    xaxis: { title: { text: 'Number of Products', font: { size: 10, color: '#555' } },
             gridcolor: '#1e1e1e' },
    yaxis: { title: { text: 'Avg Price (USD)', font: { size: 10, color: '#555' } },
             tickprefix: '$', gridcolor: '#1e1e1e' },
  }), CFG);

  // Apparel category pie
  const appTop = (DATA.appCat || []).sort((a, b) => (b.item_count || 0) - (a.item_count || 0)).slice(0, 10);

  Plotly.newPlot('chart-apparel-cats', [{
    labels: appTop.map(r => r.category || r.subcategory || 'Other'),
    values: appTop.map(r => r.item_count || 1),
    type: 'pie', hole: 0.4, marker: { colors: [
      GOLD, '#7eb8c9', GOLD2, '#5a9aaa',
      '#a08030', '#6ab0c0', '#b09040', '#4a8a9a',
      '#c9b07a', '#3a7a8a'
    ]},
    textinfo: 'percent', textfont: { size: 10, color: '#fff' },
    hovertemplate: '<b>%{label}</b><br>%{value} items<br>%{percent}<extra></extra>',
  }], baseLayout({
    height: 360, margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: true,
    legend: { font: { color: '#888', size: 10 }, bgcolor: 'transparent',
              orientation: 'v', x: 1.02, y: 0.5 },
  }), CFG);
  // Availability bar — use platform summary from nap data
  const platGroups = grp(nap.filter(r => r.platform), 'platform', { product_count: 'sum', avg_price_usd: 'count' });

  Plotly.newPlot('chart-availability', [{
    x: platGroups.map(r => r.platform),
    y: platGroups.map(r => r.avg_price_usd),
    type: 'bar',
    marker: { color: [GOLD, '#7eb8c9'] },
    text:   platGroups.map(r => r.avg_price_usd),
    textposition: 'inside', textfont: { color: '#000', size: 13, family: 'DM Sans' },
    hovertemplate: '<b>%{x}</b><br>%{y} products<extra></extra>',
  }], baseLayout({ height: 310, margin: { t: 30, r: 15, b: 40, l: 55 },
    yaxis: { title: { text: 'Product Count', font: { size: 10, color: '#555' } } } }), CFG);
}

// ── PAGE 3: BRAND INTELLIGENCE ────────────────────────────────
function renderBrands() {
  const topN   = parseInt(document.getElementById('filter-top-brands').value) || 25;
  const brands = (DATA.napBrands || [])
    .filter(r => r.brand !== 'Unknown' && r.product_count >= 2)
    .sort((a, b) => b.avg_price_usd - a.avg_price_usd);
  const top = brands.slice(0, topN);

  const grandAvg = brands.map(r => r.avg_price_usd).reduce((a, b) => a + b, 0) / (brands.length || 1);
  const topB   = brands[0];
  const mostIt = [...brands].sort((a, b) => b.product_count - a.product_count)[0];

  document.getElementById('kpi-brands').innerHTML =
    kpi('Brands Analysed',   brands.length)                              +
    kpi('Highest Avg Price', fmt(topB?.avg_price_usd || 0),    'USD')   +
    kpi('Top Priced Brand',  topB?.brand || '—')                        +
    kpi('Largest Portfolio', mostIt?.brand || '—')                      +
    kpi('Portfolio Size',    (mostIt?.product_count || 0).toLocaleString(), 'products') +
    kpi('Market Avg Price',  fmt(grandAvg),                    'USD');

  // Scatter: avg vs max price
  // Treemap: brand size = product count, color = avg price
  Plotly.newPlot('chart-brand-scatter', [{
    type: 'treemap',
    labels:  top.map(r => r.brand),
    parents: top.map(() => ''),
    values:  top.map(r => r.product_count),
    text:    top.map(r => `$${Math.round(r.avg_price_usd).toLocaleString()} avg`),
    textinfo: 'label+text',
    hovertemplate: '<b>%{label}</b><br>Products: %{value}<br>Avg Price: %{text}<extra></extra>',
    marker: {
      colors:     top.map(r => r.avg_price_usd),
      colorscale: [[0, '#1a3a4a'], [0.4, '#7eb8c9'], [0.7, GOLD2], [1, GOLD]],
      showscale:  true,
      colorbar: {
        title:    { text: 'Avg Price (USD)', font: { size: 10, color: '#888' }, side: 'right' },
        tickfont: { color: '#777', size: 9 },
        tickprefix: '$',
        len:  0.8,
        x:    1.02,
      },
      line: { color: '#080808', width: 2 },
    },
    pathbar: { visible: false },
    tiling:  { packing: 'squarify', pad: 4 },
  }], {
    paper_bgcolor: 'transparent',
    plot_bgcolor:  'transparent',
    font: { family: 'DM Sans, sans-serif', color: '#aaa', size: 11 },
    height: 460,
    margin: { t: 15, r: 120, b: 15, l: 15 },
  }, CFG);

  // Top brands by avg price
  const bp = top.slice(0, 15).reverse();
  Plotly.newPlot('chart-brand-avg-price', [{
    y: bp.map(r => r.brand),
    x: bp.map(r => Math.round(r.avg_price_usd)),
    type: 'bar', orientation: 'h',
    marker: { color: bp.map((_, i) => `rgba(201,168,76,${1 - i * 0.055})`).reverse() },
    text:         bp.map(r => `$${Math.round(r.avg_price_usd).toLocaleString()}`).reverse(),
    textposition: 'outside', textfont: { size: 9, color: '#777' },
    hovertemplate: '<b>%{y}</b><br>Avg $%{x:,.0f}<extra></extra>',
  }], baseLayout({ height: 380, margin: { t: 10, r: 90, b: 35, l: 130 },
    xaxis: { tickprefix: '$', gridcolor: '#1e1e1e' } }), CFG);

  // Top brands by product count
  const bc = [...brands].sort((a, b) => b.product_count - a.product_count).slice(0, 15).reverse();
  Plotly.newPlot('chart-brand-count', [{
    y: bc.map(r => r.brand),
    x: bc.map(r => r.product_count),
    type: 'bar', orientation: 'h',
    marker: { color: bc.map((_, i) => `rgba(126,184,201,${1 - i * 0.055})`).reverse() },
    text:         bc.map(r => r.product_count).reverse(),
    textposition: 'outside', textfont: { size: 9, color: '#777' },
    hovertemplate: '<b>%{y}</b><br>%{x} products<extra></extra>',
  }], baseLayout({ height: 380, margin: { t: 10, r: 50, b: 35, l: 130 },
    xaxis: { gridcolor: '#1e1e1e' } }), CFG);

  // Price range grouped bar
  const rng = top.slice(0, 20).sort((a, b) => a.avg_price_usd - b.avg_price_usd);
  Plotly.newPlot('chart-brand-range', [
    { name: 'Min', x: rng.map(r => r.brand), y: rng.map(r => Math.round(r.min_price_usd || 0)),
      type: 'bar', marker: { color: 'rgba(201,168,76,0.2)' },
      hovertemplate: '<b>%{x}</b><br>Min $%{y:,.0f}<extra></extra>' },
    { name: 'Avg', x: rng.map(r => r.brand), y: rng.map(r => Math.round(r.avg_price_usd || 0)),
      type: 'bar', marker: { color: GOLD },
      hovertemplate: '<b>%{x}</b><br>Avg $%{y:,.0f}<extra></extra>' },
    { name: 'Max', x: rng.map(r => r.brand), y: rng.map(r => Math.round(r.max_price_usd || 0)),
      type: 'bar', marker: { color: 'rgba(201,168,76,0.45)' },
      hovertemplate: '<b>%{x}</b><br>Max $%{y:,.0f}<extra></extra>' },
  ], baseLayout({ height: 340, margin: { t: 10, r: 15, b: 80, l: 70 },
    barmode: 'group',
    xaxis: { tickangle: -40, tickfont: { size: 9 } },
    yaxis: { tickprefix: '$', gridcolor: '#1e1e1e' },
    legend: { orientation: 'h', y: -0.38, font: { size: 10 } },
  }), CFG);
}

// ── PAGE 4: BRAND PULSE ───────────────────────────────────────
function renderPulse() {
  const yr = document.getElementById('filter-pulse-year').value;
  const d  = yr === 'all'
    ? (DATA.trends || [])
    : (DATA.trends || []).filter(r => String(r.year) === yr);

  const brands = [...new Set(d.map(r => r.brand).filter(Boolean))].sort();
  const avgI   = d.length
    ? (d.reduce((s, r) => s + (parseFloat(r.search_interest) || 0), 0) / d.length).toFixed(1)
    : '—';
  const peakB  = brands
    .map(b => ({ brand: b, peak: Math.max(...d.filter(r => r.brand === b).map(r => parseFloat(r.search_interest) || 0)) }))
    .sort((a, b) => b.peak - a.peak)[0];

  document.getElementById('kpi-pulse').innerHTML =
    kpi('Brands Tracked', brands.length)             +
    kpi('Data Points',    d.length.toLocaleString()) +
    kpi('Avg Interest',   avgI,          '/ 100')    +
    kpi('Peak Brand',     peakB?.brand || '—')       +
    kpi('Peak Score',     Math.round(peakB?.peak || 0), '/ 100');

  Plotly.newPlot('chart-trends-line',
    brands.map((b, i) => {
      const bd = d.filter(r => r.brand === b).sort((a, c) => a.date < c.date ? -1 : 1);
      return { name: b, x: bd.map(r => r.date), y: bd.map(r => parseFloat(r.search_interest) || 0),
        type: 'scatter', mode: 'lines', line: { color: COLORS[i % COLORS.length], width: 2 },
        hovertemplate: `<b>${b}</b><br>%{x}<br>Interest: %{y}<extra></extra>` };
    }),
    baseLayout({ height: 480, margin: { t: 120, r: 15, b: 55, l: 55 },
      xaxis: { type: 'date', gridcolor: '#1e1e1e' },
      yaxis: { range: [0, 105], title: { text: 'Search Interest (0–100)', font: { size: 10, color: '#555' } } },
      legend: { orientation: 'h', y: -0.38, font: { size: 10 } },
      hovermode: 'x unified',
      hoverlabel: { bgcolor: '#1a1a1a', bordercolor: '#c9a84c',
        font: { color: '#f0ead8', size: 11, family: 'DM Sans' }, align: 'left', namelength: -1 },
    }), CFG);

  const hZ = brands.map(b =>
    MONTHS.map(m => {
      const rows = d.filter(r => r.brand === b && r.month_name === m);
      const vs   = rows.map(r => parseFloat(r.search_interest) || 0);
      return vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null;
    })
  );

  Plotly.newPlot('chart-trends-heatmap', [{
    z: hZ, x: MONTHS, y: brands, type: 'heatmap',
    colorscale: [[0, '#0d0d0d'], [0.3, GOLD2], [1, GOLD]],
    hoverongaps: false,
    hovertemplate: '<b>%{y}</b><br>%{x}: %{z:.1f}<extra></extra>',
    colorbar: { title: { text: 'Avg Interest', font: { size: 9, color: '#555' } },
                tickfont: { color: '#555', size: 9 }, len: 0.7 },
  }], baseLayout({ height: Math.max(280, brands.length * 30 + 60),
    margin: { t: 10, r: 90, b: 40, l: 120 },
    xaxis: { gridcolor: 'transparent' },
    yaxis: { gridcolor: 'transparent', tickfont: { size: 10 } },
  }), CFG);
}

// ── BOOT ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', loadAll);