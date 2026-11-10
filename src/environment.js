import * as T from 'three';
import {CONFIG} from './config.js';

export function environment(scene,low){
 const bytes=new Uint8Array(128*128*4);let seed=71;for(let i=0;i<bytes.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=190+seed%60;bytes[i]=bytes[i+1]=bytes[i+2]=v;bytes[i+3]=255;}
 const grain=new T.DataTexture(bytes,128,128);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(100,100);grain.needsUpdate=true;
 const floor=new T.Mesh(new T.PlaneGeometry(300,300),new T.MeshStandardMaterial({color:0x080809,metalness:.08,roughness:.82,roughnessMap:grain,envMapIntensity:.15}));floor.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight *= .085;\n#include <opaque_fragment>');};floor.name='Fixed world-space graphite floor';floor.rotation.x=-Math.PI/2;floor.position.y=-.004;floor.receiveShadow=true;scene.add(floor);
 const lines=new T.Group();lines.name='Fixed world-space amber inlays';
 const paths=[[-8,-10,-8,16],[6,-10,6,16],[-18,-6,18,-6],[-18,9,18,9]];
 for(let i=0;i<paths.length;i++){
  const [x1,z1,x2,z2]=paths[i],length=Math.hypot(x2-x1,z2-z1),positions=[],colors=[];
  for(let n=0;n<=20;n++){const t=n/20;positions.push(T.MathUtils.lerp(x1,x2,t),.003,T.MathUtils.lerp(z1,z2,t));let k=1;while(k<3&&t>CONFIG.gradient[k].stop)k++;const a=CONFIG.gradient[k-1],b=CONFIG.gradient[k],color=new T.Color(a.color).lerp(new T.Color(b.color),(t-a.stop)/(b.stop-a.stop)).multiplyScalar(i%2?.23:.4);color.toArray(colors,n*3);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));lines.add(new T.Line(geometry,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.6,toneMapped:false})));
 }scene.add(lines);
 scene.fog=new T.FogExp2(CONFIG.colors.black,.035);
 scene.add(new T.HemisphereLight(0xeee9e0,0x151311,1.8));
 const key=new T.DirectionalLight(0xf4f0e9,4.8);key.position.set(-3,6,5);key.castShadow=!low;key.shadow.mapSize.set(low?512:1024,low?512:1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:6,bottom:-4,near:.1,far:24});key.shadow.normalBias=.015;key.shadow.bias=-.0002;scene.add(key);
 const fill=new T.DirectionalLight(0xe5e6e7,2.8);fill.position.set(4,4,5);scene.add(fill);
 const rim=new T.DirectionalLight(CONFIG.colors.amber,2.5);rim.position.set(-4,4,-4);scene.add(rim);
 // A contact shadow remains inexpensive on mobile, where the shadow map is disabled.
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,'#000d');g.addColorStop(.4,'#0009');g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
 const contact=new T.Mesh(new T.PlaneGeometry(2.6,2.3),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.001;scene.add(contact);
 return {floor,lines,contact,lineMatrix:lines.matrixWorld.toArray()};
}


