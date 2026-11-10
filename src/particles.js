import * as T from 'three';
import {CONFIG} from './config.js';
const t=CONFIG.timing,f=n=>Number(n).toFixed(3);
const trajectory=`
 vec3 trajectory(float time){
  float departure=smoothstep(${f(t.dissolve)}+aSeed*.25,${f(t.swarm)},time);
  float reform=smoothstep(${f(t.gather)}+aSeed*.15,${f(t.particleRobot)},time);
  vec3 center=vec3(0.,1.45,1.15),v=position-center;
  float angle=departure*(1.6+aSeed*.35)+max(time-${f(t.swarm)},0.)*.20;
  float cs=cos(angle),sn=sin(angle),radius=1.+departure*.28;
  vec3 flow=center+vec3((v.x*cs-v.z*sn)*radius,v.y+sin(angle+aSeed*6.28)*.42,(v.x*sn+v.z*cs)*radius);
  flow+=departure*vec3(sin(aSeed*39.+time),cos(aSeed*27.+time*.8),sin(aSeed*53.+time*.9))*.11;
  vec3 rebuilt=mix(mix(position,flow,departure),position,reform);
  return rebuilt;
 }
`;
/** Source particles return to the held KUKA surface, then give way directly to its solid materials. */
export async function createReconstruction(count,signal){
 const [mr,dr]=await Promise.all([fetch(new URL('../public/assets/robot-reveal.json',import.meta.url),{signal}),fetch(new URL('../public/assets/robot-reveal.bin',import.meta.url),{signal})]);
 if(!mr.ok||!dr.ok)throw new Error('Robot reconstruction data failed to load');
 const meta=await mr.json(),data=new Float32Array(await dr.arrayBuffer());if(meta.version!==3)throw new Error('Reconstruction data needs regeneration');
 const positions=data.slice(0,count*3),normals=data.slice(meta.normalFloatOffset,meta.normalFloatOffset+count*3);
 const seeds=new Float32Array(count),features=new Float32Array(count),colors=new Float32Array(count*3);let seed=3919;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296),color=new T.Color();
 for(let i=0;i<count;i++){seeds[i]=random();const q=random();let k=1;while(k<3&&q>CONFIG.gradient[k].stop)k++;const a=CONFIG.gradient[k-1],b=CONFIG.gradient[k];color.set(a.color).lerp(new T.Color(b.color),(q-a.stop)/(b.stop-a.stop));if(i%7===0)color.lerp(new T.Color(0xeee6d4),.3);color.multiplyScalar(.72).toArray(colors,i*3);}
 const uniforms={uTime:{value:0},uAlpha:{value:0},uDpr:{value:1},uShape:{value:0}};
 for(let i=0;i<count;i+=8)features[i]=1;
 const header='attribute vec3 aNormal;attribute float aSeed;attribute float aFeature;uniform float uTime;uniform float uAlpha;uniform float uDpr;uniform float uShape;varying vec3 tint;varying float opacity;'+trajectory;
 const geometry=new T.BufferGeometry();for(const[name,array,size]of[['position',positions,3],['aNormal',normals,3],['aSeed',seeds,1],['aFeature',features,1],['color',colors,3]])geometry.setAttribute(name,new T.BufferAttribute(array,size));
 const material=new T.ShaderMaterial({uniforms,vertexColors:true,transparent:true,depthWrite:false,blending:T.NormalBlending,toneMapped:false,
 vertexShader:header+'void main(){vec3 p=trajectory(uTime);float facing=max(.18+.82*max(0.,dot(normalize(aNormal),normalize(cameraPosition-position))),aFeature*.7);tint=color;opacity=uAlpha*mix(1.,facing,uShape);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(1.15+aSeed*.95)*mix(1.,1.4,uShape)*uDpr;}',
 fragmentShader:'varying vec3 tint;varying float opacity;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(tint,opacity*(1.-smoothstep(.12,.5,d)));\n#include <colorspace_fragment>\n}'});
 const points=new T.Points(geometry,material);points.frustumCulled=false;
 const segments=3,tp=[],ts=[],tc=[],delay=[];
 for(let i=0;i<Math.floor(count/4);i++)for(let j=0;j<segments;j++)for(let v=0;v<2;v++){const id=i*4;tp.push(...positions.subarray(id*3,id*3+3));ts.push(seeds[id]);tc.push(...colors.subarray(id*3,id*3+3));delay.push((j+v)*.03);}
 const tg=new T.BufferGeometry();for(const[name,values,size]of[['position',tp,3],['aSeed',ts,1],['color',tc,3],['aDelay',delay,1]])tg.setAttribute(name,new T.Float32BufferAttribute(values,size));
 const tm=new T.ShaderMaterial({uniforms,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,
 vertexShader:header+'attribute float aDelay;void main(){tint=color;opacity=uAlpha*.12*(1.-aDelay/.13)*(1.-smoothstep(17.,18.,uTime));gl_Position=projectionMatrix*modelViewMatrix*vec4(trajectory(uTime-aDelay),1.);}',fragmentShader:'varying vec3 tint;varying float opacity;void main(){gl_FragColor=vec4(tint,opacity);\n#include <colorspace_fragment>\n}'});
 const trails=new T.LineSegments(tg,tm);trails.frustumCulled=false;

 const group=new T.Group();group.add(points,trails);let diagnostics={};
 function update(time,dpr){
  const fill=T.MathUtils.smoothstep(time,t.solidRestore,t.frontalSettle);
  const alpha=T.MathUtils.smoothstep(time,t.dissolve,t.dissolve+.5)*(1-fill);
  uniforms.uTime.value=time;uniforms.uAlpha.value=alpha*.72;uniforms.uDpr.value=dpr;uniforms.uShape.value=T.MathUtils.smoothstep(time,t.particleRobot-.8,t.particleRobot);
  points.visible=trails.visible=alpha>.001;
  diagnostics={count,alpha,fill,surfaceReturn:T.MathUtils.smoothstep(time,t.gather+.15,t.particleRobot),particleRobotHold:time>=t.particleRobot&&time<t.solidRestore,coverage:meta.coverage[count],contourSegments:0,lineDrawing:false,origin:'component-stratified GLB surfaces',poseTime:meta.poseTime,sourceHash:meta.sourceHash};
 }
 return {group,points,trails,count,update,get diagnostics(){return diagnostics},metadata:meta};
}
