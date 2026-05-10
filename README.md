================================================================
FA 550 — DATA VISUALIZATION | CAPSTONE PROJECT SUBMISSION
Stevens Institute of Technology | Spring 2026
================================================================

PROJECT TITLE:    Luxury Pulse — Fashion Intelligence Platform
STUDENT NAME:     Roshni Patel
STUDENT ID:       20036005
TRACK:            Track 3 — Interactive Visualization Tool
SUBMISSION DATE:  May 2026

================================================================
PROJECT OVERVIEW
================================================================

Luxury Pulse is a fully coded, browser-based interactive data
visualization tool that consolidates global fashion and luxury
retail performance data into a single, elegant four-page platform.

The tool analyzes sales transactions, luxury product pricing,
brand market positioning, and consumer search interest across
the global fashion industry. It was built entirely from scratch
using HTML, CSS, and JavaScript — no BI tools or frameworks —
with a custom Python data pipeline handling all data acquisition,
cleaning, and transformation.

The project covers four analytical pages:
  - Sales Overview:      Revenue trends, category performance,
                         payment analysis, customer sentiment
  - Product Explorer:    Price tier analysis, brand pricing,
                         platform comparison
  - Brand Intelligence:  Brand portfolio mapping, price
                         positioning, competitive analysis
  - Brand Pulse:         Google Trends search interest,
                         seasonal heatmap, brand awareness

Main Technologies: HTML5, CSS3, JavaScript, Plotly.js,
                   Python, pandas, pytrends, GitHub Pages

================================================================
PROJECT ACCESS
================================================================

LIVE DEPLOYED LINK (Preferred):
  https://roshni0802.github.io/luxury-pulse

  → Open in any browser (Chrome or Edge recommended)
  → No login, no installation, no software required
  → All four pages and filters are fully functional

GITHUB REPOSITORY:
  https://github.com/Roshni0802/luxury-pulse

LOCAL SETUP (if live link is unavailable):
  Full step-by-step instructions are in the Quick Start
  section below and in the project README.md file.

================================================================
SUBMISSION CONTENTS
================================================================

This submission package contains the following deliverables:

  1. README.txt
     This file — main navigation guide for graders

  2. Project_Documentation.pdf
     Complete 8–12 page project report covering:
     - Executive Summary
     - Goals & Context
     - Data Preparation
     - Design Decisions
     - Technical Implementation
     - Key Findings & Insights
     - Challenges & Solutions
     - AI-Assisted Development
     - User Testing & Feedback
     - Reflection & Future Work

  3. Presentation_Video.mp4
     5–7 minute demo walkthrough of the live tool
     covering all four pages, filters, and key insights

  4. data_README.txt
     Detailed documentation of all 12 cleaned datasets —
     sources, variables, cleaning steps, row counts

  5. Project Files (luxury-pulse/)
     index.html        Main application entry point
     app.js            All chart logic and data loading
     style.css         All visual styling
     clean_pipeline.py Python data cleaning pipeline

  6. Data Folder (data/)
     12 pre-processed JSON files used by the web app:
     clean_sales.json, clean_netaporter.json,
     clean_trends.json, and 9 additional summary files

  7. AI Conversation Logs (ai_logs/)
     Screenshots and exports of Claude AI and ChatGPT
     conversations used during development

  8. User Guide
     Included within Project_Documentation.pdf and
     also available in README.md on GitHub

================================================================
FOLDER STRUCTURE
================================================================

RoshniPatel_Capstone/
│
├── README.txt                      ← You are here
├── Project_Documentation.pdf                ← Full project report
├── Presentation_Video.mp4          ← Demo walkthrough video
│
| index.html                 ← Main HTML file
│ app.js                     ← JavaScript logic
│ style.css                  ← CSS styling
│ clean_pipeline.py          ← Python data pipeline
│
├── data/                          ← Cleaned JSON datasets
│   ├── clean_sales.json
│   ├── clean_sales_by_payment.json
│   ├── clean_sales_by_category.json
│   ├── clean_netaporter.json
│   ├── clean_netaporter_brands.json
│   ├── clean_netaporter_tiers.json
│   ├── clean_apparel.json
│   ├── clean_apparel_by_category.json
│   ├── clean_apparel_by_brand.json
│   ├── clean_trends.json
│   ├── clean_trends_yearly.json
│   └── clean_kpis.json
│
└── ai_logs/                       ← AI conversation exports
    ├── claude_conversation_log.pdf

================================================================
QUICK START INSTRUCTIONS
================================================================

OPTION 1 — USE THE LIVE LINK (Recommended, takes 5 seconds)

  1. Open any web browser (Chrome or Edge preferred)
  2. Go to: https://roshni0802.github.io/luxury-pulse
  3. Wait 2–3 seconds for data to load
  4. Status bar top-right will show "X records loaded"
  5. All four pages and filters are ready to use

