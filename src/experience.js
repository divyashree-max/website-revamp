import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {CONFIG} from './config.js';
import {loadRobot} from './model.js';
import {createReconstruction} from './particles.js';
import {createRigMotion} from './rig-motion.js';
import {createCameraPath} from './camera.js';
import {createContent} from './content.js';
import {environment} from './environment.js';
import {createTimeline,STAGES} from './timeline.js';

function disposeScenes(scenes){
 const geometries=new Set(),materials=new Set(),textures=new Set(),images=new Set();
 for(const scene of scenes)scene?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [o.customDepthMaterial,...(o.material?(Array.isArray(o.material)?o.material:[o.material]):[])].filter(Boolean)){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{if(t.source?.data)images.add(t.source.data);t.dispose()});images.forEach(i=>i.close?.());
}

export async function createExperience(canvas,{reduced,onState,onComplete,onFailure,signal}){
 const timing=CONFIG.timing;
 const low=innerWidth<650||navigator.hardwareConcurrency<=4,params=new URLSearchParams(location.search);
 const renderer=new T.WebGLRenderer({canvas,antialias:!low,powerPreference:'high-performance'});
 let dpr=Math.min(devicePixelRatio,low?1.15:1.6);renderer.setPixelRatio(dpr);renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.shadowMap.enabled=!low;renderer.shadowMap.type=T.PCFShadowMap;
 const scene=new T.Scene();scene.background=new T.Color(CONFIG.colors.black);
 const camera=new T.PerspectiveCamera(CONFIG.camera.fov,1,.04,350);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.06);scene.environment=env.texture;scene.environmentIntensity=.95;room.dispose();pmrem.dispose();
 let logo,model,content,cloud,rt,motion,initialized=false,homeReady=false,homeError=null;
 let hero=false,holdPose=false,waiting=false,skipRequested=false,reduceMotion=reduced,paused=reduced,disposed=false,frame=0,last=performance.now(),phase=0,aspect=1,height=810;
 const state={motionTime:0},pointer=new T.Vector2(),target=new T.Vector2(),zero=new T.Vector2(),frameSamples=[];
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 // Homepage identity/fonts load concurrently; the physical intro can play while these finish.
 const logoTask=new Promise((resolve,reject)=>{logo=new T.TextureLoader().load(CONFIG.logo,resolve,undefined,reject);logo.colorSpace=T.SRGBColorSpace;});
 const homeTask=Promise.all([logoTask,document.fonts.load('400 16px PolySans'),document.fonts.load('500 100px PolySans')]).then(()=>{
  homeReady=true;if(disposed)return;clearTimeout(homeDeadline);
  if(initialized){content.resize(aspect);if(skipRequested||reduceMotion)finishHero();else if(waiting){waiting=false;onState('enterScreen');if(!document.hidden&&!paused&&!holdPose)timeline.resume();wake()}draw(0)}
 }).catch(error=>{homeError=error;if(initialized&&!disposed)onFailure(error)});
 const homeDeadline=setTimeout(()=>{if(!homeReady&&!disposed)onFailure(new Error('Homepage readiness timed out'))},45000);
 try{
  model=await loadRobot(signal);scene.add(model.root);motion=createRigMotion(model);
  motion.apply(STAGES.dissolve);
  cloud=await createReconstruction(low?CONFIG.particles.mobile:CONFIG.particles.desktop,signal);scene.add(cloud.group);
  motion.apply(STAGES.dissolve);if(model.screen.center.distanceTo(new T.Vector3().fromArray(cloud.metadata.screenCenter))>.0001)throw new Error('Reconstruction pose needs regeneration');motion.apply(0);
  content=createContent(logo);rt=new T.WebGLRenderTarget(low?1024:1536,low?1024:1536,{depthBuffer:false,stencilBuffer:false});rt.texture.colorSpace=T.SRGBColorSpace;rt.samples=low?0:2;
  if(homeError)throw homeError;if(signal.aborted)throw new DOMException('Aborted','AbortError');
 }catch(error){disposed=true;clearTimeout(homeDeadline);motion?.dispose();disposeScenes([scene,content?.scene]);logo?.dispose();rt?.dispose();env.dispose();renderer.dispose();throw error;}
 const display=model.setDisplay(rt.texture),world=environment(scene,low),path=createCameraPath(model,camera,motion,params.get('camera')==='locked');
 // Use the same composited LED texture for the homepage too, including its color/alpha treatment.
 const homepage=new T.Scene(),homepageCamera=new T.OrthographicCamera(-4.5,4.5,4.5,-4.5,.1,30);homepageCamera.position.z=10;
 homepage.add(new T.Mesh(new T.PlaneGeometry(9,9),new T.MeshBasicMaterial({map:rt.texture,toneMapped:false})));
 function draw(dt){
  if(disposed)return;if(!paused){phase+=dt;pointer.lerp(target,1-Math.exp(-dt*4));}
  content.identity.visible=homeReady;content.update(phase,reduceMotion?zero:pointer);
  content.square();renderer.setRenderTarget(rt);renderer.render(content.scene,content.camera);renderer.setRenderTarget(null);
  if(hero){renderer.render(homepage,homepageCamera);return;}
  if(waiting&&!homeReady)state.motionTime=STAGES.enterScreen;
  motion.apply(state.motionTime);path.apply(state.motionTime);
  const d=T.MathUtils.smoothstep(state.motionTime,STAGES.dissolve,STAGES.swarm)*(1-T.MathUtils.smoothstep(state.motionTime,STAGES.solidRestore,STAGES.frontalSettle));
  model.screenIllumination.value=1-T.MathUtils.smoothstep(state.motionTime,timing.enterScreen,timing.hero-.1);
  model.dissolve.value=d;model.root.visible=d<.99999;world.contact.material.opacity=1-d;
  const inlayFade=1-T.MathUtils.smoothstep(state.motionTime,timing.dissolve,timing.dissolve+.5)*(1-T.MathUtils.smoothstep(state.motionTime,timing.frontalSettle-.6,timing.frontalSettle));world.lines.visible=inlayFade>.001;for(const line of world.lines.children)line.material.opacity=.6*inlayFade;
  cloud.update(state.motionTime,dpr);display.color.setScalar(1);renderer.render(scene,camera);
 }
 function resize(){const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;aspect=rect.width/rect.height;height=rect.height;renderer.setSize(rect.width,rect.height,false);camera.aspect=aspect;camera.updateProjectionMatrix();content.resize(aspect);const width=Math.min(9,9*aspect);homepageCamera.left=-width/2;homepageCamera.right=width/2;homepageCamera.top=width/aspect/2;homepageCamera.bottom=-width/aspect/2;homepageCamera.updateProjectionMatrix();path.reframe(aspect);draw(0);}
 const timeline=createTimeline(state,value=>{if(!hero)onState(value)},()=>finishHero(),()=>{
  if(!homeReady){waiting=true;state.motionTime=STAGES.enterScreen;timeline.pause();onState('waiting');draw(0)}
 });
 function loop(now){
  if(preference.matches!==reduceMotion)setReducedMotion(preference.matches);
  const raw=Math.max(0,now-last);last=now;if(raw>0&&raw<500){frameSamples.push(raw);if(frameSamples.length>180)frameSamples.shift();}
  if(dpr>1&&frameSamples.length===120&&frameSamples.reduce((s,v)=>s+v,0)/120>27){dpr=1;renderer.setPixelRatio(dpr);resize();}
  draw(Math.min(raw/1000,.05));if(!document.hidden&&!paused)frame=requestAnimationFrame(loop);else frame=0;
 }
 function wake(){if(!frame&&!disposed&&!document.hidden){last=performance.now();frame=requestAnimationFrame(loop)}}
 function finishHero(){
  if(!homeReady){skipRequested=true;waiting=true;timeline.pause();state.motionTime=STAGES.enterScreen;draw(0);return;}
  hero=true;waiting=false;holdPose=true;timeline.pause().time(STAGES.hero,true);state.motionTime=STAGES.hero;motion.apply(STAGES.hero);path.apply(STAGES.hero);model.dissolve.value=0;model.root.visible=true;
  try{sessionStorage.setItem('craftech360-intro-complete','1')}catch{}
  onComplete();draw(0);wake();
 }
 function skip(){skipRequested=true;if(homeReady)finishHero();else{waiting=true;holdPose=true;timeline.pause();state.motionTime=STAGES.brandHold;onState('waiting');draw(0);wake()}}
 function replay(){if(reduceMotion)return skip();hero=false;waiting=false;skipRequested=false;holdPose=false;paused=false;phase=0;state.motionTime=0;pointer.set(0,0);target.set(0,0);onState('opening');timeline.restart();wake()}
 function pause(value){paused=value||reduceMotion;if(paused)timeline.pause();else if(!hero&&!holdPose&&!waiting)timeline.resume();draw(0);wake()}
 function setReducedMotion(value){reduceMotion=value;paused=value;if(value){pointer.set(0,0);target.set(0,0);skip()}else{if(!hero&&!holdPose&&!waiting)timeline.resume();draw(0);wake()}}
 function visibility(){if(document.hidden){timeline.pause();cancelAnimationFrame(frame);frame=0}else{if(!paused&&!hero&&!holdPose&&!waiting)timeline.resume();wake()}}
 function move(event){if(hero&&!paused){target.set(T.MathUtils.clamp((event.clientX/innerWidth-.5)*2,-1,1),T.MathUtils.clamp((.5-event.clientY/innerHeight)*2,-1,1));wake()}}
 function leave(event){if(event.pointerType==='mouse')target.set(0,0)}
 const events=new AbortController();signal.addEventListener('abort',()=>events.abort(),{once:true});
 document.addEventListener('visibilitychange',visibility,{signal:events.signal});canvas.addEventListener('pointermove',move,{passive:true,signal:events.signal});canvas.addEventListener('pointerdown',move,{passive:true,signal:events.signal});canvas.addEventListener('pointerleave',leave,{signal:events.signal});canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();onFailure(new Error('WebGL context lost'))},{signal:events.signal});
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 const api={skip,replay,pause,setReducedMotion,labels:timeline.labels,setCameraLocked(value){path.setLocked(value);draw(0)},
  seek(value){holdPose=true;skipRequested=false;hero=false;waiting=false;timeline.pause().time(T.MathUtils.clamp(value,0,STAGES.hero),true);state.motionTime=T.MathUtils.clamp(value,0,STAGES.hero);onState(timeline.currentLabel()||'opening');if(value>=STAGES.hero)finishHero();draw(0);wake()},
  play(){holdPose=false;paused=false;if(hero)replay();else{timeline.resume();wake()}},
  getState(){const direction=camera.getWorldDirection(new T.Vector3());return {hero,paused,waiting,homepageReady:homeReady,phase,pointer:pointer.toArray(),time:state.motionTime,iteration:timeline.iteration(),playbackRate:CONFIG.playbackRate,playbackDuration:timing.total/CONFIG.playbackRate,sourceModel:'KUKA+Display.glb',modelTriangles:model.triangles,meshes:model.meshes.length,boneCount:model.bones.length,rigAnimation:true,sourceClip:motion.sourceClip,proportionsUnchanged:model.bones.every((b,i)=>b.position.toArray().every((v,j)=>v===model.bindTransforms[i].position[j])&&b.scale.toArray().every((v,j)=>v===model.bindTransforms[i].scale[j])),cable:motion.cable,mountCalibration:model.mountCalibration,wristRevolution:motion.revolution,joints:motion.joints(),baseMatrix:model.base.matrixWorld.toArray(),rootPosition:model.root.position.toArray(),rootRotation:model.root.rotation.toArray(),screenWidth:model.screen.width,screenHeight:model.screen.height,screenRatio:model.screen.width/model.screen.height,screenCenter:model.screen.center.toArray(),screenNormal:model.screen.normal.toArray(),screenUp:model.screen.up.toArray(),screenCenterNDC:model.screen.center.clone().project(camera).toArray(),screenFacing:-direction.dot(model.screen.normal),screenLevel:camera.up.dot(model.screen.up),screenCorners:[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,y])=>model.screen.center.clone().addScaledVector(model.screen.right,x*model.screen.width/2).addScaledVector(model.screen.up,y*model.screen.height/2).project(camera).toArray()),screenBottom:model.screen.center.y-Math.abs(model.screen.right.y*model.screen.width/2)-Math.abs(model.screen.up.y*model.screen.height/2),screenParent:model.face.parent.name,screenLocalMatrix:model.face.parent.matrix.toArray(),particleCount:cloud.count,particles:cloud.diagnostics,solidVisible:model.root.visible,screenIllumination:model.screenIllumination.value,dissolve:model.dissolve.value,floorMatrix:world.floor.matrixWorld.toArray(),camera:camera.position.toArray(),cameraLocked:path.locked,lookDirection:direction.toArray(),dpr,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,meanFrameMs:frameSamples.length?frameSamples.reduce((s,v)=>s+v,0)/frameSamples.length:null}},
  dispose(){if(disposed)return;disposed=true;clearTimeout(homeDeadline);events.abort();timeline.kill();motion.dispose();cancelAnimationFrame(frame);observer.disconnect();disposeScenes([scene,content.scene,homepage]);rt.dispose();env.dispose();logo.dispose();renderer.dispose()},
 };
 try{resize();await renderer.compileAsync(scene,camera);await renderer.compileAsync(content.scene,content.camera);await renderer.compileAsync(homepage,homepageCamera);draw(0)}catch(error){api.dispose();throw error;}
 if(signal.aborted){api.dispose();return null;}initialized=true;if(homeError){api.dispose();throw homeError;}
 let seen=false;try{seen=sessionStorage.getItem('craftech360-intro-complete')==='1'}catch{}
 if(reduced||(seen&&!params.has('debug')))skip();else{if(!document.hidden)timeline.play();wake()}
 if(!import.meta.env?.PROD&&params.has('debug')){const {createDebug}=await import('./debug.js');createDebug(api,params,events.signal)}
 return api;
}


