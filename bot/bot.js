#!/usr/bin/env node
/* ============================================================================
   Lens Bot — 24/7 paper-trading & alert agent for «تحلیل‌گر بازار» (Market Analyzer)
   - Runs headless (GitHub Actions cron / VPS / Termux). No exchange keys. Never places real orders.
   - Uses the SAME engine as the app (engine.js is generated from src/lens.js): score, 4-quadrant regime,
     extension, SMC zones, classic patterns, structure (BOS/CHoCH, divergence, fib), sweep+CHoCH+FVG model,
     Time Machine backtest. Then applies the app's Risk-Check rules, and (optionally) asks a SEPARATE
     Gemini key to judge each candidate (LONG/SHORT/WAIT/SKIP + reasons in Persian).
   - Paper positions are managed on CLOSED candles only: SL −1R, T1 (half) then SL = +0.25R, T2 = +2.25R/+3R,
     timeout 40 bars = mark-to-market. Costs (fee+slippage+funding) are deducted.
   - Output: state.json (full) + public/bot.json (compact, read by the app's 🤖 Bot card).
   ============================================================================ */
const fs = require('fs'); const path = require('path');
const lens = require('./engine.js');
const ROOT = __dirname;
const CFG = Object.assign({
  symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT', 'DOGEUSDT', 'ADAUSDT', 'LINKUSDT', 'AVAXUSDT', 'XAUUSDT'],
  timeframes: ['4H', '1H'],
  minScore: 70, account: 1000, riskPct: 1, minRR: 2, noCounterHtf: true, maxOpen: 6, maxBars: 40,
  feePct: 0.1, slipPct: 0.03, fundPer8h: 0.01,
  useGemini: true, geminiModel: 'gemini-3.6-flash', minConfidence: 60,
  exchanges: ['okx', 'bitget', 'gate'], keepAlerts: 60, keepClosed: 400
}, readJSON(path.join(ROOT, 'config.json'), {}));
const STATE_FILE = path.join(ROOT, 'state.json');
try { lens.setThr && lens.setThr(CFG.minScore); } catch (e) { } // audit #14: threshold actually applied to the engine
const S = Object.assign({ version: 1, positions: [], closed: [], alerts: [], seen: {}, lastRun: null, runs: 0, errors: [] }, readJSON(STATE_FILE, {}));

function readJSON(f, d) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } }
const r6 = x => x == null ? null : +(+x).toFixed(6);
const TFMS = { '15m': 9e5, '1H': 36e5, '4H': 144e5, '1D': 864e5 };
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

