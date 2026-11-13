import * as T from 'three';
import {loadRobot} from './model.js';
import {createCableRig} from './cable-rig.js';
import {SERVICES,SERVICE_MOTION} from './services-config.js';
import {serviceEase} from './services-timeline.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
/** One owner composes source joint poses, wrist compensation and bounded ambient offsets. */
export async function createServicesRobot(scene,signal,texture,renderer){
 const model=await loadRobot(signal),cable=createCableRig(model),axis=new T.Vector3(0,1,0),q=new T.Quaternion();
 const source=model.animationClips.find(c=>c.name==='ArmatureAction.004');
 for(const track of source.tracks.filter(t=>t.name.endsWith('.quaternion'))){const binding=new T.PropertyBinding(model.source,track.name);binding.setValue(track.createInterpolant().evaluate(0),0);binding.unbind()}
 const bones=['Bone002','Bone003','Bone004','Bone005','Bone006'].map(n=>model.source.getObjectByName(n)),rest=bones.map(b=>b.quaternion.clone()),wrist=[-Math.PI,Math.PI*.5,Math.PI];
 const placement=new T.Group();placement.visible=false;placement.rotation.y=Math.PI/2;placement.add(model.root);model.setDisplay(texture);model.screenIllumination.value=0;scene.add(placement);placement.updateMatrixWorld(true);model.root.traverse(o=>{if(o.isMesh)o.layers.set(1)});
 const light=new T.PointLight(0xffdca8,.8,4,2),fill=new T.HemisphereLight(0xe1e9f0,0x101013,1.8),key=new T.DirectionalLight(0xfff3e2,2.4),rim=new T.DirectionalLight(0xd4dce5,2.2);
 key.position.set(-4,5,7);rim.position.set(4,3,-1);const lights=[light,fill,key,rim];for(const l of lights){l.visible=false;l.layers.set(1);scene.add(l)}
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();for(const mesh of model.meshes)for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material])if(material.isMeshStandardMaterial){material.envMap=environment.texture;material.envMapIntensity=.85;material.needsUpdate=true}
 const targetNormal=new T.Vector3(0,0,1),targetUp=new T.Vector3(0,1,0),targetQ=new T.Quaternion(),targetEuler=new T.Euler(0,0,0,'YXZ'),basePosition=new T.Vector3();
 let mobile=false,poseTime=0,updates=0,poseValue=0,shoulder=0,elbow=-.45;
 function authored(value,small,ambient=0){
  const i=Math.min(4,Math.floor(value)),u=value-i,a=SERVICES[i].pose,b=SERVICES[i+1].pose,strength=small?SERVICE_MOTION.mobileMotion:1;
  shoulder=(a.shoulder+(b.shoulder-a.shoulder)*u)*strength+ambient;
  elbow=-.45+(a.elbow+(b.elbow-a.elbow)*u+.45)*strength-ambient*.65;
  bones[0].quaternion.copy(rest[0]).multiply(q.setFromAxisAngle(axis,shoulder));bones[1].quaternion.copy(rest[1]).multiply(q.setFromAxisAngle(axis,elbow));
  const arc=Math.sin(u*Math.PI)*strength;
  targetEuler.set((a.pitch+(b.pitch-a.pitch)*u)*strength+arc*.035,(a.yaw+(b.yaw-a.yaw)*u)*strength+arc*.12,(a.roll+(b.roll-a.roll)*u)*strength+arc*.045);
  targetQ.setFromEuler(targetEuler);targetNormal.set(0,0,1).applyQuaternion(targetQ);targetUp.set(0,1,0).applyQuaternion(targetQ);
 }
 function wristPose(){for(let i=0;i<3;i++)bones[i+2].quaternion.copy(rest[i+2]).multiply(q.setFromAxisAngle(axis,wrist[i]));model.updateScreen()}
 const error=()=>2-model.screen.normal.dot(targetNormal)-model.screen.up.dot(targetUp);
 function solve(steps=16,angle=.025){for(let k=0;k<steps;k++){let changed=false;for(let i=0;i<3;i++){const original=wrist[i];wristPose();let best=error(),chosen=original;for(const sign of [-1,1]){wrist[i]=original+sign*angle;wristPose();const e=error();if(e<best){best=e;chosen=wrist[i];changed=true}}wrist[i]=chosen;}if(!changed)angle*=.5;}wristPose()}
 // Deterministic wrist seeds for the full motion corridor. Runtime never depends
 // on which chapter was visited before the current scroll position.
 const resolution=24,tables=[],bounds=[];
 for(const small of [false,true]){const table=new Float64Array((5*resolution+1)*3),box=new T.Box3();wrist.splice(0,3,-Math.PI,Math.PI*.5,Math.PI);for(let k=0;k<=5*resolution;k++){authored(k/resolution,small);solve(k===0?90:36,k===0?.5:.075);table.set(wrist,k*3);if(k%6===0){cable.update();box.union(new T.Box3().setFromObject(placement))}}tables.push(table);bounds.push(box)}
 function setPose(value,ambient=0){poseValue=value;authored(value,mobile,ambient);const table=tables[mobile?1:0],sample=value*resolution,lo=Math.floor(sample),hi=Math.min(5*resolution,lo+1),u=sample-lo;for(let i=0;i<3;i++)wrist[i]=T.MathUtils.lerp(table[lo*3+i],table[hi*3+i],u);solve(16);cable.update()}
 function layout(viewW,viewH,small){mobile=small;const range=bounds[small?1:0],size=range.getSize(new T.Vector3()),scale=small?Math.min(viewW*.8/size.x,viewH*.33/size.y):Math.min(viewW*.90/size.x,viewH*.79/size.y);
  placement.scale.setScalar(scale);basePosition.set(small?-(range.min.x+range.max.x)*scale*.5:-(range.min.x+range.max.x)*scale*.5,small?-viewH*.02-range.min.y*scale:-viewH*.37-range.min.y*scale,-.7);placement.position.copy(basePosition);placement.updateMatrixWorld(true);setPose(poseValue);
 }
 function update(time,presentation,transition,reduced){poseTime=time;const u=presentation.travel,envelope=u<.1?1-serviceEase(u/.1):u>.9?serviceEase((u-.9)/.1):0;
  const ambient=!reduced&&transition>=.999?Math.sin(time*.42)*SERVICE_MOTION.shoulder*envelope:0;setPose(presentation.poseValue,ambient);
  light.position.copy(model.screen.center).addScaledVector(model.screen.normal,.3);light.intensity=transition*.8;model.dissolve.value=1-T.MathUtils.smoothstep(transition,.08,.5);setVisible(transition>0);updates++;
 }
 function setVisible(value){placement.visible=value;model.root.visible=value;for(const light of lights)light.visible=value}
 const originalPositions=model.bones.map(b=>b.position.clone()),originalScales=model.bones.map(b=>b.scale.clone()),faceTransform=model.face.matrix.clone();
 return {model,layout,update,setVisible,floorPoint(){const point=model.bones[0].getWorldPosition(new T.Vector3());point.y=basePosition.y+bounds[mobile?1:0].min.y*placement.scale.y;return point},get screen(){return model.screen},diagnostics(camera){const corners=[];for(const x of [-.5,.5])for(const y of [-.5,.5])corners.push(model.screen.center.clone().addScaledVector(model.screen.right,model.screen.width*x).addScaledVector(model.screen.up,model.screen.height*y).project(camera));return {ready:true,renderVisible:placement.visible&&model.root.visible,dissolve:model.dissolve.value,lightsVisible:lights.some(l=>l.visible),updates,poseTime,poseValue,jointAngles:[shoulder,elbow,...wrist],source:'kuka-display.web.glb',clips:model.clips,profileYaw:placement.rotation.y,screenCenter:model.screen.center.clone().project(camera).toArray(),screenBounds:{left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),top:Math.max(...corners.map(p=>p.y)),bottom:Math.min(...corners.map(p=>p.y))},normal:model.screen.normal.toArray(),up:model.screen.up.toArray(),width:model.screen.width,height:model.screen.height,wrist:wrist.slice(),anchored:placement.position.distanceTo(basePosition)<1e-9,linksUnchanged:model.bones.every((b,i)=>b.position.equals(originalPositions[i])&&b.scale.equals(originalScales[i])),screenAttached:model.face.matrix.equals(faceTransform),cable:cable.diagnostics}},dispose(){placement.removeFromParent();lights.forEach(l=>l.removeFromParent());environment.dispose();const textures=new Set(),materials=new Set();for(const mesh of model.meshes){mesh.geometry.dispose();for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture&&v!==texture&&v!==environment.texture)textures.add(v)}}for(const child of model.face.children){child.geometry?.dispose();child.material?.dispose()}materials.forEach(m=>m.dispose());textures.forEach(t=>{t.dispose();t.image?.close?.()});model.depth.dispose()}};
}
