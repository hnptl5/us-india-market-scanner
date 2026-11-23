#!/usr/bin/env python3
"""
Dual-Market Stock Scanner Data Pipeline (Option A: Free yfinance + GitHub Actions)
Runs daily at 10:00 AM IST (04:30 UTC) to generate static JSON snapshots for:
  - public/data/us_scan.json     (US NYSE / NASDAQ equities + SPY/QQQ benchmarks)
  - public/data/india_scan.json  (India NSE equities + NIFTY 50 / BANK NIFTY benchmarks)

Usage:
  python scripts/scan_markets.py
"""

from __future__ import annotations

import json
import math
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import yfinance as yf

IST = timezone(timedelta(hours=5, minutes=30))
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "data"

# Expand these ticker lists freely (e.g., full S&P 500 or NIFTY 500 CSV)
US_UNIVERSE = [
    ("NVDA", "NASDAQ:NVDA", "NVIDIA Corp.", "Semiconductors", ["S&P 500", "NASDAQ 100"]),
    ("MSFT", "NASDAQ:MSFT", "Microsoft Corp.", "Software", ["S&P 500", "NASDAQ 100"]),
    ("AAPL", "NASDAQ:AAPL", "Apple Inc.", "Consumer Tech", ["S&P 500", "NASDAQ 100"]),
    ("META", "NASDAQ:META", "Meta Platforms", "Communication", ["S&P 500", "NASDAQ 100"]),
    ("AMZN", "NASDAQ:AMZN", "Amazon.com Inc.", "Consumer Discretionary", ["S&P 500", "NASDAQ 100"]),
    ("GOOGL", "NASDAQ:GOOGL", "Alphabet Inc.", "Communication", ["S&P 500", "NASDAQ 100"]),
    ("NFLX", "NASDAQ:NFLX", "Netflix Inc.", "Communication", ["S&P 500", "NASDAQ 100"]),
    ("ORCL", "NYSE:ORCL", "Oracle Corp.", "Software", ["S&P 500"]),
    ("AVGO", "NASDAQ:AVGO", "Broadcom Inc.", "Semiconductors", ["S&P 500", "NASDAQ 100"]),
    ("AMD", "NASDAQ:AMD", "Advanced Micro Devices", "Semiconductors", ["S&P 500", "NASDAQ 100"]),
    ("TSLA", "NASDAQ:TSLA", "Tesla Inc.", "Automotive", ["S&P 500", "NASDAQ 100"]),
    ("PLTR", "NASDAQ:PLTR", "Palantir Technologies", "Software", ["S&P 500", "NASDAQ 100"]),
    ("JPM", "NYSE:JPM", "JPMorgan Chase", "Financials", ["S&P 500"]),
    ("LLY", "NYSE:LLY", "Eli Lilly & Co.", "Healthcare", ["S&P 500"]),
    ("COST", "NASDAQ:COST", "Costco Wholesale", "Consumer Staples", ["S&P 500", "NASDAQ 100"]),
    ("PANW", "NASDAQ:PANW", "Palo Alto Networks", "Cybersecurity", ["S&P 500", "NASDAQ 100"]),
    ("CRM", "NYSE:CRM", "Salesforce Inc.", "Software", ["S&P 500"]),
    ("INTC", "NASDAQ:INTC", "Intel Corp.", "Semiconductors", ["S&P 500", "NASDAQ 100"]),
    ("NKE", "NYSE:NKE", "Nike Inc.", "Consumer Discretionary", ["S&P 500"]),
    ("V", "NYSE:V", "Visa Inc.", "Financials", ["S&P 500"]),
]

