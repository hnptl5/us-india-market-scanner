import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Filter,
  Globe,
  Layers,
  Moon,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// --- Sample Multi-Timeframe Market Data (Matches Python yfinance JSON Schema) ---
const INITIAL_DATASETS = {
  US: {
    market: 'US',
    exchange: 'NYSE / NASDAQ',
    currency: '$',
    benchmark: {
      symbol: 'SPY',
      name: 'S&P 500 ETF',
      price: 594.82,
      changePct: 0.64,
      rvol: 1.08,
      above20Ema: true,
      above50Ema: true,
      breadthUp: 68,
    },
    secondaryBenchmark: {
      symbol: 'QQQ',
      name: 'NASDAQ 100 ETF',
      price: 512.40,
      changePct: 0.92,
      rvol: 1.15,
    },
    asOfLabel: 'Sample EOD Snapshot (US Close • Ready for 10:00 AM IST Sync)',
    source: 'sample',
    stocks: [
      {
        symbol: 'NVDA',
        tvSymbol: 'NASDAQ:NVDA',
        name: 'NVIDIA Corp.',
        sector: 'Semiconductors',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 141.85,
        changePct: 2.84,
        volume: 68420000,
        avgVolume20: 36010000,
        rvol: 1.90,
        rsi: { '1H': 64.2, D: 66.8, W: 68.4, M: 74.1 },
        ma: {
          '1H': { ema9: 140.9, ema20: 139.4, ema50: 137.1, sma50: 136.8, sma100: 134.2, sma200: 129.5 },
          D: { ema9: 139.2, ema20: 136.5, ema50: 130.8, sma50: 129.9, sma100: 124.4, sma200: 112.6 },
          W: { ema9: 134.0, ema20: 127.5, ema50: 111.2, sma50: 110.5, sma100: 92.4, sma200: 68.1 },
          M: { ema9: 118.4, ema20: 98.2, ema50: 66.5, sma50: 64.0, sma100: 45.2, sma200: 28.4 },
        },
        history: [128, 130, 129, 132, 134, 133, 136, 137, 136, 139, 138, 141.85],
      },
      {
        symbol: 'MSFT',
        tvSymbol: 'NASDAQ:MSFT',
        name: 'Microsoft Corp.',
        sector: 'Software',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 422.10,
        changePct: -0.45,
        volume: 24100000,
        avgVolume20: 19280000,
        rvol: 1.25,
        rsi: { '1H': 44.5, D: 41.2, W: 61.8, M: 64.5 },
        ma: {
          '1H': { ema9: 423.2, ema20: 424.1, ema50: 425.0, sma50: 425.4, sma100: 421.8, sma200: 419.0 },
          D: { ema9: 424.8, ema20: 426.2, ema50: 420.1, sma50: 419.5, sma100: 415.2, sma200: 408.4 },
          W: { ema9: 419.5, ema20: 412.0, ema50: 398.4, sma50: 396.2, sma100: 372.0, sma200: 334.5 },
          M: { ema9: 405.2, ema20: 382.4, ema50: 331.0, sma50: 328.0, sma100: 265.0, sma200: 198.0 },
        },
        history: [429, 431, 430, 428, 426, 427, 425, 424, 423, 424, 423, 422.1],
      },
      {
        symbol: 'AAPL',
        tvSymbol: 'NASDAQ:AAPL',
        name: 'Apple Inc.',
        sector: 'Consumer Tech',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 229.40,
        changePct: 0.95,
        volume: 54200000,
        avgVolume20: 41690000,
        rvol: 1.30,
        rsi: { '1H': 58.1, D: 57.4, W: 62.9, M: 65.2 },
        ma: {
          '1H': { ema9: 228.5, ema20: 227.8, ema50: 226.4, sma50: 226.1, sma100: 225.0, sma200: 223.8 },
          D: { ema9: 227.6, ema20: 226.1, ema50: 222.5, sma50: 221.9, sma100: 217.4, sma200: 204.2 },
          W: { ema9: 223.4, ema20: 217.2, ema50: 204.8, sma50: 203.1, sma100: 189.4, sma200: 169.2 },
          M: { ema9: 211.0, ema20: 196.4, ema50: 171.2, sma50: 169.0, sma100: 132.4, sma200: 95.0 },
        },
        history: [222, 224, 223, 225, 226, 225, 227, 226, 228, 227, 228, 229.4],
      },
      {
        symbol: 'META',
        tvSymbol: 'NASDAQ:META',
        name: 'Meta Platforms',
        sector: 'Communication',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 586.30,
        changePct: 1.92,
        volume: 19800000,
        avgVolume20: 12100000,
        rvol: 1.64,
        rsi: { '1H': 63.4, D: 62.1, W: 67.5, M: 71.8 },
        ma: {
          '1H': { ema9: 583.0, ema20: 580.4, ema50: 576.2, sma50: 575.5, sma100: 572.0, sma200: 568.5 },
          D: { ema9: 579.2, ema20: 571.5, ema50: 554.0, sma50: 552.1, sma100: 530.4, sma200: 492.8 },
          W: { ema9: 562.0, ema20: 538.4, ema50: 491.2, sma50: 488.0, sma100: 412.5, sma200: 332.0 },
          M: { ema9: 514.0, ema20: 446.0, ema50: 356.0, sma50: 351.0, sma100: 278.0, sma200: 215.0 },
        },
        history: [558, 562, 565, 563, 568, 572, 570, 575, 579, 578, 582, 586.3],
      },
      {
        symbol: 'NFLX',
        tvSymbol: 'NASDAQ:NFLX',
        name: 'Netflix Inc.',
        sector: 'Communication',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 762.40,
        changePct: -0.62,
        volume: 4920000,
        avgVolume20: 3390000,
        rvol: 1.45,
        rsi: { '1H': 42.1, D: 40.4, W: 64.9, M: 68.7 },
        ma: {
          '1H': { ema9: 764.8, ema20: 766.5, ema50: 769.0, sma50: 769.4, sma100: 761.0, sma200: 752.4 },
          D: { ema9: 768.2, ema20: 765.0, ema50: 738.6, sma50: 736.2, sma100: 702.5, sma200: 651.0 },
          W: { ema9: 742.0, ema20: 706.5, ema50: 645.2, sma50: 641.8, sma100: 548.0, sma200: 465.0 },
          M: { ema9: 682.0, ema20: 601.0, ema50: 489.0, sma50: 482.0, sma100: 412.0, sma200: 325.0 },
        },
        history: [778, 782, 780, 775, 772, 774, 770, 768, 766, 765, 764, 762.4],
      },
      {
        symbol: 'ORCL',
        tvSymbol: 'NYSE:ORCL',
        name: 'Oracle Corp.',
        sector: 'Software',
        universe: ['S&P 500'],
        price: 184.60,
        changePct: 3.15,
        volume: 16200000,
        avgVolume20: 7820000,
        rvol: 2.07,
        rsi: { '1H': 69.2, D: 65.4, W: 69.8, M: 72.3 },
        ma: {
          '1H': { ema9: 182.1, ema20: 180.5, ema50: 178.4, sma50: 178.1, sma100: 176.2, sma200: 174.0 },
          D: { ema9: 179.8, ema20: 176.2, ema50: 168.5, sma50: 167.8, sma100: 156.4, sma200: 141.2 },
          W: { ema9: 171.2, ema20: 161.5, ema50: 144.8, sma50: 143.5, sma100: 124.2, sma200: 102.6 },
          M: { ema9: 152.0, ema20: 134.5, ema50: 108.4, sma50: 106.8, sma100: 84.5, sma200: 66.2 },
        },
        history: [168, 170, 172, 171, 174, 175, 177, 176, 179, 180, 181, 184.6],
      },
      {
        symbol: 'AVGO',
        tvSymbol: 'NASDAQ:AVGO',
        name: 'Broadcom Inc.',
        sector: 'Semiconductors',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 178.25,
        changePct: 2.18,
        volume: 32500000,
        avgVolume20: 19460000,
        rvol: 1.67,
        rsi: { '1H': 61.8, D: 60.5, W: 64.2, M: 70.1 },
        ma: {
          '1H': { ema9: 176.8, ema20: 175.4, ema50: 173.9, sma50: 173.5, sma100: 171.8, sma200: 169.2 },
          D: { ema9: 175.2, ema20: 172.8, ema50: 167.4, sma50: 166.9, sma100: 160.2, sma200: 148.6 },
          W: { ema9: 170.5, ema20: 163.2, ema50: 148.9, sma50: 147.2, sma100: 121.4, sma200: 94.8 },
          M: { ema9: 156.4, ema20: 134.2, ema50: 96.5, sma50: 94.1, sma100: 68.4, sma200: 46.2 },
        },
        history: [167, 169, 168, 170, 172, 171, 173, 174, 173, 175, 176, 178.25],
      },
      {
        symbol: 'AMZN',
        tvSymbol: 'NASDAQ:AMZN',
        name: 'Amazon.com Inc.',
        sector: 'Consumer Discretionary',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 204.50,
        changePct: 1.44,
        volume: 46800000,
        avgVolume20: 34410000,
        rvol: 1.36,
        rsi: { '1H': 60.4, D: 61.9, W: 63.1, M: 66.4 },
        ma: {
          '1H': { ema9: 203.2, ema20: 202.1, ema50: 200.4, sma50: 200.1, sma100: 198.5, sma200: 196.2 },
          D: { ema9: 201.8, ema20: 198.6, ema50: 192.4, sma50: 191.8, sma100: 187.2, sma200: 181.5 },
          W: { ema9: 195.4, ema20: 189.2, ema50: 178.6, sma50: 177.8, sma100: 158.4, sma200: 146.2 },
          M: { ema9: 184.2, ema20: 169.5, ema50: 151.0, sma50: 149.8, sma100: 129.0, sma200: 102.5 },
        },
        history: [194, 195, 197, 196, 198, 199, 200, 199, 201, 202, 203, 204.5],
      },
      {
        symbol: 'AMD',
        tvSymbol: 'NASDAQ:AMD',
        name: 'Advanced Micro Devices',
        sector: 'Semiconductors',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 138.90,
        changePct: -2.15,
        volume: 59100000,
        avgVolume20: 38120000,
        rvol: 1.55,
        rsi: { '1H': 31.4, D: 32.8, W: 46.2, M: 52.4 },
        ma: {
          '1H': { ema9: 140.4, ema20: 142.1, ema50: 145.0, sma50: 145.4, sma100: 148.2, sma200: 151.0 },
          D: { ema9: 143.2, ema20: 148.5, ema50: 154.2, sma50: 154.8, sma100: 156.1, sma200: 159.4 },
          W: { ema9: 150.4, ema20: 155.2, ema50: 154.0, sma50: 153.5, sma100: 138.2, sma200: 118.6 },
          M: { ema9: 151.0, ema20: 142.8, ema50: 121.4, sma50: 120.0, sma100: 94.5, sma200: 64.2 },
        },
        history: [154, 152, 150, 149, 148, 146, 145, 144, 143, 141, 140, 138.9],
      },
      {
        symbol: 'TSLA',
        tvSymbol: 'NASDAQ:TSLA',
        name: 'Tesla Inc.',
        sector: 'Automotive',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 332.40,
        changePct: 4.12,
        volume: 112400000,
        avgVolume20: 48450000,
        rvol: 2.32,
        rsi: { '1H': 72.4, D: 71.2, W: 69.4, M: 63.8 },
        ma: {
          '1H': { ema9: 326.5, ema20: 321.0, ema50: 312.4, sma50: 311.8, sma100: 302.5, sma200: 291.0 },
          D: { ema9: 316.4, ema20: 294.2, ema50: 262.8, sma50: 260.4, sma100: 241.5, sma200: 218.6 },
          W: { ema9: 278.5, ema20: 249.4, ema50: 226.8, sma50: 224.2, sma100: 218.5, sma200: 212.0 },
          M: { ema9: 248.0, ema20: 231.0, ema50: 219.4, sma50: 217.0, sma100: 178.0, sma200: 118.0 },
        },
        history: [262, 274, 281, 289, 295, 292, 304, 312, 318, 321, 325, 332.4],
      },
      {
        symbol: 'GOOGL',
        tvSymbol: 'NASDAQ:GOOGL',
        name: 'Alphabet Inc.',
        sector: 'Communication',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 176.80,
        changePct: -0.30,
        volume: 22900000,
        avgVolume20: 20440000,
        rvol: 1.12,
        rsi: { '1H': 43.8, D: 42.1, W: 60.8, M: 63.4 },
        ma: {
          '1H': { ema9: 177.4, ema20: 178.0, ema50: 178.6, sma50: 178.9, sma100: 177.2, sma200: 175.4 },
          D: { ema9: 178.1, ema20: 177.5, ema50: 172.8, sma50: 172.4, sma100: 169.8, sma200: 164.2 },
          W: { ema9: 174.2, ema20: 170.5, ema50: 162.4, sma50: 161.8, sma100: 145.6, sma200: 129.4 },
          M: { ema9: 166.4, ema20: 154.2, ema50: 132.8, sma50: 131.5, sma100: 105.4, sma200: 78.2 },
        },
        history: [181, 182, 181, 180, 179, 180, 179, 178, 178, 177, 177, 176.8],
      },
      {
        symbol: 'JPM',
        tvSymbol: 'NYSE:JPM',
        name: 'JPMorgan Chase',
        sector: 'Financials',
        universe: ['S&P 500'],
        price: 244.15,
        changePct: 1.85,
        volume: 13800000,
        avgVolume20: 8410000,
        rvol: 1.64,
        rsi: { '1H': 65.1, D: 67.2, W: 70.4, M: 73.6 },
        ma: {
          '1H': { ema9: 242.4, ema20: 240.8, ema50: 238.5, sma50: 238.1, sma100: 235.4, sma200: 232.0 },
          D: { ema9: 239.8, ema20: 233.4, ema50: 222.6, sma50: 221.8, sma100: 214.2, sma200: 201.4 },
          W: { ema9: 229.4, ema20: 217.8, ema50: 198.5, sma50: 197.2, sma100: 174.8, sma200: 154.2 },
          M: { ema9: 209.2, ema20: 186.4, ema50: 158.2, sma50: 156.9, sma100: 132.4, sma200: 106.8 },
        },
        history: [226, 229, 231, 230, 234, 236, 235, 238, 240, 241, 242, 244.15],
      },
      {
        symbol: 'LLY',
        tvSymbol: 'NYSE:LLY',
        name: 'Eli Lilly & Co.',
        sector: 'Healthcare',
        universe: ['S&P 500'],
        price: 792.50,
        changePct: -1.65,
        volume: 5120000,
        avgVolume20: 3650000,
        rvol: 1.40,
        rsi: { '1H': 34.2, D: 33.6, W: 47.4, M: 61.5 },
        ma: {
          '1H': { ema9: 798.4, ema20: 804.2, ema50: 814.5, sma50: 815.2, sma100: 826.0, sma200: 842.0 },
          D: { ema9: 812.5, ema20: 834.0, ema50: 868.4, sma50: 870.2, sma100: 874.5, sma200: 836.2 },
          W: { ema9: 852.0, ema20: 864.5, ema50: 812.4, sma50: 808.0, sma100: 682.0, sma200: 518.0 },
          M: { ema9: 818.0, ema20: 734.0, ema50: 542.0, sma50: 536.0, sma100: 364.0, sma200: 215.0 },
        },
        history: [862, 854, 848, 842, 836, 830, 822, 818, 810, 804, 798, 792.5],
      },
      {
        symbol: 'INTC',
        tvSymbol: 'NASDAQ:INTC',
        name: 'Intel Corp.',
        sector: 'Semiconductors',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 23.45,
        changePct: -1.10,
        volume: 64200000,
        avgVolume20: 47910000,
        rvol: 1.34,
        rsi: { '1H': 55.2, D: 59.8, W: 36.4, M: 32.1 },
        ma: {
          '1H': { ema9: 23.6, ema20: 23.8, ema50: 24.1, sma50: 24.2, sma100: 24.5, sma200: 24.9 },
          D: { ema9: 23.8, ema20: 24.2, ema50: 25.6, sma50: 25.8, sma100: 28.4, sma200: 33.2 },
          W: { ema9: 24.9, ema20: 27.6, ema50: 32.8, sma50: 33.1, sma100: 35.4, sma200: 41.2 },
          M: { ema9: 28.4, ema20: 33.8, ema50: 40.2, sma50: 40.6, sma100: 44.8, sma200: 42.1 },
        },
        history: [21.8, 22.1, 22.4, 22.8, 23.2, 23.6, 23.9, 24.1, 23.8, 23.7, 23.6, 23.45],
      },
      {
        symbol: 'PLTR',
        tvSymbol: 'NASDAQ:PLTR',
        name: 'Palantir Technologies',
        sector: 'Software',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 62.80,
        changePct: 5.42,
        volume: 94500000,
        avgVolume20: 38570000,
        rvol: 2.45,
        rsi: { '1H': 73.1, D: 74.6, W: 76.2, M: 78.4 },
        ma: {
          '1H': { ema9: 61.2, ema20: 59.8, ema50: 57.6, sma50: 57.4, sma100: 55.2, sma200: 52.8 },
          D: { ema9: 58.6, ema20: 53.4, ema50: 45.2, sma50: 44.6, sma100: 37.8, sma200: 30.4 },
          W: { ema9: 49.2, ema20: 41.5, ema50: 32.4, sma50: 31.8, sma100: 24.2, sma200: 19.6 },
          M: { ema9: 38.4, ema20: 29.6, ema50: 22.4, sma50: 21.8, sma100: 18.2, sma200: 16.5 },
        },
        history: [44, 46, 48, 49, 52, 54, 53, 56, 58, 59, 60, 62.8],
      },
      {
        symbol: 'COST',
        tvSymbol: 'NASDAQ:COST',
        name: 'Costco Wholesale',
        sector: 'Consumer Staples',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 912.40,
        changePct: -0.22,
        volume: 2480000,
        avgVolume20: 1850000,
        rvol: 1.34,
        rsi: { '1H': 41.6, D: 39.8, W: 63.4, M: 71.2 },
        ma: {
          '1H': { ema9: 914.5, ema20: 916.2, ema50: 918.0, sma50: 918.4, sma100: 914.2, sma200: 909.5 },
          D: { ema9: 917.8, ema20: 915.4, ema50: 896.2, sma50: 894.8, sma100: 871.5, sma200: 824.0 },
          W: { ema9: 901.5, ema20: 874.2, ema50: 816.4, sma50: 812.8, sma100: 714.0, sma200: 598.0 },
          M: { ema9: 842.0, ema20: 754.0, ema50: 618.0, sma50: 612.0, sma100: 472.0, sma200: 334.0 },
        },
        history: [924, 926, 922, 920, 918, 919, 917, 916, 915, 914, 913, 912.4],
      },
      {
        symbol: 'PANW',
        tvSymbol: 'NASDAQ:PANW',
        name: 'Palo Alto Networks',
        sector: 'Cybersecurity',
        universe: ['S&P 500', 'NASDAQ 100'],
        price: 389.20,
        changePct: 2.34,
        volume: 5120000,
        avgVolume20: 2790000,
        rvol: 1.84,
        rsi: { '1H': 66.4, D: 64.8, W: 66.2, M: 67.9 },
        ma: {
          '1H': { ema9: 386.4, ema20: 383.2, ema50: 379.5, sma50: 379.0, sma100: 375.2, sma200: 371.0 },
          D: { ema9: 381.5, ema20: 374.2, ema50: 361.8, sma50: 360.5, sma100: 348.4, sma200: 329.2 },
          W: { ema9: 368.4, ema20: 352.6, ema50: 326.8, sma50: 325.0, sma100: 282.4, sma200: 228.5 },
          M: { ema9: 338.0, ema20: 298.5, ema50: 236.0, sma50: 234.0, sma100: 174.0, sma200: 118.0 },
        },
        history: [364, 366, 369, 368, 372, 375, 374, 378, 381, 382, 385, 389.2],
      },
      {
        symbol: 'NKE',
        tvSymbol: 'NYSE:NKE',
        name: 'Nike Inc.',
        sector: 'Consumer Discretionary',
        universe: ['S&P 500'],
        price: 76.40,
        changePct: -0.95,
        volume: 14200000,
        avgVolume20: 10920000,
        rvol: 1.30,
        rsi: { '1H': 54.8, D: 60.4, W: 37.8, M: 35.2 },
        ma: {
          '1H': { ema9: 76.8, ema20: 77.2, ema50: 77.9, sma50: 78.1, sma100: 78.6, sma200: 79.4 },
          D: { ema9: 77.4, ema20: 78.9, ema50: 81.4, sma50: 81.8, sma100: 84.2, sma200: 88.6 },
          W: { ema9: 79.8, ema20: 83.2, ema50: 89.6, sma50: 90.1, sma100: 97.4, sma200: 108.5 },
          M: { ema9: 84.5, ema20: 92.4, ema50: 104.8, sma50: 105.4, sma100: 106.2, sma200: 94.0 },
        },
        history: [72, 73, 74, 75, 76, 77, 78, 77.8, 77.4, 77.1, 76.8, 76.4],
      },
    ],
  },
  IN: {
    market: 'IN',
    exchange: 'NSE',
    currency: '₹',
    benchmark: {
      symbol: 'NIFTY 50',
      name: 'NSE Nifty 50 Index',
      price: 24385.50,
      changePct: 0.52,
      rvol: 1.12,
      above20Ema: true,
      above50Ema: true,
      breadthUp: 62,
    },
    secondaryBenchmark: {
      symbol: 'BANK NIFTY',
      name: 'Nifty Bank Index',
      price: 52140.25,
      changePct: 0.78,
      rvol: 1.24,
    },
    asOfLabel: 'Sample 10:00 AM IST Snapshot (Prev EOD + NSE Opening 45m)',
    source: 'sample',
    stocks: [
      {
        symbol: 'TRENT',
        tvSymbol: 'NSE:TRENT',
        name: 'Trent Ltd.',
        sector: 'Retail',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 7245.00,
        changePct: 2.95,
        volume: 1840000,
        avgVolume20: 910000,
        rvol: 2.02,
        rsi: { '1H': 65.4, D: 64.2, W: 70.8, M: 76.5 },
        ma: {
          '1H': { ema9: 7180, ema20: 7125, ema50: 7040, sma50: 7032, sma100: 6960, sma200: 6880 },
          D: { ema9: 7090, ema20: 6945, ema50: 6680, sma50: 6655, sma100: 6210, sma200: 5420 },
          W: { ema9: 6810, ema20: 6390, ema50: 5410, sma50: 5380, sma100: 4120, sma200: 2890 },
          M: { ema9: 6120, ema20: 4980, ema50: 3240, sma50: 3180, sma100: 2040, sma200: 1280 },
        },
        history: [6720, 6780, 6810, 6790, 6860, 6920, 6940, 7010, 7060, 7090, 7150, 7245],
      },
      {
        symbol: 'HDFCBANK',
        tvSymbol: 'NSE:HDFCBANK',
        name: 'HDFC Bank Ltd.',
        sector: 'Banking',
        universe: ['NIFTY 50', 'NSE F&O', 'Bank Nifty'],
        price: 1742.60,
        changePct: 1.48,
        volume: 19450000,
        avgVolume20: 11860000,
        rvol: 1.64,
        rsi: { '1H': 62.8, D: 61.5, W: 63.2, M: 62.4 },
        ma: {
          '1H': { ema9: 1734, ema20: 1726, ema50: 1715, sma50: 1714, sma100: 1702, sma200: 1690 },
          D: { ema9: 1722, ema20: 1704, ema50: 1672, sma50: 1669, sma100: 1638, sma200: 1584 },
          W: { ema9: 1694, ema20: 1658, ema50: 1602, sma50: 1598, sma100: 1564, sma200: 1492 },
          M: { ema9: 1645, ema20: 1592, ema50: 1518, sma50: 1512, sma100: 1384, sma200: 1120 },
        },
        history: [1675, 1682, 1690, 1686, 1698, 1705, 1712, 1710, 1721, 1726, 1731, 1742.6],
      },
      {
        symbol: 'ICICIBANK',
        tvSymbol: 'NSE:ICICIBANK',
        name: 'ICICI Bank Ltd.',
        sector: 'Banking',
        universe: ['NIFTY 50', 'NSE F&O', 'Bank Nifty'],
        price: 1296.40,
        changePct: -0.35,
        volume: 14200000,
        avgVolume20: 10750000,
        rvol: 1.32,
        rsi: { '1H': 43.2, D: 41.4, W: 64.1, M: 69.8 },
        ma: {
          '1H': { ema9: 1299, ema20: 1302, ema50: 1306, sma50: 1307, sma100: 1298, sma200: 1288 },
          D: { ema9: 1304, ema20: 1301, ema50: 1274, sma50: 1271, sma100: 1236, sma200: 1172 },
          W: { ema9: 1282, ema20: 1246, ema50: 1168, sma50: 1164, sma100: 1052, sma200: 912 },
          M: { ema9: 1218, ema20: 1124, ema50: 948, sma50: 942, sma100: 765, sma200: 584 },
        },
        history: [1318, 1322, 1316, 1312, 1309, 1310, 1306, 1304, 1301, 1300, 1298, 1296.4],
      },
      {
        symbol: 'BHARTIARTL',
        tvSymbol: 'NSE:BHARTIARTL',
        name: 'Bharti Airtel Ltd.',
        sector: 'Telecom',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 1628.20,
        changePct: -0.48,
        volume: 6980000,
        avgVolume20: 5170000,
        rvol: 1.35,
        rsi: { '1H': 41.5, D: 39.6, W: 63.8, M: 72.4 },
        ma: {
          '1H': { ema9: 1633, ema20: 1638, ema50: 1645, sma50: 1646, sma100: 1632, sma200: 1618 },
          D: { ema9: 1642, ema20: 1639, ema50: 1604, sma50: 1601, sma100: 1542, sma200: 1418 },
          W: { ema9: 1614, ema20: 1558, ema50: 1412, sma50: 1406, sma100: 1192, sma200: 964 },
          M: { ema9: 1495, ema20: 1324, ema50: 1042, sma50: 1035, sma100: 814, sma200: 618 },
        },
        history: [1664, 1660, 1656, 1652, 1648, 1650, 1645, 1641, 1638, 1635, 1632, 1628.2],
      },
      {
        symbol: 'BEL',
        tvSymbol: 'NSE:BEL',
        name: 'Bharat Electronics',
        sector: 'Defence',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 308.75,
        changePct: 3.42,
        volume: 34600000,
        avgVolume20: 16090000,
        rvol: 2.15,
        rsi: { '1H': 68.4, D: 65.8, W: 64.5, M: 71.2 },
        ma: {
          '1H': { ema9: 304.2, ema20: 301.0, ema50: 296.5, sma50: 296.1, sma100: 292.4, sma200: 288.0 },
          D: { ema9: 299.4, ema20: 293.8, ema50: 286.2, sma50: 285.5, sma100: 279.4, sma200: 262.8 },
          W: { ema9: 292.5, ema20: 284.0, ema50: 256.4, sma50: 254.8, sma100: 204.2, sma200: 146.5 },
          M: { ema9: 274.0, ema20: 238.5, ema50: 172.0, sma50: 169.5, sma100: 118.4, sma200: 78.2 },
        },
        history: [284, 286, 288, 287, 291, 293, 295, 294, 298, 300, 303, 308.75],
      },
      {
        symbol: 'HAL',
        tvSymbol: 'NSE:HAL',
        name: 'Hindustan Aeronautics',
        sector: 'Defence',
        universe: ['NSE F&O'],
        price: 4465.00,
        changePct: 2.24,
        volume: 2890000,
        avgVolume20: 1620000,
        rvol: 1.78,
        rsi: { '1H': 64.2, D: 62.4, W: 61.2, M: 69.5 },
        ma: {
          '1H': { ema9: 4425, ema20: 4390, ema50: 4345, sma50: 4340, sma100: 4295, sma200: 4240 },
          D: { ema9: 4380, ema20: 4315, ema50: 4240, sma50: 4232, sma100: 4185, sma200: 3960 },
          W: { ema9: 4310, ema20: 4220, ema50: 3890, sma50: 3875, sma100: 3120, sma200: 2240 },
          M: { ema9: 4080, ema20: 3560, ema50: 2580, sma50: 2540, sma100: 1720, sma200: 1140 },
        },
        history: [4210, 4240, 4265, 4250, 4295, 4320, 4340, 4365, 4380, 4395, 4420, 4465],
      },
      {
        symbol: 'M&M',
        tvSymbol: 'NSE:M_M',
        name: 'Mahindra & Mahindra',
        sector: 'Auto',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 2984.50,
        changePct: -0.18,
        volume: 3940000,
        avgVolume20: 2850000,
        rvol: 1.38,
        rsi: { '1H': 44.1, D: 42.3, W: 63.5, M: 73.1 },
        ma: {
          '1H': { ema9: 2992, ema20: 2998, ema50: 3008, sma50: 3010, sma100: 2985, sma200: 2954 },
          D: { ema9: 3002, ema20: 2996, ema50: 2935, sma50: 2928, sma100: 2810, sma200: 2540 },
          W: { ema9: 2955, ema20: 2840, ema50: 2510, sma50: 2498, sma100: 2040, sma200: 1580 },
          M: { ema9: 2740, ema20: 2380, ema50: 1810, sma50: 1795, sma100: 1320, sma200: 940 },
        },
        history: [3040, 3035, 3028, 3020, 3015, 3018, 3010, 3004, 2998, 2994, 2990, 2984.5],
      },
      {
        symbol: 'SBIN',
        tvSymbol: 'NSE:SBIN',
        name: 'State Bank of India',
        sector: 'Banking',
        universe: ['NIFTY 50', 'NSE F&O', 'Bank Nifty'],
        price: 856.20,
        changePct: 1.96,
        volume: 22400000,
        avgVolume20: 12720000,
        rvol: 1.76,
        rsi: { '1H': 65.8, D: 63.4, W: 62.1, M: 66.8 },
        ma: {
          '1H': { ema9: 849, ema20: 844, ema50: 838, sma50: 837, sma100: 830, sma200: 822 },
          D: { ema9: 842, ema20: 831, ema50: 814, sma50: 812, sma100: 804, sma200: 782 },
          W: { ema9: 826, ema20: 811, ema50: 774, sma50: 771, sma100: 694, sma200: 592 },
          M: { ema9: 794, ema20: 738, ema50: 624, sma50: 619, sma100: 498, sma200: 384 },
        },
        history: [814, 818, 822, 820, 826, 831, 834, 832, 839, 844, 848, 856.2],
      },
      {
        symbol: 'RELIANCE',
        tvSymbol: 'NSE:RELIANCE',
        name: 'Reliance Industries',
        sector: 'Energy & Retail',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 1278.40,
        changePct: -1.42,
        volume: 16800000,
        avgVolume20: 11830000,
        rvol: 1.42,
        rsi: { '1H': 33.4, D: 34.1, W: 45.6, M: 51.2 },
        ma: {
          '1H': { ema9: 1286, ema20: 1294, ema50: 1308, sma50: 1310, sma100: 1324, sma200: 1340 },
          D: { ema9: 1298, ema20: 1322, ema50: 1364, sma50: 1368, sma100: 1412, sma200: 1428 },
          W: { ema9: 1345, ema20: 1392, ema50: 1408, sma50: 1405, sma100: 1324, sma200: 1218 },
          M: { ema9: 1378, ema20: 1342, ema50: 1245, sma50: 1238, sma100: 1084, sma200: 842 },
        },
        history: [1348, 1340, 1332, 1328, 1320, 1316, 1310, 1304, 1296, 1292, 1285, 1278.4],
      },
      {
        symbol: 'TCS',
        tvSymbol: 'NSE:TCS',
        name: 'Tata Consultancy Services',
        sector: 'IT Services',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 4168.50,
        changePct: 1.12,
        volume: 3120000,
        avgVolume20: 2210000,
        rvol: 1.41,
        rsi: { '1H': 59.2, D: 58.6, W: 60.4, M: 62.1 },
        ma: {
          '1H': { ema9: 4152, ema20: 4138, ema50: 4118, sma50: 4115, sma100: 4092, sma200: 4065 },
          D: { ema9: 4135, ema20: 4108, ema50: 4062, sma50: 4058, sma100: 4012, sma200: 3924 },
          W: { ema9: 4092, ema20: 4045, ema50: 3940, sma50: 3932, sma100: 3745, sma200: 3480 },
          M: { ema9: 3985, ema20: 3820, ema50: 3510, sma50: 3495, sma100: 3040, sma200: 2420 },
        },
        history: [4055, 4070, 4065, 4085, 4092, 4105, 4112, 4108, 4125, 4138, 4148, 4168.5],
      },
      {
        symbol: 'INFY',
        tvSymbol: 'NSE:INFY',
        name: 'Infosys Ltd.',
        sector: 'IT Services',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 1912.30,
        changePct: 1.65,
        volume: 9420000,
        avgVolume20: 5710000,
        rvol: 1.65,
        rsi: { '1H': 63.5, D: 62.8, W: 65.4, M: 64.2 },
        ma: {
          '1H': { ema9: 1898, ema20: 1886, ema50: 1872, sma50: 1870, sma100: 1854, sma200: 1835 },
          D: { ema9: 1884, ema20: 1862, ema50: 1824, sma50: 1820, sma100: 1768, sma200: 1684 },
          W: { ema9: 1848, ema20: 1796, ema50: 1692, sma50: 1688, sma100: 1584, sma200: 1492 },
          M: { ema9: 1756, ema20: 1654, ema50: 1512, sma50: 1506, sma100: 1295, sma200: 985 },
        },
        history: [1824, 1835, 1842, 1838, 1852, 1860, 1868, 1872, 1880, 1888, 1895, 1912.3],
      },
      {
        symbol: 'TATAMOTORS',
        tvSymbol: 'NSE:TATAMOTORS',
        name: 'Tata Motors Ltd.',
        sector: 'Auto',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 786.40,
        changePct: -1.85,
        volume: 18600000,
        avgVolume20: 12230000,
        rvol: 1.52,
        rsi: { '1H': 54.2, D: 60.2, W: 36.8, M: 38.4 },
        ma: {
          '1H': { ema9: 792, ema20: 798, ema50: 808, sma50: 809, sma100: 818, sma200: 832 },
          D: { ema9: 798, ema20: 822, ema50: 874, sma50: 878, sma100: 924, sma200: 946 },
          W: { ema9: 842, ema20: 896, ema50: 928, sma50: 932, sma100: 812, sma200: 645 },
          M: { ema9: 882, ema20: 834, ema50: 692, sma50: 686, sma100: 512, sma200: 398 },
        },
        history: [762, 768, 774, 782, 790, 796, 802, 804, 798, 794, 790, 786.4],
      },
      {
        symbol: 'BAJFINANCE',
        tvSymbol: 'NSE:BAJFINANCE',
        name: 'Bajaj Finance Ltd.',
        sector: 'NBFC / Financials',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 7185.00,
        changePct: 2.15,
        volume: 2140000,
        avgVolume20: 1175000,
        rvol: 1.82,
        rsi: { '1H': 64.9, D: 62.1, W: 58.4, M: 56.2 },
        ma: {
          '1H': { ema9: 7140, ema20: 7095, ema50: 7035, sma50: 7030, sma100: 6980, sma200: 6920 },
          D: { ema9: 7085, ema20: 7010, ema50: 6925, sma50: 6918, sma100: 6885, sma200: 6840 },
          W: { ema9: 6995, ema20: 6940, ema50: 6910, sma50: 6905, sma100: 6820, sma200: 6510 },
          M: { ema9: 6960, ema20: 6880, ema50: 6620, sma50: 6605, sma100: 5840, sma200: 4420 },
        },
        history: [6890, 6920, 6950, 6940, 6980, 7010, 7025, 7050, 7080, 7105, 7135, 7185],
      },
      {
        symbol: 'INDUSINDBK',
        tvSymbol: 'NSE:INDUSINDBK',
        name: 'IndusInd Bank Ltd.',
        sector: 'Banking',
        universe: ['NIFTY 50', 'NSE F&O', 'Bank Nifty'],
        price: 1018.50,
        changePct: -2.40,
        volume: 9840000,
        avgVolume20: 5520000,
        rvol: 1.78,
        rsi: { '1H': 56.4, D: 61.2, W: 32.5, M: 34.8 },
        ma: {
          '1H': { ema9: 1028, ema20: 1036, ema50: 1048, sma50: 1050, sma100: 1064, sma200: 1085 },
          D: { ema9: 1038, ema20: 1072, ema50: 1168, sma50: 1175, sma100: 1265, sma200: 1348 },
          W: { ema9: 1110, ema20: 1215, ema50: 1310, sma50: 1318, sma100: 1320, sma200: 1185 },
          M: { ema9: 1225, ema20: 1280, ema50: 1215, sma50: 1210, sma100: 1190, sma200: 1140 },
        },
        history: [992, 1004, 1012, 1020, 1032, 1040, 1046, 1042, 1036, 1030, 1024, 1018.5],
      },
      {
        symbol: 'LT',
        tvSymbol: 'NSE:LT',
        name: 'Larsen & Toubro',
        sector: 'Infrastructure',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 3682.40,
        changePct: 1.54,
        volume: 3450000,
        avgVolume20: 2210000,
        rvol: 1.56,
        rsi: { '1H': 61.2, D: 59.4, W: 61.8, M: 67.4 },
        ma: {
          '1H': { ema9: 3662, ema20: 3645, ema50: 3622, sma50: 3618, sma100: 3592, sma200: 3560 },
          D: { ema9: 3638, ema20: 3604, ema50: 3562, sma50: 3556, sma100: 3518, sma200: 3440 },
          W: { ema9: 3595, ema20: 3548, ema50: 3412, sma50: 3405, sma100: 3045, sma200: 2510 },
          M: { ema9: 3465, ema20: 3180, ema50: 2620, sma50: 2605, sma100: 2040, sma200: 1580 },
        },
        history: [3540, 3558, 3572, 3565, 3588, 3602, 3615, 3622, 3635, 3648, 3662, 3682.4],
      },
      {
        symbol: 'SUNPHARMA',
        tvSymbol: 'NSE:SUNPHARMA',
        name: 'Sun Pharmaceutical',
        sector: 'Pharma',
        universe: ['NIFTY 50', 'NSE F&O'],
        price: 1842.00,
        changePct: -0.25,
        volume: 2890000,
        avgVolume20: 2260000,
        rvol: 1.28,
        rsi: { '1H': 42.4, D: 40.8, W: 62.9, M: 71.5 },
        ma: {
          '1H': { ema9: 1846, ema20: 1850, ema50: 1855, sma50: 1856, sma100: 1845, sma200: 1832 },
          D: { ema9: 1852, ema20: 1848, ema50: 1814, sma50: 1810, sma100: 1756, sma200: 1642 },
          W: { ema9: 1824, ema20: 1768, ema50: 1632, sma50: 1625, sma100: 1410, sma200: 1125 },
          M: { ema9: 1712, ema20: 1534, ema50: 1218, sma50: 1210, sma100: 942, sma200: 765 },
        },
        history: [1874, 1870, 1866, 1862, 1858, 1860, 1855, 1852, 1849, 1847, 1845, 1842],
      },
    ],
  },
};

