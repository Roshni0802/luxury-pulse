# ============================================================
# Luxury Pulse — Full Data Cleaning Pipeline
# Track 3: Interactive Visualization Tool
# ============================================================

import pandas as pd
import numpy as np
import os
import time
import warnings
warnings.filterwarnings("ignore")

os.makedirs("../data", exist_ok=True)

# ── EXACT FILE PATHS matching your VS Code explorer ──────────
RAW_FILES = {
    "sales"      : "raw_data/Fashion_Retail_Sales.csv",
    "apparel"    : "raw_data/Luxury_Products_Apparel_Data.csv",
    "netaporter" : "raw_data/net-a-porter.csv",
    "mrporter"   : "raw_data/mr-porter.csv",
}

GBP_TO_USD = 1.244
 
BRANDS = [
    "Gucci", "Louis Vuitton", "Prada",
    "Chanel", "Burberry", "Balenciaga",
    "Dior", "Versace"
]


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def snake_case(df):
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(r"[\s\-\/]+", "_", regex=True)
        .str.replace(r"[^\w]", "", regex=True)
    )
    return df


def find_col(df, keywords):
    """Find first column containing any keyword."""
    for col in df.columns:
        if any(k in col for k in keywords):
            return col
    return None


def clean_price(series):
    """Strip currency symbols and cast to float."""
    return (
        series.astype(str)
        .str.replace(r"[£$€,\s]", "", regex=True)
        .str.replace(r"[^\d\.]", "", regex=True)
        .pipe(pd.to_numeric, errors="coerce")
    )


def price_tier(price):
    if pd.isna(price):   return "Unknown"
    if price < 200:      return "Entry Luxury"
    elif price < 800:    return "Mid Luxury"
    elif price < 2500:   return "High Luxury"
    else:                return "Ultra Luxury"


def satisfaction_tier(score):
    if pd.isna(score):  return "No Rating"
    if score >= 4.5:    return "Excellent"
    if score >= 3.5:    return "Good"
    if score >= 2.5:    return "Average"
    return "Poor"


def interest_label(score):
    if score >= 75:    return "Very High"
    elif score >= 50:  return "High"
    elif score >= 25:  return "Moderate"
    else:              return "Low"


def save(df, name):
    """Save as both CSV and JSON."""
    df.to_csv(f"data/{name}.csv", index=False)
    df.to_json(f"data/{name}.json", orient="records", indent=2, force_ascii=False)
    print(f"   ✓ Saved {name}  ({len(df):,} rows, {df.shape[1]} cols)")


def print_summary(label, before_rows, df):
    print(f"\n{'─'*55}")
    print(f"  {label}")
    print(f"  Rows  : {before_rows:,}  →  {len(df):,}")
    nulls = df.isnull().sum()
    nulls = nulls[nulls > 0]
    if len(nulls):
        print(f"  Nulls remaining: { {c: int(n) for c,n in nulls.items()} }")
    else:
        print(f"  Nulls : None ✓")
    print(f"  Columns: {list(df.columns)}")


def check_archive(filename_keywords):
    """
    Check if a matching file exists in the archive/ folder.
    Returns the path if found, else None.
    """
    if not os.path.exists("archive"):
        return None
    for f in os.listdir("archive"):
        if any(k.lower() in f.lower() for k in filename_keywords):
            path = os.path.join("archive", f)
            print(f"   Found in archive/: {f}")
            return path
    return None


# ============================================================
# DATASET 1 — FASHION RETAIL SALES
# File: Fashion_Retail_Sales.csv
# Used for: KPI cards — order value, reviews, payment methods
# ============================================================

