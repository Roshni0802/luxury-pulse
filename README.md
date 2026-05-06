# 💎 Luxury Pulse — Fashion Intelligence Platform

**An interactive data visualization tool for exploring global fashion and luxury retail performance.**

🔗 **Live Demo:** https://roshni0802.github.io/luxury-pulse

---

## Overview

Luxury Pulse is a browser-based interactive visualization tool built for
FA 550 Data Visualization (Stevens Institute of Technology, Spring 2026).
It consolidates sales performance, product pricing, brand positioning,
and market awareness data from the global fashion and luxury retail
industry into a single, elegant four-page tool.

The project was built entirely from scratch using HTML, CSS, and
JavaScript — no frameworks, no BI tools. All data was acquired,
cleaned, and transformed using a custom Python pipeline before being
loaded into the browser as pre-processed JSON files.

---

## Pages & Features

### 1. Sales Overview
- Monthly revenue trend (line chart with area fill)
- Payment method distribution (donut chart)
- Top 12 categories by revenue (horizontal bar)
- Review score distribution (histogram)
- Revenue by top 5 categories over time (multi-line)
- **Filters:** Year (2022 / 2023 / All), Payment type
- **KPIs:** Total revenue, transactions, avg order value,
  avg review score, category count

### 2. Product Explorer
- Price tier distribution — Entry / Mid / High / Ultra Luxury (donut)
- Average price by category (horizontal bar)
- Top 25 brands — avg price vs product count (bubble chart)
- Apparel category breakdown (pie chart)
- Stock availability by platform (bar chart)
- **Filters:** Price tier, Platform (Net-a-Porter / Mr Porter)
- **KPIs:** Products listed, unique brands, avg price, max price, platforms

### 3. Brand Intelligence
- Brand portfolio map — size = products, color = avg price (treemap)
- Top brands by average price (horizontal bar)
- Top brands by product count (horizontal bar)
- Price range min / avg / max by brand (grouped bar)
- **Filter:** Top N brands (15 / 25 / 40)
- **KPIs:** Brands analysed, highest avg price, top priced brand,
  largest portfolio, portfolio size, market avg price

### 4. Brand Pulse
- Search interest over time — all brands (multi-line with unified tooltip)
- Monthly search interest heatmap — seasonality (heatmap)
- **Filter:** Year (2019–2024 / All)
- **KPIs:** Brands tracked, data points, avg interest,
  peak brand, peak score, trending up count

---

## Data Sources

| Dataset | Source | Records | Usage |
|---|---|---|---|
| Fashion Retail Sales | Kaggle (atharvasoundankar) | 2,750 | Pages 1 KPIs + charts |
| Net-a-Porter Products | Kaggle (justinpakzad) | ~22,000 | Pages 2 + 3 |
| Mr Porter Products | Kaggle (justinpakzad) | ~22,000 | Pages 2 + 3 |
| Luxury Apparel Data | Kaggle (chitwanmanchanda) | ~2,000 | Page 2 category breakdown |
| Google Trends | pytrends Python library | ~576 | Page 4 brand awareness |

**Data notes:**
- Fashion Retail Sales dates are in DD-MM-YYYY format — fixed with `dayfirst=True`
- Net-a-Porter prices are in GBP — converted to USD using 2023 avg rate (1 GBP = $1.244)
- Google Trends scores are relative (0–100 per query), not absolute search volumes
- All data was pre-aggregated in Python to summary JSON files for fast browser loading

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Charts | Plotly.js 2.27.0 (CDN) |
| Fonts | Cormorant Garamond + DM Sans (Google Fonts CDN) |
| Data pipeline | Python 3.13, pandas, pytrends |
| Deployment | GitHub Pages |

No frameworks, no npm, no build tools required.

---

## How to Run Locally

### Requirements
- VS Code
- Live Server extension (by Ritwick Dey)
- Internet connection (Plotly.js and fonts load from CDN)

### Steps
1. Clone the repository:
```bash
   git clone https://github.com/Roshni0802/luxury-pulse.git
```
2. Open the folder in VS Code:
3. Right-click `index.html` in the Explorer panel
4. Click **Open with Live Server**
5. Browser opens at `http://127.0.0.1:5500`

> ⚠️ Do NOT open index.html by double-clicking it.
> The browser blocks fetch() requests on the file:// protocol.
> Always use Live Server.

---

## Project Structure
luxury-pulse/
├── index.html              Main application file
├── app.js                  All chart logic and data loading
├── style.css               All styling
├── README.md               This file
├── clean_pipeline.py       Python data cleaning pipeline
└── json_data/              Pre-processed data files
├── clean_sales.json              2,750 transaction records
├── clean_sales_by_payment.json   Payment type summary
├── clean_sales_by_category.json  Category summary
├── clean_netaporter.json         Product catalog summary
├── clean_netaporter_brands.json  Brand-level aggregates
├── clean_netaporter_tiers.json   Price tier summary
├── clean_apparel.json            Apparel category counts
├── clean_apparel_by_category.json Category breakdown
├── clean_apparel_by_brand.json   Brand breakdown
├── clean_trends.json             Google Trends weekly data
├── clean_trends_yearly.json      Yearly brand averages
└── clean_kpis.json               Top-level KPI summary

---

## Rebuilding the Data

To regenerate all JSON files from raw CSVs:

```bash
pip install pandas pytrends
python clean_pipeline.py
```

Raw CSV files required (not included in repo due to size):
- `Fashion_Retail_Sales.csv`
- `net-a-porter.csv`
- `mr-porter.csv`
- `Luxury_Products_Apparel_Data.csv`

Download from Kaggle links in the Data Sources table above.

---

## Key Insights

1. **Revenue is highly seasonal** — clear peaks in specific months
   visible in the monthly trend chart
2. **Mid Luxury dominates** — 43% of products fall in the
   $200–$800 tier, making it the largest segment by volume
3. **COVID impact is visible** — every brand dips simultaneously
   in early 2020 on the Brand Pulse line chart, with different
   recovery trajectories revealing brand resilience differences
4. **Watches command premium pricing** — the highest average
   price category by a significant margin on Product Explorer
5. **Portfolio size ≠ price** — the brands with the most products
   (Saint Laurent, Gucci) are not the most expensive ones
   (Vacheron Constantin, Bovet) as shown in the treemap

---

## Author

**Roshni Patel**
Stevens Institute of Technology
FA 550 — Data Visualization, Spring 2026
Student ID: 20036005

---

## Track

Track 3 — Interactive Visualization Tool

*Originally proposed as Track 1 (Executive Dashboard / Tableau),
switched to Track 3 to build a fully coded, deployable portfolio piece.*

---

## License

This project was built for academic purposes.
Data sourced from publicly available Kaggle datasets and Google Trends.