INDIA_UNIVERSE = [
    ("RELIANCE.NS", "NSE:RELIANCE", "Reliance Industries", "Energy & Retail", ["NIFTY 50", "NSE F&O"]),
    ("HDFCBANK.NS", "NSE:HDFCBANK", "HDFC Bank Ltd.", "Banking", ["NIFTY 50", "NSE F&O", "Bank Nifty"]),
    ("ICICIBANK.NS", "NSE:ICICIBANK", "ICICI Bank Ltd.", "Banking", ["NIFTY 50", "NSE F&O", "Bank Nifty"]),
    ("SBIN.NS", "NSE:SBIN", "State Bank of India", "Banking", ["NIFTY 50", "NSE F&O", "Bank Nifty"]),
    ("TCS.NS", "NSE:TCS", "Tata Consultancy Services", "IT Services", ["NIFTY 50", "NSE F&O"]),
    ("INFY.NS", "NSE:INFY", "Infosys Ltd.", "IT Services", ["NIFTY 50", "NSE F&O"]),
    ("BHARTIARTL.NS", "NSE:BHARTIARTL", "Bharti Airtel Ltd.", "Telecom", ["NIFTY 50", "NSE F&O"]),
    ("LT.NS", "NSE:LT", "Larsen & Toubro", "Infrastructure", ["NIFTY 50", "NSE F&O"]),
    ("TRENT.NS", "NSE:TRENT", "Trent Ltd.", "Retail", ["NIFTY 50", "NSE F&O"]),
    ("BEL.NS", "NSE:BEL", "Bharat Electronics", "Defence", ["NIFTY 50", "NSE F&O"]),
    ("HAL.NS", "NSE:HAL", "Hindustan Aeronautics", "Defence", ["NSE F&O"]),
    ("M&M.NS", "NSE:M_M", "Mahindra & Mahindra", "Auto", ["NIFTY 50", "NSE F&O"]),
    ("TATAMOTORS.NS", "NSE:TATAMOTORS", "Tata Motors Ltd.", "Auto", ["NIFTY 50", "NSE F&O"]),
    ("BAJFINANCE.NS", "NSE:BAJFINANCE", "Bajaj Finance Ltd.", "NBFC / Financials", ["NIFTY 50", "NSE F&O"]),
    ("SUNPHARMA.NS", "NSE:SUNPHARMA", "Sun Pharmaceutical", "Pharma", ["NIFTY 50", "NSE F&O"]),
    ("INDUSINDBK.NS", "NSE:INDUSINDBK", "IndusInd Bank Ltd.", "Banking", ["NIFTY 50", "NSE F&O", "Bank Nifty"]),
    ("AXISBANK.NS", "NSE:AXISBANK", "Axis Bank Ltd.", "Banking", ["NIFTY 50", "NSE F&O", "Bank Nifty"]),
    ("KOTAKBANK.NS", "NSE:KOTAKBANK", "Kotak Mahindra Bank", "Banking", ["NIFTY 50", "NSE F&O", "Bank Nifty"]),
    ("ITC.NS", "NSE:ITC", "ITC Ltd.", "FMCG", ["NIFTY 50", "NSE F&O"]),
    ("HINDUNILVR.NS", "NSE:HINDUNILVR", "Hindustan Unilever", "FMCG", ["NIFTY 50", "NSE F&O"]),
]


def safe_round(val: Any, digits: int = 2, default: float = 0.0) -> float:
    try:
        f = float(val)
        return round(f, digits) if math.isfinite(f) else default
    except (TypeError, ValueError):
        return default


def wilder_rsi(series: pd.Series, period: int = 14) -> float:
    close = series.dropna().astype(float)
    if len(close) < period + 2:
        return 50.0
    delta = close.diff()
    gain = delta.clip(lower=0.0)
    loss = (-delta).clip(lower=0.0)
    avg_gain = gain.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    last_loss = float(avg_loss.iloc[-1])
    if last_loss == 0:
        return 100.0
    rs = float(avg_gain.iloc[-1]) / last_loss
    return safe_round(100.0 - (100.0 / (1.0 + rs)), 1, 50.0)


