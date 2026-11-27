'use strict';
const board=document.querySelector('canvas'),g=board.getContext('2d'),ui=document.querySelector('#controls'),msg=document.querySelector('#status'),game=document.body.dataset.game;
const accent=getComputedStyle(document.body).getPropertyValue('--accent').trim(),params=new URLSearchParams(location.hash.slice(1));
let seed=Number(params.get('s'))>>>0||crypto.getRandomValues(new Uint32Array(1))[0],state=seed;
function random(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296}
function mix(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function screen(s){msg.textContent=s;ui.replaceChildren();board.onpointerdown=board.onpointermove=board.onpointerup=board.onpointercancel=null}
function button(s,fn){const b=document.createElement('button');b.textContent=s;b.onclick=fn;ui.append(b);return b}
function input(label){const el=document.createElement('input');el.placeholder=label;el.setAttribute('aria-label',label);el.maxLength=80;ui.append(el);return el}
function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(x,y,w,h)}
function ellipse(x,y,rx,ry,col){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=col;g.fill()}
function label(s,x,y,size=22,col='#283b3b'){g.fillStyle=col;g.textAlign='center';g.font='600 '+size+'px system-ui,sans-serif';g.fillText(s,x,y,570)}
function background(c='#f1ebdc'){rect(0,0,600,330,c)}
function point(e){const b=board.getBoundingClientRect();return [(e.clientX-b.left)*600/b.width,(e.clientY-b.top)*330/b.height]}
function invite(message,fields={}){
 const url=new URL(location.pathname,location.origin);url.hash=new URLSearchParams({s:seed,...fields});const share=new URL('https://twitter.com/intent/tweet');share.searchParams.set('text',message);share.searchParams.set('url',url);
 const a=document.createElement('a');a.href=share;a.target='_blank';a.rel='noopener';a.textContent='Xで共有';ui.append(a);
 button('リンクをコピー',async()=>{try{await navigator.clipboard.writeText(url.href);msg.textContent='招待リンクをコピーしました。'}catch{const el=input('招待リンク');el.removeAttribute('maxlength');el.value=url;el.readOnly=true;el.select()}});
}
function end(s,fields={}){screen(s);invite(s,fields);button('画像を保存',()=>{const c=document.createElement('canvas');c.width=600;c.height=450;const ctx=c.getContext('2d');ctx.fillStyle='#faf6ea';ctx.fillRect(0,0,600,450);ctx.drawImage(board,0,0);ctx.fillStyle='#213e3b';ctx.font='bold 22px sans-serif';ctx.fillText(document.querySelector('h1').textContent,16,367,565);ctx.font='17px sans-serif';ctx.fillText(s,16,410,565);const a=document.createElement('a');a.href=c.toDataURL();a.download=game+'.png';a.click()});button('新しく遊ぶ',()=>location.assign(location.pathname+'?new='+Date.now()))}
let audioCtx;
function sound(){audioCtx??=new AudioContext();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
function tone(freq,duration=.12,delay=0,noise=false){const ctx=sound(),t=ctx.currentTime+delay,amp=ctx.createGain();let src;if(noise){const buf=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate);const data=buf.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;src=ctx.createBufferSource();src.buffer=buf}else{src=ctx.createOscillator();src.frequency.value=freq}amp.gain.setValueAtTime(.12,t);amp.gain.exponentialRampToValueAtTime(.001,t+duration);src.connect(amp).connect(ctx.destination);src.start(t);src.stop(t+duration)}
function stroke(points,color,width=3,close=false){if(!points.length)return;g.beginPath();g.moveTo(...points[0]);for(const p of points.slice(1))g.lineTo(...p);if(close)g.closePath();g.strokeStyle=color;g.lineWidth=width;g.lineJoin='round';g.stroke()}
const games={};
