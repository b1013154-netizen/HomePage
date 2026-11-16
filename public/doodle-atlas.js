'use strict';

const DoodleAtlas = (() => {
  const species = `
1f418 ゾウ walk
1f992 キリン walk
1f993 シマウマ walk
1f98f サイ walk
1f99b カバ walk
1f42a ヒトコブラクダ walk
1f998 カンガルー hop
1f98c シカ walk
1f410 ヤギ walk
1f411 ヒツジ walk
1f43f シマリス hop
1f994 ハリネズミ walk
1f9a5 ナマケモノ walk
1f9a8 スカンク walk
1f9a6 カワウソ swim
1f9ab ビーバー swim
1f987 コウモリ fly
1f989 フクロウ fly
1f985 ワシ fly
1f99a クジャク walk
1f9a9 フラミンゴ walk
1f9a2 ハクチョウ swim
1f427 ペンギン walk
1f986 カモ swim
1f99c オウム fly
1f422 カメ walk
1f40a ワニ crawl
1f40d ヘビ slither
1f995 竜脚類 walk
1f996 ティラノサウルス walk
1f419 タコ pulse
1f991 イカ pulse
1f980 カニ side
1f99e ロブスター side
1f990 エビ swim
1f421 フグ swim
1f988 サメ swim
1f42c イルカ swim
1f433 クジラ swim
1f9ad アザラシ swim
1f98b チョウ fly
1f41d ミツバチ fly
1f41c アリ walk
1f982 サソリ walk
1f577 クモ side
1f40c カタツムリ slither
1f41b イモムシ crawl
1f997 コオロギ hop
  `.trim().split(/\r?\n/).map(row => {
    const [code, name, gait] = row.trim().split(' ');
    return {name, gait, url: '/assets/doodle-fauna/' + code + '.svg'};
  });

  // Each outline starts at the attachment joint. The second path describes
  // feather barbs, membrane struts, joints or fin rays on that same outline.
  const parts = [];
  function add(role, name, outline, detail, fill) {
    parts.push({role, name, outline: new Path2D(outline), detail: new Path2D(detail), fill});
  }
  const wing = (n,o,d,c) => add('wing',n,o,d,c);
  wing('ワシの指状翼','M0 0 Q-5 -21 -21 -30 L-48 -43 Q-48 -37 -36 -28 L-53 -37 Q-49 -26 -36 -21 L-52 -26 Q-48 -16 -32 -15 L-44 -16 Q-39 -6 -18 -8 Q-9 1 0 0Z','M-4 -4 Q-15 -17 -33 -23 M-12 -12 L-28 -12','#b18a60');
  wing('ツバメの鎌翼','M0 0 Q-7 -26 -54 -43 Q-39 -28 -29 -12 Q-15 -7 0 0Z','M-4 -4 Q-17 -18 -43 -34','#7497a6');
  wing('フクロウの丸翼','M0 0 Q-4 -34 -32 -35 Q-52 -38 -50 -25 Q-48 -18 -44 -20 Q-43 -11 -37 -15 Q-32 -6 -26 -11 Q-16 -3 0 0Z','M-9 -8 Q-13 -22 -31 -26 M-21 -18 L-37 -23 M-25 -15 L-40 -18','#cfae76');
  wing('アホウドリの長翼','M0 0 L-13 -17 Q-31 -24 -58 -23 L-46 -17 L-30 -15 L-17 -7Z','M-9 -8 L-24 -18 L-51 -21','#ccd7d5');
  wing('カワセミの短翼','M0 0 Q0 -22 -17 -30 Q-29 -32 -42 -24 L-36 -19 L-30 -20 L-32 -14 L-22 -13 Q-14 -5 0 0Z','M-8 -9 Q-18 -22 -33 -23 M-15 -12 L-26 -17','#61aaa3');
  wing('コウモリの膜翼','M0 0 L-14 -31 L-48 -41 Q-43 -29 -52 -21 Q-37 -27 -33 -12 Q-21 -21 -17 -5 Q-8 -12 0 0Z','M-14 -31 L-33 -12 M-14 -31 L-17 -5 M-15 -30 L-50 -21','#a699b5');
  wing('翼竜の帆翼','M0 0 L-12 -16 L-17 -41 L-21 -34 L-56 -17 Q-34 -21 -24 -8 Q-14 -12 0 0Z','M-4 -5 L-18 -31 L-53 -18 M-18 -31 L-24 -8','#c99267');
  wing('アゲハの尾状翼','M0 0 Q-4 -30 -35 -40 Q-49 -35 -37 -20 Q-52 -15 -38 -6 L-51 4 L-37 1 Q-17 4 0 0Z','M-3 -2 Q-18 -13 -32 -32 M-7 -3 L-32 -12 M-13 -2 L-38 -1','#edc069');
  wing('モルフォの扇翼','M0 0 Q-2 -35 -25 -39 Q-42 -38 -44 -22 Q-47 -10 -32 -9 Q-41 5 -28 8 Q-10 8 0 0Z','M-4 -2 L-24 -33 M-5 0 L-36 -21 M-7 1 L-29 4','#70b5ca');
  wing('トンボの複葉翼','M0 0 Q-26 -33 -53 -29 Q-49 -17 -5 -3 Q-38 -20 -52 -10 Q-49 2 0 0Z','M-5 -4 L-46 -25 M-8 -2 L-45 -9 M-25 -15 L-28 -21 M-31 -7 L-34 -12','#bddcd5');
  wing('セミの網目翼','M0 0 Q-11 -30 -37 -30 Q-55 -29 -51 -19 Q-40 -6 0 0Z','M-4 -3 L-47 -24 M-18 -10 L-20 -21 L-29 -16 L-32 -25 L-40 -21 M-22 -12 L-31 -9','#c9cfac');
  wing('ガの三角翼','M0 0 Q-1 -21 -18 -36 Q-30 -25 -51 -13 L-45 -8 L-40 -9 L-37 -5Z','M-8 -4 L-20 -27 L-38 -12 M-12 -6 L-21 -18 L-32 -11','#c5999c');
  wing('ペンギンの翼ひれ','M0 0 Q-1 -16 -20 -20 Q-34 -22 -48 -35 Q-46 -19 -31 -10 Q-14 2 0 0Z','M-5 -4 Q-25 -14 -39 -25','#8299aa');
  wing('トビウオの滑空ひれ','M0 0 L-18 -38 Q-39 -32 -53 -11 Q-34 -16 -22 -5Z','M-3 -3 L-18 -33 M-4 -3 L-29 -29 M-6 -4 L-38 -22 M-8 -4 L-46 -15','#83c5c2');
  const leg = (n,o,d,c) => add('leg',n,o,d,c);
  leg('カエルの跳躍脚','M0 0 Q-22 -2 -25 12 Q-25 16 -10 17 L-19 29 L-30 28 L-23 33 L-31 36 L-17 35 L-8 29 L0 15 Q4 12 -7 10 Q7 5 0 0Z','M-5 4 L-20 11 L-5 14 L-16 30','#9cb976');
  leg('カモの水かき','M-2 0 L4 0 L5 22 L18 31 Q9 30 7 35 Q1 31 -5 35 Q-6 30 -13 29 L-2 22Z','M1 22 L7 32 M1 22 L-5 31','#dfa266');
  leg('ヤモリの吸着指','M-4 0 Q-5 15 0 22 L-15 28 Q-22 25 -19 32 Q-16 35 -12 30 L0 26 L-7 36 Q-12 39 -7 41 L-3 39 L4 28 L12 35 Q14 42 18 37 L17 34 L8 24 L7 12 L3 0Z','M-1 5 L4 22 M-3 23 L-13 28','#a7b886');
  leg('シカの蹄脚','M-5 0 Q-5 13 1 16 L-1 31 L-8 38 L4 38 L8 32 L7 16 L3 0Z','M0 14 L4 19 M-1 32 L7 31 M0 37 L3 33','#b79574');
  leg('ワシの鉤爪','M-3 0 L4 0 L6 21 Q17 17 19 32 Q15 25 7 27 Q9 34 5 38 Q6 30 0 28 Q-11 29 -13 38 Q-16 26 -3 22Z','M-2 7 L4 8 M-2 12 L5 13 M-1 17 L5 18','#d8b773');
  leg('カマキリの鎌脚','M0 0 L7 3 L-4 15 L11 29 Q12 33 6 38 L-13 16 L-10 11 L-8 15 L-6 9 L-4 12Z','M-8 16 L8 34 M0 5 L-6 13','#9bad73');
  leg('ゾウの柱脚','M-8 0 Q-10 17 -8 28 L-12 35 Q0 40 13 35 L9 27 Q6 13 8 0Z','M-8 26 Q0 29 8 26 M-6 36 Q-6 29 -2 36 M0 36 Q1 29 5 36','#adb0a6');
  leg('モグラの掘削脚','M-4 0 Q-13 12 -12 23 L-18 34 L-9 29 L-9 38 L-2 31 L2 39 L5 30 L11 36 L12 23 Q14 14 4 0Z','M-6 14 Q-1 18 7 17 M-8 25 L-11 30 M0 26 L-2 30','#bc998e');
  const tail = (n,o,d,c) => add('tail',n,o,d,c);
  tail('キツネの房尾','M0 0 Q-14 -22 -31 -18 L-28 -22 Q-44 -22 -54 -10 Q-43 -11 -38 -2 L-40 2 Q-18 14 0 0Z','M-35 -17 L-30 -12 L-36 -11 L-31 -5 L-37 -4','#d69762');
  tail('サソリの毒針尾','M0 0 Q-22 16 -38 2 Q-56 -15 -40 -28 Q-27 -38 -20 -23 L-17 -13 L-27 -20 Q-31 -30 -38 -21 Q-48 -8 -28 -2 Q-17 2 -3 -8Z','M-12 -4 L-9 6 M-22 -3 L-21 8 M-38 -6 L-44 -1 M-42 -15 L-49 -16','#b59b7d');
  tail('タツノオトシゴの巻尾','M0 -6 Q-16 -10 -22 2 Q-27 18 -40 12 Q-48 5 -39 1 Q-33 0 -35 7 Q-27 2 -33 -5 Q-49 -13 -54 3 Q-58 22 -39 24 Q-18 27 -13 10 Q-10 3 0 3Z','M-5 -3 Q-16 -3 -20 9 M-25 17 Q-37 25 -46 16','#dab47a');
  tail('サメの三日月尾','M0 -3 Q-13 -4 -30 -28 L-40 -35 Q-38 -16 -30 -3 Q-36 11 -43 20 Q-30 18 -17 5 L0 3Z','M-5 0 L-26 -3 L-36 -26 M-26 -2 L-38 15','#86a9b8');
  tail('ビーバーの櫂尾','M0 -3 Q-10 -8 -29 -10 Q-53 -11 -54 1 Q-57 15 -36 16 Q-17 16 0 4Z','M-44 -6 L-28 12 M-33 -6 L-18 9 M-46 6 L-32 -6 M-38 13 L-20 -3','#b09479');
  tail('孔雀の飾り尾','M0 0 Q-15 -26 -42 -30 Q-47 -25 -37 -17 Q-58 -22 -55 -12 Q-51 -6 -37 -6 Q-55 -3 -50 5 Q-29 13 0 0Z','M-5 -1 L-39 -26 M-6 0 L-49 -13 M-6 0 L-44 3 M-35 -23 Q-38 -29 -41 -25 Q-39 -20 -35 -23','#7eaf9c');

  const images = new Map();
  function texture(id) {
    if (!images.has(id)) {
      const image = new Image();
      image.src = species[id].url;
      images.set(id, image);
    }
    return images.get(id);
  }

  // Deform horizontal bands continuously so feet, fins and wing tips lag the trunk.
  function animal(g,id,actor) {
    const image = texture(id);
    if (!image.complete || !image.naturalWidth) return;
    const gait = species[id].gait, s = 92;
    if (!actor) { g.drawImage(image,-46,-46,s,s); return; }
    const phase=actor.phase, stride=Math.min(1,Math.abs(actor.vx)/55);
    for(let y=0;y<32;y++) {
      const u=(y+.5)/32, feet=Math.max(0,(u-.52)/.48);
      let x=0, width=1, rise=0;
      if(gait==='fly') width+=Math.sin(phase*1.7)*.17*(1-u);
      else if(gait==='pulse') {width+=Math.sin(phase-u*2)*.12; x=Math.sin(phase-u*5)*feet*3}
      else if(gait==='swim'||gait==='slither'||gait==='crawl') x=Math.sin(phase-u*3.6)*u*4;
      else if(gait==='hop') {rise=-Math.max(0,Math.sin(phase))*8*stride; width+=Math.cos(phase)*feet*.1}
      else {x=Math.sin(phase)*feet*4*stride; width+=Math.cos(phase)*feet*.08*stride}
      g.drawImage(image,0,y*image.naturalHeight/32,image.naturalWidth,image.naturalHeight/32,x-s*width/2,rise-46+y*s/32,s*width,s/32+.32);
    }
  }

  function part(g,id) {
    const p=parts[id];g.fillStyle=p.fill;g.strokeStyle='#34463e';g.lineJoin='round';g.lineCap='round';g.lineWidth=1.35;
    g.fill(p.outline);g.stroke(p.outline);g.lineWidth=.9;g.stroke(p.detail);
  }
  const limbTextures=new Map();
  function limbTexture(id){
    if(!limbTextures.has(id)){
      const c=document.createElement('canvas');c.width=164;c.height=180;
      const ctx=c.getContext('2d');ctx.scale(2,2);ctx.translate(59,46);
      part(ctx,id);limbTextures.set(id,c);
    }
    return limbTextures.get(id);
  }
  function movingPart(g,id,phase,ankle){
    const img=limbTexture(id),role=parts[id].role;
    if(role==='leg'){
      const end=ankle || [0,35],knee=Art.knee([0,0],end,20,19,-1);
      // Map each horizontal band to its position on the two-bone chain.
      for(let y=0;y<44;y++){
        const u=Math.min(1,y/35),mid=u<.5;
        const dx=mid?knee[0]*2*u:knee[0]+(end[0]-knee[0])*(2*u-1);
        const dy=mid?knee[1]*2*u:knee[1]+(end[1]-knee[1])*(2*u-1);
        const stretch=mid?knee[1]/17.5:(end[1]-knee[1])/17.5;
        g.drawImage(img,0,(y+46)*2,164,2,-59+dx,dy+Math.max(0,y-35),82,Math.max(1,stretch+.4));
      }
    }else{
      g.rotate(role==='wing'?Math.sin(phase)*.52:Math.sin(phase)*.12);
      for(let x=-59;x<2;x++){
        const u=Math.max(0,-x/59);
        const offset=role==='wing'?Math.sin(phase-u*.8)*u*u*9:Math.sin(phase-u*2.8)*u*11;
        g.drawImage(img,(x+59)*2,0,2,180,x,-46+offset,1.1,90);
      }
    }
  }
  return {species,parts,animal,part,movingPart};
})();