def compute_mas(series: pd.Series) -> dict[str, float]:
    close = series.dropna().astype(float)
    if close.empty:
        return {"ema9": 0.0, "ema20": 0.0, "ema50": 0.0, "sma50": 0.0, "sma100": 0.0, "sma200": 0.0}
    last = float(close.iloc[-1])

    def ema(n: int) -> float:
        return safe_round(close.ewm(span=n, adjust=False).mean().iloc[-1], 2, last)

    def sma(n: int) -> float:
        window = min(n, len(close))
        return safe_round(close.rolling(window=window).mean().iloc[-1], 2, last)

    return {
        "ema9": ema(9),
        "ema20": ema(20),
        "ema50": ema(50),
        "sma50": sma(50),
        "sma100": sma(100),
        "sma200": sma(200),
    }


def download_chunked(tickers: list[str], period: str, interval: str, chunk_size: int = 25) -> dict[str, pd.DataFrame]:
    result: dict[str, pd.DataFrame] = {}
    for i in range(0, len(tickers), chunk_size):
        batch = tickers[i : i + chunk_size]
        for attempt in range(3):
            try:
                df = yf.download(
                    tickers=batch,
                    period=period,
                    interval=interval,
                    group_by="ticker",
                    auto_adjust=True,
                    progress=False,
                    threads=True,
                )
                if len(batch) == 1:
                    t = batch[0]
                    if not df.empty:
                        result[t] = df.dropna(how="all")
                else:
                    for t in batch:
                        if t in df.columns.get_level_values(0):
                            sub = df[t].dropna(how="all")
                            if not sub.empty:
                                result[t] = sub
                break
            except Exception:
                time.sleep(2 * (attempt + 1))
        time.sleep(0.5)
    return result


def build_benchmark(ticker: str, label: str, name: str, daily_df: pd.DataFrame | None) -> dict[str, Any]:
    if daily_df is None or len(daily_df) < 2:
        return {
            "symbol": label,
            "name": name,
            "price": 0.0,
            "changePct": 0.0,
            "rvol": 1.0,
            "above20Ema": True,
            "above50Ema": True,
            "breadthUp": 50,
        }
    close = daily_df["Close"].dropna()
    vol = daily_df["Volume"].dropna()
    price = safe_round(close.iloc[-1], 2)
    prev = safe_round(close.iloc[-2], 2, price)
    chg_pct = safe_round(((price - prev) / prev) * 100.0 if prev else 0.0, 2)
    avg20 = float(vol.tail(21).iloc[:-1].mean()) if len(vol) > 2 else 0.0
    last_vol = float(vol.iloc[-1]) if len(vol) else 0.0
    rvol = safe_round(last_vol / avg20 if avg20 > 0 else 1.0, 2, 1.0)
    mas = compute_mas(close)
    return {
        "symbol": label,
        "name": name,
        "price": price,
        "changePct": chg_pct,
        "rvol": rvol,
        "above20Ema": price > mas["ema20"],
        "above50Ema": price > mas["ema50"],
        "breadthUp": 50,
    }


