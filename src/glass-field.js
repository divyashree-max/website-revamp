import * as T from 'three';
export const FLUID=Object.freeze({resolution:320,pressureIterations:12,vorticity:.022,dissipation:2.4,inertia:.09,radius:.07});
/** Advected velocity/thickness sheet with pressure projection and vorticity. No radial waves. */
export function createGlassField(unused,low,canvas){
 const capable=matchMedia('(hover: hover) and (pointer: fine)').matches;
 const quiet={resize(){},pointer(){},leave(){},reset(){},update(){},get energy(){return 0},get diagnostics(){return {solver:'disabled',energy:0}},dispose(){}};
 if(low||!capable||!canvas)return quiet;
 let renderer;try{renderer=new T.WebGLRenderer({canvas,alpha:false,antialias:false,powerPreference:'low-power'})}catch{return quiet}
 if(!renderer.extensions.has('EXT_color_buffer_float')){renderer.dispose();return quiet}
 renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,2);camera.position.z=1;
 const geometry=new T.PlaneGeometry(2,2),quad=new T.Mesh(geometry);scene.add(quad);
 const pair=()=>[0,1].map(()=>new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:false,stencilBuffer:false}));
 const flow=pair(),pressure=pair(),differential=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false,stencilBuffer:false});
 const common={flow:{value:flow[0].texture},pressure:{value:pressure[0].texture},differential:{value:differential.texture},texel:{value:new T.Vector2(1,1)},aspect:{value:1},dt:{value:.016},from:{value:new T.Vector2(-10,-10)},to:{value:new T.Vector2(-10,-10)},impulse:{value:new T.Vector2()},amount:{value:0},radius:{value:FLUID.radius},turn:{value:0},debug:{value:0}};
 const header='varying vec2 v;uniform sampler2D flow,pressure,differential;uniform vec2 texel,from,to,impulse;uniform float aspect,dt,amount,radius,turn,debug;';
 const make=fragment=>new T.ShaderMaterial({uniforms:common,depthTest:false,depthWrite:false,toneMapped:false,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:header+fragment});
 const advect=make(`void main(){vec4 current=texture2D(flow,v);vec2 old=v-current.xy*dt/vec2(aspect,1.);vec4 q=texture2D(flow,clamp(old,texel,1.-texel));
  vec4 neighbors=(texture2D(flow,old-vec2(texel.x,0))+texture2D(flow,old+vec2(texel.x,0))+texture2D(flow,old-vec2(0,texel.y))+texture2D(flow,old+vec2(0,texel.y)))*.25;
  q=mix(q,neighbors,.012);q.xy*=exp(-dt*2.5);q.z*=exp(-dt*${FLUID.dissipation});q.w*=exp(-dt*2.1);
  vec2 a=from*vec2(aspect,1.),b=to*vec2(aspect,1.),p=v*vec2(aspect,1.),ab=b-a;float t=clamp(dot(p-a,ab)/max(dot(ab,ab),.000001),0.,1.);vec2 d=p-(a+ab*t);
  float stamp=exp(-dot(d,d)/(radius*radius));
  vec2 tangent=normalize(ab+vec2(.000001,0.)),perp=vec2(-tangent.y,tangent.x);
  float shear=dot(d,perp)/radius;
  // Deposit a continuous film, rather than accumulating independent ridges at
  // successive pointer samples. Bound the flow to avoid grid-scale shredding.
  q.xy=mix(q.xy,impulse*.21+perp*(shear*.07+turn*.3),clamp(stamp*amount*1.5,0.,1.));
  q.z=mix(q.z,max(q.z,stamp*.7),clamp(amount*2.,0.,1.));q.w=mix(q.w,clamp(turn*shear,-1.,1.)*stamp,clamp(amount*2.,0.,1.));q.xy=clamp(q.xy,vec2(-.65),vec2(.65));
  if(v.x<texel.x||v.x>1.-texel.x)q.x=0.;if(v.y<texel.y||v.y>1.-texel.y)q.y=0.;gl_FragColor=q;
 }`);
 const derivatives=make(`void main(){vec2 l=texture2D(flow,v-vec2(texel.x,0)).xy,r=texture2D(flow,v+vec2(texel.x,0)).xy,b=texture2D(flow,v-vec2(0,texel.y)).xy,t=texture2D(flow,v+vec2(0,texel.y)).xy;float hx=texel.x*aspect,hy=texel.y;float div=(r.x-l.x)/(2.*hx)+(t.y-b.y)/(2.*hy),curl=(r.y-l.y)/(2.*hx)-(t.x-b.x)/(2.*hy);gl_FragColor=vec4(div,curl,0.,1.);}`);
 const curl=make(`void main(){float l=abs(texture2D(differential,v-vec2(texel.x,0)).y),r=abs(texture2D(differential,v+vec2(texel.x,0)).y),b=abs(texture2D(differential,v-vec2(0,texel.y)).y),t=abs(texture2D(differential,v+vec2(0,texel.y)).y);vec2 n=vec2(r-l,t-b);n/=length(n)+.0001;float spin=texture2D(differential,v).y;vec4 q=texture2D(flow,v);q.xy+=vec2(n.y,-n.x)*spin*${FLUID.vorticity}*dt;gl_FragColor=vec4(clamp(q.xy,vec2(-2.),vec2(2.)),q.z,q.w);}`);
 const solve=make(`void main(){float l=texture2D(pressure,v-vec2(texel.x,0)).r,r=texture2D(pressure,v+vec2(texel.x,0)).r,b=texture2D(pressure,v-vec2(0,texel.y)).r,t=texture2D(pressure,v+vec2(0,texel.y)).r;float hx=texel.x*aspect,hy=texel.y;float p=((l+r)*hy*hy+(b+t)*hx*hx-texture2D(differential,v).r*hx*hx*hy*hy)/(2.*(hx*hx+hy*hy));gl_FragColor=vec4(p,0.,0.,1.);}`);
 const project=make(`void main(){float l=texture2D(pressure,v-vec2(texel.x,0)).r,r=texture2D(pressure,v+vec2(texel.x,0)).r,b=texture2D(pressure,v-vec2(0,texel.y)).r,t=texture2D(pressure,v+vec2(0,texel.y)).r;vec4 q=texture2D(flow,v);q.xy-=vec2((r-l)/(2.*texel.x*aspect),(t-b)/(2.*texel.y));gl_FragColor=q;}`);
 const display=make(`

 // Hidden softboxes provide a light field for the liquid surface to refract.
 vec3 lightField(vec2 p){float a=exp(-pow((p.x*.8+p.y-.82)*18.,2.)),b=exp(-pow((p.x-p.y*.5-.2)*30.,2.));return vec3(.001)+vec3(.12,.14,.15)*a+vec3(.11,.075,.035)*b;}
 vec3 reflection(vec3 d){float band=d.x*.7+d.y-.12;float edge=max(.009,fwidth(band)*1.2);float strip=exp(-pow(band/edge,2.));float box=pow(max(dot(d,normalize(vec3(-.3,.7,.7))),0.),170.);float warm=pow(max(dot(d,normalize(vec3(.7,-.25,.6))),0.),300.);return vec3(5.5,5.6,5.7)*box+vec3(2.8,2.85,2.9)*strip+vec3(.7,.48,.17)*warm;}
 float heightAt(vec2 p){vec4 q=texture2D(flow,p)*.5+(texture2D(flow,p-vec2(texel.x,0))+texture2D(flow,p+vec2(texel.x,0))+texture2D(flow,p-vec2(0,texel.y))+texture2D(flow,p+vec2(0,texel.y)))*.125;float h=q.z+q.w*.12;return smoothstep(.008,.7,max(0.,h));}
 void main(){vec4 q=texture2D(flow,v);float l=heightAt(v-vec2(texel.x,0)),r=heightAt(v+vec2(texel.x,0)),b=heightAt(v-vec2(0,texel.y)),t=heightAt(v+vec2(0,texel.y));
  vec2 slope=vec2((r-l)/(2.*texel.x*aspect),(t-b)/(2.*texel.y))*.11;
  vec3 n=normalize(vec3(-slope,1.));vec3 reflected=reflect(vec3(0,0,-1),n);float fresnel=.04+.96*pow(1.-n.z,5.);
  vec3 red=refract(vec3(0,0,-1),n,1./1.327),green=refract(vec3(0,0,-1),n,1./1.333),blue=refract(vec3(0,0,-1),n,1./1.34);
  vec3 transmitted=vec3(lightField(v+red.xy*.08).r,lightField(v+green.xy*.08).g,lightField(v+blue.xy*.08).b);
  vec3 reflectedLight=vec3(reflection(normalize(reflected+vec3(.005,0,0))).r,reflection(reflected).g,reflection(normalize(reflected-vec3(.005,0,0))).b);
  float coverage=smoothstep(.02,.15,q.z);vec3 refractedDetail=abs(transmitted-lightField(v))*.6;vec3 color=lightField(v)*.001+coverage*(refractedDetail+reflectedLight*fresnel);
  if(debug>1.5)color=vec3(q.z*.3);else if(debug>.5)color=vec3(q.xy*.2+.2,.2);
  gl_FragColor=vec4(color,1.);#include <colorspace_fragment>
 }`.replace(';#include',';\n#include'));
 let read=0,pRead=0,pointerActive=false,initialized=false,current=new T.Vector2(),target=new T.Vector2(),previousVelocity=new T.Vector2(),energy=0,steps=0;
 function render(material,targetRT){quad.material=material;renderer.setRenderTarget(targetRT);renderer.render(scene,camera)}
 function swap(material){common.flow.value=flow[read].texture;render(material,flow[1-read]);read=1-read}
 function reset(){pointerActive=false;energy=0;for(const rt of [...flow,...pressure,differential]){renderer.setRenderTarget(rt);renderer.setClearColor(0,0);renderer.clear()}renderer.setRenderTarget(null);renderer.clear();initialized=false;}
 function pointer(x,y){target.set(x,y);if(!pointerActive){current.copy(target);initialized=true}pointerActive=true;}
 return {resize(w,h){const height=FLUID.resolution,width=Math.max(96,Math.min(640,Math.round(height*w/h)));for(const rt of [...flow,...pressure,differential])rt.setSize(width,height);common.texel.value.set(1/width,1/height);common.aspect.value=w/h;renderer.setSize(Math.ceil(w*.8),Math.ceil(h*.8),false);reset()},pointer,
 leave(){pointerActive=false;},reset,
 update(rawDt,enabled){if(!enabled){if(energy>0)reset();renderer.setRenderTarget(null);renderer.clear();return}const dt=Math.min(.033,rawDt||.016);common.dt.value=dt;common.amount.value=0;
  if(pointerActive&&initialized){common.from.value.copy(current);const dx=target.x-current.x,dy=target.y-current.y;current.lerp(target,1-Math.exp(-dt/FLUID.inertia));common.to.value.copy(current);const vx=(current.x-common.from.value.x)*common.aspect.value/dt,vy=(current.y-common.from.value.y)/dt,speed=Math.hypot(vx,vy);
   const previousSpeed=previousVelocity.length();common.turn.value=previousSpeed>.01&&speed>.01?T.MathUtils.clamp((previousVelocity.x*vy-previousVelocity.y*vx)/(previousSpeed*speed),-1,1):0;previousVelocity.set(vx,vy);common.impulse.value.set(vx,vy);if(Math.hypot(dx*common.aspect.value,dy)>.00035){common.amount.value=Math.min(1,speed*.7)*.32;energy+=common.amount.value*.3;}
  }
  energy*=Math.exp(-rawDt*3.2);swap(advect);common.flow.value=flow[read].texture;render(derivatives,differential);swap(curl);common.flow.value=flow[read].texture;render(derivatives,differential);
  for(let i=0;i<FLUID.pressureIterations;i++){common.pressure.value=pressure[pRead].texture;render(solve,pressure[1-pRead]);pRead=1-pRead}
  common.pressure.value=pressure[pRead].texture;swap(project);common.flow.value=flow[read].texture;render(display,null);steps++;
 },
 get energy(){return energy},get diagnostics(){return {solver:'advected-folding-sheet-pressure-vorticity',resolution:common.texel.value.toArray().map(v=>Math.round(1/v)),steps,energy}},setDebug(value){common.debug.value=value},
 dispose(){for(const rt of [...flow,...pressure,differential])rt.dispose();for(const mat of [advect,derivatives,curl,solve,project,display])mat.dispose();geometry.dispose();renderer.dispose()}};
}