/* ---------------- data: same exchanges & fallbacks as the app ---------------- */
async function J(u) { const c = new AbortController(); const t = setTimeout(() => c.abort(), 9000); try { const r = await fetch(u, { signal: c.signal, headers: { 'User-Agent': 'lens-bot/1.0' } }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(t); } }
const EX = {
  okx: async (s, tf, n) => { const d = await J(`https://www.okx.com/api/v5/market/candles?instId=${s.replace('USDT', '-USDT-SWAP')}&bar=${tf === '1D' ? '1Dutc' : tf}&limit=${n}`); return d.data.map(x => ({ t: +x[0], o: +x[1], h: +x[2], l: +x[3], c: +x[4], v: +x[5] })).reverse(); },
  bitget: async (s, tf, n) => { const d = await J(`https://api.bitget.com/api/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${s}&granularity=${tf === '1D' ? '1Dutc' : tf}&limit=${n}`); return d.data.map(x => ({ t: +x[0], o: +x[1], h: +x[2], l: +x[3], c: +x[4], v: +x[5] })); },
  gate: async (s, tf, n) => { const m = { '1D': '1d', '4H': '4h', '1H': '1h', '15m': '15m' }; const d = await J(`https://api.gateio.ws/api/v4/futures/usdt/candlesticks?contract=${s.replace('USDT', '_USDT')}&interval=${m[tf]}&limit=${n}`); return d.map(x => ({ t: x.t * 1000, o: +x.o, h: +x.h, l: +x.l, c: +x.c, v: +x.v })); }
};
let dataSrc = null;
async function klinesAny(sym, tf, n) { for (const e of CFG.exchanges) { try { const k = await EX[e](sym, tf, n); if (k && k.length > 50) { dataSrc = e; return k; } } catch (err) { } } return null; }

/* ---------------- rule check (mirror of the app's Risk Check) ---------------- */
function ruleCheck(p, side) {
  const fails = [], warns = [];
  const Q = p.regime_quadrant; if (Q && Q.quadrant === 'Q4') fails.push('رژیم Q4 (آشوب) — بیرون بمان');
  const hb = p.trend && p.trend.htf_bias; if (CFG.noCounterHtf && ((side === 'LONG' && hb === 'DOWN') || (side === 'SHORT' && hb === 'UP'))) fails.push('خلاف سوگیری تایم‌فریم بالاتر');
  const e = p.extension_atr_from_ema50; if (e != null) { if ((side === 'LONG' && e >= 4) || (side === 'SHORT' && e <= -4)) fails.push('کش‌شده از EMA50 (' + e + '×ATR)'); else if ((side === 'LONG' && e >= 2.5) || (side === 'SHORT' && e <= -2.5)) warns.push('نسبتاً کش‌شده (' + e + '×ATR)'); }
  const x = p.structure_extras || {}; if (x.last_event) { const ch = x.last_event.type; const bad = (side === 'LONG' && ch.endsWith('BEARISH')) || (side === 'SHORT' && ch.endsWith('BULLISH')); if (bad) (ch.startsWith('CHOCH') ? fails : warns).push(ch.replace('_', ' ') + ' خلاف جهت'); }
  const dv = (x.divergences || []).filter(d => d.type.startsWith('REGULAR') && d.type.endsWith(side === 'LONG' ? 'BEARISH' : 'BULLISH')); if (dv.length) warns.push('واگرایی منظم خلاف جهت (' + dv.map(d => d.indicator).join('/') + ')');
  const cp = (p.chart_patterns && p.chart_patterns.patterns) || []; cp.forEach(pt => { const opp = pt.bias === (side === 'LONG' ? 'BEARISH' : 'BULLISH'); if (opp) (pt.status !== 'FORMING' ? fails : warns).push('الگوی ' + pt.name.replace(/_/g, ' ') + ' خلاف جهت'); });
  const z = p.smc_zones; if (z) { const opp = side === 'LONG' ? z.nearest_resistance : z.nearest_support; if (opp && Math.abs(opp.distance_atr) < 1) warns.push('ناحیه‌ی ' + opp.type + ' فقط ' + Math.abs(opp.distance_atr) + '×ATR جلوتر'); }
  const R = Math.abs(p.trade.entry - p.trade.stop), rr = R ? Math.abs(p.trade.target_2 - p.trade.entry) / R : 0; if (rr < CFG.minRR) fails.push('R:R در T2 = ' + rr.toFixed(2) + ' < ' + CFG.minRR);
  return { fails, warns, rr: +rr.toFixed(2), sizeMult: Q ? Q.size_multiplier : 1 };
}

/* ---------------- separate AI judge (Gemini, own key) ---------------- */
async function judge(p, side, rc, bt) {
  const key = process.env.GEMINI_API_KEY; if (!CFG.useGemini || !key) return { decision: side, confidence: null, reasons: ['بدون قاضی AI — تصمیم موتور قطعی'], concerns: rc.warns, judge: 'rules' };
  const prompt = `You are the independent risk judge of an automated PAPER-trading desk. You receive a Lens packet (computed from closed exchange candles), the deterministic engine's proposal, the rule-check result and the Time Machine record of this exact setup on this symbol. Decide whether this paper trade should be taken NOW. Be strict: WAIT or SKIP whenever one key factor is missing. Never invent numbers. Reply with ONE JSON object only, text fields in Persian:
{"decision":"LONG|SHORT|WAIT|SKIP","confidence":0-100,"entry":number,"stop":number,"target_1":number,"target_2":number,"reasons":["max 3, short"],"concerns":["max 3, short"],"invalidation":"one line"}
PROPOSAL: side=${side}, entry=${p.trade.entry}, stop=${p.trade.stop}, t1=${p.trade.target_1}, t2=${p.trade.target_2}, score=${side === 'LONG' ? p.scores.long : p.scores.short}
RULE_CHECK: ${JSON.stringify(rc)}
TIME_MACHINE: ${JSON.stringify(bt ? { all: bt.all, with_htf: bt.with_htf, against_htf: bt.against_htf, range: bt.from + '..' + bt.to } : null)}
PACKET: ${JSON.stringify(p)}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CFG.geminiModel}:generateContent`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }) });
      const j = await r.json(); if (!r.ok) { if (r.status === 429 || r.status === 503) { await new Promise(s => setTimeout(s, 4000 * (attempt + 1))); continue; } throw new Error(j.error && j.error.message || ('HTTP ' + r.status)); }
      const txt = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts || []).map(x => x.text || '').join('');
      const m = txt.match(/\{[\s\S]*\}/); const d = JSON.parse(m ? m[0] : txt); d.judge = CFG.geminiModel; return d;
    } catch (e) { if (attempt === 2) return fallback(e.message || e); }
  }
  return fallback('rate limit 429/503');
  function fallback(why) { return { decision: side, confidence: null, reasons: ['قاضی AI در دسترس نبود (' + why + ') — تصمیم موتور قطعی'], concerns: rc.warns, judge: 'rules(fallback)' }; }
}

