
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
- v114d: (a) ƒx+ "createIndicator of null" — a stale chart instance (from before a header timeframe change) re-injected its menu into the new chart; now instances are id-tagged, listeners use AbortController and observers are disconnected on destroy. (b) Drawing bar: whole menu box tappable, touch-action:manipulation, our ✋/↶ re-added after the bar is re-opened. (c) Auto-play freeze on Android WebView (candle pane stopped repainting while the time axis moved): throttled forced resize() per step (≤1/700ms). Not reproducible in Chromium; mitigation.
- v114e: (a) price-axis touch scaling — KLineCharts only supports it with a mouse; touch shim mirrors the mouse path (touchstart on yAxis sets _prevYAxisRange/_mouseDownWidget, touchmove -> pressedMouseMoveEvent, touchend releases; double-tap on the axis resets auto-scale). (b) landscape: drawing-bar popovers were clipped by the bar's own overflow (max-height media rule) -> lifted out with position:fixed when the bar scrolls.
- v115: new src/tvtools.js — 19 extra drawing tools (crossline; fib time zone / trend-based fib time / fib channel / fib arcs / fib wedge; flat top-bottom, disjoint channel; 4 pitchforks; position forecast, bars pattern, ghost feed, sector; anchored VWAP, fixed-range & anchored volume profile), injected as 5 groups into the Pro drawing bar (replay too), + ⚙ properties dialog (color/width/style/hide/lock/delete; also on double-click/right-click of a drawing) + ☰ objects tree (drawings & indicators with show/lock/edit/delete). Persistence stores styles/hidden/lock.
- v115a: screener detail: 'send chart to Gemini' button replaced by 'open chart for this symbol' (sets tvSym/tvInt from detail TF, opens Chart tab, loadTv).
- v115c (self-audit): eslint (no-undef/dupe-keys/unreachable…) over all src + bot → 0 real findings (all "undefined" names are template globals, verified); Playwright sweep over every tab/button, backtest run, replay (+10/+1/auto/trade), screener detail + Lens/risk/journal/flow/alert/watch/no-AI report, tools, bot card, calc, EN/FA switch, sw asset list, manifest icons → 0 page errors, 0 console errors. Bot `node bot/bot.js` one run: 0 errors (OKX). Fixes: OKX/Bybit/Bitget/Gate `meta()` crashed with "Cannot read properties of undefined (reading 'oiCcy')" for symbols not listed on that exchange → clean "not listed" message; fc_watch JSON.parse guarded.
- v116 (external audit #1, Claude — 17 findings triaged; 15 confirmed & fixed, 2 partially): bot: setThr(minScore) now applied (#14); sweep entry only on bars_ago 0 (#2); plan rebuilt when sweep side != engine plan (#1); LLM levels sanity-checked vs ATR/direction (#3); throttle in finally (#15); cumulative equity not truncated by keepClosed (#13); gap-aware SL fill (#5, also paper.js); OKX/Bitget 1D→1Dutc so all exchanges share the UTC day (#8, app+bot); Gemini key moved to x-goog-api-key header (bot + model list). app: backtest BE/trail applied only after the SL test of the same bar (#6); tvExch gate→GATEIO (#7); kline cache fallback rejected when older than 2 bars (#9); race tokens in screener loadDetail and replay load (#10); paper: lab verdict gates only the live bar (#4), save() guarded + seen capped (#11); settings import validates https + confirms endpoint changes (#17); sw network-first with 4s timeout (#16). Not done: #12 (paper recompute every 5 min — perf only), P3 list (cost constants, innerHTML esc, popstate, EMA seed) — tracked below.
- TODO (P3 from audit): unify fee defaults (lens 0.3% / bot 0.13% / paper 0.15%); esc() for r.display/e.message in innerHTML; single popstate dispatcher; checkAlerts re-read after await; backtest loop end n-2.
- v116a (external audit #2, ChatGPT — 12 findings): confirmed & fixed: paper historical replay processed the entry bar (not yet closed at time tt) → manage() now uses close-time semantics (b.t+TF<=uptoT) and the time-walk passes tt; partial exits release margin proportionally; RSI flat market → 50 (lens/backtest/engine); tvchart period-change responses guarded by request id; screener coin list escapes symbol/display + strict symbol regex; agent prompts sanitize sym/tf. Already fixed in v116: stale cache, trailing-stop ordering (same-bar), key in query. Rejected/not applicable: missing klpro.css/icons (only absent from the audit pack, present in repo); R-based DD naming (strategy lab is explicitly R-based); localStorage keys (by design — local-only app, documented + wipe button); backtester close-entry vs paper next-open (documented research convention). Deferred: AbortController per exchange request (perf).
- v116b (external audit #3, Kimi — 12 findings): confirmed & fixed: replay called lens.backtest without {tf} → funding cost 16× on 15m / 6× too low on 1D (#1, real P0 for the strategy tester rows); AI JSON rendered raw into innerHTML → deepEsc() of model output + md() escapes > and " + e.message escaped (#5); replay load() stops autoplay (#7); Binance klines paginate past the 1500 cap + 5m mapping (#8); build.py appends a bundle hash to the SW cache name (#9); watcher JSON.parse guarded (#11); export asks before including API keys (#6 partial); revokeObjectURL in paper export (#12). Already fixed earlier: cache TTL (#4), paper seen cap (#10), replay race (#7 token). FALSE: #2 (icons missing — only from the audit pack), #3 (swing-stop "mirrored" — Kimi's own arithmetic shows sl = lvl − 0.1·ATR; the clamps are intentional).
- v116c (external audit #4, Grok — 17 items): only #14 applied (separator touch listeners now on the chart's AbortController; was harmless since the nodes die with the chart). FALSE: #1 swingsAt (j ≤ i+n ≤ L by construction — no look-ahead, Grok's "fix" is a no-op), #2 volumeProfile (i ≤ L−40 → j ≤ L−30), #3 duplicated last candle (intentional: packet treats the last element as the forming bar, L=len−2), #4 bot/paper "stop never moved after T1" (model is T1=+1.5R half, remainder to original SL → net +0.25R, arithmetic consistent; v116 already made the SL leg gap-aware), #9 key echoed to DOM (inputs are type=password), #11/#13 no issue. Already fixed: #7 cache TTL, #10 prompt sanitize, #12 SW build id. Documented modelling choices, unchanged: #5 SL-first on shared bar, #6 funding per bar approximation.
- Regression (real OKX data, v115c-before-audit vs v116c): engine lens.backtest identical on 12 sym/TF combos (no behavioural change intended there); Backtest Studio ICHI: unchanged when T1/trail off (SOL 4H identical), with T1/trail trades −1..−2 and results shift (BTC 4H −6.4R→−2.8R, XAU 4H +3.8R→+10.5R, ETH 1H −8.2→−7.6R) because same-bar BE exits no longer happen; Paper 120d/22 syms: 65→63 closed, win 48%→43%, +13.0R→+4.8R, maxDD 9.7%→8.4%, no negative margin, 0 errors — more conservative as expected after removing the entry-bar look-ahead and lab gating.
- v116d (bot): CORRECTION — the v116 bot patches had been applied to the stale template futures-calculator/bot/bot.js (pre-v100, no shadow/desk/judge) and that file was shipped in the update zips. The real bot is lens-bot/ (v111b). Re-checked against the audits: v107 side-rebuild (= Claude #1), v110 number lock (≈ #3), v111b setThr (#14) already present; pool-based scan makes #15 moot; applied the one missing fix (#2: SWEEP nominates only when bars_ago === 0). engine.js identical in both. Bot now ships separately as lens-bot-v116.zip.
- v116d (external audit #5, "manual-verified" report, 26 items): fixed #3 stored XSS (journal symbol/why/note/lesson, alerts sym/label escH; bot panel deep-escapes remote JSON), #12 display sanitized before prompt, #14 SW install allSettled (hardening; icons DO exist), #15 saveLog try/catch, #16 flow.js AbortSignal.timeout guard, #17 clipboard .catch, #21 aiData re-render on lang switch (was never reached — TDZ/let), #22 fa tdKeyL + setLang keeps text when key missing, #23 chat history capped 40, #24 overscroll-behavior-y. FALSE: #1 Bitget reverse (v2 API returns oldest-first — checked live), #11 trail (ratchet already applied next bar since v116). Already fixed: #2 (v116 #6), #4 okx 300, #5/#6 race guards, #7 TTL, #9 paper gap, #13 key export confirm. Design/deferred: #8 slippage per layer (lens is deliberately conservative live), #10 TP slippage, #18 Sharpe years, #19 (see Grok #3), #20, #25, #26.

## DONE v117 (user-approved, ship with the first v117 change)
- Screener "manual scan" (inspired by alphakademi.com): condition builder — indicator (EMA/SMA/RSI/ATR/BB width/ADX/relVol/Supertrend/Ichimoku/price/change%) · bars-ago shift · operator (< > crosses) · number OR another indicator×k · AND/OR; named presets (BB squeeze, 52-period breakout, relVol 2× + above EMA9 "smart money", SMA50>SMA200 & ADX>25, Supertrend flip, momentum top movers); save filters (localStorage); result table with the condition columns + existing "📈 فراخوانی چارت" button; CSV export. Runs on the screener's cached klines via lens.series/labSeries (no new data). Both languages.


## v117 (done)
- KLineCharts perf phase 1: TF switch in-place (no chart recreate), click-queue while loading, cull off-screen overlays, event-driven sepShim, DPR cap 2, memoised calcTextWidth.
- Screener manual scan (src/mscan.js): 33 indicators, n-bars-ago, 6 operators incl. cross, AND/OR, 9 presets, saved filters, CSV, chart link.
- Phase 2 candidate: LWC migration (overlay-count scaling in KL remains: 160 fib overlays → 6fps).

## v118 (done) — chart engine switched to Lightweight Charts
- src/lwchart.js: LWChart.mount() with the same surface as TVChart (push/setMarks/setLines/setExt/fit/setPeriod/integrateBar/destroy).
  Own drawing layer (single canvas, viewport-culled): 24 tools (lines, rays, channels, fib retr/seg/ext, rect/ellipse/triangle, brush/highlighter,
  long/short position, measure, text/note, price line), select/move/handles, props panel (color/width/dash/text/hide/delete), magnet, undo, clear,
  Esc/Delete keys, long-press cancel. Drawings share storage key fc_tv_draw_<sym> with the KL engine.
  Indicators: EMA, EMA9/21, SMA, BOLL, VWAP, Supertrend, Donchian, Ichimoku (lines), VOL, RSI, MACD, ATR, ADX, OBV (sub-panes = synced charts).
- replay.js: engine selector fc_engine (default lwc; 'kl' fallback via ƒx menu toggle). Lens line in stats() debounced (was ~100ms per step on phone).
- Bench (CPU 4×, phone viewport, pan/zoom/crosshair fps): 0 drawings 48/46/56 · 40 → 50/45/54 · 160 → 41/38/37 (KL: 47/49/53 · 31/24/21 · 13/13/15).
  Step cost 8–13ms (KL 27–45ms).
- TODO next: Ichimoku cloud fill, props for sys lines, pinch-zoom check on real device, backtest page still uses btchart.js (LWC read-only) — could reuse LWChart.

## v120 (done)
- KLineCharts removed entirely (klinecharts.js/klpro.js/klpro.css/tvchart.js/tvtools.js → attic/, not bundled). Bundle 1.33 MB → 0.86 MB.
- LWChart: global 🔒 lock + per-drawing lock; selection only by TAP (pan/pinch starting on a drawing never grabs it).
- TV-style tools: fib retracement 11 levels w/ coloured bands, regression trend (Pearson R, two-colour fill), parallel/price channel (mid + quartiles).
- Ichimoku cloud filled (overlay layer). 15 new indicators: KC, ENV, HMA, WMA, SAR, STOCH, STOCHRSI, CCI, WPR, MFI, CMF, AROON, ROC, SQZ (TTM), + existing.
- HD toggle gone (was the DPR cap of the KL engine).

## v121 (done)
- Backtest tab: segmented sub-tabs «بک‌تست | بازپخش» (btSeg → btPane/rpPane; remembered in fc_bt_pane). Replay pane has own symbol input (rpSym, synced to btSym) + load button; auto-loads on first open.
- Replay bottom compacted: trade settings collapsed in <details>, 4 action buttons one row, stats 3-col compact grid, candle/date split.

## v122 (done)
- Replay header redesigned: symbol field → slider → [بارگذاری بازپخش | TradingView] button row (standard .btns), status line below.
- src/sympick.js: universal symbol picker (▾ next to every symbol input: tvSym, btSym, rpSym, cSym, sym, customSym). Bottom sheet with search + tabs (all/recent/metals/crypto/forex-note); crypto = top-150 OKX USDT spot-volume with perps (6h cache fc_univ), stablecoins excluded; metals XAU/XAG/XPT/PAXG; recent list fc_sym_recent. Forex tab explains pairs are bot-only.
- v123: calculator symbol field restored to plain input (picker removed there per user).

## v124 (done)
- 🔐 Entry lock: 4-digit PIN gate before anything renders (SHA-256 hash in index.template.html, session-scoped unlock, keypad + keyboard, JS SHA-256 fallback for non-secure contexts). Change: replace var HASH.
- Help: new pages for 📊 بک‌تست (studio + replay/tools/indicators/lock), 🤖 ربات (bot + ledger), 🏦 صرافی مجازی; tools help trimmed to Lens/lab/roundtable/watch; chart/screener/settings updated (symbol picker ▾, PIN). FA + EN.
- README rewritten from scratch (features, tabs, deploy, PIN, keys, bot incl. state.json warning, update, structure, privacy, troubleshooting). No PIN inside.
- Playwright scripts set sessionStorage fc_unlocked.

## v126 (done) — strategy research
- research/: lib.js engine, triggers.js (9 trigger families × regime × score), research2/3/4.js grids, wf.js quarterly walk-forward; REPORT.md (FA).
- Verdict: sweep+score idea has no edge; score filter useless. TEP (engulf pullback in EMA200/EMA50-slope regime, 2×ATR stop, hold to opposite signal) on 4H: 10/10 symbols positive, WF OOS +169R/189 trades; edge is in the long hold (300 bars), 21% win, short-heavy. 1H not robust.
- 5-year test (2021-11→2026-11, deep.js): n1023, avg +0.41R, PF 1.48, 5/5 years, 8/10 symbols, DD 50R; yearly WF OOS +0.41R (2025 ≈ 0). Longs dominate over 5y (shorts dominated last 15m).
- lens.js: STRATS.TEP + per-strategy `exit` override in simulate (sl, flip, maxBars) → bot/engine.js reproduces (+380R).
- Volume-profile test (vp.js/vp_wf.js): mean-reversion to POC NEGATIVE everywhere; VAB (value-area acceptance breakout + trail3) robust: 45/45 grid positive, every year positive, WF OOS +0.14R, DD 27R, corr with TEP 0.41. Ported: STR.VAB (strat2.js, vprof cache) + STRATS.VAB (lens.js, trail exit support in simulate). Visual VP indicator intentionally not built.
- paper.js (صرافی مجازی): multi-strategy — CFG.strats (ICHI/TEP/VAB checkboxes in settings; TEP/VAB 4H-only), per-position exit model pos.ex {sl,trail,flip,maxBars}: trail ratchets stop from extreme ∓ trail×ATR14(prev bars), FLIP exit via cached series, no T1/T2 for trend strategies; ICHI-only filters (no-chase, maxExtAtr) not applied to TEP/VAB; stop0 kept for R; strategy shown under side in tables. Offline e2e (tests/px_check.js, 4 syms × 120d): TEP 18 / VAB 7 / ICHI 4 trades, no errors.
- strat2.js: STR.TEP added (params trend/slope/ma/adx). App engine reproduces research (246 trades, +198.9R vs 250/+195.2R).

## v125 (done) — QUEUE.md List 1 (A–G)
- A: ind2.js — 55 new indicators (DEMA…LSMA, MAX, RIB, PIV, ATRTS, ADST, DMI, UO, CMO, FISH, TSI, TRIX, DPO, COPP, %B, AO, MOM, BOP, KER, RVI, RSIB(+RSI trendlines), CONF, TEC, ADL, CHO, PVT, VOSC, EFI, RVOL, VEX, HV, BBW, SD, CHOP, VTX, NR, REG5). lwchart v1.2: `_shapes`/`_markers` API, grouped ƒx popup + search.
- B: LVL (strength ★1–5, sweep/BRK/PB), EQ, RNG (+premium/discount), PDA, VOB, FVG(CE), MSB (fib 0.273 confirm + OB), SQZB, TL, WOLFE (beta), VCP, LIQ.
- C: strat2.js — MADEUCE, TWRB, LIQ, SCORE(N/16), REG5, TEC, CONF, SQZB, NR7, LVLPB, SWEEP, MAX, VCP (marker-based ones are causal). Anti-repaint: all signals on closed bars (existing). Report: BACKTEST_v125.md.
- D: mscan presets NR7/NR4/range-expansion/N-day-fall/Stockbee 4%/20%/$vol movers/TML/97 Club/strike zone/over-extended; badges Stage·RS·ext×ATR·RVOL·🎯; card view with mini candle charts (▦), new-entrant alert, universe avg ATR%.
- E: journal2.js — ctx tags on saved trades (session/tf/regime/day), Trade Grader by side×regime×tf×session×day×tags, Morning plan / Session recap, day tags.
- F: indeditor.js (sandboxed JS indicators); chart type (HA/hollow/line/area), log/% scale, compare symbol, candle countdown, share link; replay random/date start + limit/stop pending orders.
- G: tests/oracle.py + oracle_dump.js (pandas-ta oracle, 48/48 within tolerance); tests/run.js +8 tests (57 total).
- Deferred (not in v125): Pine-subset transpiler (F32 second half), multi-chart grid beyond scanner cards (D30 partial), WOLFE broadening variant, MSB MTF.

## Backlog (user)
- ccxt execution layer for Lens-Bot (real orders, trade-only key, off by default) — only after shadow ledger proves edge (N≥40 judge, ≥30 trades Avg R>0).
- Indicators queue (user will say when): Adaptive Supertrend (factor = base × ATR ratio), Kaufman Efficiency Ratio pane, signal grade/conviction label (ER + regime + distance) in replay.
- Indicators queue (cont.): Volume Exhaustion candles (vol ≥ k×SMA20 after ≥ n×ATR move, dots in pane); Confluence Oscillator (fast/slow RSI-type two-line −100..+100, ±25 bands, ▲▼ when exit from band + cross + optional divergence) — open-source re-implementation inspired by BigBeluga Nautilus look, not a copy.
- Indicators queue (cont.): Liquidity Levels + Sweeps overlay (ZigZag swing H/L lines until touched; wick-through + close-back → sweep box + "hunted level" line; untouched nearby = dashed next-hunt levels). Visual layer over existing Lens sweep logic.
- Indicators queue (cont.): TSI (25/13 + signal 13 + histogram); RSI with MA + dynamic ±σ bands; Trend-Entry Composite (momentum histogram flip + fast/slow cross + exit from lower adaptive band → dated vertical event line). Inspired by leventn68 "Dip indikatörü" look.
- Tooling: use pandas-ta (pip, sandbox only) as reference oracle for indicator tests (compare lwchart IND outputs vs pandas-ta on same OHLCV).
- Optional indicator menu (from pandas-ta coverage, not yet requested): ALMA, DEMA/TEMA, VIDYA, ZLEMA, KAMA, Vortex, Choppiness, UO, Fisher, Coppock, KST, PPO, AO, RVGI, QQE, Mass Index, Ulcer, HV, A/D, PVT, EOM, NVI/PVI, VWMA, Z-Score, LinReg slope/R², more candle patterns.
- Indicators queue (cont.): Range Detector (consolidation box: N bars with range<k×ATR or low ADX; high/low/EQ 50%/premium-discount); EQH/EQL equal highs/lows lines (swings within 0.1–0.2×ATR); "Ma Deuce" ICT strategy for replay/lab: range + sweep of EQH/EQL + MSS/displacement + FVG → entry at FVG, SL behind sweep, TP opposite side of range (scalp LTF).
- Screener presets queue (from Chartink formulas, verified): NR7/NR4 (yesterday range < prior 6 ranges; SMA10>SMA50>SMA200; vol filter) + candle marker in replay; Range-Expansion Breakout (today H-L > max of prior 4; green; close > weekly open & monthly open; $vol ≥ X; low > prev close −0.45%); N-day Fall + Reversal candle (≥3 down closes + confirmed hammer/engulfing). Fundamental filters (EPS/ROCE) N/A for crypto.
- Queue (cont., Minervini/Komar): VCP detector (≥2–3 contractions with shrinking depth on ZigZag pivots, vol10/vol50<1 dry-up, pivot line = last contraction high, breakout close>pivot with vol>1.5×avg, stop under last contraction low); Base Finder (flat base ≥N bars, range<15%, higher lows, vol ratio); 5-star checklist score 0–5 (Stage2, near 52W high, RS, base, dry volume) in Lens card/screener.
- Screener UI queue (Finviz/Syncster-style): Snapshot card view (sparkline 3M + MA + volume + 4–6 key numbers) toggle vs table; Relative Volume column/filter (vol ÷ 3M avg); screen-entry alerts (notify when a new symbol enters a preset's results; app-open or bot).
- Queue (cont.): MSB-OB overlay (à la EmreKb "Market Structure Break & Order Block"): ZigZag len param, MSB lines (BOS/CHoCH) with fib-factor breakout confirmation (0.273 of prior leg), bullish/bearish OB boxes extended until mitigated, MTF option (HTF OBs on LTF chart). Reuse lens.js structure/OB engine; new drawing layer in lwchart.
- Feature backlog (edgeful-agent idea): personal Trade Grader (on journal/calc entry: stats from own journal + ledger for same conditions side×regime×TF×hour×day-condition → win%, avg R, N, grade A–D, "what works for you here"); Day Conditions tags (gap vs prev close, open inside/outside prior day range, first-4h/IB break) as journal field + stats dimension; Morning plan / Session recap cards.
- Standard indicator base (from Wickline's 55, missing in lwchart): DEMA, TEMA, SMMA, VWMA, ALMA, LSMA, MA-Cross, Pivot Points overlay, Ultimate Osc, CMO, Fisher, TSI, TRIX, DPO, Coppock, %B, Awesome Osc, Momentum, Balance of Power, Elder Force, Vortex, Choppiness, A/D, Chaikin Osc, PVT, Volume Osc, Historical Vol, BB Width, StdDev. Reference impl: github.com/keptaduona/wickline (MIT) + pandas-ta.
- Chart features backlog (Wickline): custom JS indicator/strategy editor (sandboxed), Heikin Ashi/line/area/hollow chart types, log/percent scale, compare symbol, bar-close countdown, replay start at date/random, limit/stop orders in paper/replay, shareable link.

## Indicator queue — STP PB + ATR Trailing Stop + RSI Trendlines (Emrahgulez, TV protected-source; via eczilkerdogan RT)
- [x] S/R از سوئینگ‌ها (lookback 100) → خطوط افقی سبز؛ «STP» وقتی سطح شکسته شد؛ «STP PB» وقتی قیمت به ناحیهٔ شکسته برگشت (pullback/retest) — ✅ v130: STPSR
- [x] ATR Trailing Stop با رنگ‌آمیزی کندل (سبز/قرمز) + پرکردن ناحیه بین قیمت و استاپ (fill) — ✅ v130: ATRTS upgrade (candle colour + fill)
- [x] باکس‌های ناحیهٔ ۲ کندل آخر (قرمز = عرضه بالای قیمت، آبی = تقاضا زیر قیمت) با خط میانی — ✅ v130: SDZ (v129)
- [x] پنل RSI با MA و خطوط روند خودکار روی RSI (شکست خط روند نزولی RSI → برچسب Bull / صعودی → Bear) + سطوح 20/40/60/80 — ✅ v130: RSIB (shipped earlier)

## Feature queue — Setup Scorecard (LEVENT__SEN1977 YEOTK chart، همان leventn68 ستاپ Dip)
- [x] کارت امتیاز ستاپ روی چارت: «N/16 شرط | X امتیاز» + وضعیت UYGUN/UYGUN DEĞİL (مناسب/نامناسب) با آستانهٔ قابل تنظیم (حتی 87.5 هم رد شده → شرط‌های اجباری + امتیاز) — ✅ v129
- [x] برچسب خودکار GİRİŞ/STOP/HEDEF1-3 از سیگنال AL: ورود، استاپ زیر سوئینگ، اهداف با R-multiple (≈1.1R/2.0R/3.0R در نمونه) + ناحیهٔ سایه‌دار فعال‌بودن ستاپ — ✅ v130: PLAN
- [x] ایده‌ی لایهٔ ترکیبی: ایچیموکو (کومو/تنکان/کیجون) + چند Supertrend + پیوت‌های پله‌ای + MA‌ها زیر یک پریست «Dip Setup» — ✅ v130: DIP preset

## Indicator queue — "Trend + Sharp-Reversal" 5-state regime (fuumin_trader / F_wizard، TV invite-only ¥3300، کد بسته)
- [x] پنج حالت بازار با رنگ پس‌زمینه/fill: ① روند صعودی (آبی) ② ناحیهٔ پولبک در روند صعودی ③ رنج (زرد) ④ روند نزولی (صورتی) ⑤ ناحیهٔ ریترِیس در روند نزولی — ✅ v130: REG5 (shipped earlier)
- [x] خط MA مرکزی رنگ‌شونده بر اساس حالت + fill بین قیمت و MA — ✅ v130: MAFILL
- [x] سیگنال Buy/Sell = (crash/spike اخیر: حرکت N٪ یا kσ در چند کندل) ∧ (حالت پولبک/ریترِیس) ∧ تأیید چند اندیکاتور (RSI/استوک/کندل بازگشتی) → مثلث + آلرت — ✅ v130: REG5 markers (shipped earlier)
- [x] می‌تواند با Lens regime (ADX/ATR/Hurst) و Range Detector موجود در صف ترکیب شود — ❌ closed by 5y backtest (research/REPORT.md §۶): ADX filter on VAB unstable across years/symbols (+0.13→+0.16R, 2023 reversed, 4/10 symbols reversed); TEP insensitive to ADX. No filter added.

## Backlog (not applicable) — Polymarket sports latency-arb bot (linda6248130564 video)
- خارج از دامنهٔ اپ (پیش‌بینی‌بازار ورزشی، نیاز به فید امتیاز کم‌تأخیر، 1¢ سود/معامله × ~1100 معامله/روز). فقط برای ثبت؛ اقدام ندارد.

## Indicator queue — samichart Arabic "all-in-one" overlay (EVAA short، کد در تلگرام خصوصی؛ منطق از اسکرین‌شات)
- [x] S/R با «تعداد برخورد»: برچسب «مقاومت ×2 ★ / دعم ×1 ★» (★ = سطح قوی) — شمارش تاچ‌ها برای Liquidity Levels موجود در صف — ✅ v130: LVL ★/× (shipped earlier)
- [x] خطوط روند خودکار با شمارش تاچ و وضعیت: «ترند صاعد ×4 (رئيسي) — مكسور» (شکسته) / «ترند هابط ×2 — مرجعي» + نقطه‌چین برای روند مرجع — ✅ v130: TL ×n active/broken (shipped earlier)
- [x] برچسب‌های «شراء قوي / بيع قوي» (ورود قوی) + مارکر ⚡ (مومنتوم) آبی/نارنجی — ✅ v130: STRONG
- [x] ریبون MA دوبل رنگ‌شونده (سبز/قرمز) با fill — ✅ v130: MAFILL ribbon

## Chart feature note — TradeUniv (tradeuniv.com/chart): Pine v4-v6 / thinkScript / MQL5 در مرورگر
- [x] ارجاع برای آیتم «ویرایشگر اندیکاتور سفارشی» در صف: گام اول JS editor (از Wickline)؛ گام بعدی (اختیاری/سنگین) ترنسپایلر زیرمجموعهٔ Pine (ta.sma/ema/rsi/atr, plot, input, strategy.entry) → JS. MQL5/thinkScript خارج از دامنه. — ✅ v130: JS editor stage 1 shipped (indEditor); Pine transpiler out of scope by decision

## Strategy queue — "Time-Window Range Breakout" (algojan ↔ Roboquant "MNQ Range Breakout"، MES 2020-26: +107.9%، DD 37.7%، PF 1.37، WR 74%، 158 trades)
- قوانین: یک پنجرهٔ ۱۵ دقیقه‌ای ثابت در روز (ساعت محلی + آفست UTC) → باکس High/Low؛ بعد از بسته‌شدن پنجره، اولین کندل ۱m که بالای High ببندد = لانگ / زیر Low = شورت؛ استاپ سمت مقابل رنج؛ تارگت = RR × ارتفاع رنج؛ فقط یک معامله برای هر رنج؛ فیلتر: اگر ارتفاع رنج > X٪ قیمت → رد؛ حالت Reverse اختیاری (بعد از استاپ، یک معاملهٔ معکوس با RR جدا)؛ ریست روزانه.
- [x] پیاده‌سازی در Backtest به‌صورت استراتژی پارامتری: windowStart (HH:MM + tz)، windowLen (15m)، RR، maxRangePct، reverse on/off + reverseRR، flattenTime — ✅ v130: TWRB (v129)
- [x] برای کریپتو ۲۴h: پنجرهٔ ۰۰:۰۰ UTC (daily open) و ۱۳:۳۰ UTC (NY open) به‌عنوان پریست — ✅ v130: TWRB presets (v129)
- نقد: Sharpe 0.41، Sortino 0.07، Calmar 0.09، Avg R:R 0.48 (Avg loss 2× avg win)، CAGR 11.5٪ با DD 37.7٪؛ ۱۵۸ معامله در ۶.۵ سال (~۲/ماه) → از نظر آماری ضعیف و حساس به پارامتر (ساعت پنجره). فقط به‌عنوان الگوی قابل‌تست، نه اج.

## Reference — walidkssa/pine-script-v6-examples (MIT، 22 اسکریپت آموزشی کوچک از edgoro.com)
- کاربرد مستقیم: کم (Pine، سطح مبتدی؛ EMA-cross+RSI، pivot S/R، ATR trailing، position sizing را داریم/در صف داریم)
- [x] نکتهٔ قابل‌برداشت: «barstate.isconfirmed» → در چارت/بات ما سیگنال‌ها فقط روی کندل بسته‌شده نهایی شوند و سیگنال داخل‌کندلی با برچسب «موقت» نشان داده شود (ضد-repaint) — ✅ v130: forming-bar markers get '~' prefix in lwchart (anti-repaint); SCORE '~' provisional
- [x] pivot-support-resistance.pine: الگوی تغییر وضعیت خط به «شکسته» بعد از عبور معتبر → همان آیتم samichart — ✅ v130: STPSR broken-state line
- مرجع نمونه‌های Pine ساده برای تست ترنسپایلر Pine→JS اگر روزی ساخته شد

## Coverage check — "25 Trading Indicators" cheat-sheet (marketintelOG)
- داریم (22/25): MA, EMA, RSI, MACD(+hist), BB, ATR, Volume, OBV, Stoch, SAR, Ichimoku, VWAP, Fib (ابزار رسم), CCI, ADX, MFI, KC, Donchian, StochRSI, ROC, CMF
- [x] DMI: خطوط +DI / −DI به پنل ADX اضافه شود (الان فقط ADX) — ✅ v130: DMI (shipped earlier)
- [x] RVI (Relative Vigor/Volatility Index) — ۱۰ دوره + سیگنال؛ در هیچ صفی نبود — ✅ v130: RVI (shipped earlier)
- Pivot Points → قبلاً در «standard base» صف هست

## Indicator queue — AlphaCore (AlphaCoreICT/AlphaCore، Pine v6 ۳۷۴ خط، بدون LICENSE صریح؛ منطق خوانده شد)
- داریم در lens.js smcZones: FVG، VI، OB (تعریف OB فعلی: کندل مخالف + شکست 20-bar high در ۵ کندل بعد)، mitigation٪، Breaker
- [x] Volumetric OB (روش AlphaCore): OB = کندلِ کمترین Low بین pivotHigh(len 5) و کندل شکست (close > PH)؛ متریک حجم: Σvol از OB تا شکست + سهم خرید/فروش (close≥open) → نوار Buy/Sell داخل باکس + درصد — ✅ v130: VOB buy/sell share bar (shipped earlier)
- [x] حالت‌های اندازهٔ OB: Full / Middle (نصف) / Accurate (سقف 1×ATR) / Precise (0.5×ATR و بدنه)؛ Hide Overlap؛ خط میانی — ✅ v130: VOB: Accurate (1×ATR cap) + mid line; other size modes not exposed (no per-indicator params UI)
- [x] FVG: حالت‌های mitigation Touch / Middle (CE 50٪) / Full؛ min gap ×ATR (0.15)؛ نوع OG (Opening Gap: شکاف بین close قبلی و open)؛ MTF gap timeframe؛ extend N bar — ✅ v130: FVG + OG opening gaps; CE 50% mitigation; Touch/Full modes & MTF not exposed
- [x] Premium/Discount Arrays: dealing range = highest/lowest(50) → نوارهای Premium (۵٪ بالا)، Equilibrium (±۲.۵٪ وسط)، Discount (۵٪ پایین) + برچسب — در اپ نداریم — ✅ v130: PDA (shipped earlier)
- [x] آلرت: OB جدید، ورود به FVG — ✅ v130: watcher.js SMC alerts (opt-in awSmc)

## Backlog (not applicable) — OkalaNQT / Vest Markets PnL flex
- ویدیو: شورت NQ perp با اهرم 50× روی vestmarkets.com (DEX پرپ روی شاخص‌ها)، PnL نمایش‌داده‌شده ~۳.۱k$ (ادعا ۱۰k$)؛ بدون ستاپ/اندیکاتور. فقط ایده: Vest به‌عنوان منبع قیمت NQ/ES perp اگر روزی شاخص‌ها اضافه شد.

## UI queue — Bullflow mobile "Charts" layout (اسکرین‌شات؛ بدون اندیکاتور/کد)
- [x] نمای Multi-chart موبایل: یک چارت بزرگ + گرید ۴×۲ مینی‌چارت از واچ‌لیست (نماد، قیمت، لِوِل‌های کلیدی)؛ تپ روی مینی → نمای اصلی؛ تایم‌فریم مشترک پایین (1m…8h) — ✅ v129
- [x] روی هر مینی‌چارت سطوح «کلیدی» به‌صورت خط زرد/بنفش + برچسب قیمت (برای ما: Liquidity Levels / S-R از lens، نه GEX) — ✅ v129
- [x] ریبون MA رنگ‌شونده با fill (مشابه fuumin/samichart) — ایدهٔ تکراری، ادغام شود — ✅ v130: MAFILL

## Screener queue — "Guru Scans" dashboard (SteveDJacobs؛ خروجی اسکنر خودش، بدون کد)
- [x] نمای «کارت به ازای هر اسکن»: هدر رنگی با تعداد نتایج + ردیف نمادها با Δ٪ و نشان‌ها (نمادی که در چند اسکن است تکرار می‌شود) — ✅ v129
- [x] پریست‌های اسکن برای کریپتو (معادل‌سازی): Qullamaggie Breakout (رالی ۳۰–۱۰۰٪ در ۱–۳ ماه → تثبیت تنگ → شکست با حجم)، Minervini Trend Template (داریم/در صف 5-star)، Stockbee 4٪ روزانه با حجم > روز قبل، 20٪ هفتگی، «9M Movers» → حجم دلاری > X، TML/Liquid Growth → حجم دلاری ≥ 24M$ و ATR٪ ≥ 3، «97 Club» → رتبهٔ قدرت نسبی ≥ 97 صدک در کل یونیورس — ✅ v130: mscan presets (v125)
- [x] نشان‌ها روی هر نماد: 📏 کشیدگی ATR از SMA50 (= (close−SMA50)/ATR)، 📈 Stage analysis (1/2A/2B/3/4 به سبک Weinstein)، ⚾ Strike Zone (نزدیکی به ناحیهٔ ورود)، رتبهٔ RS (عدد در دایره)؛ Earnings برای کریپتو → جایگزین: رویداد/آنلاک/فاندینگ — ✅ v130: mscan badges (v125)
- [x] فیلتر یونیورس: حداقل حجم دلاری + حداقل ATR٪ با نمایش میانگین ATR٪ کل یونیورس — ✅ v129

## Indicator queue — ZTAN "LEVEL POWER" + "SQUEEZE BREAKOUT" (ZehraTanbuga، XU100 4H؛ اندیکاتور گروه خصوصی، منطق از توضیح+تصویر)
- [x] LEVEL POWER: سطوح شکسته‌نشده (سوئینگ‌ها) با امتیاز قدرت 1–5 (= سن + دفعات نگه‌داشتن)؛ خط پررنگ=قوی/کم‌رنگ=ضعیف؛ برچسب کنار خط: قیمت · سن(روز) · تعداد hold — ✅ v129
- [x] جدول سمت راست: «قوی‌ترین سطح نزدیک» (نوع/فاصله٪/سن/hold) + ردیف‌های مقاومت بالای قیمت، ردیف زرد قیمت فعلی، حمایت‌ها پایین؛ ستون‌ها: FİYAT، UZAKLIK٪، GÜÇ (۵ مربع)، TUTMA، YAŞ — مکمل Liquidity Levels و «شمارش تاچ» samichart در صف — ✅ v129
- [x] SQUEEZE BREAKOUT: ناحیهٔ فشردگی قیمت → باکس؛ تفکیک حجم خرید/فروش داخل باکس (Alış/Satış با عدد)؛ برچسب «Break» و جهت حل‌شدن (بالا/پایین) + مثلث سیگنال — ✅ v130: SQZB (shipped earlier)
- [x] OB با وضعیت mitigated (داریم) + خط‌چین امتداد تا مصرف — ✅ v130: VOB dashed stroke when touched (shipped earlier)

## Pattern queue — Wolfe Wave / Wedge detector با پلن معامله (metadoloji، Brent 1D؛ اندیکاتور «Diagonaller» خصوصی ترکی، منطق از ۷ اسنپ‌شات)
- [x] تشخیص Rising/Falling Wedge و Broadening از ۵ نقطهٔ سوئینگ a-b-c-d-e (ZigZag)، برچسب‌گذاری نقاط، خط‌ترند b-d و a-c — ✅ v130: WOLFE (shipped earlier)
- [x] Wolfe Wave: خط EPA (a→d امتداد) = هدف؛ چک‌لیست وضعیت: شکست انجام شد / b-d شکست و e قفل شد / d رد شد / در انتظار هدف — ✅ v130: WOLFE EPA/status (shipped earlier)
- [x] پلن خودکار: ورود = شکست b-d؛ استاپ = نوک e ± 1 ATR؛ TP1 = 38.2٪، TP2 = خط EPA، TP3 = نقطهٔ صفر (رأس گوه)؛ نمایش R هر هدف و هشدار «R:R ضعیف (TP1<1R)» — ✅ v130: WOLFE TP3 apex + weak R:R warning
- [x] نسخهٔ Broadening/Bullish: اهداف = W×0.618 / W×1 (حرکت اندازه‌گیری‌شده) / W×1.618 با R — ✅ v130: WOLFE broadening W×0.618/1/1.618
- [x] باکس‌های ریسک (قرمز) / ریوارد (سبز) از نقطهٔ ورود — مشابه Long/Short position tool ولی خودکار — ✅ v130: PLAN risk/reward boxes
- lens.js فعلاً chartPatterns دارد → بررسی شود Wedge هست یا فقط H&S/مثلث/پرچم

## Strategy/Indicator queue — "sami_algo Liquidity / رادار السيولة PRO+" (TV protected، توضیح کامل منتشر شده؛ مکمل آیتم samichart قبلی)
- دو ستاپ: (1) Liquidity Sweep: شکست آخرین کف/سقف سوئینگ با بازگشت و بسته‌شدن داخل رنج با کندل مخالف؛ (2) Expansion Break: فشردگی (رنج تنگ) سپس کندل قوی بسته بالای 20-bar high / زیر 20-bar low
- فیلترها: EMA200 جهت، HTF هم‌جهت (مثلاً 5m→15m)، سشن GMT (پیش‌فرض 0700-2000)، cooldown بین سیگنال‌ها، حداقل امتیاز
- [x] امتیاز 0–6 به ازای: جهت EMA، HTF هم‌جهت، حجم قوی، تاچ S/R، بدنهٔ بزرگ، ساختار (BOS/CHoCH) هم‌جهت → برچسب «خرید 4/6» — همان آیتم «signal grade» صف را دقیق می‌کند — ✅ v129
- [x] پلن: ورود=close کندل سیگنال، استاپ=ATR×1.5 یا پشت کندل، TP=1R/2R/3R؛ علامت ✓/✗ روی چارت وقتی هدف/استاپ خورد؛ سیگنال مخالف = بستن — ✅ v129
- [x] پنل آمار درون‌چارتی: تعداد، WR، نرخ رسیدن به هر TP، نرخ استاپ مستقیم، Net R (قانون: اگر SL و TP در یک کندل → ضرر) — ✅ v129
- [x] آلرت با متن کامل (ورود/استاپ/اهداف/امتیاز) — ✅ v129
- در اپ: sweep/CHoCH/FVG در lens، Squeeze داریم → قابل ساخت به‌عنوان پریست Backtest + مارکر چارت
## v127 (done) — Trading Academy + Tutor AI settings (AvalAI/OpenRouter/Anthropic/Gemini/DeepSeek/custom)

## v128 (in progress) — mm-lab shipped; remaining:
- [x] Inject research-evidence summary (same block as `<evidence>` in `src/learn_data3.js` LEARN_SKILL) into `bot/skill.txt` so bot text reports cite TEP/VAB/ICHI stats and negative results. No effect on mechanical signals; redeploy bot after. — ✅ v129
- [x] Research: "enter only after pullback to the order" (Coil-Reclaim rubber-band idea) as a quality filter on 4H breakouts (VAB retest entry). Coil-Reclaim itself tested negative on 15m/1H (REPORT §۵پ) — do not port. — ❌ closed by 5y backtest (research/REPORT.md §۶): retest entry drops VAB from +0.13R (t2.4, DD36R) to +0.03…0.05R (t<1, DD 75–92R); hybrid +0.056R. Not ported.
- [x] Bot config: `judgeShadow:true` option → AI judge also scores shadow-only setups (faster n≥40 for verdict; more quota use). — ✅ v129
- [x] Bot config: move SWEEP to shadow-only (no edge in 5y research; 6 live trades −0.21R), like RSI2. — ✅ v129: already shadow-only via `liveStrategies:["ICHI"]` (SWEEP/LENS/RSI2 never trade live)
- [x] Bot: scan-source setups must apply the `extended` (>2×ATR from EMA20) filter as strictly as watch-source (scan −0.36R vs watch +0.69R; extended 35 trades −0.3R). — ✅ v129: chase (>maxExtAtr) cards are shadow-only for every source via `chaseShadow` (nominate() runs before source split)
- [x] Backtest Studio: per-factor stats — avg R with/without each filter (volume, regime, extended, HTF, session) for the selected strategy/symbol (idea from WillyAlgoTrader v2.3 dashboard). — ✅ v129
- [x] Bot judge v2: ask for calibrated probability ("P(T1 before SL)") instead of LONG/SHORT/SKIP; track Brier score + calibration buckets in shadow ledger (idea from Calibrain Harness: labellable questions, EV in code). Reaches a verdict with fewer samples than agree/against counting. — ✅ v129
- [x] Academy m5l1: add 6th family 'market making' (edge = spread, risks = adverse selection + inventory; needs L2/websocket infra, Hummingbot; not for retail without maker rebates) — from Jane Street challenge thread. — ✅ v129
- [x] Academy m6l2: add example "correct stat, zero edge" — Herman NQ inside-bar study (88% next candle touches one side; no direction → no money). Mention Zeiierman-style per-signal historical win% = our Time Machine, with its pitfalls (repaint pivots, no costs/R). — ✅ v129
- [x] Academy: add quants.md (QuantJourney, Apache-2.0, 50 classic strategies w/ honest stats: Sharpe 0.2–0.6, CAGR single-digit) to LEARN_BOOKS + m6l3 'expectation calibration' paragraph. — ✅ v129
- [x] **v129 planned** (from roan-maverick/MIT-trader-skill, MIT lic, 51 tests pass): (1) GARCH(1,1) MLE port to JS → GARCH-stop vs ATR-stop in Lens backtest (MAE/MFE, stop-out rate); (2) Benjamini-Hochberg FDR + weekly-clustered t over parameter variants in research lens; (3) planted-edge unit test for the stats engine; (4) half-Kelly info display in calculator (capped by fixed risk). — ✅ v129
- [x] Academy: examples — Polymarket 0.99 limit-buy (1:99 payoff, queue competition, tail risk); thin-book movement / absorption as order-flow context (not for 4H); footprint end-of-move triad: absorption, exhaustion (shrinking volume at new extremes), delta flip — one = attention, two = setup (needs tick data). — ✅ v129
- [x] Academy (portfolio lesson): one-paragraph Black-Litterman note — market-implied returns + personal views with confidence; without a good view it collapses to market-cap weights (UChicago case3 example: views were supplied by the contest, PnL simulated). — ✅ v129

## v132 (open)
- [x] #221 Remove dead FreeCharting/TheFreeChart code: srcSeg fc/fr buttons, frHint/fcExtHint/fcHint markup, frParams/frFullUrl/extChartUrl fc-fr branches in screener.js, T.fa/en strings (frHint, frOpen, frNoSym, frNet, fcHint, fcThemeHint, tvExtHint); keep tvExt ↗ (TradingView/LWC only).
- [x] #222 Execution audit card (journal + bot): avg slippage in R by symbol/hour/volatility from btFill + journal fills
- [x] #223 Weekly shadow→decision report in bot tab: per-filter (AI judge / ADX / HTF) with-vs-without cumulative R, clustered n≥20 gate
- [x] #224 Behavioural circuit breakers enforced in paper exchange (3 losses → 24h lock, daily loss stop) with logged override
- [x] #225 Chart Lab skill ratings (Elo per skill) + tutor picks next task from weakest skill
- [x] #226 Journal "review with tutor": numeric entry/exit chart context → 3 Socratic questions
- [x] #227 Module quizzes with certificate
- [x] #228 Live 1% mode: paperX → real OKX orders with hard notional cap (gated on shadow stats)
- [x] #229 Live portfolio correlation (30d) before 2nd position; >0.8 → half risk

## Pending decisions (not tasks yet — revisit later)
- [ ] D1 Live 1% bridge (#228): real OKX orders are untested from the sandbox. Run with live.enabled=true + dryRun=true for ≥1 week, inspect `LIVE` log lines in the bot run output; then decide: move to demo (dryRun=false, demo=true) → only after weeks of clean demo, real (demo=false).
- [ ] D2 Execution audit (#222) & weekly shadow→decision report (#223) will show "inconclusive" until the bot has accumulated several weeks of liveFill data / ≥20 clusters per arm. Revisit when the Bot tab shows a KEEP/DROP verdict repeated on two consecutive weekly reports; then decide on config changes (AI judge / ADX / HTF / Q4 filters, slip-blocked symbols).


## v133 (open)
- [x] #230 order-flow shadow fields via order-flow-mcp (bot/orderflow.js, 4 filterReport arms, config.orderflow disabled by default)
- [x] #231 day-gate shadow A/B ("first win of UTC day = stop / max 3 tries") → state.dayGateAB
- [x] #232 Fib Structure Engine ideas (3-bar sweep return window, protected-swing CHoCH) — backtested, rejected (reports/v133-sweep-ab.md)
- [ ] #233 decide on #230/#231 after ≥20 clusters / ≥40 trading days of shadow data

## v133b
- [x] #234 percentile SCORE grade (Willy) — backtested, rejected; re-test only if SCORE becomes continuous (reports/v133b-score-percentile.md).
- [x] #235 `of.deltaDivAgainst` shadow flag + filterReport arm (spxomega "delta without acceptance").
- [x] #236 desk-note report structure (channel → squeeze → levels w/ age+holds → critical threshold → invalidation) in Lens agent + roundtable technical prompts (ZTAN-style).
- [x] #238 ORB-60m-UTC backtest (PhenLabs idea) — zero gross edge, −0.65R net; rejected (reports/v133c-orb-ab.md).
- [ ] #237 Time Machine: empirical level hit-rate after setup (PDH/PDL, VWAP, 1×/1.5×/2× R or structure) — from PhenLabs hit-rate map idea; low priority.

## v134
- [x] #239 Academy: full-length lesson text for all 38 lessons (src/learn_full1–4.js, ~120k chars): deep explanation, every formula, numeric example, 1–2 solved problems, self-check exercise with answer. Rendered as collapsible "📖 متن کامل درس" under the summary; fed to tutor as LESSON_FULL. Lesson minutes ×2.5.

- [x] #240 v134b: کندل زنده از WebSocket عمومی OKX با پولینگ پشتیبان و نشانگر زنده/تأخیری
- [x] #241 v134b: انتخاب منطقهٔ زمانی نمایش چارت (UTC پیش‌فرض، تهران، دستگاه، سفارشی) — محاسبات UTC
- [ ] #242 منبع دوم وب‌سوکت (Binance) برای نمادهایی که در OKX نیستند
- [x] #243 v134c: دکمه‌های «ارسال برای تحلیل» و «ارسال به گفتگو» در پنجرهٔ اسکرین‌شات LWC
- [x] #244 v134d: حالت گفتگوی آزاد / تحلیل ساختاریافته در چت چارت
- [x] #245 v135: bot signals[]/funnel/coverage + seen bug fix + Signals card (active/watch/rejected, explained empty states, id-deduped notifications)
- [x] #246 v135: funnel backtest ICHI 4H (20 syms, 5y, walk-forward) → Time Machine gate dropped for ICHI; HTF neutral (kept); CHASE inconsistent (kept shadow)
- [ ] #247 after 2–3 weeks of v135 shadow data: re-check CHASE gate with filterReport; consider ICHI LONG only if shadow avgR>0 over ≥30 clusters
- [x] #248 v135b: DONCHIAN20 1D walk-forward → rejected for live (IS t≈0, regime-dependent); stays lab/shadow. Report BACKTEST_v135b_donchian.md
- [ ] #249 ~2026-12-20: run `node tests/funnel_live.js state.json` (≥3 weeks) → real ACTIVE/week vs ≤6 ceiling; altExits decision at n≥100
- [x] #250 v136 policy judge in app (policy.js, Lens card) — mirrors bot shadowWhy via bot.json coverage
- [x] #251 v136 one trade ticket (signals card 🎫 + Lens AI decision), sized from app account, policy-labelled
- [x] #252 v136 bot: maxShadowDeep=2 + shadow cards rank below live-eligible (funnel.shadowDeferred)
- [x] #253 v136 one account: sync button app←bot (coverage.sizing)
- [ ] #254 after 1 week on v136: funnel_live.js — deepPicked split live/shadow, confirm ICHI 4H no longer queued (shadowDeferred>0 and labRejected/rulesRejected now mostly ICHI)
- [x] #255 v136b flow snapshot (OKX REST, shadow-only): 4 `flow:` filter arms; app hides empty orderflow rows + shows flow line
- [ ] #256 ~2027-01: first look at `flow:` arms in the weekly report (need ≥20 clusters each side); until then no rule change
- [x] #257 v136c bot: session arms (00:00 / 16:00 UTC, 4H) in filterReport — report-only
- [x] #258 v137 chart actions: AI → chart (draw/indicator/alert/chart/jsIndicator) with approve card; indEditor.add
- [ ] #259 chart actions in Market-AI tab and screenshot modal (same card) — after a week of use in chart chat
- [x] #260 v136d bot: judge `size` FULL/HALF recorded (aiSize) + filterReport arm — shadow-only
- [x] #261 v136e bot: HAR-RV vol forecast recorded (volF) + filterReport arm — shadow-only; compare with existing volMult/q4Size when n allows
- [x] #262 v137b Triple RSI (QS) backtested on crypto 1D/4H → rejected (research/v137-trirsi.md); TRIRSI in lab STRATS only
- [x] #263 v137b bot: judge `counterparty` field recorded on signals (no gating)
- [x] #264 v138 LWC: TradingView-style indicator legend rows (⚙ settings with Inputs/Style/Help tabs, 👁, ✕); core indicators parametrised (`params` + `calc(k,P)`), settings saved in `fc_lw_indcfg`
- [x] #265 v138 LWC: global 👁 (hide/show all indicators without removing) + 💾 layouts (≤10, symbol-independent, `fc_lw_layouts`, JSON export/import)
- [x] #266 v138 chart actions: `{"indicator":ID,"on":true,"params":{…}}` + prompt lists current indicators and tunable inputs; help updated (FA/EN)
