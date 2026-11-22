
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