/* ---------------- paper position management ---------------- */
function manage(pos, k) {
  const closedBars = k.slice(0, -1).filter(b => b.t > pos.lastBarT); if (!closedBars.length) return null;
  const R = Math.abs(pos.entry - pos.stop); const LG = pos.side === 'LONG'; let out = null, rr = 0;
  for (const b of closedBars) {
    pos.bars++; pos.lastBarT = b.t;
    const hs = LG ? b.l <= pos.stop : b.h >= pos.stop, h1 = LG ? b.h >= pos.t1 : b.l <= pos.t1, h2 = LG ? b.h >= pos.t2 : b.l <= pos.t2;
    if (hs) { const fill = LG ? Math.min(pos.stop, b.o) : Math.max(pos.stop, b.o); const m = (LG ? fill - pos.entry : pos.entry - fill) / R; out = pos.t1hit ? 'T1_THEN_SL' : 'SL'; rr = pos.t1hit ? 0.75 + 0.5 * m : m; break; } // audit #5: gap through the stop fills at the open
    if (h2) { out = 'T2'; rr = (pos.t1hit || h1) ? 2.25 : 3; break; }
    if (h1 && !pos.t1hit) pos.t1hit = true;
    if (pos.bars >= CFG.maxBars) { const m = (LG ? b.c - pos.entry : pos.entry - b.c) / R; rr = pos.t1hit ? 0.75 + m / 2 : m; out = 'TIMEOUT'; break; }
    pos.mtm = +(((LG ? b.c - pos.entry : pos.entry - b.c) / R)).toFixed(2);
  }
  if (!out) return null;
  const hoursHeld = pos.bars * (TFMS[pos.tf] || 144e5) / 36e5; const costR = pos.entry * ((CFG.feePct + CFG.slipPct + CFG.fundPer8h * hoursHeld / 8) / 100) / R;
  return { out, rr: +(rr - costR).toFixed(2), gross: +rr.toFixed(2), costR: +costR.toFixed(3) };
}
function stats(arr) { const n = arr.length; if (!n) return null; const w = arr.filter(x => x.rr > 0).length, sum = arr.reduce((s, x) => s + x.rr, 0); const g = arr.filter(x => x.rr > 0).reduce((s, x) => s + x.rr, 0), l = -arr.filter(x => x.rr < 0).reduce((s, x) => s + x.rr, 0); let eq = 0, pk = 0, dd = 0; arr.slice().reverse().forEach(x => { eq += x.rr; pk = Math.max(pk, eq); dd = Math.max(dd, pk - eq); }); return { n, win: Math.round(100 * w / n), avg: +(sum / n).toFixed(2), total: +sum.toFixed(2), pf: l ? +(g / l).toFixed(2) : null, maxDD: +dd.toFixed(2) }; }
function by(arr, f) { const m = {}; arr.forEach(x => { const k = f(x) || '—'; (m[k] = m[k] || []).push(x); }); const o = {}; Object.entries(m).forEach(([k, a]) => o[k] = stats(a)); return o; }

