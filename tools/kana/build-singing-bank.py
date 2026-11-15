"""Build the web sampler from PJS ver.1.1 and pjs-manual-labels v1 archives."""
import array
import io
import json
import sys
import wave
import zipfile
from pathlib import Path

rows = dict(zip("∅ k g s z t d n h b p m r y w sh j ch ts f ky gy ny hy by py my ry".split(),
                "あいうえお かきくけこ がぎぐげご さすぃすせそ ざずぃずぜぞ たてぃとぅてと だでぃどぅでど なにぬねの はひふへほ ばびぶべぼ ぱぴぷぺぽ まみむめも らりるれろ やいゆいぇよ わうぃううぇを しゃししゅしぇしょ じゃじじゅじぇじょ ちゃちちゅちぇちょ つぁつぃつつぇつぉ ふぁふぃふふぇふぉ きゃききゅきぇきょ ぎゃぎぎゅぎぇぎょ にゃににゅにぇにょ ひゃひひゅひぇひょ びゃびびゅびぇびょ ぴゃぴぴゅぴぇぴょ みゃみみゅみぇみょ りゃりりゅりぇりょ".split()))
import re
rows = {k: re.findall(r".[ゃゅょぁぃぅぇぉ]?", v) for k, v in rows.items()}
songs, labels = map(zipfile.ZipFile, sys.argv[1:3])
best = {}
for name in sorted(labels.namelist()):
    if "/v1/" not in name or not name.endswith(".lab"):
        continue
    song = Path(name).stem
    previous = "pau"
    preceding = "pau"
    prev_start = preceding_start = 0
    for line in labels.read(name).decode("utf8").splitlines():
        a,b,p = line.split()
        a,b = int(a)/1e7,int(b)/1e7
        if p.lower() in ("a","i","u","e","o","n") and (p=="N" or p.lower()!="n"):
            onset = prev_start if previous in rows else a
            kana = "ん" if p=="N" else rows.get(previous,rows["∅"])["aiueo".index(p.lower())]
            left = preceding if previous in rows else previous
            rating = abs(b-a-.22) + max(0,a-onset-.12) + (.3 if p.isupper() and p!="N" else 0)
            variants = [(kana,max(onset,a-.16))]
            # Keep the actual release of the preceding vowel into this consonant.
            if left in ("a","i","u","e","o","N"):
                left_start = preceding_start if previous in rows else prev_start
                variants.append((left+":"+kana,max(left_start,onset-.044)))
            for key,start in variants:
                if key not in best or rating < best[key][0]:
                    best[key] = (rating,song,start,a,min(b,a+.38),onset-start)
        preceding,preceding_start = previous,prev_start
        previous,prev_start=p,a
out=array.array("h")
meta={}
for kana,(_,song,start,vowel,end,lead) in sorted(best.items()):
    with wave.open(io.BytesIO(songs.read(f"PJS_corpus_ver1.1/{song}/{song}_song.wav"))) as w:
        w.setpos(round(start*w.getframerate()))
        raw=w.readframes(round((end-start)*w.getframerate()))
    sample=[int.from_bytes(raw[i:i+3],"little",signed=True)>>8 for i in range(0,len(raw)-2,6)]
    onset=round((vowel-start)*24000)
    if len(sample)-onset<600: continue
    # Estimate a vowel period via normalized autocorrelation, then align grains to local peaks.
    mid=min(len(sample)-520,onset+300)
    def correlation(lag):
        a=sample[mid:mid+300:2]; b=sample[mid+lag:mid+lag+300:2]
        return sum(x*y for x,y in zip(a,b))/(max(1,sum(x*x for x in a)*sum(x*x for x in b))**.5)-lag*.00012
    period=max(range(40,214),key=correlation)
    pos=max(range(onset,min(len(sample),onset+period)),key=sample.__getitem__)
    marks=[pos]
    while pos+period*1.3<len(sample):
        pos=max(range(pos+int(period*.80),pos+int(period*1.23)),key=sample.__getitem__)
        marks.append(pos)
    if len(marks)<3: continue
    meta[kana]=[len(out),len(sample),onset,marks,max(map(abs,sample)),round(lead*24000)]
    out.extend(sample)
assets=Path("public/assets")
(assets/"pjs-legato.bin").write_bytes(out.tobytes())
(assets/"pjs-legato.json").write_text(json.dumps(meta,ensure_ascii=False,separators=(",",":")),encoding="utf8")
print(len(meta),"syllables,",len(out)*2,"bytes")
