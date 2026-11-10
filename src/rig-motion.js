import * as T from 'three';
import {CONFIG} from './config.js';
import {createCableRig} from './cable-rig.js';

export const MOTION_KEYS=[0,CONFIG.timing.armPerformance,CONFIG.timing.screenRotation,CONFIG.timing.total];
export const SOURCE_KEYS=[0,0,.32,.32];
export const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*t*(t*(t*6-15)+10)};

/** Only authored joint rotations are evaluated; all source link offsets and scales stay fixed. */
export function createRigMotion(model){
 const timing=CONFIG.timing,source=model.animationClips.find(c=>c.name==='ArmatureAction.004');
 if(!source)throw new Error('Required articulated source clip is missing');
 const tracks=source.tracks.filter(t=>t.name.endsWith('.quaternion')).map(track=>({binding:new T.PropertyBinding(model.source,track.name),interpolant:track.createInterpolant()}));
 const base=model.bones[0],roll=model.source.getObjectByName('Bone004'),bend=model.source.getObjectByName('Bone005'),end=model.source.getObjectByName('Bone006');
 const cable=createCableRig(model),axis=new T.Vector3(0,1,0),offset=new T.Quaternion();let revolution=0;
 function apply(time){
  const t=T.MathUtils.clamp(time,0,timing.total);let i=0;while(i<MOTION_KEYS.length-2&&t>MOTION_KEYS[i+1])i++;
  const amount=SOURCE_KEYS[i]===SOURCE_KEYS[i+1]?0:smooth((t-MOTION_KEYS[i])/(MOTION_KEYS[i+1]-MOTION_KEYS[i]));
  for(const {binding,interpolant}of tracks){const a=Array.from(interpolant.evaluate(SOURCE_KEYS[i])),b=interpolant.evaluate(SOURCE_KEYS[i+1]);const q=new T.Quaternion().fromArray(a).slerp(new T.Quaternion().fromArray(b),amount).normalize();binding.setValue(q.toArray(),0);}
  const preparation=smooth((t-timing.armPerformance)/(timing.screenRotation-timing.armPerformance));
  revolution=Math.PI*2*smooth((t-timing.screenRotation)/(timing.rotationEnd-timing.screenRotation));
  base.quaternion.multiply(offset.setFromAxisAngle(axis,-.14*preparation));
  roll.quaternion.multiply(offset.setFromAxisAngle(axis,-Math.PI+Math.PI*.5*preparation));
  bend.quaternion.multiply(offset.setFromAxisAngle(axis,-1.15*preparation));
  // A6 local +Y is the physical display normal; negative angle is clockwise from its front.
  end.quaternion.multiply(offset.setFromAxisAngle(axis,Math.PI-Math.PI*.5*preparation-revolution));
  model.updateScreen();cable.update();
 }
 function joints(){return model.bones.map(b=>({name:b.name,position:b.getWorldPosition(new T.Vector3()).toArray(),quaternion:b.quaternion.toArray(),localPosition:b.position.toArray(),localScale:b.scale.toArray(),linkLength:b.getWorldPosition(new T.Vector3()).distanceTo(b.parent.getWorldPosition(new T.Vector3()))}));}
 const envelope=[],p=new T.Vector3();
 for(let t=0;t<=timing.brandHold;t+=.5){apply(t);for(const mesh of model.meshes){if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])envelope.push(p.set(x,y,z).applyMatrix4(mesh.matrixWorld).clone());}}
 apply(0);
 return {apply,joints,envelope,sourceClip:source.name,get revolution(){return revolution},get cable(){return cable.diagnostics},dispose(){tracks.forEach(t=>t.binding.unbind())}};
}
