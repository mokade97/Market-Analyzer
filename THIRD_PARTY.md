# Third-party components

- **TradingView Lightweight Charts™ 5.2.0** — Apache-2.0 — https://github.com/tradingview/lightweight-charts (src/lwc.js, attribution shown in app)
- **Lightweight Charts Line Tools** (core + plugins: lines, rectangle, circle, triangle, fib-retracement, parallel-channel, long-short-position, text, price-range, freehand, path) by difurious — **MPL-2.0** — https://github.com/difurious/lightweight-charts-line-tools-core (src/linetools.js, single IIFE bundle built with rollup from the sources at commit of 2026-07).
  - Modification (MPL §3.2 notice): in the pane views of Rectangle, Circle, Triangle and ParallelChannel, `hitTestBackground: false` was changed to `true` so clicking inside a filled shape selects it (TradingView behaviour). No other source changes. Bundle entry: `createAll(chart, series)` registers all tools on one core instance.
- Drawing-UX concepts (hover state, handles, object tree, extend L/R, keyboard shortcuts) ported in-house from OpenCharts (MIT) — https://github.com/dylanpersonguy/OpenCharts
