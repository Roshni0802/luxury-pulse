LUXURY PULSE — Interactive Fashion Intelligence Tool
Capstone Progress Check-In | Track 3: Interactive Visualization Tool

================================================================
HOW TO RUN
================================================================

REQUIREMENTS
  - VS Code (free download: code.visualstudio.com)
  - Live Server extension for VS Code (free)
  - Internet connection (loads fonts and Plotly.js from CDN)
  - No Python, Node.js, or any installation required

STEP 1 — Install Live Server (if not already installed)
  1. Open VS Code
  2. Click the Extensions icon on the left sidebar (or Ctrl+Shift+X)
  3. Search for "Live Server" by Ritwick Dey
  4. Click Install

STEP 2 — Open the project folder
  1. Unzip the submitted file
  2. Open VS Code
  3. Click File → Open Folder
  4. Select the LuxuryPulse_Prototype folder
  5. Click Select Folder

STEP 3 — Launch the tool
  1. In the VS Code Explorer panel on the left,
     find index.html and right-click it
  2. Click "Open with Live Server"
  3. Your browser will open automatically at:
     http://127.0.0.1:5500

STEP 4 — Use the tool
  - Click "Sales Overview" or "Brand Pulse" in the top nav
  - Use the Year dropdown to filter by 2022 or 2023
  - Use the Payment dropdown to filter by payment type
  - Hover over any chart for detailed tooltips
  - All charts update instantly when filters change

TROUBLESHOOTING
  - If charts appear blank: make sure you opened the FOLDER
    in VS Code, not just the index.html file directly
  - If "Live Server" is not in the right-click menu:
    install the extension (Step 1) and restart VS Code
  - Do NOT open index.html by double-clicking it in File
    Explorer — it will show a 404 error because the browser
    needs a local server to load the JSON data files

================================================================
FOLDER STRUCTURE
================================================================

LuxuryPulse_Prototype/
├── index.html              Main HTML file — open this
├── styles.css              All visual styling
├── app.js                  All chart logic and data loading
├── README.md               This file
└── json_data/              Pre-processed data files
    ├── clean_sales.json         2,750 transaction records
    ├── clean_sales_by_payment.json  Payment summary
    ├── clean_trends.json            Google Trends data
    └── clean_trends_yearly.json     Yearly brand averages

================================================================
TECHNOLOGY STACK
================================================================

  - HTML / CSS / JavaScript (no frameworks)
  - Plotly.js 2.27.0 (charting library, loaded from CDN)
  - Google Fonts: Cormorant Garamond + DM Sans (from CDN)
  - Python + pandas (data cleaning pipeline only,
    not required to run the tool)