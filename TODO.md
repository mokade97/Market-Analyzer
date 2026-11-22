
## Parked (apply with next batch of changes)
- Twelve Data (twelvedata.com) as SECOND source only, in the "AI market" tab:
  - XAU/USD + XAG/USD spot (real metals price/hours) alongside OKX XAU-USDT/XAG-USDT perps
  - DXY / SPX / US10Y as fallback for the macro agent (Yahoo currently flaky)
  - Free plan: 800 req/day, 8 req/min, ~1-15 min delay -> only few requests/day, daily TF
  - Needs user API key (store in localStorage, optional); never used for bot or paper exchange
- Paper exchange: add optional profile "ICHI + no-chase" (research/REPORT.md section 5):
  skip ICHI 4H signal when 60-bar return in trade direction > +16% (f_ret60 > 16.3, cut from IS tercile).
  Runs side by side with the standard profile for comparison. Bot untouched.
  Optional second variant: skip when 20-bar realized vol (log-return stdev) > 2.23%.
- AI roundtable: add "Laws of Trading" (Agustin Lebron) principles as a checklist to the critic/risk agent prompt
  (motivation/who is on the other side, adverse selection, risk only when paid, liquidity, edge must be stated in one
  sentence + numbers, models break, costs are the only certainty, edges decay -> monitor). Principles only, no book text.
- Screener: add OKX fallback (GET /api/v5/market/tickers?instType=SWAP) when scanner.tradingview.com (tvScan) fails,
  for the symbol list, quick price/change columns and price alerts (checkAlerts). Bot/paper/backtest/chart already OKX-only.

## Release rule (user instruction, 2026-11-22)
- From now on ship ONLY changed files as a delta zip (e.g. market-analyzer-update-v113.zip) with the same relative paths
  as the Pages repo; full package only when the user asks. Always include index.html + sw.js (version/cache bump).


## v114 (2026-11-23) — applied
- Chart freeze on touch after drawing (replay / in-app KLineCharts): root cause = a finger landing within hit-tolerance of any drawn line "pressed" the overlay (dragged it or did nothing) instead of panning; plus KLineCharts' sticky long-tap crosshair mode. Fix in tvchart.js: touch-safe drawings (finished drawings locked; tap selects+unlocks; tap elsewhere re-locks), locked overlay touch starts a pan, crosshair mode released on touchend, hand button + long-press cancel an unfinished drawing.
- Chart tab tool strip (chartbar.js): Lens / Roundtable in a bottom sheet (same DOM, moved while open), Replay/Backtest jump with symbol+tf, Chat, Vision. NOTE: the main chart is a TradingView iframe — Lens SL/TP lines cannot be drawn inside it; they are shown on the in-app replay chart (plan lines) only.
- Twelve Data second source (features.js, key fc_td_key in settings): spot XAU/XAG + DXY/SPX/US10Y added as macro_twelvedata in the AI-market desk LIVE_DATA. Not used by bot/Lens/paper.
- Paper exchange profile "nochase" (balanced + skip when 60-bar return in trade direction > 16.3%).
- Laws of Trading checklist (7 questions) in the roundtable risk-manager prompt (agents.js).
- Screener: tvScan falls back to OKX tickers (price/24h/volume only; indicator columns null) when scanner.tradingview.com fails.
Parked items from the previous list are now all applied; the list is empty.
- v114b (video 2026-11-22): landscape replay showed candles squeezed into a strip + blank chart. Cause: fullscreen fit ran 350ms after the tap, before the phone rotated → bar spacing from portrait width. Fix: ResizeObserver-based refit on real width change (replay.js), fit() ignores widths <160px, min 12 visible bars on both scroll limits (tvchart.js).
- v114c: replay chart integrated TradingView-style — the duplicate toolbar above the chart is gone; timeframes use the Pro header, extra indicators (Ichimoku…Stoch, Swings, strategy signals) live in a ƒx+ dropdown in the header, visible-candle count in ⤢, the Pro fullscreen button routes to the app fullscreen (orientation lock), ✋ cancel + ↶ undo appended to the Pro drawing bar (TVChart.integrateBar). Compact header CSS on phones.