def clean_sales():
    print("\n\n⟳  Cleaning: Fashion_Retail_Sales.csv")

    path = RAW_FILES["sales"]
    if not os.path.exists(path):
        alt = check_archive(["fashion_retail", "retail_sales", "fashion retail"])
        if alt:
            path = alt
        else:
            print(f"   ✗ File not found: {path}")
            return None

    df = pd.read_csv(path, low_memory=False)
    before = len(df)
    df = snake_case(df)
    print(f"   Detected columns: {list(df.columns)}")

    # Order value
    ov_col = find_col(df, ["purchase_amount", "amount", "order", "total", "price", "value", "spend"])
    if ov_col:
        df.rename(columns={ov_col: "order_value_usd"}, inplace=True)
        df["order_value_usd"] = clean_price(df["order_value_usd"])
        df = df[df["order_value_usd"] > 0]
    else:
        print("   ⚠ No order value column found")

    # Review / rating
    rev_col = find_col(df, ["review", "rating", "score", "stars", "feedback"])
    if rev_col:
        df.rename(columns={rev_col: "review_score"}, inplace=True)
        df["review_score"] = pd.to_numeric(df["review_score"], errors="coerce").clip(1, 5)
        df["satisfaction_tier"] = df["review_score"].apply(satisfaction_tier)

    # Payment type
    pay_col = find_col(df, ["payment", "method", "pay_type"])
    if pay_col:
        df.rename(columns={pay_col: "payment_type"}, inplace=True)
        df["payment_type"] = df["payment_type"].str.strip().str.title().fillna("Unknown")

    # Date
    date_col = find_col(df, ["date", "time", "order_date", "purchase_date"])
    if date_col:
        df.rename(columns={date_col: "date"}, inplace=True)
        df["date"] = pd.to_datetime(df["date"], dayfirst=True, errors="coerce")
        df["year"]       = df["date"].dt.year
        df["month"]      = df["date"].dt.month
        df["month_name"] = df["date"].dt.strftime("%b")
        df["date"]       = df["date"].dt.strftime("%Y-%m-%d")

    # Item / category purchased
    item_col = find_col(df, ["item", "product", "category", "name", "purchased"])
    if item_col:
        df.rename(columns={item_col: "item_purchased"}, inplace=True)
        df["item_purchased"] = df["item_purchased"].str.strip().str.title()

    # Gender column if present
    gender_col = find_col(df, ["gender", "sex"])
    if gender_col:
        df.rename(columns={gender_col: "gender"}, inplace=True)
        df["gender"] = df["gender"].str.strip().str.title()

    df.drop_duplicates(inplace=True)
    df.dropna(subset=["order_value_usd"], inplace=True)
    df["dataset"] = "Fashion Retail Sales"

    print_summary("Fashion Retail Sales", before, df)
    save(df, "clean_sales")

    # Payment summary for donut chart
    if "payment_type" in df.columns and "order_value_usd" in df.columns:
        agg = {"order_value_usd": ["count", "sum", "mean"]}
        if "review_score" in df.columns:
            agg["review_score"] = "mean"
        pay_df = df.groupby("payment_type").agg(agg).round(2).reset_index()
        pay_df.columns = ["payment_type", "transaction_count",
                          "total_revenue", "avg_order_value"] + \
                         (["avg_review_score"] if "review_score" in df.columns else [])
        save(pay_df, "clean_sales_by_payment")

    # Category summary if item column exists
    if "item_purchased" in df.columns and "order_value_usd" in df.columns:
        cat_df = df.groupby("item_purchased", as_index=False).agg(
            transaction_count = ("order_value_usd", "count"),
            total_revenue     = ("order_value_usd", "sum"),
            avg_order_value   = ("order_value_usd", "mean"),
        ).round(2).sort_values("total_revenue", ascending=False)
        save(cat_df, "clean_sales_by_category")

    return df


# ============================================================
# DATASET 2 — LUXURY PRODUCTS APPAREL DATA
# File: Luxury_Products_Apparel_Data.csv
# Used for: Category deep-dive, price tier analysis
# ============================================================

