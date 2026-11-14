import array,json,math
from pathlib import Path
d=Path('public/assets'); raw=(d/'kana-bank.pcm').read_bytes(); index=json.loads((d/'kana-bank.json').read_text(encoding='utf-8-sig'));out=bytearray();meta={}
for kana,(off,size) in index.items():
 if size<2000:continue
 a=array.array('h');a.frombytes(raw[off:off+size]);peak=max(map(abs,a));active=[i for i in range(0,len(a),8) if abs(a[i])>max(35,peak*.013)]
 if not active:continue
 a=a[max(0,active[0]-110):min(len(a),active[-1]+200)]; mid=len(a)//2
 def period(k):
  k=max(0,min(k,len(a)-720)); best=-1; lag=100
  for l in range(56,175):
   aa=bb=ab=0
   for j in range(k,k+500,6):
    x=a[j];y=a[j+l];aa+=x*x;bb+=y*y;ab+=x*y
   r=ab/math.sqrt(max(1,aa*bb))-.00035*l
   if r>best:best,lag=r,l
  return lag,best
 marks=[];k=0;onset=0
 while k<len(a)-720:
  lag,quality=period(k)
  if quality>.60 and sum(abs(a[j]) for j in range(k,k+440,8))/55>peak*.045:onset=k;break
  k+=100
 lag,_=period(mid);start=max(onset+lag,lag);p=max(range(start,min(start+lag,len(a))),key=a.__getitem__);marks.append(p)
 while p<len(a)-350:
  lp,_=period(p) if len(marks)%6==1 else (lp,0)
  lo=p+int(lp*.82);hi=min(len(a),p+int(lp*1.18)+1)
  if hi<=lo:break
  p=max(range(lo,hi),key=a.__getitem__);marks.append(p)
 offset=len(out)//2;out.extend(a.tobytes());meta[kana]=[offset,len(a),onset,marks,peak]
(d/'kana-bank.pcm').write_bytes(out);(d/'kana-bank.json').write_text(json.dumps(meta,ensure_ascii=False,separators=(',',':')),encoding='utf8');print(len(meta),len(out))