OPTION 2 — RUN LOCALLY (if live link is unavailable)

  Requirements:
    - VS Code (free: code.visualstudio.com)
    - Live Server extension by Ritwick Dey (free, in VS Code)
    - Internet connection (Plotly.js loads from CDN)

  Steps:
    1. Download or clone the repository:
       git clone https://github.com/Roshni0802/luxury-pulse.git

    2. Open VS Code
       File → Open Folder → select the luxury-pulse folder

    3. In the VS Code Explorer panel, right-click index.html
       Click "Open with Live Server"

    4. Browser opens automatically at http://127.0.0.1:5500

  IMPORTANT: Do NOT open index.html by double-clicking it
  in File Explorer. The browser blocks data loading on the
  file:// protocol. Always use Live Server.

  Estimated setup time: under 5 minutes

OPTION 3 — REBUILD DATA FROM SCRATCH (optional)

  Requirements: Python 3.x, pandas, pytrends
    pip install pandas pytrends

  Steps:
    1. Place raw CSV files in the raw_data/ folder:
       - Fashion_Retail_Sales.csv
       - net-a-porter.csv
       - mr-porter.csv
       - Luxury_Products_Apparel_Data.csv
    2. Run: python clean_pipeline.py
    3. All 12 JSON files regenerate in data/ folder

================================================================
TECHNOLOGIES USED
================================================================

FRONTEND
  Language:     HTML5, CSS3, Vanilla JavaScript (no frameworks)
  Charts:       Plotly.js 2.27.0 (loaded from Cloudflare CDN)
  Fonts:        Cormorant Garamond + DM Sans (Google Fonts CDN)
  Design:       Custom CSS variables, CSS Grid, Flexbox

DATA PIPELINE
  Language:     Python 3.13
  Libraries:    pandas, pytrends, os, time, json, warnings
  Environment:  VS Code + PowerShell terminal

DATA SOURCES
  Kaggle:       Fashion Retail Sales (atharvasoundankar)
  Kaggle:       Net-a-Porter / Mr Porter (justinpakzad)
  Kaggle:       Luxury Apparel Data (chitwanmanchanda)
  API:          Google Trends via pytrends Python library

DEPLOYMENT
  Platform:     GitHub Pages 
  Repository:   github.com/Roshni0802/luxury-pulse

AI TOOLS USED
  Claude AI:    Primary tool — code generation, debugging,
                chart design, documentation writing
  ChatGPT:      Secondary tool — documentation structure,
                visualization concept explanations

================================================================
NOTES FOR GRADERS
================================================================

1. LIVE LINK IS THE EASIEST WAY TO GRADE
   The deployed GitHub Pages link requires no setup. Open it
   in Chrome or Edge and everything works immediately.

2. DATA LOADING TIME
   The tool loads Page 1 (Sales Overview) within 2–3 seconds.
   Product Explorer and Brand Intelligence data loads in the
   background. If charts appear blank, wait 5 seconds and
   click the page tab again.

3. TRACK CHANGE FROM PROPOSAL
   My original proposal was Track 1 (Executive Dashboard /
   Tableau). I switched to Track 3 (Interactive Tool / coded
   JavaScript) during Week 11 to build something deployable
   and portfolio-ready. This change is documented in full in
   Section 3 of the Project Documentation.

4. SIMULATED DATA DISCLOSURE
   The Fashion Retail Sales dataset is a realistic simulation,
   not live commercial transaction data. This is disclosed
   in the tool's data source notes and documentation.

5. GOOGLE TRENDS SCORES
   Brand Pulse search interest scores are relative (0–100
   per query period), not absolute search volumes. Cross-brand
   comparisons are directional only. This limitation is
   documented in the data_README.txt and in the tool tooltips.

6. BROWSER RECOMMENDATION
   Best viewed in Chrome or Edge at 1280px width or wider.
   The tool is responsive and works on smaller screens but
   some chart labels may be compressed.

7. ALL SOURCE CODE IS ON GITHUB
   Every line of code is visible at:
   https://github.com/Roshni0802/luxury-pulse
   The repository includes index.html, app.js, style.css,
   clean_pipeline.py, README.md, and the data/ folder.

8. NO DEPENDENCIES TO INSTALL
   The web tool has zero npm or pip dependencies for the
   grader. Plotly.js and Google Fonts load from CDN links
   embedded in index.html. An internet connection is the
   only requirement.

================================================================
CONTACT INFORMATION
================================================================

Student:        Roshni Patel
Student ID:     20036005
Program:        Computer Science 
Course:         FA 550 — Data Visualization
Semester:       Spring 2026
Institution:    Stevens Institute of Technology

GitHub:         https://github.com/Roshni0802
Project URL:    https://roshni0802.github.io/luxury-pulse

================================================================
Thank you for reviewing Luxury Pulse.
================================================================