def clean_apparel():
    print("\n\n⟳  Cleaning: Luxury_Products_Apparel_Data.csv")

    path = RAW_FILES["apparel"]
    if not os.path.exists(path):
        alt = check_archive(["luxury", "apparel", "luxury_products"])
        if alt:
            path = alt
        else:
            print(f"   ✗ File not found: {path}")
            return None

    df = pd.read_csv(path, low_memory=False)
    before = len(df)
    df = snake_case(df)
    print(f"   Detected columns: {list(df.columns)}")

    # Drop unnamed index column pandas sometimes adds
    df.drop(columns=[c for c in df.columns if "unnamed" in c], inplace=True)

    # Category
    cat_col = find_col(df, ["categor", "type", "department", "class"])
    if cat_col:
        df.rename(columns={cat_col: "category"}, inplace=True)
        df["category"] = df["category"].str.strip().str.title().fillna("Unknown")

    # Subcategory — this dataset has it, keep it
    subcat_col = find_col(df, ["subcategor", "sub_cat", "subtype"])
    if subcat_col:
        df.rename(columns={subcat_col: "subcategory"}, inplace=True)
        df["subcategory"] = df["subcategory"].str.strip().str.title().fillna("Unknown")

    # Product name
    name_col = find_col(df, ["productname", "name", "title", "product_name", "item"])
    if name_col:
        df.rename(columns={name_col: "product_name"}, inplace=True)
        df["product_name"] = df["product_name"].str.strip()

    # Description
    desc_col = find_col(df, ["desc", "description", "detail", "about"])
    if desc_col:
        df.rename(columns={desc_col: "description"}, inplace=True)
        df["description"] = df["description"].str.strip()

    # Price — if it exists
    price_col = find_col(df, ["price", "cost", "value", "msrp", "retail"])
    if price_col:
        df.rename(columns={price_col: "price_usd"}, inplace=True)
        df["price_usd"] = clean_price(df["price_usd"])
        df["price_tier"] = df["price_usd"].apply(price_tier)
        df = df[df["price_usd"] > 0]

    # Brand — only use if column actually exists
    brand_col = find_col(df, ["brand", "designer", "label", "maker", "house"])
    if brand_col:
        df.rename(columns={brand_col: "brand"}, inplace=True)
        df["brand"] = df["brand"].str.strip().str.title().fillna("Unknown")

    # Drop on category instead — that column definitely exists
    df.dropna(subset=["category"], inplace=True)
    df.drop_duplicates(inplace=True)
    df["dataset"] = "Luxury Apparel"

    print_summary("Luxury Apparel Data", before, df)
    save(df, "clean_apparel")

    # Category summary
    if "category" in df.columns:
        agg_cols = {"category": "count"}
        if "subcategory" in df.columns:
            sub_df = df.groupby(["category", "subcategory"], as_index=False).agg(
                item_count=("category", "count")
            ).sort_values("item_count", ascending=False)
            save(sub_df, "clean_apparel_by_category")
        else:
            cat_df = df.groupby("category", as_index=False).agg(
                item_count=("category", "count")
            ).sort_values("item_count", ascending=False)
            save(cat_df, "clean_apparel_by_category")

    return df


# ============================================================
# DATASET 3 — NET-A-PORTER + MR PORTER (combined)
# Files: net-a-porter.csv  +  mr-porter.csv
# Used for: Product explorer, price tier, brand comparison
# ============================================================

