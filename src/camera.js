import * as T from 'three';
import {CONFIG} from './config.js';
import {smooth} from './rig-motion.js';

/** Authored product-camera beats. Azimuth interpolation creates arcs, not a rotating model. */
export function createCameraPath(model,camera,motion,locked=false){
 const timing=CONFIG.timing,point=new T.Vector3(),right=new T.Vector3(),up=new T.Vector3(),delta=new T.Vector3();let lock=locked,keys=[],lockedView,presentationView,alignedView,coverDistance=2,frontDistance=7;
 motion.apply(timing.brandHold);const front={center:model.screen.center.clone(),normal:model.screen.normal.clone(),up:model.screen.up.clone(),width:model.screen.width,height:model.screen.height};
 motion.apply(timing.screenRotation);const rolling={center:model.screen.center.clone(),normal:model.screen.normal.clone(),up:model.screen.up.clone()};
 motion.apply(0);const detail=model.bones[2].getWorldPosition(new T.Vector3());motion.apply(timing.dissolve);const wrist=model.bones[5].getWorldPosition(new T.Vector3());motion.apply(0);
 function fit(angle,aspect){
  const target=new T.Vector3(0,1.5,1.15),eye=target.clone().add(new T.Vector3(Math.sin(angle),.045,Math.cos(angle)).normalize().multiplyScalar(5.5)),test=new T.PerspectiveCamera(camera.fov,aspect,.04,350);
  for(let i=0;i<7;i++){
   test.position.copy(eye);test.lookAt(target);test.updateMatrixWorld();let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
   for(const p of motion.envelope){point.copy(p).project(test);xmin=Math.min(xmin,point.x);xmax=Math.max(xmax,point.x);ymin=Math.min(ymin,point.y);ymax=Math.max(ymax,point.y);}
   const h=eye.distanceTo(target)*Math.tan(T.MathUtils.degToRad(camera.fov/2));right.setFromMatrixColumn(test.matrixWorld,0);up.setFromMatrixColumn(test.matrixWorld,1);
   delta.copy(right).multiplyScalar((xmin+xmax)*.5*h*aspect).addScaledVector(up,(ymin+ymax)*.5*h);eye.add(delta);target.add(delta);
   const factor=Math.max((xmax-xmin)/(aspect<.8?1.64:1.7),(ymax-ymin)/1.62,1);eye.sub(target).multiplyScalar(Math.min(factor,1.6)).add(target);
  }return {eye,target};
 }
 function key(time,view){const o=view.eye.clone().sub(view.target);return {time,target:view.target,azimuth:Math.atan2(o.x,o.z),radius:Math.hypot(o.x,o.z),height:o.y,up:view.up||T.Object3D.DEFAULT_UP};}
 function adjust(view,scale,target){const eye=view.eye.clone().sub(view.target).multiplyScalar(scale).add(target||view.target);return {eye,target:target?.clone()||view.target.clone()};}
 function reframe(aspect){
  const view=angle=>fit(T.MathUtils.degToRad(angle),aspect),wide=view(45),spin=view(56),particle=view(54);
  const rollingDistance=Math.max(spin.eye.distanceTo(spin.target),2.5/Math.tan(T.MathUtils.degToRad(camera.fov/2)),1.7/(aspect*Math.tan(T.MathUtils.degToRad(camera.fov/2))));
  const rollView={eye:rolling.center.clone().addScaledVector(rolling.normal,rollingDistance),target:rolling.center.clone(),up:rolling.up};
  lockedView=rollView;
  const macro={target:detail.clone(),eye:detail.clone().add(new T.Vector3(aspect<.8?2.25:1.55,.14,-.15))};
  const sweepTarget=detail.clone().lerp(wrist,.42);
  const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));frontDistance=Math.max(2.2/tan,front.width/(1.55*aspect*tan));coverDistance=Math.min(front.height,front.width/aspect)/(2*tan);
  const aligned={eye:front.center.clone().addScaledVector(front.normal,frontDistance),target:front.center.clone(),up:front.up};
  presentationView=particle;alignedView=aligned;
  keys=[key(0,macro),key(timing.fullReveal,wide),key(timing.armPerformance,wide),key(timing.screenRotation,rollView),key(timing.rotationEnd,rollView),key(13.4,adjust(view(72),.88,sweepTarget.clone().lerp(particle.target,.55))),key(timing.gather,adjust(view(70),1.1)),key(timing.particleRobot,particle),key(timing.frontalSettle,particle)];
 }
 function apply(time){
  if(time>=timing.brandHold){const entry=smooth((time-timing.enterScreen)/(timing.total-timing.enterScreen));camera.position.copy(front.center).addScaledVector(front.normal,T.MathUtils.lerp(frontDistance,coverDistance,entry));camera.up.copy(front.up);camera.lookAt(front.center);}
  else if(time>=timing.frontalSettle){
   const settle=smooth((time-timing.frontalSettle)/(timing.brandHold-timing.frontalSettle));
   camera.position.copy(presentationView.eye).lerp(alignedView.eye,settle);camera.up.copy(T.Object3D.DEFAULT_UP).lerp(front.up,settle).normalize();point.copy(presentationView.target).lerp(front.center,settle);camera.lookAt(point);
  }
  else if(lock&&time<timing.frontalSettle){camera.position.copy(lockedView.eye);camera.up.copy(T.Object3D.DEFAULT_UP);camera.lookAt(lockedView.target);}
  else{
   let i=0;while(i<keys.length-2&&time>keys[i+1].time)i++;const a=keys[i],b=keys[i+1],p=smooth((time-a.time)/(b.time-a.time)),angle=T.MathUtils.lerp(a.azimuth,b.azimuth,p),radius=T.MathUtils.lerp(a.radius,b.radius,p);
   point.copy(a.target).lerp(b.target,p);camera.position.copy(point).add(delta.set(Math.sin(angle)*radius,T.MathUtils.lerp(a.height,b.height,p),Math.cos(angle)*radius));camera.up.copy(a.up).lerp(b.up,p).normalize();camera.lookAt(point);
  }camera.updateMatrixWorld();
 }
 reframe(1);return {reframe,apply,front,setLocked(v){lock=v},get locked(){return lock},get coverDistance(){return coverDistance}};
}
