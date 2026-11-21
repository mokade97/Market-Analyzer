const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:760}});
const errs=[];p.on('pageerror',e=>errs.push(String(e.message)));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push('console:'+m.text().slice(0,200));});
await p.route('**/*',r=>r.request().url().startsWith('file:')?r.continue():r.abort());
await p.goto('file:///home/user/futures-calculator/index.html');await p.waitForTimeout(800);
const k=JSON.parse(fs.readFileSync('/home/user/.tt/okx_4H_1000.json','utf8'));
await p.evaluate(k=>{window.klinesAny=async(s,tf,n)=>k.slice(-n);window.tvSymbol=()=>({q:'BTCUSDT',full:'BINANCE:BTCUSDT'});window.alert=()=>{};window.confirm=()=>true;window.prompt=()=>'hello';document.getElementById('tvInt').value='240';},k);
await p.evaluate(()=>{document.querySelector('.tabs button[data-tab="backtest"]').click();document.getElementById('rpBtn').click();});await p.waitForTimeout(1500);
await p.evaluate(()=>{const o=document.getElementById('obWrap');if(o)o.remove();});
const info=await p.evaluate(()=>({lt:!!window.LT,msg:document.getElementById('rpMsg').textContent,rail:[...document.querySelectorAll('#rpRail [data-tool]')].map(b=>b.dataset.tool).join(','),eng:document.getElementById('rpEng')&&document.getElementById('rpEng').textContent,ver:LightweightCharts.version()}));
console.log(info);
const box=await p.evaluate(()=>{document.getElementById('rpChartRow').scrollIntoView();window.scrollBy(0,-10);const r=document.getElementById('rpChart').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};});console.log('chart',box);
const X=x=>box.x+x,Y=y=>box.y+y;
const tool=async t=>{await p.evaluate(t=>document.querySelector('#rpRail [data-tool="'+t+'"]').click(),t);await p.waitForTimeout(100);};
const clickAt=async(x,y)=>{await p.mouse.move(X(x),Y(y));await p.mouse.down();await p.mouse.up();await p.waitForTimeout(120);};
// trend line
await tool('t');await clickAt(100,200);await p.mouse.move(X(200),Y(150));await clickAt(300,120);
// rectangle
await tool('r');await clickAt(350,100);await clickAt(480,220);
// horizontal
await tool('h');await clickAt(500,300);
// fib
await tool('f');await clickAt(120,400);await clickAt(300,250);
// text
await tool('x');await clickAt(600,150);
// channel (3 pts)
await tool('c');await clickAt(520,380);await clickAt(700,300);await clickAt(650,330);
// long short
await tool('ls');await clickAt(720,200);await clickAt(820,260);await clickAt(820,120);
await p.waitForTimeout(300);
let st=await p.evaluate(()=>{const j=JSON.parse(localStorage.getItem('fc_rp_lt_BTCUSDT_4H')||'[]');return {n:j.length,types:j.map(x=>x.toolType).join(','),tool:document.querySelector('#rpRail .on')&&document.querySelector('#rpRail .on').dataset.tool};});
console.log('after create',st);
await p.screenshot({path:'lt_a.png'});
const midOf=async T=>await p.evaluate(T=>{const j=JSON.parse(__rp.LTP.exportLineTools());const d=j.find(x=>x.toolType===T);const r=document.getElementById('rpChart').getBoundingClientRect();const ts=__rp.CH.timeScale();const P=d.points.slice(0,2);const xs=P.map(q=>ts.timeToCoordinate(q.timestamp)),ys=P.map(q=>__rp.SER.c.priceToCoordinate(q.price));return {x:r.x+(xs[0]+(xs[1]??xs[0]))/2,y:r.y+(ys[0]+(ys[1]??ys[0]))/2};},T);
const selT=async T=>{const m=await midOf(T);await p.mouse.move(m.x,m.y);await p.mouse.down();await p.mouse.up();await p.waitForTimeout(200);};
await p.keyboard.press('Escape');await p.waitForTimeout(100);
// select trend line by clicking mid, check style bar
await selT('TrendLine');await p.waitForTimeout(200);
let sb=await p.evaluate(()=>{const b=document.getElementById('rpStyle');return {disp:b.style.display,html:b.innerHTML.length,btns:[...b.querySelectorAll('[data-a]')].map(x=>x.dataset.a).join(',')};});console.log('stylebar',sb);
// change colour
await p.evaluate(()=>{const b=document.getElementById('rpStyle');b.querySelector('[data-a=col]').click();b.querySelector('.pal i[data-c="#ef5350"]').click();});await p.waitForTimeout(150);
await p.evaluate(()=>{const b=document.getElementById('rpStyle');b.querySelector('[data-a=w]').click();});await p.waitForTimeout(100);
await p.evaluate(()=>{const b=document.getElementById('rpStyle');b.querySelector('[data-a=exR]').click();});await p.waitForTimeout(100);
st=await p.evaluate(()=>{const j=JSON.parse(localStorage.getItem('fc_rp_lt_BTCUSDT_4H')||'[]');const tl=j.find(x=>x.toolType==='TrendLine');return tl&&tl.options.line;});console.log('trendline opts',JSON.stringify(st));
// drag the horizontal line
const hBefore=await p.evaluate(()=>JSON.parse(localStorage.getItem('fc_rp_lt_BTCUSDT_4H')).find(x=>x.toolType==='HorizontalLine').points[0].price);
await p.keyboard.press('Escape');const hm=await midOf('HorizontalLine');await p.mouse.move(hm.x-200,hm.y);await p.mouse.down();await p.mouse.move(hm.x-200,hm.y+30,{steps:6});await p.mouse.up();await p.waitForTimeout(200);
const hAfter=await p.evaluate(()=>JSON.parse(localStorage.getItem('fc_rp_lt_BTCUSDT_4H')).find(x=>x.toolType==='HorizontalLine').points[0].price);console.log('hline drag',hBefore,'->',hAfter);
// object tree
await p.evaluate(()=>document.getElementById('rpObjB').click());await p.waitForTimeout(150);console.log('tree rows',await p.evaluate(()=>document.querySelectorAll('#rpObj .row').length));
await p.screenshot({path:'lt_b.png'});
// undo twice
await p.keyboard.press('Escape');await p.evaluate(()=>{rpUndo.click();rpUndo.click();});await p.waitForTimeout(100);
console.log('live after undo',await p.evaluate(()=>JSON.parse(__rp.LTP.exportLineTools()).map(x=>x.toolType).join(',')));console.log('after 2 undo',await p.evaluate(()=>JSON.parse(localStorage.getItem('fc_rp_lt_BTCUSDT_4H')).length));await p.evaluate(()=>rpRedo.click());console.log('live after redo',await p.evaluate(()=>JSON.parse(__rp.LTP.exportLineTools()).map(x=>x.toolType).join(',')));console.log('after redo',await p.evaluate(()=>JSON.parse(localStorage.getItem('fc_rp_lt_BTCUSDT_4H')).length));
// Escape cancels a half-drawn tool
await tool('t');await clickAt(100,500);await p.keyboard.press('Escape');await p.waitForTimeout(100);console.log('after esc',await p.evaluate(()=>({n:JSON.parse(localStorage.getItem('fc_rp_lt_BTCUSDT_4H')).length,tool:document.querySelector('#rpRail .on')&&document.querySelector('#rpRail .on').dataset.tool})));
// delete via key: select rect then Delete
await selT('Rectangle');console.log('rect sel?',await p.evaluate(()=>__rp.ltSel));await p.keyboard.press('Delete');await p.waitForTimeout(100);console.log('after delete',await p.evaluate(()=>JSON.parse(localStorage.getItem('fc_rp_lt_BTCUSDT_4H')).map(x=>x.toolType).join(',')));
// persistence: switch tf and back
await p.evaluate(()=>document.querySelector('#rpTb [data-tf="1D"]').click());await p.waitForTimeout(900);await p.evaluate(()=>document.querySelector('#rpTb [data-tf="4H"]').click());await p.waitForTimeout(900);
console.log('reloaded tools visible',await p.evaluate(()=>__rp.LTP?JSON.parse(__rp.LTP.exportLineTools()).length:'noLTP'));
// step replay forward
await p.evaluate(()=>{for(let i=0;i<5;i++)document.getElementById('rpNext10').click();});await p.waitForTimeout(300);
await p.screenshot({path:'lt_c.png'});
console.log('errs',JSON.stringify(errs.filter(e=>!/createObjectURL|favicon|net::ERR/.test(e)).slice(0,8)));await b.close();})();
