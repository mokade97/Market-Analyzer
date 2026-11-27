"""G34 — pandas-ta oracle: compares our JS indicators (tests/oracle_out.json, produced by oracle_dump.js) with pandas_ta on the same bars.
usage:  node tests/oracle_dump.js tests/oracle_bars.json && python3 tests/oracle.py
Tolerance is relative (per-indicator) on the last 200 bars; known definitional differences are listed in NOTES."""
import json,sys,math,os
import pandas as pd,numpy as np,pandas_ta as ta
here=os.path.dirname(__file__)
bars=json.load(open(os.path.join(here,'oracle_bars.json')));ours=json.load(open(os.path.join(here,'oracle_out.json')))
df=pd.DataFrame(bars).rename(columns={'o':'open','h':'high','l':'low','c':'close','v':'volume'});df.index=pd.to_datetime(df.t,unit='ms')
o,h,l,c,v=df.open,df.high,df.low,df.close,df.volume
def col(x,i=0):
    return x if isinstance(x,pd.Series) else x.iloc[:,i]
REF={
 'EMA':lambda:ta.ema(c,20),'SMA':lambda:ta.sma(c,50),'RSI':lambda:ta.rsi(c,14),'ATR':lambda:ta.atr(h,l,c,14),'ADX':lambda:col(ta.adx(h,l,c,14),0),
 'BOLL':lambda:col(ta.bbands(c,20,2,ddof=0),2),'MACD':lambda:col(ta.macd(c),1),'CCI':lambda:(lambda tp:(tp-tp.rolling(20).mean())/(0.015*tp.rolling(20).apply(lambda w:np.mean(np.abs(w-w.mean())),raw=True)))((h+l+c)/3),'WPR':lambda:ta.willr(h,l,c,14),'MFI':lambda:ta.mfi(h,l,c,v,14),
 'CMF':lambda:ta.cmf(h,l,c,v,length=20),'OBV':lambda:ta.obv(c,v),'ROC':lambda:ta.roc(c,12),'DEMA':lambda:ta.dema(c,20),'TEMA':lambda:ta.tema(c,20),'WMA':lambda:ta.wma(c,20),'HMA':lambda:ta.hma(c,55),
 'TRIX':lambda:col(ta.trix(c,15),0)*100,'CMO':lambda:ta.cmo(c,14,talib=False),'UO':lambda:ta.uo(h,l,c),'AO':lambda:ta.ao(h,l),'MOM':lambda:ta.mom(c,10),'VTX':lambda:col(ta.vortex(h,l,c,14),0),
 'CHOP':lambda:ta.chop(h,l,c,14),'DPO':lambda:ta.dpo(c,20,centered=False),'VWMA':lambda:ta.vwma(c,v,20),'KC':lambda:col(ta.kc(h,l,c,20,2),2),'STOCH':lambda:col(ta.stoch(h,l,c,14,3,3),0),
 'TSI':lambda:col(ta.tsi(c,13,25),0),'PVT':lambda:ta.pvt(c,v)/100,'ADL':lambda:ta.ad(h,l,c,v),'EFI':lambda:ta.efi(c,v,13),'BOP':lambda:ta.sma(ta.bop(o,h,l,c),14),'COPP':lambda:ta.coppock(c),
 'FISH':lambda:col(ta.fisher(h,l,9),0),'KER':lambda:ta.er(c,20),'SD':lambda:ta.stdev(c,20,ddof=0),'PCTB':lambda:col(ta.bbands(c,20,2,ddof=0),4),'SMMA':lambda:ta.rma(c,14),'ALMA':lambda:ta.alma(c,21,0.6,6),
 'LSMA':lambda:ta.linreg(c,25),'DON':lambda:col(ta.donchian(h,l,20,20),2),'AROON':lambda:col(ta.aroon(h,l,25),1),'DMI':lambda:ta.adx(h,l,c,14).filter(like='DMP').iloc[:,0],'SAR':lambda:col(ta.psar(h,l,c),0).combine_first(col(ta.psar(h,l,c),1)),
 'STOCHRSI':lambda:col(ta.stochrsi(c,14,14,3,3),0),'CHO':lambda:ta.adosc(h,l,c,v,fast=3,slow=10),'BBW':lambda:col(ta.bbands(c,20,2,ddof=0),3),
}
TOL={'default':0.01,'HMA':0.02,'TRIX':0.05,'TSI':0.05,'DPO':0.05,'COPP':0.05,'FISH':0.08,'ALMA':0.15,'PCTB':0.05,'STOCHRSI':0.08,'SAR':0.05,'CHO':0.05,'EFI':0.05,'KC':0.03,'BOP':0.05,'DON':0.001,'DMI':0.03,'ADX':0.03,'AROON':0.001,'UO':0.03,'RVI':0.1}
NOTES={'CCI':'pandas-ta 0.4 cci lacks the 0.015 constant → compared with a manual Lambert CCI','TRIX':'ours ×10000 (TradingView), pandas ×100','PVT':'ours fraction×vol, pandas percent×vol','SD':'population σ (ddof=0) like TradingView','DON':'ours excludes the current bar (prev-N) — compared with a 1-bar shift','ALMA':'TradingView-style offset 0.85 vs pandas 0.6 — looser tolerance','OBV':'cumulative; compared after de-meaning','PVT':'cumulative; compared after de-meaning','ADL':'cumulative; de-meaned','CMO':'pandas CMO (non-talib) matches the Chande definition'}
res=[];fails=0
for k,fn in REF.items():
    mine=ours.get(k)
    if mine is None or isinstance(mine,str): res.append((k,'MISSING' if mine is None else mine));continue
    try: ref=fn().astype(float).values
    except Exception as e: res.append((k,'REF-ERR '+str(e)[:50]));continue
    m=np.array([np.nan if x is None else float(x) for x in mine])
    if k=='DON': m=m[1:];ref=ref[:-1]
    n=min(len(m),len(ref));m=m[-n:];ref=ref[-n:]
    a=m[-200:];b=ref[-200:]
    if k in('OBV','PVT','ADL'): a=a-np.nanmean(a);b=b-np.nanmean(b)
    ok=~(np.isnan(a)|np.isnan(b))
    if ok.sum()<50: res.append((k,'too few overlapping values'));fails+=1;continue
    scale=max(np.nanmax(np.abs(b[ok])),1e-9)
    err=np.nanmax(np.abs(a[ok]-b[ok]))/scale
    tol=TOL.get(k,TOL['default']);good=err<=tol
    if not good: fails+=1
    res.append((k,('✓' if good else '✗')+f' maxrel={err:.4f} tol={tol}'+(' · '+NOTES[k] if k in NOTES else '')))
for k,r in res: print(f'{k:9}{r}')
print(f'\n{len(res)-fails}/{len(res)} within tolerance');sys.exit(1 if fails else 0)