const TIMEFRAMES = [
  { key: '1H', label: '1H Intraday' },
  { key: 'D', label: 'Daily' },
  { key: 'W', label: 'Weekly' },
  { key: 'M', label: 'Monthly' },
];

const MA_OPTIONS = [
  { key: 'ema9', label: 'EMA 9' },
  { key: 'ema20', label: 'EMA 20' },
  { key: 'ema50', label: 'EMA 50' },
  { key: 'sma50', label: 'SMA 50' },
  { key: 'sma100', label: 'SMA 100' },
  { key: 'sma200', label: 'SMA 200' },
];

const MA_CONDITIONS = [
  { key: 'price_above', label: 'Price Above', needsMa: true },
  { key: 'price_below', label: 'Price Below', needsMa: true },
  { key: 'within_2pct', label: 'Within ±2% of', needsMa: true },
  { key: 'ema20_gt_ema50', label: 'EMA 20 > EMA 50', needsMa: false },
  { key: 'ema20_lt_ema50', label: 'EMA 20 < EMA 50', needsMa: false },
  { key: 'bullish_stack', label: 'Bullish Stack (P > 20E > 50E > 200S)', needsMa: false },
  { key: 'bearish_stack', label: 'Bearish Stack (P < 20E < 50E < 200S)', needsMa: false },
];