/* ---------------- main ---------------- */
(async () => {
  const started = Date.now(); S.runs++; S.errors = []; const newAlerts = [];
  for (const sym of CFG.symbols) for (const tf of CFG.timeframes) {
    try {
      const k = await klinesAny(sym, tf, 320); if (!k) { S.errors.push(sym + ' ' + tf + ': no data'); continue; }
      const htf = lens.HTF[tf]; const hk = htf !== tf ? await klinesAny(sym, htf, 120) : null;
      // 1) manage open paper positions of this sym/tf
      for (const pos of S.positions.filter(x => x.sym === sym && x.tf === tf)) {
        const res = manage(pos, k); if (res) { Object.assign(pos, res, { status: 'CLOSED', closedAt: new Date().toISOString() }); S.cumR = +((S.cumR || 0) + res.rr).toFixed(4); S.cumUSD = +((S.cumUSD || 0) + res.rr * (pos.riskUSD || 0)).toFixed(2); S.closed.unshift(pos); S.positions = S.positions.filter(x => x !== pos); log('CLOSE', sym, tf, pos.side, res.out, res.rr + 'R'); }
      }
      // 2) analyse last CLOSED candle with the full engine
      const p = lens.packet(sym, tf, k, hk, hk ? htf : 'N/A'); if (!p) continue;
      let sweep = null; try { sweep = lens.sweepSignals(k.slice(0, k.length - 1), lens.series(k, null).atr).live; } catch (e) { }
      p.sweep_choch_fvg_live = sweep;
      const side = p.event === 'LONG_SETUP' ? 'LONG' : p.event === 'SHORT_SETUP' ? 'SHORT' : (sweep && sweep.status === 'ENTRY_TRIGGERED' && sweep.bars_ago === 0 ? sweep.side : null); // audit #2: only the entry bar, not the 3 bars after
      if (!side) continue;
      const score = side === 'LONG' ? p.scores.long : p.scores.short; const barKey = `${sym}|${tf}|${side}|${p.time}`;
      if (S.seen[barKey]) continue; S.seen[barKey] = Date.now();
      if (p.event === 'CANDLE' && score < CFG.minScore - 15) continue; // sweep model alone needs at least a decent score
      if (p.trade && p.trade.side !== side) { const R0 = 1.5 * (p.volatility && p.volatility.atr || Math.abs(p.trade.entry - p.trade.stop) / 1.5); const sg = side === 'LONG' ? 1 : -1, e0 = p.trade.entry; p.trade = Object.assign({}, p.trade, { side, stop: r6(e0 - sg * R0), target_1: r6(e0 + sg * 1.5 * R0), target_2: r6(e0 + sg * 3 * R0) }); } /* audit #1 */
      const rc = ruleCheck(p, side); let bt = null; try { bt = lens.backtest(k, hk, { tf }); } catch (e) { }
      const alert = { ts: new Date().toISOString(), barTime: p.time, sym, tf, side, score, quad: p.regime_quadrant && p.regime_quadrant.quadrant, regime: p.regime, htf: p.trend.htf_bias, event: p.event, sweep: sweep && sweep.status, entry: p.trade.entry, stop: p.trade.stop, t1: p.trade.target_1, t2: p.trade.target_2, rr: rc.rr, fails: rc.fails, warns: rc.warns, tm: bt && bt.all ? { n: bt.all.n, win: bt.all.win_rate, avg: bt.all.avg_r, pf: bt.all.profit_factor } : null, src: dataSrc };
      if (rc.fails.length) { alert.status = 'REJECTED_RULES'; alert.reasons = rc.fails; S.alerts.unshift(alert); log('REJECT', sym, tf, side, rc.fails.join('; ')); continue; }
      // 3) independent AI judge
      const d = await judge(p, side, rc, bt);
      alert.judge = d.judge; alert.confidence = d.confidence; alert.reasons = d.reasons || []; alert.concerns = d.concerns || []; alert.invalidation = d.invalidation || '';
      const approved = (d.decision === side) && (d.confidence == null || d.confidence >= CFG.minConfidence);
      if (!approved) { alert.status = 'REJECTED_AI'; alert.aiDecision = d.decision; S.alerts.unshift(alert); log('AI-SKIP', sym, tf, side, d.decision, d.confidence); continue; }
      const _A = p.volatility && p.volatility.atr || 0, _R = Math.abs(d.entry - d.stop); if (d.entry > 0 && d.stop > 0 && d.target_1 > 0 && ((side === 'LONG' && d.stop < d.entry) || (side === 'SHORT' && d.stop > d.entry)) && (!_A || (Math.abs(d.entry - p.trade.entry) <= 0.5 * _A && _R >= 0.5 * _A && _R <= 3 * _A)) && (side === 'LONG' ? d.target_1 > d.entry : d.target_1 < d.entry)) { /* audit #3: sanity-check LLM levels */ alert.entry = d.entry; alert.stop = d.stop; alert.t1 = d.target_1; alert.t2 = d.target_2 > 0 ? d.target_2 : alert.t2; }
      // 4) open paper position (if capacity and not already in this symbol)
      const busy = S.positions.some(x => x.sym === sym); const cap = S.positions.length >= CFG.maxOpen;
      const R = Math.abs(alert.entry - alert.stop); const riskUSD = CFG.account * CFG.riskPct / 100 * rc.sizeMult; const size = R ? riskUSD / R : 0;
      alert.size = +size.toPrecision(5); alert.riskUSD = +riskUSD.toFixed(2); alert.sizeMult = rc.sizeMult;
      if (busy || cap) { alert.status = busy ? 'ALERT_ONLY_BUSY' : 'ALERT_ONLY_CAP'; S.alerts.unshift(alert); newAlerts.push(alert); log('ALERT', sym, tf, side, alert.status); continue; }
      const pos = { id: barKey, sym, tf, side, entry: alert.entry, stop: alert.stop, t1: alert.t1, t2: alert.t2, size: alert.size, riskUSD: alert.riskUSD, quad: alert.quad, score, confidence: d.confidence, openedAt: alert.ts, barTime: p.time, lastBarT: Date.parse(p.time), bars: 0, t1hit: false, mtm: 0, status: 'OPEN', reasons: alert.reasons };
      S.positions.push(pos); alert.status = 'OPENED_PAPER'; S.alerts.unshift(alert); newAlerts.push(alert); log('OPEN', sym, tf, side, '@', alert.entry, 'SL', alert.stop, 'T1', alert.t1, 'conf', d.confidence);
    } catch (e) { S.errors.push(sym + ' ' + tf + ': ' + (e.message || e)); } finally { await new Promise(r => setTimeout(r, 250)); } // audit #15: throttle also on continue
  }
  // housekeeping
  S.alerts = S.alerts.slice(0, CFG.keepAlerts); S.closed = S.closed.slice(0, CFG.keepClosed);
  const cutoff = Date.now() - 14 * 864e5; Object.keys(S.seen).forEach(k => { if (S.seen[k] < cutoff) delete S.seen[k]; });
  S.lastRun = new Date().toISOString(); S.durationSec = Math.round((Date.now() - started) / 1000); S.dataSrc = dataSrc;
  S.stats = { all: stats(S.closed), byQuad: by(S.closed, x => x.quad), byTf: by(S.closed, x => x.tf), bySide: by(S.closed, x => x.side), bySym: by(S.closed, x => x.sym) };
  if (S.cumR == null) { S.cumR = +(S.closed.reduce((s, x) => s + x.rr, 0)).toFixed(4); S.cumUSD = +(S.closed.reduce((s, x) => s + x.rr * (x.riskUSD || 0), 0)).toFixed(2); } S.equityR = +S.cumR.toFixed(2); S.equityUSD = +S.cumUSD.toFixed(2); // audit #13: not truncated by keepClosed
  S.config = { symbols: CFG.symbols, timeframes: CFG.timeframes, minScore: CFG.minScore, account: CFG.account, riskPct: CFG.riskPct, maxOpen: CFG.maxOpen, judge: CFG.useGemini && process.env.GEMINI_API_KEY ? CFG.geminiModel : 'rules-only' };
  fs.writeFileSync(STATE_FILE, JSON.stringify(S, null, 1));
  const pub = { v: 1, lastRun: S.lastRun, durationSec: S.durationSec, dataSrc, config: S.config, equityR: S.equityR, equityUSD: S.equityUSD, stats: S.stats, positions: S.positions, alerts: S.alerts.slice(0, 40), closed: S.closed.slice(0, 60), errors: S.errors.slice(0, 10) };
  fs.mkdirSync(path.join(ROOT, 'public'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'public', 'bot.json'), JSON.stringify(pub));
  log(`done in ${S.durationSec}s · open ${S.positions.length} · closed ${S.closed.length} · new alerts ${newAlerts.length} · equity ${S.equityR}R · src ${dataSrc} · errors ${S.errors.length}`);
  if (S.errors.length) console.log(S.errors.join('\n'));
})();
