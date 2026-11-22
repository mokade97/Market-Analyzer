/* ==== v114 chart tool strip: TradingView-style access to the analysis tools from the chart tab ====
   UX only. Lens / Roundtable panels are the SAME DOM nodes as in the Tools tab — they are moved into a bottom sheet while open
   and moved back on close, and the existing buttons (#lensBtn / #rtBtn) are clicked programmatically. No analysis logic lives here. */
(function(){
const $=id=>document.getElementById(id);const fa=()=>(localStorage.getItem('fc_lang')||'fa')==='fa';
const L=()=>fa()?{lens:'🎯 Lens',rt:'⚖️ میزگرد',replay:'🎬 بازپخش',bt:'🧪 بک‌تست',chat:'💬 گفتگو',vision:'📸 تحلیل تصویر',close:'✕',hint:'ابزارها روی نماد/تایم‌فریم همین چارت اجرا می‌شوند'}
                 :{lens:'🎯 Lens',rt:'⚖️ Roundtable',replay:'🎬 Replay',bt:'🧪 Backtest',chat:'💬 Chat',vision:'📸 Vision',close:'✕',hint:'tools run on this chart’s symbol / timeframe'};
const wrap=$('tvWrap');if(!wrap)return;
/* strip */
const bar=document.createElement('div');bar.id='chartToolStrip';bar.style.cssText='display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:4px 0 6px;direction:ltr;align-items:center';
const mk=(txt,fn,bg)=>{const b=document.createElement('button');b.className='ghost';b.textContent=txt;b.style.cssText='flex-shrink:0;padding:7px 11px;font-size:12px;border-radius:999px'+(bg?';background:'+bg+';color:#fff;border-color:transparent':'');b.onclick=fn;return b;};
/* sheet */
const sheet=document.createElement('div');sheet.id='chartSheet';sheet.style.cssText='display:none;position:fixed;left:0;right:0;bottom:0;max-height:78vh;z-index:70;background:var(--card);border-top:1px solid var(--border);border-radius:16px 16px 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.45);flex-direction:column';
sheet.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border)"><b id="chartSheetTitle" style="font-size:13px"></b><span id="chartSheetSym" class="hint" style="margin:0;direction:ltr;font-size:11px"></span><button class="ghost" id="chartSheetClose" style="padding:4px 10px">✕</button></div><div id="chartSheetBody" style="overflow:auto;padding:8px 10px;-webkit-overflow-scrolling:touch"></div>';
document.body.appendChild(sheet);
const home={};// id -> {parent,next} so panels go back exactly where they came from
function take(id){const el=$(id);if(!el)return null;if(!home[id])home[id]={parent:el.parentNode,next:el.nextSibling};$('chartSheetBody').appendChild(el);el.style.display='';return el;}
function giveBack(){Object.keys(home).forEach(id=>{const el=$(id),h=home[id];if(el&&h&&h.parent){if(h.next&&h.next.parentNode===h.parent)h.parent.insertBefore(el,h.next);else h.parent.appendChild(el);}});}
function open(title,ids,clickId){const T=L();$('chartSheetTitle').textContent=title;try{$('chartSheetSym').textContent=(window.tvSymbol?tvSymbol().full:'')+' · '+((window.tfName&&tfName[$('tvInt').value])||({'5':'5m','15':'15m','60':'1H','240':'4H','D':'1D','W':'1W'}[$('tvInt').value]||$('tvInt').value));}catch(e){}
  $('chartSheetBody').innerHTML='';ids.forEach(take);sheet.style.display='flex';history.pushState({sheet:1},'');
  if(clickId&&$(clickId)){try{if(window.updToolsSym)updToolsSym();$(clickId).click();}catch(e){}}}
function close(){if(sheet.style.display==='none')return;giveBack();sheet.style.display='none';}
$('chartSheetClose').onclick=()=>{close();try{if(history.state&&history.state.sheet)history.back();}catch(e){}};
window.addEventListener('popstate',()=>close());
const toTab=name=>{const b=document.querySelector('.tabs button[data-tab="'+name+'"]');if(b)b.click();};
const syncBt=()=>{try{const s=window.tvSymbol?tvSymbol().q:null;const tf={'5':'15m','15':'15m','60':'1H','240':'4H','D':'1D','1D':'1D','W':'1D'}[$('tvInt').value]||'4H';if($('btSym')&&s)$('btSym').value=s;if($('btTf'))$('btTf').value=tf;}catch(e){}};
const T=L();
bar.appendChild(mk(T.lens,()=>open(T.lens,['lensBox'],'lensBtn'),'#7c3aed'));
bar.appendChild(mk(T.rt,()=>open(T.rt,['rtBox'],'rtBtn'),'#0e7490'));
bar.appendChild(mk(T.replay,()=>{syncBt();toTab('backtest');setTimeout(()=>{const b=$('rpBtn');if(b){b.scrollIntoView({block:'start'});b.click();}},50);}));
bar.appendChild(mk(T.bt,()=>{syncBt();toTab('backtest');setTimeout(()=>{const b=$('btLoad');if(b)b.scrollIntoView({block:'start'});},50);}));
bar.appendChild(mk(T.chat,()=>{const d=$('chatBox');if(d){d.open=true;d.scrollIntoView({block:'start'});}}));
bar.appendChild(mk(T.vision,()=>{const b=$('tvVision');if(b)b.click();}));
const h=document.createElement('span');h.className='hint';h.style.cssText='margin:0 4px;font-size:11px;flex-shrink:0';h.textContent=T.hint;bar.appendChild(h);
wrap.parentNode.insertBefore(bar,wrap);
/* the Lens / Roundtable panels show their result inside the box; make sure the box is visible when opened from the sheet */
['lensBox','rtBox'].forEach(id=>{const el=$(id);if(!el)return;new MutationObserver(()=>{if(el.parentNode===$('chartSheetBody'))el.style.display='';}).observe(el,{attributes:true,attributeFilter:['style']});});
})();
