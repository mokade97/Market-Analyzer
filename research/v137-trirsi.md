# v137b #262 — Triple RSI (QuantifiedStrategies) on crypto perps: REJECTED

Rule (QS, mirrored for SHORT): RSI(5) < 30, RSI(5) lower than 3 bars ago, RSI(5) 3 bars ago < 60, close > SMA200 → LONG. Standard bot exits (ATR stop / T1 / T2), cost 0.3 %, funding scaled per TF. 20 crypto symbols, walk-forward IS ≤2023 / OOS 2024+.

| TF | split | RAW n | avgR | PF | PUBLISHED n | avgR | PF |
|---|---|---|---|---|---|---|---|
| 1D | ALL | 795 | −0.13 | 0.80 | 223 | −0.21 | 0.69 |
| 1D | IS | 266 | −0.27 | 0.64 | 122 | −0.19 | 0.72 |
| 1D | OOS | 529 | −0.06 | 0.90 | 101 | −0.23 | 0.64 |
| 4H | ALL | 5001 | −0.12 | 0.82 | 1009 | −0.13 | 0.80 |
| 4H | IS | 1943 | −0.10 | 0.85 | 490 | −0.10 | 0.85 |
| 4H | OOS | 3058 | −0.14 | 0.80 | 519 | −0.16 | 0.75 |

Only positive cell: 1D SHORT OOS raw n=301 +0.137R PF 1.26 — with IS SHORT −0.32R (n=205). Sign flip between halves = regime, not edge.
Verdict: consistent with BACKTEST_v125 (RSI-2, Bollinger MR all negative on perps). The 90 % win rate QS reports is on SPY with a 100-year upward drift; crypto perps have no such drift and 0.3 % costs. TRIRSI stays in `lens.STRATS` for the lab card only; not in `labStrategiesByTf`, never a candidate.
Raw outputs: reports/v137-trirsi-1D.txt, v137-trirsi-4H.txt.
