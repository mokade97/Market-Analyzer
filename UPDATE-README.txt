v134b + v134c (incremental on top of v134)

APP: replace index.html and sw.js in the app repo root (README.md / TODO.md optional).
     Hard-refresh or reinstall the PWA (cache name fcalc-v134c).
     src/lwchart.js and src/screener.js are the only changed sources (for your repo; index.html is already built from them).

v134b: live OKX websocket candles on the LWC chart (green dot = live, grey = 20 s polling fallback)
       + 🕒 display time-zone picker (fc_tz: utc default / tehran / local / ±hh:mm; analytics & bot stay UTC)
v134c: screenshot modal → "🔎 send to analysis" / "💬 send to chat" buttons.
BOT: unchanged (v133b).
