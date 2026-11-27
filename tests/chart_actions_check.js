/* v137: AI chart actions — parse, validate, apply (drawings / indicators / alert / chart switch / JS indicator) only via the approve button */
const {JSDOM}=require('jsdom');const fs=require('fs');const h=fs.readFileSync(__dirname+'/../index.html','utf8');const errs=[];
const d=new JSDOM(h,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,beforeParse(w){w.HTMLCanvasElement.prototype.getContext=()=>({measureText:()=>({width:10}),fillRect(){},clearRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},arc(){},fillText(){},save(){},restore(){},setLineDash(){},translate(){},scale(){},rect(){},closePath(){}});w.fetch=()=>Promise.reject(new Error('x'));w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});w.scrollTo=()=>{};w.WebSocket=undefined;w.ResizeObserver=class{observe(){}disconnect(){}};w.addEventListener('error',e=>errs.push(e.message));}});
let pass=0,fail=0;const ok=(n,c,i)=>{c?pass++:fail++;console.log(c?'  ✓':'  ✗',n,c?'':JSON.stringify(i||'').slice(0,300));};
setTimeout(()=>{const w=d.window;const CA=w.chartActions;ok('module present',!!CA&&typeof CA.parse==='function');
 const bars=[];let c=100;const t0=Date.now()-300*144e5;for(let i=0;i<300;i++){c*=1+Math.sin(i/7)*0.01;bars.push({t:t0+i*144e5,o:c,h:c*1.01,l:c*0.99,c,v:100});}
 // fake chart handle like window.__tvLw
 const H={sym:'BTCUSDT',tf:'4H',bars,draw:[],indOn:['EMA','VOL'],toggleExtra(id){const on=this.indOn.includes(id);this.indOn=on?this.indOn.filter(x=>x!==id):this.indOn.concat(id);return !on;},saveDrawings(){this._saved=(this._saved||0)+1;},redraw(){}};w.__tvLw=H;
 const answer="سقف هفتگی مهم است.\n\n```chart-actions\n[{\"draw\":\"horizontal\",\"price\":105.5,\"label\":\"PDH\"},{\"draw\":\"zone\",\"top\":99,\"bottom\":97,\"label\":\"OB\"},{\"draw\":\"trend\",\"from\":{\"time\":\""+new Date(t0+100*144e5).toISOString()+"\",\"price\":95},\"to\":{\"time\":\""+new Date(t0+299*144e5).toISOString()+"\",\"price\":101}},{\"indicator\":\"RSI\",\"on\":true},{\"indicator\":\"NOPE\",\"on\":true},{\"alert\":{\"price\":98.2,\"label\":\"trigger\"}},{\"draw\":\"horizontal\",\"price\":-3},{\"jsIndicator\":{\"name\":\"AI fast/slow\",\"pane\":\"main\",\"code\":\"const c=k.map(b=>b.c);return {pane:'main',series:{f:ema(c,8),s:ema(c,21)},colors:{f:'#fff',s:'#f00'}};\"}},{\"jsIndicator\":{\"name\":\"evil\",\"code\":\"fetch('x');return {}\"}}]\n```";
 const P=CA.parse(answer);ok('parse strips the block and keeps prose',/سقف هفتگی/.test(P.text)&&!/chart-actions/.test(P.text));ok('9 actions parsed',P.actions.length===9,P.actions.length);
 ok('validation: unknown indicator, negative price, network JS rejected',!CA.valid(P.actions[4])&&!CA.valid(P.actions[6])&&!CA.valid(P.actions[8])&&CA.valid(P.actions[0])&&CA.valid(P.actions[7]));
 const host=w.document.createElement('div');host.innerHTML=CA.card(P.actions);w.document.body.appendChild(host);const card=host.querySelector('.ca-card');CA.wire(card,P.actions);
 ok('card: 6 checked (valid) + 3 disabled',card.querySelectorAll('[data-ca-i]:checked').length===6&&card.querySelectorAll('[data-ca-i]:disabled').length===3);
 ok('nothing applied before approval',H.draw.length===0&&!H.indOn.includes('RSI'));
 card.querySelector('[data-ca-apply]').click();
 ok('3 drawings added with AI tag',H.draw.length===3&&H.draw.every(x=>x.styles.ai)&&H.draw[0].name==='horizontalStraightLine'&&H.draw[1].name==='rect'&&H.draw[2].name==='segment',H.draw.map(x=>x.name));
 ok('trend points snapped to bar times',bars.some(b=>b.t===H.draw[2].points[0].timestamp)&&H.draw[2].points[1].timestamp===bars[299].t);
 ok('RSI switched on, saved',H.indOn.includes('RSI')&&H._saved>0);
 const al=JSON.parse(w.localStorage.getItem('fc_alerts')||'[]');ok('price alert stored',al.length===1&&al[0].price===98.2&&al[0].sym==='BTCUSDT',al);
 const ui=JSON.parse(w.localStorage.getItem('fc_user_ind')||'[]');ok('JS indicator saved and registered as U1, switched on',ui.length===1&&!!w.LWChart.IND.U1&&H.indOn.includes('U1'),ui.map(x=>x.name));
 ok('output line reports 6 applied',/6/.test(card.querySelector('.ca-out').textContent),card.querySelector('.ca-out').textContent);
 card.querySelector('[data-ca-clear]').click();ok('remove AI drawings clears only AI ones',H.draw.length===0);
 // jsdom cannot run srcdoc iframes (the real sandbox ships since v125); execute the saved AI code with the same helper contract in Node instead
 {const ema=(a,n)=>{const k=2/(n+1);let p=null;return a.map(v=>p=p==null?v:v*k+p*(1-k));};let r=null,err=null;try{r=new Function('k','ema','sma','rsi','atr','hh','ll',ui[0].code)(bars,ema,ema,ema,()=>[],()=>[],()=>[]);}catch(e){err=e.message;}
  ok('AI JS indicator code runs under the helper contract and returns series',r&&r.series&&r.series.f&&r.series.f.length===300,err);}
 ok('prompt addendum lists built-in ids',/chart-actions/.test(CA.promptAddendum())&&/RSI/.test(CA.promptAddendum()));
 ok('no runtime errors',errs.length===0,errs);console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);
},1500);
