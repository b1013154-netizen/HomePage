import initialize from '/vendor/sinsy/sinsy.js';
let engine;
self.onmessage=async({data})=>{
  try{
    if(!engine){
      engine=await initialize({locateFile:file=>new URL('/vendor/sinsy/'+file,self.location.href).href,print:()=>{}});
      if(engine._sinsy_init()!==1)throw Error('日本語歌唱モデルの初期化に失敗しました。');
    }
    const bytes=new TextEncoder().encode(data.xml+'\0'),p=engine._malloc(bytes.length);
    if(!p)throw Error('歌声を作るメモリが足りません。');
    try{
      engine.HEAPU8.set(bytes,p);
      const alpha=[.55,.59,.51][data.voice]??.55;
      const count=engine._sinsy_render_xml(p,alpha,0,0,1,0,.5,1);
      if(count<=0)throw Error('このフレーズを歌えませんでした。音符の長さと歌詞を確認してください。');
      const offset=engine._sinsy_data()/4,pcm=engine.HEAPF32.slice(offset,offset+count);
      self.postMessage({pcm,hz:engine._sinsy_sample_rate()},[pcm.buffer]);
    }finally{engine._free(p);}
  }catch(e){self.postMessage({error:e.message});}
};
