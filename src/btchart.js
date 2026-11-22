/* ==== Backtest chart (v112): dedicated read-only trade viewer on TradingView Lightweight Charts (src/lwc.js, Apache-2.0).
   Used by the Backtest Studio only — the main chart (KLineCharts Pro, drawing tools) is untouched.
   mount({el,bars,tf,ext,trades,sel,onSelect}) -> {setTrades,setSel,focus,fit,scrollToEnd,resize,destroy,chart}
   bars: [{t,o,h,l,c,v}]  trades: [{i,j,t,side,entry,sl0,tp,exit,out,rr}]
   ext: [{id,series:{k:number[]},colors:{k:css},opts:{label,dash:{k:1},cloud:[a,b]}}]
   Notes: LWC draws series in creation order -> overlays/cloud are created BEFORE the candles so price always stays on top. */
(function(){
const LWC=()=>window.LightweightCharts;
const isLight=()=>(localStorage.getItem('fc_theme')||'dark')==='light';
const sec=t=>Math.floor(t/1000);
const GREEN='#26a69a',RED='#ef5350',SEL='#facc15';
function theme(){const l=isLight();return {bg:l?'#ffffff':'#0b1220',txt:l?'#334155':'#cbd5e1',grid:l?'rgba(15,23,42,.08)':'rgba(148,163,184,.10)',border:l?'rgba(15,23,42,.18)':'rgba(148,163,184,.22)'};}
function fmtP(p){const a=Math.abs(p);const d=a>=1000?1:a>=100?2:a>=1?3:a>=0.01?5:7;return (+p).toFixed(d);}
function prec(bars){const c=bars.length?bars[bars.length-1].c:1;return c>=1000?1:c>=100?2:c>=1?3:c>=0.01?5:7;}
const NOLINE={lastValueVisible:false,priceLineVisible:false,crosshairMarkerVisible:false};

function mount(o){const L=LWC();if(!L)return null;const el=typeof o.el==='string'?document.getElementById(o.el):o.el;if(!el)return null;el.innerHTML='';el.style.position='relative';
 const T=theme();const H={bars:o.bars||[],trades:o.trades||[],sel:o.sel==null?-1:o.sel,tf:o.tf,ext:o.ext||[],extS:{},selObj:[],onSelect:o.onSelect,T};
 const chart=L.createChart(el,{autoSize:true,layout:{background:{type:'solid',color:T.bg},textColor:T.txt,fontSize:11},grid:{vertLines:{color:T.grid},horzLines:{color:T.grid}},
  rightPriceScale:{borderColor:T.border,scaleMargins:{top:0.06,bottom:0.22}},timeScale:{borderColor:T.border,timeVisible:true,secondsVisible:false,rightOffset:4,barSpacing:7,minBarSpacing:0.5},
  crosshair:{mode:0},handleScroll:{mouseWheel:true,pressedMouseMove:true,horzTouchDrag:true,vertTouchDrag:false},handleScale:{axisPressedMouseMove:true,mouseWheel:true,pinch:true},
  localization:{locale:'en-GB',dateFormat:'yyyy-MM-dd',priceFormatter:fmtP}});
 H.chart=chart;
 const tAt=i=>sec(H.bars[i].t);
 /* ---- 1. overlays (behind price) ---- */
 for(const e of H.ext){
  // Ichimoku cloud: exactly 4 series (bull tint, bull mask, bear tint, bear mask) using whitespace gaps — one series per run was far too heavy on phones
  if(e.opts&&e.opts.cloud&&e.opts.cloud.length===2){const A=e.series[e.opts.cloud[0]],B=e.series[e.opts.cloud[1]];if(A&&B){
   const bu=[],bm=[],ru=[],rm=[];for(let i=0;i<H.bars.length;i++){const x=A[i],y=B[i],t=tAt(i);if(x==null||y==null){bu.push({time:t});bm.push({time:t});ru.push({time:t});rm.push({time:t});continue;}
    const hi=Math.max(x,y),lo=Math.min(x,y);if(x>=y){bu.push({time:t,value:hi});bm.push({time:t,value:lo});ru.push({time:t});rm.push({time:t});}else{ru.push({time:t,value:hi});rm.push({time:t,value:lo});bu.push({time:t});bm.push({time:t});}}
   const area=(col,d)=>{const s=chart.addAreaSeries(Object.assign({lineColor:'rgba(0,0,0,0)',topColor:col,bottomColor:col,lineWidth:1},NOLINE));s.setData(d);return s;};
   H.extS[e.id+'.bullTop']=area('rgba(38,166,154,.16)',bu);H.extS[e.id+'.bullMask']=area(T.bg,bm);H.extS[e.id+'.bearTop']=area('rgba(239,83,80,.16)',ru);H.extS[e.id+'.bearMask']=area(T.bg,rm);}}
  for(const k of Object.keys(e.series)){const arr=e.series[k];if(!arr)continue;const dash=e.opts&&e.opts.dash&&e.opts.dash[k];const inCloud=e.opts&&e.opts.cloud&&e.opts.cloud.includes(k);
   const s=chart.addLineSeries(Object.assign({color:e.colors[k]||'#94a3b8',lineWidth:inCloud?1:(k==='st'?2:1),lineStyle:dash?2:0,title:''},NOLINE));
   const d=[];for(let i=0;i<H.bars.length;i++){const v=arr[i];if(v!=null&&isFinite(v))d.push({time:tAt(i),value:v});}s.setData(d);H.extS[e.id+'.'+k]=s;}}
 /* ---- 2. price + volume ---- */
 const pr=prec(H.bars);
 const candles=chart.addCandlestickSeries({upColor:GREEN,downColor:RED,borderVisible:false,wickUpColor:GREEN,wickDownColor:RED,priceFormat:{type:'price',precision:pr,minMove:Math.pow(10,-pr)},lastValueVisible:true,priceLineVisible:false});
 candles.setData(H.bars.map(b=>({time:sec(b.t),open:b.o,high:b.h,low:b.l,close:b.c})));
 const vol=chart.addHistogramSeries(Object.assign({priceFormat:{type:'volume'},priceScaleId:'vol'},NOLINE));chart.priceScale('vol').applyOptions({scaleMargins:{top:0.84,bottom:0}});
 vol.setData(H.bars.map(b=>({time:sec(b.t),value:b.v||0,color:b.c>=b.o?'rgba(38,166,154,.35)':'rgba(239,83,80,.35)'})));
 H.candles=candles;H.vol=vol;
 /* ---- legend ---- */
 const lg=document.createElement('div');lg.style.cssText='position:absolute;left:8px;top:6px;z-index:3;font-size:11px;color:'+T.txt+';pointer-events:none;direction:ltr;text-align:left;line-height:1.4';
 lg.innerHTML=H.ext.map(e=>`<span style="margin-right:8px"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${Object.values(e.colors)[0]};margin-right:3px"></span>${(e.opts&&e.opts.label)||e.id}</span>`).join('');el.appendChild(lg);
 /* ---- click on a bar near an entry/exit selects that trade ---- */
 chart.subscribeClick(p=>{if(!p||p.logical==null)return;const bi=Math.round(p.logical);let best=-1,bd=1e9;H.trades.forEach((x,k)=>{const d=Math.min(Math.abs(x.i-bi),Math.abs((x.j==null?x.i:x.j)-bi));if(d<bd){bd=d;best=k;}});if(best>=0&&bd<=2){H.setSel(best);H.onSelect&&H.onSelect(best);}});
 /* ---- API ---- */
 H.setTrades=tr=>{H.trades=tr||[];applyMarks(H);applySel(H);};
 H.setSel=k=>{H.sel=k==null?-1:k;applyMarks(H);applySel(H);};
 H.focus=(k,nvis)=>{if(k==null||k<0||!H.trades[k])return;const x=H.trades[k];const n=nvis||140;const j=x.j==null?x.i:x.j;const mid=(x.i+j)/2;const half=Math.max(n/2,(j-x.i)*0.75+10);try{chart.timeScale().setVisibleLogicalRange({from:Math.max(-2,mid-half),to:Math.min(H.bars.length+4,mid+half)});}catch(e){}};
 H.fit=n=>{try{chart.timeScale().setVisibleLogicalRange({from:Math.max(-2,H.bars.length-(n||140)),to:H.bars.length+4});}catch(e){}};
 H.scrollToEnd=()=>{try{chart.timeScale().scrollToRealTime();}catch(e){}};
 H.resize=()=>{try{chart.applyOptions({autoSize:true});}catch(e){}};
 H.destroy=()=>{try{chart.remove();}catch(e){}el.innerHTML='';};
 applyMarks(H);applySel(H);
 return H;}

function applyMarks(H){const tr=H.trades;const many=tr.length>60;const m=[];
 tr.forEach((x,k)=>{const isSel=k===H.sel;const LG=x.side==='LONG';const te=H.bars[x.i]?sec(H.bars[x.i].t):sec(x.t);const j=x.j==null?null:x.j;const tx=j!=null&&H.bars[j]?sec(H.bars[j].t):null;const win=x.rr>0;
  m.push({time:te,position:LG?'belowBar':'aboveBar',shape:LG?'arrowUp':'arrowDown',color:isSel?SEL:(LG?'#38bdf8':'#f472b6'),size:isSel?2:1,text:(isSel||!many)?('#'+(k+1)+(isSel?' '+x.side:'')):''});
  if(tx!=null)m.push({time:tx,position:win?'aboveBar':'belowBar',shape:isSel?'square':'circle',color:isSel?SEL:(win?GREEN:RED),size:isSel?0.6:0.8,text:(isSel||!many)?((x.rr>0?'+':'')+x.rr.toFixed(1)+'R'):''});});
 m.sort((a,b)=>a.time-b.time);try{H.candles.setMarkers(m);}catch(e){}}

function applySel(H){H.selObj.forEach(o=>{try{o.kind==='pl'?H.candles.removePriceLine(o.ref):H.chart.removeSeries(o.ref);}catch(e){}});H.selObj=[];
 const x=H.trades[H.sel];if(!x)return;const j=x.j==null?x.i:x.j;const t0=sec(H.bars[x.i]?H.bars[x.i].t:x.t),t1=sec(H.bars[j]?H.bars[j].t:x.t);
 const seg=(price,color,style,width)=>{if(price==null||!(t1>t0))return;const s=H.chart.addLineSeries(Object.assign({color,lineWidth:width||1,lineStyle:style==null?2:style},NOLINE));s.setData([{time:t0,value:price},{time:t1,value:price}]);H.selObj.push({kind:'s',ref:s});};
 // SL / TP / entry drawn only over the trade's lifetime (not full-width), plus axis labels via price lines
 seg(x.sl0,RED,2,2);seg(x.tp,GREEN,2,2);seg(x.entry,SEL,0,1);
 const pl=(price,color,title)=>{if(price==null)return;const ref=H.candles.createPriceLine({price,color,lineWidth:1,lineStyle:3,lineVisible:false,axisLabelVisible:true,title});H.selObj.push({kind:'pl',ref});};
 pl(x.entry,SEL,'entry');pl(x.sl0,RED,'SL');pl(x.tp,GREEN,'TP');
 // entry → exit connector
 if(x.exit!=null&&t1>t0){const s=H.chart.addLineSeries(Object.assign({color:x.rr>0?GREEN:RED,lineWidth:2,lineStyle:1,pointMarkersVisible:true,pointMarkersRadius:4},NOLINE));s.setData([{time:t0,value:x.entry},{time:t1,value:x.exit}]);H.selObj.push({kind:'s',ref:s});}}
window.BTChart={mount};
})();
