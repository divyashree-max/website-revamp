import * as T from 'three';
import {CONFIG} from './config.js';

/** Shared square display scene; responsive cover crop is used only by the viewport camera. */
export function createContent(logo){
 const scene=new T.Scene();scene.background=new T.Color(CONFIG.colors.black);
 const camera=new T.OrthographicCamera(-4.5,4.5,4.5,-4.5,.1,30);camera.position.z=10;
 const identity=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:logo,transparent:true,opacity:.9,toneMapped:false,depthWrite:false}));identity.position.set(0,.35,1);scene.add(identity);
 const decoration=new T.Group();scene.add(decoration);
 const lines=[];
 for(const [points,color] of [
  [[[-6,-2.4],[-2.8,-2.1],[.3,-2.4],[5,-1.8]],CONFIG.colors.brown],
  [[[2.7,3.8],[3.7,2.9],[5.3,3.4]],CONFIG.colors.amber],
  [[[-5,1.5],[-3.8,2.2],[-4.5,3.3]],CONFIG.colors.copper],
 ]){
  const geometry=new T.BufferGeometry().setFromPoints(points.map(([x,y])=>new T.Vector3(x,y,0)));const line=new T.Line(geometry,new T.LineBasicMaterial({color,transparent:true,opacity:.3,toneMapped:false}));decoration.add(line);lines.push(line);
 }
 const dotCanvas=document.createElement('canvas');dotCanvas.width=dotCanvas.height=32;const ctx=dotCanvas.getContext('2d'),gradient=ctx.createRadialGradient(16,16,0,16,16,16);gradient.addColorStop(0,'#fff1cf');gradient.addColorStop(.12,'#F7A504');gradient.addColorStop(1,'#994f2a00');ctx.fillStyle=gradient;ctx.fillRect(0,0,32,32);
 const texture=new T.CanvasTexture(dotCanvas),nodes=[];for(let i=0;i<5;i++){const dot=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,opacity:.65,depthWrite:false,toneMapped:false}));dot.scale.setScalar(i<2?.16:.09);decoration.add(dot);nodes.push(dot);}
 const led=new T.Mesh(new T.PlaneGeometry(20,20),new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,vertexShader:'varying vec2 uvLed;void main(){uvLed=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uvLed;void main(){float pattern=step(.7,fract(uvLed.x*1100.))*step(.7,fract(uvLed.y*1100.));gl_FragColor=vec4(0.,0.,0.,pattern*.015);}'}));led.position.z=2;scene.add(led);
 function resize(aspect){const width=Math.min(9,9*aspect),height=width/aspect;camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();const w=Math.min(4,width*.72),ratio=(logo.image?.width||3000)/(logo.image?.height||1314);identity.scale.set(w,w/ratio,1);}
 function square(){camera.left=camera.bottom=-4.5;camera.right=camera.top=4.5;camera.updateProjectionMatrix();}
 function update(time,pointer){decoration.position.set(pointer.x*.045,pointer.y*.025,0);lines[0].position.y=Math.sin(time*.2)*.045;for(let i=0;i<nodes.length;i++){const x=[-2.8,3.7,-3.1,1.8,3.4][i]+Math.sin(time*.14+i)*.055,y=[-2.1,2.9,-2.7,-2.45,1.7][i]+Math.cos(time*.12+i)*.04;nodes[i].position.set(x,y,.1);}}
 return {scene,camera,identity,resize,square,update};
}