def clean_netaporter():
    print("\n\n⟳  Cleaning: net-a-porter.csv + mr-porter.csv (merging both)")

    frames = []

    for key, label in [("netaporter", "Net-a-Porter"), ("mrporter", "Mr Porter")]:
        path = RAW_FILES[key]
        if os.path.exists(path):
            tmp = pd.read_csv(path, low_memory=False)
            tmp = snake_case(tmp)
            tmp["platform"] = label   # tag which platform each row came from
            frames.append(tmp)
            print(f"   Loaded {label}: {len(tmp):,} rows")
        else:
            alt = check_archive(["net-a-porter", "netaporter", "mr-porter", "mrporter"])
            if alt:
                tmp = pd.read_csv(alt, low_memory=False)
                tmp = snake_case(tmp)
                tmp["platform"] = label
                frames.append(tmp)
                print(f"   Loaded {label} from archive: {len(tmp):,} rows")
            else:
                print(f"   ⚠ {label} file not found, skipping")

    if not frames:
        print("   ✗ No Net-a-Porter data found")
        return None

    df = pd.concat(frames, ignore_index=True)
    before = len(df)

    print(f"   Combined rows before cleaning: {before:,}")
    print(f"   Detected columns: {list(df.columns)}")

    # Price — strip GBP symbol, convert to USD
    price_col = find_col(df, ["price", "cost", "amount"])
    if price_col:
        df.rename(columns={price_col: "price_gbp"}, inplace=True)
        df["price_gbp"] = clean_price(df["price_gbp"])
        df["price_usd"] = (df["price_gbp"] * GBP_TO_USD).round(2)
        df["price_tier"] = df["price_usd"].apply(price_tier)
        df.dropna(subset=["price_gbp"], inplace=True)
        df = df[df["price_gbp"] > 0]

    # Brand
    brand_col = find_col(df, ["brand", "designer", "label", "maker"])
    if brand_col:
        df.rename(columns={brand_col: "brand"}, inplace=True)
        df["brand"] = df["brand"].str.strip().str.title().fillna("Unknown")
        brand_map = {
            "Saint Laurent"   : "Yves Saint Laurent",
            "Ysl"             : "Yves Saint Laurent",
            "Mcm"             : "MCM",
            "A.P.C."          : "APC",
            "Dolce & Gabbana" : "Dolce And Gabbana",
            "Stella Mccartney": "Stella McCartney",
        }
        df["brand"] = df["brand"].replace(brand_map)

    # Category
    cat_col = find_col(df, ["categor", "type", "department"])
    if cat_col:
        df.rename(columns={cat_col: "category"}, inplace=True)
        df["category"] = df["category"].str.strip().str.title().fillna("Unknown")

    # Product name
    name_col = find_col(df, ["name", "title", "product_name", "item"])
    if name_col:
        df.rename(columns={name_col: "product_name"}, inplace=True)
        df["product_name"] = df["product_name"].str.strip()

    # Availability
    avail_col = find_col(df, ["avail", "stock", "in_stock", "status"])
    if avail_col:
        df.rename(columns={avail_col: "availability"}, inplace=True)
        in_stock = ["true", "yes", "1", "in stock", "available", "instock"]
        df["availability"] = df["availability"].astype(str).str.strip().str.lower()
        df["availability"] = df["availability"].apply(
            lambda x: "In Stock" if x in in_stock else "Out of Stock"
        )

    # Gender
    gender_col = find_col(df, ["gender", "sex"])
    if gender_col:
        df.rename(columns={gender_col: "gender"}, inplace=True)
        df["gender"] = df["gender"].str.strip().str.title()

    df.drop_duplicates(inplace=True)
    df["dataset"] = "Net-a-Porter / Mr Porter"

    print_summary("Net-a-Porter + Mr Porter (combined)", before, df)
    save(df, "clean_netaporter")

    # Brand-level summary for bar chart
    if "brand" in df.columns and "price_usd" in df.columns:
        brand_df = df.groupby(
            ["brand"] + (["platform"] if "platform" in df.columns else []),
            as_index=False
        ).agg(
            avg_price_usd  = ("price_usd", "mean"),
            min_price_usd  = ("price_usd", "min"),
            max_price_usd  = ("price_usd", "max"),
            product_count  = ("price_usd", "count"),
        ).round(2).sort_values("avg_price_usd", ascending=False)
        save(brand_df, "clean_netaporter_brands")

    # Price tier distribution for donut chart
    if "price_tier" in df.columns:
        tier_df = df.groupby("price_tier", as_index=False).agg(
            product_count = ("price_tier", "count"),
            avg_price_usd = ("price_usd", "mean"),
        ).round(2)
        # Set display order
        tier_order = ["Entry Luxury", "Mid Luxury", "High Luxury", "Ultra Luxury", "Unknown"]
        tier_df["sort_order"] = tier_df["price_tier"].apply(
            lambda x: tier_order.index(x) if x in tier_order else 99
        )
        tier_df = tier_df.sort_values("sort_order").drop(columns="sort_order")
        save(tier_df, "clean_netaporter_tiers")

    return df


# ============================================================
# DATASET 4 — GOOGLE TRENDS via pytrends
# Used for: Brand awareness chart, seasonal heat map
# ============================================================

def pull_google_trends():
    print("\n\n⟳  Pulling Google Trends via pytrends...")
    print("   (Takes ~2 minutes due to API rate limits)")

    try:
        from pytrends.request import TrendReq
    except ImportError:
        print("   ✗ Run: pip install pytrends")
        return None

    pytrends = TrendReq(hl="en-US", tz=0)
    all_frames = []
    batch_size = 4
    batches = [BRANDS[i:i+batch_size] for i in range(0, len(BRANDS), batch_size)]

    for i, batch in enumerate(batches):
        print(f"   Batch {i+1}/{len(batches)}: {batch}")
        try:
            pytrends.build_payload(batch, timeframe="2019-01-01 2024-12-31", geo="")
            df = pytrends.interest_over_time()

            if df.empty:
                print(f"   ⚠ No data for batch {i+1}")
                continue

            df = df.drop(columns=["isPartial"], errors="ignore")
            df = df.reset_index().melt(
                id_vars="date",
                var_name="brand",
                value_name="search_interest"
            )
            all_frames.append(df)

        except Exception as e:
            print(f"   ✗ Error: {e}")

        if i < len(batches) - 1:
            print("   Waiting 10s...")
            time.sleep(10)

    if not all_frames:
        print("   ✗ No data retrieved.")
        return None

    combined = pd.concat(all_frames, ignore_index=True)
    combined["date"]           = pd.to_datetime(combined["date"])
    combined["year"]           = combined["date"].dt.year
    combined["month"]          = combined["date"].dt.month
    combined["month_name"]     = combined["date"].dt.strftime("%b")
    combined["quarter"]        = "Q" + combined["date"].dt.quarter.astype(str)
    combined["interest_level"] = combined["search_interest"].apply(interest_label)
    combined["date"]           = combined["date"].dt.strftime("%Y-%m-%d")
    combined["dataset"]        = "Google Trends"

    print(f"   Retrieved {len(combined):,} rows for {combined['brand'].nunique()} brands")
    save(combined, "clean_trends")

    # Yearly brand average — for summary comparison chart
    yearly = combined.groupby(["year", "brand"], as_index=False).agg(
        avg_interest  = ("search_interest", "mean"),
        peak_interest = ("search_interest", "max"),
    ).round(1)
    save(yearly, "clean_trends_yearly")

    return combined