def scan_market(
    market_code: str,
    exchange: str,
    currency: str,
    universe: list[tuple[str, str, str, str, list[str]]],
    primary_bench: tuple[str, str, str],
    secondary_bench: tuple[str, str, str],
) -> dict[str, Any]:
    all_tickers = [row[0] for row in universe] + [primary_bench[0], secondary_bench[0]]

    daily_map = download_chunked(all_tickers, period="5y", interval="1d")
    hourly_map = download_chunked(all_tickers, period="60d", interval="60m")

    stocks_out: list[dict[str, Any]] = []
    advancing = 0

    for yf_ticker, tv_symbol, name, sector, tags in universe:
        ddf = daily_map.get(yf_ticker)
        if ddf is None or len(ddf) < 25:
            continue

        close_d = ddf["Close"].dropna()
        vol_d = ddf["Volume"].dropna()
        if len(close_d) < 2:
            continue

        price = safe_round(close_d.iloc[-1], 2)
        prev = safe_round(close_d.iloc[-2], 2, price)
        change_pct = safe_round(((price - prev) / prev) * 100.0 if prev else 0.0, 2)
        if change_pct > 0:
            advancing += 1

        last_vol = int(vol_d.iloc[-1]) if len(vol_d) else 0
        avg_vol_20 = int(vol_d.tail(21).iloc[:-1].mean()) if len(vol_d) > 2 else max(1, last_vol)
        rvol = safe_round(last_vol / avg_vol_20 if avg_vol_20 > 0 else 1.0, 2, 1.0)

        # Resample Daily -> Weekly & Monthly for accurate multi-timeframe indicators
        close_w = close_d.resample("W-FRI").last().dropna()
        close_m = close_d.resample("ME").last().dropna()

        hdf = hourly_map.get(yf_ticker)
        close_1h = hdf["Close"].dropna() if hdf is not None and "Close" in hdf else close_d.tail(60)

        clean_symbol = yf_ticker.replace(".NS", "").replace(".BO", "")
        history = [safe_round(v, 2) for v in close_d.tail(12).tolist()]

        stocks_out.append(
            {
                "symbol": clean_symbol,
                "tvSymbol": tv_symbol,
                "name": name,
                "sector": sector,
                "universe": tags,
                "price": price,
                "changePct": change_pct,
                "volume": last_vol,
                "avgVolume20": avg_vol_20,
                "rvol": rvol,
                "rsi": {
                    "1H": wilder_rsi(close_1h),
                    "D": wilder_rsi(close_d),
                    "W": wilder_rsi(close_w),
                    "M": wilder_rsi(close_m),
                },
                "ma": {
                    "1H": compute_mas(close_1h),
                    "D": compute_mas(close_d),
                    "W": compute_mas(close_w),
                    "M": compute_mas(close_m),
                },
                "history": history,
            }
        )

    bench = build_benchmark(primary_bench[0], primary_bench[1], primary_bench[2], daily_map.get(primary_bench[0]))
    bench["breadthUp"] = round((advancing / max(1, len(stocks_out))) * 100)
    sec_bench = build_benchmark(secondary_bench[0], secondary_bench[1], secondary_bench[2], daily_map.get(secondary_bench[0]))

    now_ist = datetime.now(IST).strftime("%d %b %Y, %I:%M %p IST")
    return {
        "market": market_code,
        "exchange": exchange,
        "currency": currency,
        "benchmark": bench,
        "secondaryBenchmark": sec_bench,
        "asOfLabel": f"Updated {now_ist} (yfinance)",
        "source": "yfinance-github-actions",
        "stocks": stocks_out,
    }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Scanning US market (NYSE/NASDAQ)...")
    us_payload = scan_market(
        market_code="US",
        exchange="NYSE / NASDAQ",
        currency="$",
        universe=US_UNIVERSE,
        primary_bench=("SPY", "SPY", "S&P 500 ETF"),
        secondary_bench=("QQQ", "QQQ", "NASDAQ 100 ETF"),
    )
    (OUTPUT_DIR / "us_scan.json").write_text(json.dumps(us_payload, indent=2), encoding="utf-8")
    print(f"Saved {len(us_payload['stocks'])} US stocks.")

    print("Scanning Indian market (NSE)...")
    in_payload = scan_market(
        market_code="IN",
        exchange="NSE",
        currency="₹",
        universe=INDIA_UNIVERSE,
        primary_bench=("^NSEI", "NIFTY 50", "NSE Nifty 50 Index"),
        secondary_bench=("^NSEBANK", "BANK NIFTY", "Nifty Bank Index"),
    )
    (OUTPUT_DIR / "india_scan.json").write_text(json.dumps(in_payload, indent=2), encoding="utf-8")
    print(f"Saved {len(in_payload['stocks'])} Indian stocks.")


if __name__ == "__main__":
    main()