const DEFAULT_FILTERS = {
  search: '',
  universe: 'ALL',
  sector: 'ALL',
  minRvol: '',
  maxRvol: '',
  rsMode: 'ALL', // ALL | OUTPERFORM | STRONG_LEADER | UNDERPERFORM
  rsi: {
    '1H': { min: '', max: '' },
    D: { min: '', max: '' },
    W: { min: '', max: '' },
    M: { min: '', max: '' },
  },
  maRules: [],
};

const BUILTIN_PRESETS = [
  {
    id: 'all',
    name: 'All Stocks',
    tag: 'Reset',
    filters: DEFAULT_FILTERS,
  },
  {
    id: 'bullish_gfs',
    name: 'Bullish GFS Pullback',
    tag: 'M>60 • W>60 • D 38–43',
    filters: {
      ...DEFAULT_FILTERS,
      rsi: {
        '1H': { min: '', max: '' },
        D: { min: '38', max: '43' },
        W: { min: '60', max: '' },
        M: { min: '60', max: '' },
      },
    },
  },
  {
    id: 'bearish_gfs',
    name: 'Bearish GFS Pullback',
    tag: 'M<40 • W<40 • D 58–63',
    filters: {
      ...DEFAULT_FILTERS,
      rsi: {
        '1H': { min: '', max: '' },
        D: { min: '58', max: '63' },
        W: { min: '', max: '40' },
        M: { min: '', max: '40' },
      },
    },
  },
  {
    id: 'momentum_rvol',
    name: 'Momentum + RVOL Leader',
    tag: 'RVOL≥1.5x • RS>0 • D RSI>60',
    filters: {
      ...DEFAULT_FILTERS,
      minRvol: '1.5',
      rsMode: 'OUTPERFORM',
      rsi: {
        '1H': { min: '', max: '' },
        D: { min: '60', max: '' },
        W: { min: '60', max: '' },
        M: { min: '', max: '' },
      },
      maRules: [
        { id: 'r1', timeframe: 'D', condition: 'price_above', maKey: 'ema20' },
      ],
    },
  },
  {
    id: 'ma_stack',
    name: 'Strong MA Trend Stack',
    tag: 'D & W Bullish Stack • RVOL≥1.2x',
    filters: {
      ...DEFAULT_FILTERS,
      minRvol: '1.2',
      maRules: [
        { id: 'r1', timeframe: 'D', condition: 'bullish_stack', maKey: 'ema20' },
        { id: 'r2', timeframe: 'W', condition: 'ema20_gt_ema50', maKey: 'ema20' },
      ],
    },
  },
  {
    id: 'oversold_bounce',
    name: 'Oversold Daily Dip',
    tag: 'D RSI<35 • W RSI>45',
    filters: {
      ...DEFAULT_FILTERS,
      rsi: {
        '1H': { min: '', max: '' },
        D: { min: '', max: '35' },
        W: { min: '45', max: '' },
        M: { min: '', max: '' },
      },
    },
  },
];

