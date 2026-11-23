# PulseScan — Dual-Market React Stock Scanner (US & India)

A 100% free, GitHub-hosted React stock scanner for **US (NYSE/NASDAQ)** and **Indian (NSE)** markets with:
- **Automated 10:00 AM IST weekday scans** via GitHub Actions + `yfinance` (zero server cost, zero API keys).
- **Relative Volume (RVOL)** & **Relative Strength vs. Benchmark** (`SPY` for US, `NIFTY 50` for India).
- **Multi-Timeframe RSI (14)** across `1H`, `Daily`, `Weekly`, and `Monthly` timeframes (including Bullish/Bearish GFS presets).
- **Composable Multi-Timeframe EMA / SMA Filter Builder** (`EMA 9/20/50`, `SMA 50/100/200`, crossovers, bullish/bearish stacks, and ±2% proximity).
- **CSV Export**, **TradingView Watchlist Copy**, and **Custom Preset Persistence**.

## Quick Setup (5 Minutes on GitHub)

1. **Create a new GitHub repository** (public for unlimited free GitHub Actions minutes, or private within GitHub Free's 2,000 mins/month).
2. **Push this project** to your repository's `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial PulseScan dual-market scanner"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. **Enable GitHub Pages:** Go to **Settings → Pages → Source** and choose **GitHub Actions**.
4. **Enable Workflow Write Permissions:** Go to **Settings → Actions → General → Workflow permissions** and select **Read and write permissions**.
5. **Run Your First Scan Now:** Go to **Actions → Daily 10 AM IST Dual-Market Stock Scan & Deploy → Run workflow**.
   - Every weekday at **10:00 AM IST** (`04:30 UTC`), GitHub Actions automatically refreshes `public/data/us_scan.json` and `public/data/india_scan.json` and republishes your React app.

## Local Development

```bash
npm install
npm run dev
```

To refresh data locally before running the dev server:
```bash
pip install -r scripts/requirements.txt
python scripts/scan_markets.py
```

## Expanding the Stock Universe

Edit `US_UNIVERSE` and `INDIA_UNIVERSE` in `scripts/scan_markets.py` to add more S&P 500, NASDAQ 100, NIFTY 500, or NSE F&O tickers (append `.NS` for NSE symbols).
