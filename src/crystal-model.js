import {crystalOptics} from './crystal-optics.js';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {CRYSTAL} from './crystal-config.js';
const names=['upper_left','upper_center','upper_right','left_top','left_middle','left_bottom','bottom_left','bottom_center','bottom_right'];
function audit(meshes){const edges=new Map();let volume=0,triangles=0;for(const m of meshes){const p=m.geometry.attributes.position,idx=m.geometry.index;for(let i=0;i<(idx?.count||p.count);i+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld)),keys=v.map(a=>a.toArray().map(x=>Math.round(x*1e5)).join(','));volume+=v[0].dot(v[1].clone().cross(v[2]))/6;triangles++;for(let k=0;k<3;k++){const key=[keys[k],keys[(k+1)%3]].sort().join('|');edges.set(key,(edges.get(key)||0)+1)}}}return {boundaries:[...edges.values()].filter(v=>v!==2).length,volume,triangles}}
export async function loadCrystal(signal,low,backdrop){
 const response=await fetch(CRYSTAL.model,{signal});if(!response.ok)throw new Error('Crystal model unavailable');
 const gltf=await new GLTFLoader().parseAsync(await response.arrayBuffer(),new URL('.',CRYSTAL.model).href),root=gltf.scene;root.updateMatrixWorld(true);
 const sourceBounds=new T.Box3().setFromObject(root),facets=[],oldMaterials=new Set(),oldTextures=new Set(),proxyRoot=new T.Group(),proxyMaterial=new T.MeshBasicMaterial({side:T.DoubleSide});
 const glass=new T.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.012,transmission:1,thickness:.395,ior:1.5,dispersion:low?.24:.46,attenuationColor:0xffffff,attenuationDistance:30,envMapIntensity:.48,clearcoat:.08,clearcoatRoughness:.01,side:T.FrontSide});
 const bevel=glass.clone();bevel.roughness=.008;bevel.envMapIntensity=.72;
 const amber={value:0},probeCenter={value:new T.Vector3()},probeScale={value:1};
 let triangles=0,openEdges=0,originalOpenEdges=0;const repairs=[];
 for(const name of names){
  const front=root.getObjectByName(name+'_front'),side=root.getObjectByName(name+'_beveled_sides');if(!front?.isMesh||!side?.isMesh)throw new Error('Missing facet pair: '+name);
  originalOpenEdges+=audit([front,side]).boundaries;
  const source=front.geometry.attributes.position,center=new T.Vector3();for(let i=0;i<source.count;i++)center.add(new T.Vector3().fromBufferAttribute(source,i).applyMatrix4(front.matrixWorld));center.divideScalar(source.count);
  // The source cap is embedded at z=.12 and misses the bevel aperture at z=.185.
  // Seal it on the shell's EXISTING first ring. Outer silhouette and every side vertex stay unchanged.
  const cap=[];for(let i=0;i<3;i++){const p=new T.Vector3().fromBufferAttribute(side.geometry.attributes.position,i).applyMatrix4(side.matrixWorld);front.worldToLocal(p);cap.push(...p.toArray())}
  const old=front.geometry;front.geometry=new T.BufferGeometry();front.geometry.setAttribute('position',new T.Float32BufferAttribute(cap,3));old.dispose();
  const solidCenter=new T.Vector3(),sp=side.geometry.attributes.position;for(let i=0;i<sp.count;i++)solidCenter.add(new T.Vector3().fromBufferAttribute(sp,i).applyMatrix4(side.matrixWorld));solidCenter.divideScalar(sp.count);
  for(const mesh of [front,side]){
   for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){oldMaterials.add(material);for(const value of Object.values(material))if(value?.isTexture)oldTextures.add(value)}
   const g=mesh.geometry;mesh.geometry=g.index?g.toNonIndexed():g.clone();const p=mesh.geometry.attributes.position;
   for(let k=0;k<p.count;k+=3){const a=new T.Vector3().fromBufferAttribute(p,k),b=new T.Vector3().fromBufferAttribute(p,k+1),c=new T.Vector3().fromBufferAttribute(p,k+2),localCenter=mesh.worldToLocal(solidCenter.clone());const n=b.clone().sub(a).cross(c.clone().sub(a)),mid=a.clone().add(b).add(c).divideScalar(3);if(n.dot(mid.sub(localCenter))<0){p.setXYZ(k+1,c.x,c.y,c.z);p.setXYZ(k+2,b.x,b.y,b.z)}}
   mesh.geometry.computeVertexNormals();if(mesh===front){const n=mesh.geometry.attributes.normal,c=new T.Vector3();for(let k=0;k<p.count;k++)c.add(new T.Vector3().fromBufferAttribute(p,k));c.divideScalar(p.count);for(let k=0;k<p.count;k++){const opticalNormal=new T.Vector3((p.getX(k)-c.x)*.09,(p.getY(k)-c.y)*.09,1).normalize();n.setXYZ(k,opticalNormal.x,opticalNormal.y,opticalNormal.z)}}g.dispose();mesh.material=(mesh===front?glass:bevel).clone();
  }
  const frontBind=crystalOptics(front.material,front,side,backdrop,low,amber,probeCenter,probeScale),sideBind=crystalOptics(side.material,front,side,backdrop,low,amber,probeCenter,probeScale);frontBind(front);sideBind(side);
  root.updateMatrixWorld(true);const qa=audit([front,side]);if(qa.boundaries||qa.volume<=0)throw new Error('Crystal repair failed: '+name);openEdges+=qa.boundaries;triangles+=qa.triangles;repairs.push({name,...qa});
  for(const mesh of [front,side]){const proxy=new T.Mesh(mesh.geometry,proxyMaterial);proxy.matrix.copy(mesh.matrixWorld);proxy.matrixAutoUpdate=false;proxy.userData.facet=facets.length;proxyRoot.add(proxy)}
  const pivot=new T.Group();pivot.name=name;root.add(pivot);pivot.position.copy(root.worldToLocal(center.clone()));pivot.updateMatrixWorld(true);pivot.attach(front);pivot.attach(side);
  facets.push({name,pivot,front,side,rest:pivot.position.clone(),quaternion:pivot.quaternion.clone(),childMatrices:[front.matrix.toArray(),side.matrix.toArray()]});
 }
 oldMaterials.forEach(m=>m.dispose());oldTextures.forEach(t=>{t.dispose();t.image?.close?.()});
 const repairedBounds=new T.Box3().setFromObject(root),raycaster=new T.Raycaster();
 return {root,facets,glass,bevel,amber,probeCenter,probeScale,sourceBounds,repairedBounds,triangles,openEdges,originalOpenEdges,repairs,proxyRoot,
 pick(pointer,camera){proxyRoot.updateMatrixWorld(true);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(proxyRoot.children,false)[0]?.object.userData.facet??-1},
 dispose(){for(const f of facets){f.front.geometry.dispose();f.side.geometry.dispose();f.front.material.dispose();f.side.material.dispose()}glass.dispose();bevel.dispose();proxyMaterial.dispose()}};
}
export function createReflectionEnvironment(renderer){
 const scene=new T.Scene();scene.background=new T.Color(0x020204);const cards=[];const panel=document.createElement('canvas');panel.width=256;panel.height=8;const ctx=panel.getContext('2d'),gradient=ctx.createLinearGradient(0,0,256,0);for(const [p,c]of [[0,'#000'],[.38,'#000'],[.47,'#fff'],[.53,'#fff'],[.62,'#000'],[1,'#000']])gradient.addColorStop(p,c);ctx.fillStyle=gradient;ctx.fillRect(0,0,256,8);const lightMap=new T.CanvasTexture(panel);lightMap.colorSpace=T.SRGBColorSpace;
 for(const [position,size,color,intensity]of [
  [[-1.25,.2,5],[1.6,4.5],0xf7faff,5],[[.35,.1,5],[.9,5],0xffffff,5],[[1.8,-.3,4],[.45,3],0xffdeb5,3],
  [[-2.8,1.2,4],[1.4,5],0xe9f6ff,3],[[2.8,.5,3],[.65,5],0xcbdcff,4],[[0,3.5,2],[5,.8],0xffffff,4],
  [[-1,-3,3],[4,.4],0x9fb9f7,2.2],[[3,-2,2],[.5,3],0xffd5a1,2],[[0,1,-4],[4,3],0xffffff,3],
 ]){const card=new T.Mesh(new T.PlaneGeometry(...size),new T.MeshBasicMaterial({map:lightMap,color:new T.Color(color).multiplyScalar(intensity),side:T.DoubleSide}));card.position.fromArray(position);card.lookAt(0,0,0);scene.add(card);cards.push(card)}
 const pmrem=new T.PMREMGenerator(renderer),target=pmrem.fromScene(scene,.035,.1,30);pmrem.dispose();cards.forEach(c=>{c.geometry.dispose();c.material.dispose()});lightMap.dispose();return target;
}
