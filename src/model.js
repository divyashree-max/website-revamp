import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {CONFIG} from './config.js';

/** Preserve authored arm/link transforms; centre the existing payload on its A6 shaft. */
export async function loadRobot(signal){
 const response=await fetch(CONFIG.model,{signal});if(!response.ok)throw new Error(`Model request failed: ${response.status}`);
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
 const gltf=await loader.parseAsync(await response.arrayBuffer(),new URL('.',CONFIG.model).href);
 const root=new T.Group();root.name='Normalized supplied KUKA';root.add(gltf.scene);root.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(root),base=gltf.scene.getObjectByName('Base');
 const baseCenter=new T.Box3().setFromObject(base).getCenter(new T.Vector3());
 root.position.set(-baseCenter.x,-bounds.min.y,-baseCenter.z);root.updateMatrixWorld(true);
 const meshes=[],bones=[],materials=new Set();let face=null,triangles=0;
 gltf.scene.traverse(o=>{
  if(o.isBone||/^Bone\d+$/.test(o.name))bones.push(o);
  if(!o.isMesh)return;
  o.castShadow=true;o.receiveShadow=true;meshes.push(o);
  // Refine only the original LED housing; actual cabinet geometry provides its bezel reflections.
  if(o.name==='Kuka_LED_Led6x4_2'){
   o.material=o.material.clone();o.material.color.set(0x24272b);o.material.roughness=.3;o.material.metalness=.5;o.material.envMapIntensity=1.25;
  }
  for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);if(m.name==='Display.001')face=o;}
  triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
 });
 if(!face)throw new Error('Authoritative Display.001 face was not found');
 face.geometry.computeBoundingBox();const localBox=face.geometry.boundingBox.clone();
 // Display.001 is a square in local Y/Z, facing local +X. Keep its real geometry and UVs.
 const localCenter=localBox.getCenter(new T.Vector3()),bottomLeft=new T.Vector3(),bottomRight=new T.Vector3(),topLeft=new T.Vector3();
 // The tiled LED mesh has sub-millimetre seams. Its content plane sits just in front.
 localCenter.x=localBox.max.x+.00005;
 const screen={center:new T.Vector3(),right:new T.Vector3(),up:new T.Vector3(),normal:new T.Vector3(),width:0,height:0,bounds:localBox};
 function updateScreen(){root.updateMatrixWorld(true);bottomLeft.set(localCenter.x,localBox.max.y,localBox.min.z).applyMatrix4(face.matrixWorld);bottomRight.set(localCenter.x,localBox.max.y,localBox.max.z).applyMatrix4(face.matrixWorld);topLeft.set(localCenter.x,localBox.min.y,localBox.min.z).applyMatrix4(face.matrixWorld);screen.center.copy(localCenter).applyMatrix4(face.matrixWorld);screen.right.subVectors(bottomRight,bottomLeft).normalize();screen.up.subVectors(topLeft,bottomLeft).normalize();screen.normal.set(1,0,0).transformDirection(face.matrixWorld);screen.width=bottomRight.distanceTo(bottomLeft);screen.height=topLeft.distanceTo(bottomLeft);}
 updateScreen();
 // The imported payload is 3.9 mm eccentric to A6. Centre the existing rigid mount on
 // its real shaft so an A6 roll passes through the display centre instead of orbiting it.
 // Only the payload's mounting offset is calibrated; joint/link transforms and mesh dimensions stay authored.
 const endEffector=gltf.scene.getObjectByName('Bone006'),payload=gltf.scene.getObjectByName('Kuka_LED_Mid001');
 const payloadCenter=endEffector.worldToLocal(screen.center.clone());
 const mountingCorrection=new T.Vector3(payloadCenter.x,0,payloadCenter.z);
 payload.position.sub(mountingCorrection);updateScreen();
 const mountCalibration={joint:'Bone006',radialCorrection:mountingCorrection.toArray(),distance:mountingCorrection.length()};
 const bindTransforms=bones.map(b=>({name:b.name,position:b.position.toArray(),quaternion:b.quaternion.toArray(),scale:b.scale.toArray()}));
 // Light the physical LED panel separately; the shared homepage texture remains unchanged.
 const screenIllumination={value:1},dissolve={value:0};
 function illuminatePanel(material){
  const previous=material.onBeforeCompile;
  material.onBeforeCompile=(shader,renderer)=>{
   previous?.call(material,shader,renderer);shader.uniforms.uScreenIllumination=screenIllumination;
   shader.fragmentShader='uniform float uScreenIllumination;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    float radial=1.-smoothstep(0.,.72,length(vMapUv-.5));
    vec3 charcoal=vec3(.008,.009,.011),amber=vec3(.021,.012,.004);
    vec3 panel=mix(charcoal,amber,(1.-vMapUv.y)*.65)*(.75+radial*.25);
    float darkPixels=1.-smoothstep(.025,.22,max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b)));
    diffuseColor.rgb+=panel*uScreenIllumination*darkPixels;`);
  };
 }
 function applyDissolve(material){
  // Opaque depth/alpha settings stay authored. One uniform disables the effect cleanly.
  const previous=material.onBeforeCompile;
  material.onBeforeCompile=(shader,renderer)=>{
   previous?.call(material,shader,renderer);shader.uniforms.uDissolve=dissolve;
   shader.vertexShader='varying vec3 vSurfaceWorld;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvSurfaceWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
   shader.fragmentShader='uniform float uDissolve;varying vec3 vSurfaceWorld;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\nfloat surfaceNoise=fract(sin(dot(floor(vSurfaceWorld*180.),vec3(12.9898,78.233,45.164)))*43758.5453);if(surfaceNoise<uDissolve)discard;');
  };
 }
 for(const material of materials)applyDissolve(material);
 const depth=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking});applyDissolve(depth);
 for(const mesh of meshes)mesh.customDepthMaterial=depth;
 function setDisplay(texture){
  const old=face.material;
  const material=new T.MeshBasicMaterial({map:texture,color:0xffffff,toneMapped:false});
  material.name='Craftech360 shared LED content';
  const literal=n=>Number(n).toFixed(10);
  material.onBeforeCompile=shader=>{
   shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>\nvMapUv=vec2((position.z-(${literal(localBox.min.z)}))/${literal(localBox.max.z-localBox.min.z)},1.-(position.y-(${literal(localBox.min.y)}))/${literal(localBox.max.y-localBox.min.y)});`);
  };
  illuminatePanel(material);applyDissolve(material);face.material=material;old.dispose();
  const x=localCenter.x,y0=localBox.min.y,y1=localBox.max.y,z0=localBox.min.z,z1=localBox.max.z;
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([x,y1,z0,x,y1,z1,x,y0,z0,x,y0,z1],3));geometry.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));geometry.setIndex([0,1,2,2,1,3]);geometry.computeVertexNormals();
  const surfaceMaterial=new T.MeshBasicMaterial({map:texture,toneMapped:false});illuminatePanel(surfaceMaterial);applyDissolve(surfaceMaterial);
  const surface=new T.Mesh(geometry,surfaceMaterial);surface.name='Continuous LED content surface';face.add(surface);
  return material;
 }
 return {root,source:gltf.scene,meshes,bones,face,screen,triangles,dissolve,screenIllumination,setDisplay,updateScreen,bindTransforms,depth,mountCalibration,animationClips:gltf.animations,clips:gltf.animations.map(c=>({name:c.name,duration:c.duration})),base,
  rigUnchanged:()=>bones.every((b,i)=>b.position.toArray().every((v,j)=>v===bindTransforms[i].position[j])&&b.quaternion.toArray().every((v,j)=>v===bindTransforms[i].quaternion[j])),
 };
}