# ============================================================
# GLOBAL KPI SUMMARY
# One JSON with headline numbers for your dashboard header
# ============================================================

def build_kpi_summary(df_sales, df_apparel, df_netaporter):
    print("\n\n⟳  Building KPI summary...")

    kpis = {}

    if df_sales is not None and "order_value_usd" in df_sales.columns:
        kpis["total_revenue_usd"]   = round(float(df_sales["order_value_usd"].sum()), 2)
        kpis["avg_order_value_usd"] = round(float(df_sales["order_value_usd"].mean()), 2)
        kpis["total_transactions"]  = int(len(df_sales))
        if "review_score" in df_sales.columns:
            kpis["avg_review_score"] = round(float(df_sales["review_score"].mean()), 2)

    if df_netaporter is not None:
        if "brand" in df_netaporter.columns:
            kpis["luxury_brands_tracked"] = int(df_netaporter["brand"].nunique())
        if "price_usd" in df_netaporter.columns:
            kpis["avg_luxury_price_usd"] = round(float(df_netaporter["price_usd"].mean()), 2)
            kpis["total_products_listed"] = int(len(df_netaporter))

    if df_apparel is not None and "category" in df_apparel.columns:
        kpis["apparel_categories"] = int(df_apparel["category"].nunique())

    import json
    os.makedirs("data", exist_ok=True)
    with open("data/clean_kpis.json", "w") as f:
        json.dump(kpis, f, indent=2)

    print(f"   ✓ Saved data/clean_kpis.json")
    print(f"\n   KPI Values:")
    for k, v in kpis.items():
        print(f"     {k}: {v:,}")

    return kpis


# ============================================================
# CHECK ARCHIVE FOLDER FOR ANY EXTRA CSVs
# ============================================================

def check_and_report_archive():
    print("\n\n⟳  Checking archive/ folder...")
    if not os.path.exists("archive"):
        print("   No archive/ folder found.")
        return

    files = [f for f in os.listdir("archive") if f.endswith(".csv")]
    if not files:
        print("   archive/ folder is empty.")
        return

    print(f"   Found {len(files)} CSV(s) in archive/:")
    for f in files:
        path = os.path.join("archive", f)
        try:
            tmp = pd.read_csv(path, nrows=2)
            size = os.path.getsize(path) // 1024
            print(f"   • {f}  ({size} KB)  Columns: {list(tmp.columns)}")
        except Exception as e:
            print(f"   • {f}  (could not read: {e})")


# ============================================================
# RUN EVERYTHING
# ============================================================

if __name__ == "__main__":

    print("\n" + "="*55)
    print("  LUXURY PULSE — DATA CLEANING PIPELINE")
    print("="*55)

    check_and_report_archive()

    df_sales      = clean_sales()
    df_apparel    = clean_apparel()
    df_netaporter = clean_netaporter()
    df_trends     = pull_google_trends()

    build_kpi_summary(df_sales, df_apparel, df_netaporter)

    print("\n\n" + "="*55)
    print("  DONE — files saved to:")
    print("="*55)
    print("""
  data/
  ├── clean_sales.csv
  ├── clean_sales_by_payment.csv
  ├── clean_sales_by_category.csv
  ├── clean_apparel.csv
  ├── clean_apparel_by_category.csv
  ├── clean_apparel_by_brand.csv
  ├── clean_netaporter.csv
  ├── clean_netaporter_brands.csv
  ├── clean_netaporter_tiers.csv
  └── clean_trends.csv

  data/                         ← load these in your web app
  ├── clean_sales.json
  ├── clean_sales_by_payment.json
  ├── clean_sales_by_category.json
  ├── clean_apparel.json
  ├── clean_apparel_by_category.json
  ├── clean_apparel_by_brand.json
  ├── clean_netaporter.json
  ├── clean_netaporter_brands.json
  ├── clean_netaporter_tiers.json
  ├── clean_trends.json
  ├── clean_trends_yearly.json
  └── clean_kpis.json
    """)