function formatVolume(vol) {
  if (!Number.isFinite(vol)) return '—';
  if (vol >= 1e7) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`;
  return String(Math.round(vol));
}

function evaluateMaRule(stock, rule) {
  const tfMa = stock.ma?.[rule.timeframe];
  if (!tfMa) return false;
  const p = stock.price;
  const target = tfMa[rule.maKey];

  switch (rule.condition) {
    case 'price_above':
      return Number.isFinite(target) && p > target;
    case 'price_below':
      return Number.isFinite(target) && p < target;
    case 'within_2pct':
      return Number.isFinite(target) && target > 0 && Math.abs((p - target) / target) * 100 <= 2.0;
    case 'ema20_gt_ema50':
      return Number.isFinite(tfMa.ema20) && Number.isFinite(tfMa.ema50) && tfMa.ema20 > tfMa.ema50;
    case 'ema20_lt_ema50':
      return Number.isFinite(tfMa.ema20) && Number.isFinite(tfMa.ema50) && tfMa.ema20 < tfMa.ema50;
    case 'bullish_stack':
      return (
        p > tfMa.ema20 &&
        tfMa.ema20 > tfMa.ema50 &&
        tfMa.ema50 > tfMa.sma200
      );
    case 'bearish_stack':
      return (
        p < tfMa.ema20 &&
        tfMa.ema20 < tfMa.ema50 &&
        tfMa.ema50 < tfMa.sma200
      );
    default:
      return true;
  }
}

function getMarketClock(market) {
  try {
    const now = new Date();
    const tz = market === 'US' ? 'America/New_York' : 'Asia/Kolkata';
    const timeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(now);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now);
    const wd = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
    const hr = Number(parts.find((p) => p.type === 'hour')?.value || 0);
    const min = Number(parts.find((p) => p.type === 'minute')?.value || 0);
    const mins = hr * 60 + min;
    const isWeekend = wd === 'Sat' || wd === 'Sun';

    let status = 'Closed';
    if (!isWeekend) {
      if (market === 'US') {
        if (mins >= 570 && mins < 960) status = 'Live Market';
        else if (mins >= 240 && mins < 570) status = 'Pre-Market';
        else if (mins >= 960 && mins < 1200) status = 'After-Hours';
      } else {
        if (mins >= 555 && mins < 930) status = 'Live Market';
        else if (mins >= 540 && mins < 555) status = 'Pre-Open';
      }
    }
    return { timeStr, tzLabel: market === 'US' ? 'ET' : 'IST', status };
  } catch {
    return { timeStr: '--:--', tzLabel: market === 'US' ? 'ET' : 'IST', status: 'EOD' };
  }
}

function getRsiBadgeClass(val, dark) {
  if (!Number.isFinite(val)) return dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500';
  if (val >= 60) return dark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (val >= 38 && val <= 43) return dark ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
  if (val < 38) return dark ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200';
  return dark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200';
}

export default function App() {
  const [dark, setDark] = useState(true);
  const [market, setMarket] = useState('IN');
  const [mode, setMode] = useState('EOD'); // 'EOD' | 'LIVE'
  const [liveRunning, setLiveRunning] = useState(true);
  const [datasets, setDatasets] = useState(INITIAL_DATASETS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activePresetId, setActivePresetId] = useState('all');
  const [customPresets, setCustomPresets] = useState([]);
  const [sortBy, setSortBy] = useState({ key: 'rvol', dir: 'desc' });
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');
  const [githubUrlInput, setGithubUrlInput] = useState('');
  const [importError, setImportError] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [clock, setClock] = useState(() => getMarketClock('IN'));
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  // Auto-load daily GitHub Actions JSON snapshots when hosted on GitHub Pages
  useEffect(() => {
    let cancelled = false;
    async function loadSnapshots() {
      for (const [key, path] of [['US', './data/us_scan.json'], ['IN', './data/india_scan.json']]) {
        try {
          const res = await fetch(path, { cache: 'no-store' });
          if (!res.ok) continue;
          const json = await res.json();
          if (!cancelled && json && Array.isArray(json.stocks) && json.stocks.length > 0) {
            setDatasets((prev) => ({ ...prev, [key]: json }));
          }
        } catch {
          // Fallback to bundled sample snapshot
        }
      }
    }
    loadSnapshots();
    return () => { cancelled = true; };
  }, []);

  // Load saved custom presets from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pulsescan_custom_presets_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCustomPresets(parsed);
      }
    } catch {
      // Ignore storage restrictions
    }
  }, []);

  // Update market clock
  useEffect(() => {
    setClock(getMarketClock(market));
    const t = setInterval(() => setClock(getMarketClock(market)), 30000);
    return () => clearInterval(t);
  }, [market]);

  // Simulated Live Tick Stream when in LIVE mode
  useEffect(() => {
    if (mode !== 'LIVE' || !liveRunning) return undefined;
    const interval = setInterval(() => {
      setDatasets((prev) => {
        const current = prev[market];
        const benchDelta = (Math.random() - 0.48) * 0.08;
        const newBenchPct = Number((current.benchmark.changePct + benchDelta).toFixed(2));
        const newBenchPrice = Number((current.benchmark.price * (1 + benchDelta / 100)).toFixed(2));

        const updatedStocks = current.stocks.map((s) => {
          const tickPct = (Math.random() - 0.485) * 0.24;
          const nextPrice = Number((s.price * (1 + tickPct / 100)).toFixed(2));
          const nextChange = Number((s.changePct + tickPct).toFixed(2));
          const volBump = Math.round(s.avgVolume20 * (0.002 + Math.random() * 0.006));
          const nextVol = s.volume + volBump;
          const nextRvol = Number((nextVol / Math.max(1, s.avgVolume20)).toFixed(2));
          const next1HRsi = Number(
            Math.max(15, Math.min(88, s.rsi['1H'] + tickPct * 2.2)).toFixed(1)
          );
          const nextHist = [...s.history.slice(1), nextPrice];
          return {
            ...s,
            price: nextPrice,
            changePct: nextChange,
            volume: nextVol,
            rvol: nextRvol,
            rsi: { ...s.rsi, '1H': next1HRsi },
            history: nextHist,
          };
        });

        return {
          ...prev,
          [market]: {
            ...current,
            benchmark: {
              ...current.benchmark,
              price: newBenchPrice,
              changePct: newBenchPct,
            },
            stocks: updatedStocks,
          },
        };
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [mode, liveRunning, market]);

  const currentData = datasets[market];

  // Derived universes & sectors for active market
  const universes = useMemo(() => {
    const set = new Set();
    currentData.stocks.forEach((s) => (s.universe || []).forEach((u) => set.add(u)));
    return Array.from(set);
  }, [currentData]);

  const sectors = useMemo(() => {
    const set = new Set();
    currentData.stocks.forEach((s) => s.sector && set.add(s.sector));
    return Array.from(set).sort();
  }, [currentData]);

  // Enrich stocks with Relative Strength vs Benchmark & MA alignment summary
  const enrichedStocks = useMemo(() => {
    const benchChg = currentData.benchmark.changePct;
    return currentData.stocks.map((s) => {
      const rsVsMarket = Number((s.changePct - benchChg).toFixed(2));
      const dMa = s.ma.D;
      const above20 = s.price > dMa.ema20;
      const above50 = s.price > dMa.ema50;
      const above200 = s.price > dMa.sma200;
      const bullishStack = s.price > dMa.ema20 && dMa.ema20 > dMa.ema50 && dMa.ema50 > dMa.sma200;
      const bearishStack = s.price < dMa.ema20 && dMa.ema20 < dMa.ema50 && dMa.ema50 < dMa.sma200;
      return {
        ...s,
        rsVsMarket,
        above20,
        above50,
        above200,
        bullishStack,
        bearishStack,
      };
    });
  }, [currentData]);

  // Apply all filters & sorting
  const filteredStocks = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const minRvol = filters.minRvol !== '' ? Number(filters.minRvol) : null;
    const maxRvol = filters.maxRvol !== '' ? Number(filters.maxRvol) : null;

    const list = enrichedStocks.filter((s) => {
      if (q && !s.symbol.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q) && !s.sector.toLowerCase().includes(q)) {
        return false;
      }
      if (filters.universe !== 'ALL' && !(s.universe || []).includes(filters.universe)) {
        return false;
      }
      if (filters.sector !== 'ALL' && s.sector !== filters.sector) {
        return false;
      }
      if (minRvol !== null && Number.isFinite(minRvol) && s.rvol < minRvol) return false;
      if (maxRvol !== null && Number.isFinite(maxRvol) && s.rvol > maxRvol) return false;

      if (filters.rsMode === 'OUTPERFORM' && s.rsVsMarket <= 0) return false;
      if (filters.rsMode === 'STRONG_LEADER' && s.rsVsMarket < 1.5) return false;
      if (filters.rsMode === 'UNDERPERFORM' && s.rsVsMarket >= 0) return false;

      // Multi-timeframe RSI
      for (const tf of TIMEFRAMES) {
        const range = filters.rsi[tf.key];
        const val = s.rsi?.[tf.key];
        if (range.min !== '' && Number.isFinite(Number(range.min))) {
          if (!Number.isFinite(val) || val < Number(range.min)) return false;
        }
        if (range.max !== '' && Number.isFinite(Number(range.max))) {
          if (!Number.isFinite(val) || val > Number(range.max)) return false;
        }
      }

      // Multi-timeframe EMA/SMA rules
      for (const rule of filters.maRules) {
        if (!evaluateMaRule(s, rule)) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      let av;
      let bv;
      switch (sortBy.key) {
        case 'symbol':
          av = a.symbol;
          bv = b.symbol;
          return sortBy.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        case 'price':
          av = a.price;
          bv = b.price;
          break;
        case 'changePct':
          av = a.changePct;
          bv = b.changePct;
          break;
        case 'rvol':
          av = a.rvol;
          bv = b.rvol;
          break;
        case 'rsVsMarket':
          av = a.rsVsMarket;
          bv = b.rsVsMarket;
          break;
        case 'rsiD':
          av = a.rsi.D;
          bv = b.rsi.D;
          break;
        case 'rsiW':
          av = a.rsi.W;
          bv = b.rsi.W;
          break;
        case 'rsiM':
          av = a.rsi.M;
          bv = b.rsi.M;
          break;
        default:
          av = a.rvol;
          bv = b.rvol;
      }
      return sortBy.dir === 'asc' ? av - bv : bv - av;
    });

    return list;
  }, [enrichedStocks, filters, sortBy]);

  const selectedStock = useMemo(
    () => enrichedStocks.find((s) => s.symbol === selectedSymbol) || null,
    [enrichedStocks, selectedSymbol]
  );

  // Handlers
  const switchMarket = (nextMarket) => {
    setMarket(nextMarket);
    setSelectedSymbol(null);
    setFilters((f) => ({ ...f, universe: 'ALL', sector: 'ALL' }));
  };

  const applyPreset = (preset) => {
    setActivePresetId(preset.id);
    setFilters({
      ...DEFAULT_FILTERS,
      ...preset.filters,
      rsi: {
        '1H': { ...DEFAULT_FILTERS.rsi['1H'], ...(preset.filters.rsi?.['1H'] || {}) },
        D: { ...DEFAULT_FILTERS.rsi.D, ...(preset.filters.rsi?.D || {}) },
        W: { ...DEFAULT_FILTERS.rsi.W, ...(preset.filters.rsi?.W || {}) },
        M: { ...DEFAULT_FILTERS.rsi.M, ...(preset.filters.rsi?.M || {}) },
      },
      maRules: (preset.filters.maRules || []).map((r) => ({ ...r })),
    });
  };

  const resetFilters = () => {
    setActivePresetId('all');
    setFilters(DEFAULT_FILTERS);
  };

  const updateRsiFilter = (tf, bound, value) => {
    setActivePresetId('custom');
    setFilters((prev) => ({
      ...prev,
      rsi: {
        ...prev.rsi,
        [tf]: { ...prev.rsi[tf], [bound]: value },
      },
    }));
  };

  const addMaRule = () => {
    setActivePresetId('custom');
    setFilters((prev) => ({
      ...prev,
      maRules: [
        ...prev.maRules,
        {
          id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timeframe: 'D',
          condition: 'price_above',
          maKey: 'ema20',
        },
      ],
    }));
  };

  const updateMaRule = (id, patch) => {
    setActivePresetId('custom');
    setFilters((prev) => ({
      ...prev,
      maRules: prev.maRules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  };

  const removeMaRule = (id) => {
    setActivePresetId('custom');
    setFilters((prev) => ({
      ...prev,
      maRules: prev.maRules.filter((r) => r.id !== id),
    }));
  };

  const toggleSort = (key) => {
    setSortBy((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }
    );
  };

  const handleSavePreset = () => {
    const trimmed = presetNameInput.trim();
    if (!trimmed) return;
    const newPreset = {
      id: `custom_${Date.now()}`,
      name: trimmed,
      tag: 'Saved',
      filters: JSON.parse(JSON.stringify(filters)),
    };
    const next = [...customPresets, newPreset];
    setCustomPresets(next);
    setActivePresetId(newPreset.id);
    setPresetNameInput('');
    setShowSaveModal(false);
    try {
      localStorage.setItem('pulsescan_custom_presets_v1', JSON.stringify(next));
    } catch {
      // Ignore storage error
    }
    showToast(`Saved preset "${trimmed}"`);
  };

  const deleteCustomPreset = (id) => {
    const next = customPresets.filter((p) => p.id !== id);
    setCustomPresets(next);
    if (activePresetId === id) setActivePresetId('custom');
    try {
      localStorage.setItem('pulsescan_custom_presets_v1', JSON.stringify(next));
    } catch {
      // Ignore storage error
    }
  };

  const copyWatchlist = () => {
    const text = filteredStocks.map((s) => s.tvSymbol || s.symbol).join(', ');
    if (!text) {
      showToast('No matching tickers to copy');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(`Copied ${filteredStocks.length} TradingView tickers`),
        () => fallbackCopy(text)
      );
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(`Copied ${filteredStocks.length} TradingView tickers`);
    } catch {
      showToast('Copy unavailable in this browser');
    }
    document.body.removeChild(ta);
  };

  const exportCsv = () => {
    if (!filteredStocks.length) {
      showToast('No matching rows to export');
      return;
    }
    const headers = [
      'Symbol',
      'Name',
      'Sector',
      'Price',
      'Change%',
      'RVOL',
      `RS_vs_${currentData.benchmark.symbol}%`,
      'RSI_1H',
      'RSI_D',
      'RSI_W',
      'RSI_M',
      'D_EMA20',
      'D_EMA50',
      'D_SMA200',
      'Volume',
    ];
    const rows = filteredStocks.map((s) => [
      s.symbol,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.sector}"`,
      s.price,
      s.changePct,
      s.rvol,
      s.rsVsMarket,
      s.rsi['1H'],
      s.rsi.D,
      s.rsi.W,
      s.rsi.M,
      s.ma.D.ema20,
      s.ma.D.ema50,
      s.ma.D.sma200,
      s.volume,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulsescan_${market.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredStocks.length} rows to CSV`);
  };

  const applyImportedJson = (parsed, sourceLabel) => {
    if (!parsed || !Array.isArray(parsed.stocks) || !parsed.benchmark) {
      setImportError('Invalid JSON format. Expected { market, benchmark, stocks: [...] } from scan_markets.py.');
      return;
    }
    const targetMkt = parsed.market === 'US' ? 'US' : 'IN';
    setDatasets((prev) => ({
      ...prev,
      [targetMkt]: {
        ...prev[targetMkt],
        ...parsed,
        source: sourceLabel,
      },
    }));
    setMarket(targetMkt);
    setShowImportModal(false);
    setImportError('');
    showToast(`Loaded ${parsed.stocks.length} ${targetMkt} stocks (${sourceLabel})`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        applyImportedJson(parsed, file.name);
      } catch {
        setImportError('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleGithubFetch = async () => {
    const url = githubUrlInput.trim();
    if (!url.startsWith('https://')) {
      setImportError('Enter a valid https:// raw JSON URL (e.g., https://raw.githubusercontent.com/.../india_scan.json).');
      return;
    }
    setImportLoading(true);
    setImportError('');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = await res.json();
      applyImportedJson(parsed, 'GitHub JSON');
    } catch (err) {
      setImportError(`Failed to fetch URL (${err.message}). Make sure the repo is public and the raw URL is accessible.`);
    } finally {
      setImportLoading(false);
    }
  };

  // Count active filter pills
  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.universe !== 'ALL') c++;
    if (filters.sector !== 'ALL') c++;
    if (filters.minRvol !== '' || filters.maxRvol !== '') c++;
    if (filters.rsMode !== 'ALL') c++;
    TIMEFRAMES.forEach((tf) => {
      if (filters.rsi[tf.key].min !== '' || filters.rsi[tf.key].max !== '') c++;
    });
    c += filters.maRules.length;
    return c;
  }, [filters]);

  // Theme tokens
  const bg = dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const card = dark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const subText = dark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = dark
    ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500';

  const SortIcon = ({ col }) => {
    if (sortBy.key !== col) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortBy.dir === 'desc' ? (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
    ) : (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
    );
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${bg}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-xl">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md ${dark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand + Market Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold tracking-tight leading-tight">PulseScan</h1>
                <p className={`text-[11px] leading-tight ${subText}`}>US &amp; India Multi-TF Scanner</p>
              </div>
            </div>

            {/* Market Switcher */}
            <div className={`flex items-center p-0.5 rounded-lg border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button
                type="button"
                onClick={() => switchMarket('US')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  market === 'US'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : dark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                US (NYSE/NASDAQ)
              </button>
              <button
                type="button"
                onClick={() => switchMarket('IN')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  market === 'IN'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : dark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                India (NSE)
              </button>
            </div>

            {/* Mode Switcher */}
            <div className={`flex items-center p-0.5 rounded-lg border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setMode('EOD')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  mode === 'EOD'
                    ? dark
                      ? 'bg-slate-800 text-cyan-300'
                      : 'bg-white text-indigo-700 shadow-sm'
                    : subText
                }`}
              >
                10 AM IST / EOD
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('LIVE');
                  setLiveRunning(true);
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  mode === 'LIVE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : subText
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${mode === 'LIVE' && liveRunning ? 'bg-white animate-pulse' : 'bg-emerald-400'}`} />
                Live Sim
              </button>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs ${dark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono font-medium">{clock.timeStr} {clock.tzLabel}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                clock.status === 'Live Market'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-700/40 text-slate-400'
              }`}>
                {clock.status}
              </span>
            </div>

            {mode === 'LIVE' && (
              <button
                type="button"
                onClick={() => setLiveRunning((v) => !v)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  dark ? 'bg-slate-900 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-300 hover:bg-slate-100'
                }`}
              >
                {liveRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                {liveRunning ? 'Pause' : 'Resume'}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setImportError('');
                setShowImportModal(true);
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                dark ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-cyan-300' : 'bg-white border-slate-300 hover:bg-slate-100 text-indigo-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Load JSON
            </button>

            <button
              type="button"
              onClick={copyWatchlist}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                dark ? 'bg-slate-900 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-300 hover:bg-slate-100'
              }`}
              title="Copy filtered tickers for TradingView"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy TV</span>
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                dark ? 'bg-slate-900 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className={`p-1.5 rounded-lg border transition-colors ${
                dark ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-amber-300' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-4 space-y-4">
        {/* Benchmark Pulse Bar */}
        <section className={`rounded-2xl border p-3.5 flex flex-wrap items-center justify-between gap-4 ${card}`}>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Primary Benchmark */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentData.benchmark.changePct >= 0
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-rose-500/15 text-rose-400'
              }`}>
                {currentData.benchmark.changePct >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Benchmark</span>
                  <span className="text-sm font-bold">{currentData.benchmark.symbol}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-mono font-bold">
                    {currentData.currency}{currentData.benchmark.price.toLocaleString()}
                  </span>
                  <span className={`text-xs font-mono font-semibold ${
                    currentData.benchmark.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {currentData.benchmark.changePct >= 0 ? '+' : ''}{currentData.benchmark.changePct}%
                  </span>
                  <span className={`text-xs ${subText}`}>• RVOL {currentData.benchmark.rvol}x</span>
                </div>
              </div>
            </div>

            {/* Secondary Benchmark */}
            {currentData.secondaryBenchmark && (
              <div className={`pl-4 border-l ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="text-xs font-semibold">{currentData.secondaryBenchmark.symbol}</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-sm font-mono font-semibold">
                    {currentData.currency}{currentData.secondaryBenchmark.price.toLocaleString()}
                  </span>
                  <span className={`text-xs font-mono font-semibold ${
                    currentData.secondaryBenchmark.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {currentData.secondaryBenchmark.changePct >= 0 ? '+' : ''}{currentData.secondaryBenchmark.changePct}%
                  </span>
                </div>
              </div>
            )}

            {/* Market Breadth */}
            <div className={`pl-4 border-l ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className={`text-[11px] font-medium ${subText}`}>Market Breadth</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-2 rounded-full bg-rose-500/30 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${currentData.benchmark.breadthUp || 50}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  {currentData.benchmark.breadthUp || 50}% Adv
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-lg border ${dark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              {currentData.asOfLabel}
            </span>
          </div>
        </section>

        {/* Quick Strategy Presets Bar */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1">
          <div className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 mr-1 ${subText}`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Presets:
          </div>
          {[...BUILTIN_PRESETS, ...customPresets].map((preset) => {
            const isActive = activePresetId === preset.id;
            const isCustom = preset.id.startsWith('custom_');
            return (
              <div key={preset.id} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                      : dark
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{preset.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {preset.tag}
                  </span>
                </button>
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => deleteCustomPreset(preset.id)}
                    className="ml-1 p-1 rounded-lg text-slate-500 hover:text-rose-400"
                    title="Delete saved preset"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className={`px-2.5 py-1.5 rounded-xl border border-dashed text-xs font-medium shrink-0 flex items-center gap-1 transition-colors ${
              dark ? 'border-slate-700 text-slate-400 hover:text-indigo-300 hover:border-indigo-500' : 'border-slate-300 text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            Save Current
          </button>
        </section>

        {/* Main Workspace: Filter Sidebar + Results Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowFiltersMobile((v) => !v)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 ${card}`}
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px]">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <span className={`text-xs font-medium ${subText}`}>
              {filteredStocks.length} of {enrichedStocks.length} matches
            </span>
          </div>

          {/* Left Filter Sidebar */}
          <aside className={`lg:col-span-4 xl:col-span-3 space-y-3 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
            <div className={`rounded-2xl border p-4 space-y-4 ${card}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold">Scanner Filters</h2>
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`text-xs flex items-center gap-1 hover:text-indigo-400 transition-colors ${subText}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              {/* Search, Universe & Sector */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${subText}`} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    placeholder="Search ticker, name, sector..."
                    className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-none ${inputCls}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${subText}`}>Universe</label>
                    <select
                      value={filters.universe}
                      onChange={(e) => {
                        setActivePresetId('custom');
                        setFilters((f) => ({ ...f, universe: e.target.value }));
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none ${inputCls}`}
                    >
                      <option value="ALL">All ({currentData.exchange})</option>
                      {universes.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${subText}`}>Sector</label>
                    <select
                      value={filters.sector}
                      onChange={(e) => {
                        setActivePresetId('custom');
                        setFilters((f) => ({ ...f, sector: e.target.value }));
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none ${inputCls}`}
                    >
                      <option value="ALL">All Sectors</option>
                      {sectors.map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Relative Volume & Market Strength */}
              <div className={`pt-3 border-t space-y-2.5 ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  Relative Volume &amp; Market Strength
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] mb-1 ${subText}`}>Min RVOL (x)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g. 1.5"
                      value={filters.minRvol}
                      onChange={(e) => {
                        setActivePresetId('custom');
                        setFilters((f) => ({ ...f, minRvol: e.target.value }));
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono outline-none ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] mb-1 ${subText}`}>Max RVOL (x)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Any"
                      value={filters.maxRvol}
                      onChange={(e) => {
                        setActivePresetId('custom');
                        setFilters((f) => ({ ...f, maxRvol: e.target.value }));
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono outline-none ${inputCls}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-[11px] mb-1 ${subText}`}>
                    Strength vs. {currentData.benchmark.symbol}
                  </label>
                  <select
                    value={filters.rsMode}
                    onChange={(e) => {
                      setActivePresetId('custom');
                      setFilters((f) => ({ ...f, rsMode: e.target.value }));
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none ${inputCls}`}
                  >
                    <option value="ALL">Any Relative Strength</option>
                    <option value="OUTPERFORM">Outperforming Market (RS &gt; 0%)</option>
                    <option value="STRONG_LEADER">Strong Leader (RS ≥ +1.5%)</option>
                    <option value="UNDERPERFORM">Underperforming Market (RS &lt; 0%)</option>
                  </select>
                </div>
              </div>

              {/* Multi-Timeframe RSI (14) */}
              <div className={`pt-3 border-t space-y-2.5 ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Multi-Timeframe RSI (14)
                  </div>
                  <span className={`text-[10px] ${subText}`}>Min – Max</span>
                </div>
                <div className="space-y-2">
                  {TIMEFRAMES.map((tf) => (
                    <div key={tf.key} className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 text-xs font-medium">{tf.label}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Min"
                        value={filters.rsi[tf.key].min}
                        onChange={(e) => updateRsiFilter(tf.key, 'min', e.target.value)}
                        className={`col-span-4 px-2 py-1 rounded-lg border text-xs font-mono outline-none ${inputCls}`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Max"
                        value={filters.rsi[tf.key].max}
                        onChange={(e) => updateRsiFilter(tf.key, 'max', e.target.value)}
                        className={`col-span-4 px-2 py-1 rounded-lg border text-xs font-mono outline-none ${inputCls}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Timeframe EMA / SMA Filter Builder */}
              <div className={`pt-3 border-t space-y-2.5 ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    Multi-TF EMA / SMA Rules
                  </div>
                  <button
                    type="button"
                    onClick={addMaRule}
                    className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Rule
                  </button>
                </div>

                {filters.maRules.length === 0 ? (
                  <p className={`text-[11px] rounded-xl p-2.5 border border-dashed ${dark ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-500'}`}>
                    No EMA/SMA rules active. Click <strong>Add Rule</strong> to filter by Price vs. EMA/SMA, crossovers, or bullish/bearish stacks across 1H, Daily, Weekly, or Monthly.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filters.maRules.map((rule) => {
                      const condMeta = MA_CONDITIONS.find((c) => c.key === rule.condition);
                      return (
                        <div
                          key={rule.id}
                          className={`p-2.5 rounded-xl border space-y-2 ${dark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={rule.timeframe}
                              onChange={(e) => updateMaRule(rule.id, { timeframe: e.target.value })}
                              className={`px-2 py-1 rounded-lg border text-xs font-semibold outline-none ${inputCls}`}
                            >
                              {TIMEFRAMES.map((tf) => (
                                <option key={tf.key} value={tf.key}>{tf.label}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => removeMaRule(rule.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                              aria-label="Remove MA rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            <select
                              value={rule.condition}
                              onChange={(e) => updateMaRule(rule.id, { condition: e.target.value })}
                              className={`w-full px-2 py-1 rounded-lg border text-xs outline-none ${inputCls}`}
                            >
                              {MA_CONDITIONS.map((c) => (
                                <option key={c.key} value={c.key}>{c.label}</option>
                              ))}
                            </select>
                            {condMeta?.needsMa && (
                              <select
                                value={rule.maKey}
                                onChange={(e) => updateMaRule(rule.id, { maKey: e.target.value })}
                                className={`w-full px-2 py-1 rounded-lg border text-xs font-mono outline-none ${inputCls}`}
                              >
                                {MA_OPTIONS.map((m) => (
                                  <option key={m.key} value={m.key}>{m.label}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Results Table */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-3">
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              {/* Table Header Strip */}
              <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2 ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {filteredStocks.length} Matching {market === 'US' ? 'US' : 'NSE'} Stocks
                  </span>
                  <span className={`text-xs ${subText}`}>
                    (out of {enrichedStocks.length} tracked)
                  </span>
                </div>
                <div className={`text-[11px] flex items-center gap-3 ${subText}`}>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> RSI ≥ 60</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Pullback 38–43</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> RSI &lt; 38</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[11px] uppercase tracking-wider border-b ${dark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <th className="py-3 px-4">
                        <button type="button" onClick={() => toggleSort('symbol')} className="flex items-center gap-1 font-semibold hover:text-indigo-400">
                          Ticker <SortIcon col="symbol" />
                        </button>
                      </th>
                      <th className="py-3 px-3 text-right">
                        <button type="button" onClick={() => toggleSort('price')} className="inline-flex items-center gap-1 font-semibold hover:text-indigo-400">
                          Price <SortIcon col="price" />
                        </button>
                      </th>
                      <th className="py-3 px-3 text-right">
                        <button type="button" onClick={() => toggleSort('changePct')} className="inline-flex items-center gap-1 font-semibold hover:text-indigo-400">
                          Chg % <SortIcon col="changePct" />
                        </button>
                      </th>
                      <th className="py-3 px-3">
                        <button type="button" onClick={() => toggleSort('rvol')} className="flex items-center gap-1 font-semibold hover:text-indigo-400">
                          RVOL <SortIcon col="rvol" />
                        </button>
                      </th>
                      <th className="py-3 px-3 text-right">
                        <button type="button" onClick={() => toggleSort('rsVsMarket')} className="inline-flex items-center gap-1 font-semibold hover:text-indigo-400">
                          RS vs {currentData.benchmark.symbol} <SortIcon col="rsVsMarket" />
                        </button>
                      </th>
                      <th className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => toggleSort('rsiD')} className="inline-flex items-center gap-0.5 font-semibold hover:text-indigo-400">
                            RSI (1H / D / W / M) <SortIcon col="rsiD" />
                          </button>
                        </div>
                      </th>
                      <th className="py-3 px-4">Daily MA Stack</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${dark ? 'divide-slate-800/70' : 'divide-slate-200'}`}>
                    {filteredStocks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <p className="text-sm font-semibold mb-1">No stocks match your current filters</p>
                          <p className={`text-xs mb-3 ${subText}`}>Try widening your RSI range, lowering Min RVOL, or resetting MA rules.</p>
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                          >
                            Reset All Filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredStocks.map((stock) => {
                        const isSelected = selectedSymbol === stock.symbol;
                        const rvolPct = Math.min(100, (stock.rvol / 2.5) * 100);
                        return (
                          <tr
                            key={stock.symbol}
                            onClick={() => setSelectedSymbol(stock.symbol)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? dark
                                  ? 'bg-indigo-500/15'
                                  : 'bg-indigo-50'
                                : dark
                                ? 'hover:bg-slate-800/50'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            {/* Ticker & Name */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm tracking-tight">{stock.symbol}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                  {stock.sector}
                                </span>
                              </div>
                              <div className={`text-[11px] truncate max-w-[170px] ${subText}`}>{stock.name}</div>
                            </td>

                            {/* Price */}
                            <td className="py-3 px-3 text-right font-mono font-semibold">
                              {currentData.currency}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Change % */}
                            <td className="py-3 px-3 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded-md font-mono font-semibold ${
                                stock.changePct >= 0
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-rose-500/15 text-rose-400'
                              }`}>
                                {stock.changePct >= 0 ? '+' : ''}{stock.changePct.toFixed(2)}%
                              </span>
                            </td>

                            {/* RVOL */}
                            <td className="py-3 px-3 min-w-[110px]">
                              <div className="flex items-center justify-between font-mono font-semibold mb-1">
                                <span className={stock.rvol >= 1.5 ? 'text-cyan-400' : ''}>{stock.rvol.toFixed(2)}x</span>
                                <span className={`text-[10px] font-normal ${subText}`}>{formatVolume(stock.volume)}</span>
                              </div>
                              <div className={`w-full h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                <div
                                  className={`h-full rounded-full ${stock.rvol >= 1.8 ? 'bg-cyan-400' : stock.rvol >= 1.3 ? 'bg-indigo-400' : 'bg-slate-500'}`}
                                  style={{ width: `${rvolPct}%` }}
                                />
                              </div>
                            </td>

                            {/* RS vs Market */}
                            <td className="py-3 px-3 text-right font-mono font-semibold">
                              <span className={stock.rsVsMarket >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {stock.rsVsMarket >= 0 ? '+' : ''}{stock.rsVsMarket.toFixed(2)}%
                              </span>
                            </td>

                            {/* Multi-TF RSI */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1 font-mono text-[11px]">
                                {['1H', 'D', 'W', 'M'].map((tf) => (
                                  <span
                                    key={tf}
                                    title={`${tf} RSI(14): ${stock.rsi[tf]}`}
                                    className={`px-1.5 py-0.5 rounded border ${getRsiBadgeClass(stock.rsi[tf], dark)}`}
                                  >
                                    <span className="opacity-60 mr-0.5 text-[9px]">{tf}</span>
                                    {stock.rsi[tf].toFixed(0)}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Daily MA Alignment */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                {[
                                  { label: '20E', ok: stock.above20 },
                                  { label: '50E', ok: stock.above50 },
                                  { label: '200S', ok: stock.above200 },
                                ].map((m) => (
                                  <span
                                    key={m.label}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                      m.ok
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : 'bg-rose-500/15 text-rose-400'
                                    }`}
                                  >
                                    {m.label}
                                  </span>
                                ))}
                                {stock.bullishStack && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                                    Stack ↑
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Slide-Over Stock Detail Drawer */}
      {selectedStock && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-xs" onClick={() => setSelectedSymbol(null)}>
          <div
            className={`w-full max-w-lg h-full overflow-y-auto p-5 border-l space-y-5 ${
              dark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{selectedStock.symbol}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    {currentData.exchange} • {selectedStock.sector}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${subText}`}>{selectedStock.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSymbol(null)}
                className={`p-1.5 rounded-lg border ${dark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price & Key Metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className={`p-3 rounded-xl border ${card}`}>
                <div className={`text-[11px] ${subText}`}>Last Price</div>
                <div className="text-base font-mono font-bold mt-0.5">
                  {currentData.currency}{selectedStock.price.toLocaleString()}
                </div>
                <div className={`text-xs font-mono font-semibold ${selectedStock.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedStock.changePct >= 0 ? '+' : ''}{selectedStock.changePct.toFixed(2)}%
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${card}`}>
                <div className={`text-[11px] ${subText}`}>Relative Volume</div>
                <div className="text-base font-mono font-bold text-cyan-400 mt-0.5">
                  {selectedStock.rvol.toFixed(2)}x
                </div>
                <div className={`text-[11px] ${subText}`}>Vol {formatVolume(selectedStock.volume)}</div>
              </div>
              <div className={`p-3 rounded-xl border ${card}`}>
                <div className={`text-[11px] ${subText}`}>RS vs {currentData.benchmark.symbol}</div>
                <div className={`text-base font-mono font-bold mt-0.5 ${selectedStock.rsVsMarket >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedStock.rsVsMarket >= 0 ? '+' : ''}{selectedStock.rsVsMarket.toFixed(2)}%
                </div>
                <div className={`text-[11px] ${subText}`}>
                  {selectedStock.rsVsMarket >= 0 ? 'Outperforming' : 'Lagging'}
                </div>
              </div>
            </div>

            {/* Mini Price vs EMA Chart */}
            <div className={`p-3.5 rounded-xl border ${card}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Recent Trend vs Daily EMA 20</span>
                <a
                  href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(selectedStock.tvSymbol || selectedStock.symbol)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  Open TradingView <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={selectedStock.history.map((p, idx) => ({
                      bar: `T-${selectedStock.history.length - 1 - idx}`,
                      price: p,
                      ema20: selectedStock.ma.D.ema20,
                    }))}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <XAxis dataKey="bar" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: dark ? '#0f172a' : '#ffffff',
                        borderColor: dark ? '#334155' : '#e2e8f0',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="#6366f1"
                      fillOpacity={0.18}
                    />
                    <Line
                      type="monotone"
                      dataKey="ema20"
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      dot={false}
                      strokeWidth={1.5}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Multi-Timeframe RSI Gauges */}
            <div className={`p-3.5 rounded-xl border space-y-2.5 ${card}`}>
              <h3 className="text-xs font-bold">Multi-Timeframe RSI (14)</h3>
              {TIMEFRAMES.map((tf) => {
                const val = selectedStock.rsi[tf.key];
                return (
                  <div key={tf.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{tf.label}</span>
                      <span className="font-mono font-bold">{val.toFixed(1)}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full ${
                          val >= 60 ? 'bg-emerald-500' : val >= 38 && val <= 43 ? 'bg-amber-400' : val < 38 ? 'bg-rose-500' : 'bg-indigo-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily EMA / SMA Price Ladder */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${card}`}>
              <h3 className="text-xs font-bold">Daily EMA / SMA Distance Ladder</h3>
              <div className="grid grid-cols-2 gap-2">
                {MA_OPTIONS.map((m) => {
                  const maVal = selectedStock.ma.D[m.key];
                  const distPct = maVal ? ((selectedStock.price - maVal) / maVal) * 100 : 0;
                  const above = distPct >= 0;
                  return (
                    <div
                      key={m.key}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        dark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{m.label}</div>
                        <div className={`font-mono text-[11px] ${subText}`}>
                          {currentData.currency}{maVal.toLocaleString()}
                        </div>
                      </div>
                      <span className={`font-mono font-semibold text-xs ${above ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {above ? '+' : ''}{distPct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowSaveModal(false)}>
          <div className={`w-full max-w-sm rounded-2xl border p-5 space-y-4 ${card}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Save Custom Scan Preset</h3>
              <button type="button" onClick={() => setShowSaveModal(false)} className={subText}><X className="w-4 h-4" /></button>
            </div>
            <input
              type="text"
              value={presetNameInput}
              onChange={(e) => setPresetNameInput(e.target.value)}
              placeholder="e.g., High RVOL + Weekly EMA20"
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${inputCls}`}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${subText}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreset}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import GitHub JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowImportModal(false)}>
          <div className={`w-full max-w-md rounded-2xl border p-5 space-y-4 ${card}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Load GitHub Actions Scan Snapshot</h3>
              <button type="button" onClick={() => setShowImportModal(false)} className={subText}><X className="w-4 h-4" /></button>
            </div>
            <p className={`text-xs leading-relaxed ${subText}`}>
              Load your daily <strong>10:00 AM IST</strong> <code className="text-indigo-400">us_scan.json</code> or <code className="text-indigo-400">india_scan.json</code> generated by <code className="text-indigo-400">scan_markets.py</code>.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold">Option 1: Fetch from Public GitHub Raw URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={githubUrlInput}
                  onChange={(e) => setGithubUrlInput(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/user/repo/main/public/data/india_scan.json"
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none ${inputCls}`}
                />
                <button
                  type="button"
                  onClick={handleGithubFetch}
                  disabled={importLoading}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  {importLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Fetch'}
                </button>
              </div>
            </div>

            <div className={`pt-3 border-t space-y-2 ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
              <label className="block text-xs font-semibold">Option 2: Upload Local JSON File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-2.5 rounded-xl border border-dashed text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  dark ? 'border-slate-700 hover:border-indigo-500 text-slate-300' : 'border-slate-300 hover:border-indigo-500 text-slate-700'
                }`}
              >
                <Upload className="w-4 h-4 text-indigo-400" />
                Choose us_scan.json or india_scan.json
              </button>
            </div>

            {importError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
                {importError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
