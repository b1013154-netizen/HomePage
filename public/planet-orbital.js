// Per-planet deposit map, shared by the GPU and Canvas renderers.
function buildPlanetBasins(sites){
  const w=256,h=128,bytes=new Uint8Array(w*h);
  for(const {site:[x,y,z],amount} of sites){
    const radius=.085+.075*amount,b=Math.asin(Math.max(-1,Math.min(1,y))),lng=Math.atan2(z,x);
    const cy=(b/Math.PI+.5)*h,cx=(lng/(2*Math.PI)+1)%1*w;
    const yr=radius*h/Math.PI,xr=Math.min(w/2,radius*w/(2*Math.PI*Math.max(.025,Math.cos(b))));
    for(let j=Math.max(0,Math.floor(cy-yr));j<Math.min(h,Math.ceil(cy+yr));j++){
      for(let i=Math.floor(cx-xr);i<=Math.ceil(cx+xr);i++){
        const d=Math.hypot((j+.5-cy)/yr,(i+.5-cx)/xr);
        if(d>=1)continue;const k=j*w+((i%w+w)%w);
        bytes[k]=Math.min(255,bytes[k]+Math.round(255*(1-d*d)**2));
      }
    }
  }
  return bytes;
}
// Bake spherical terrain once per seed. The live pass samples the map at native
// display resolution, with a separate drifting cloud layer and ocean lighting.
function createOrbitalRenderer(){
  const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false});
  if(!gl||!gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT).precision)return null;
  const vertex='attribute vec2 p; varying vec2 uv; void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  function program(body){
    function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
    const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,'precision highp float; varying vec2 uv;\n'+body));gl.bindAttribLocation(p,0,'p');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
  }
  try{
    const terrain=program(`
uniform float seed;
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec2 e=vec2(0.,1.);
 return mix(mix(mix(hash(i),hash(i+e.yxx),f.x),mix(hash(i+e.xyx),hash(i+e.yyx),f.x),f.y),
            mix(mix(hash(i+e.xxy),hash(i+e.yxy),f.x),mix(hash(i+e.xyy),hash(i+1.),f.x),f.y),f.z);}
mat3 spin=mat3(.00,.80,.60,-.80,.36,-.48,-.60,-.48,.64);
float fb(vec3 p){float a=.51,v=0.;for(int i=0;i<6;i++){v+=a*noise(p);p=spin*p*2.06+13.7;a*=.495;}return v;}
void main(){float a=uv.x*6.283185,b=(uv.y-.5)*3.14159;vec3 v=vec3(cos(b)*cos(a),sin(b),cos(b)*sin(a));
 vec3 p=v*2.1+vec3(seed,seed*.7,2.);vec3 warp=vec3(fb(p),fb(p+17.),fb(p+32.));
 float base=fb(p+warp*1.5), ridge=pow(1.-abs(2.*fb(v*16.+warp*5.)-1.),7.);
 float relief=base*.81+ridge*.19*smoothstep(.36,.7,base);float rough=fb(v*74.+warp*8.);
 float clouds=fb(v*7.+vec3(warp.x,warp.y*3.,warp.z)*3.2+seed);
 gl_FragColor=vec4(relief,ridge*.55+rough*.45,clouds,rough);}`);
    const globe=program(`
uniform sampler2D atlas;uniform vec2 angle;uniform vec4 climate;uniform float clock,city,px;
uniform sampler2D basins;
void main(){
 vec2 q=(uv-.5)*2.;float rr=dot(q,q);if(rr>=1.){gl_FragColor=vec4(0.);return;}
 float z=sqrt(1.-rr);vec3 n=vec3(q,z);
 vec3 v=vec3(q.x,q.y*cos(angle.y)+z*sin(angle.y),z*cos(angle.y)-q.y*sin(angle.y));
 float lng=atan(v.x,v.z)+angle.x,lat=asin(clamp(v.y,-1.,1.));vec2 t=vec2(lng/6.283185,.5+lat/3.14159);
 vec3 local=vec3(cos(lat)*cos(lng),sin(lat),cos(lat)*sin(lng));
 vec4 tex=texture2D(atlas,t);float lake=texture2D(basins,t).r*.38;
 float h=tex.r-lake;float sea=.18+climate.x*.0058,depth=sea-h;
 float ice=climate.y-48.*pow(abs(v.y),2.)-52.*max(h-.5,0.);
 vec3 rock=mix(vec3(.31,.245,.20),vec3(.71,.53,.37),tex.g);
 rock=mix(rock,vec3(.55,.53,.51),smoothstep(.5,.73,h)*tex.g);
 vec3 land=mix(rock,mix(vec3(.17,.30,.15),vec3(.37,.44,.24),tex.g),climate.w*smoothstep(-2.,12.,ice)*(1.-smoothstep(31.,50.,ice))*(1.-smoothstep(.52,.7,h)));
 float ocean=climate.x>0.?smoothstep(-.002,.003,depth):0.;
 vec3 water=mix(vec3(.10,.52,.54),vec3(.023,.13,.235),smoothstep(.002,.09,depth));
 land=mix(land,vec3(.73,.65,.49),climate.x>0.?(1.-smoothstep(.0,.014,abs(depth)))*.9:0.);
 vec3 col=mix(land,water,ocean);float snow=(1.-smoothstep(-11.,1.,ice))*step(.01,climate.x);
 col=mix(col,vec3(.80,.89,.91),snow*(.68+.30*tex.a));
 float hx=texture2D(atlas,t+vec2(.00055,0.)).r-tex.r,hy=texture2D(atlas,t+vec2(0.,.0011)).r-tex.r;
 vec3 bump=normalize(n+vec3(-hx*5.,-hy*5.,0.)*(1.-ocean));vec3 sun=normalize(vec3(-.71,.45,.55));float nd=dot(bump,sun);
 float cl=texture2D(atlas,t+vec2(clock,.0017)).b,shadow=texture2D(atlas,t+vec2(clock+.002,.004)).b;
 float cover=smoothstep(.48,.71,cl)*smoothstep(0.,30.,climate.x)*min(1.,climate.z);
 col*=1.-smoothstep(.50,.65,shadow)*.28*smoothstep(0.,30.,climate.x);
 col=mix(col,vec3(.93,.94,.91),cover*.9);col*=.085+.95*pow(max(0.,nd),.76);
 col+=vec3(1.,.87,.65)*pow(max(0.,dot(n,normalize(sun+vec3(0.,0.,1.)))),64.)*ocean*(1.-cover)*(1.-snow)*.72;
 col+=vec3(.12,.31,.44)*pow(1.-z,3.)*(.4+.6*max(0.,nd));
 col+=vec3(.96,.62,.23)*city*(1.-smoothstep(-.1,.28,nd))*(1.-ocean)*(1.-cover)*smoothstep(.54,.67,tex.a)*(1.-smoothstep(.0,.09,abs(depth)));
 gl_FragColor=vec4(col,smoothstep(0.,px*1.7,1.-sqrt(rr)));}`);
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2048,1024,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)return null;
    const loc=name=>gl.getUniformLocation(globe,name),u=Object.fromEntries(['angle','climate','clock','city','px','basins'].map(n=>[n,loc(n)]));
    const wetMap=gl.createTexture();let lastBasins;
    let seed=-1;
    return {canvas,draw(s,yaw,pitch,size,now,basins){
      if(gl.isContextLost())return false;
      if(seed!==s.seed){gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,2048,1024);gl.useProgram(terrain);gl.uniform1f(gl.getUniformLocation(terrain,'seed'),s.seed%21437/111.);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);seed=s.seed}
      if(canvas.width!==size||canvas.height!==size)canvas.width=canvas.height=size;
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,size,size);gl.useProgram(globe);gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.uniform2f(u.angle,yaw*2*Math.PI,pitch);gl.uniform4f(u.climate,s.water,s.temp,s.gravity,s.streak>=2?1:0);
      gl.uniform1f(u.clock,now*.0000008);gl.uniform1f(u.city,s.civil?1:0);gl.uniform1f(u.px,1/size);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,wetMap);
      if(basins!==lastBasins){
        gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,256,128,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,basins);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);lastBasins=basins;
      }
      gl.uniform1i(u.basins,1);gl.activeTexture(gl.TEXTURE0);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return true;
    }};
  }catch{return null}
}
