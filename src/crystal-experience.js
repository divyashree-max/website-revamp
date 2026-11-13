import * as T from 'three';
import {gsap} from 'gsap';
import {CRYSTAL,CRYSTAL_HANDOFF} from './crystal-config.js';
import {loadCrystal,createReflectionEnvironment} from './crystal-model.js';
import {sampleServices} from './services-timeline.js';
import {createGlassField} from './glass-field.js';
import {createCrystalBackdrop} from './crystal-backdrop.js';
const ease=(t,a,b)=>{const p=T.MathUtils.clamp((t-a)/(b-a),0,1);return p*p*(3-2*p)};
export async function createCrystalExperience(canvas,section,{signal,reduced}){
 const studio=section.closest('#studio-sequence');
 const low=innerWidth<650||navigator.hardwareConcurrency<=4,events=new AbortController(),replay=studio.querySelector('.crystal-replay');
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:!low,powerPreference:'high-performance'});renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(devicePixelRatio,low?CRYSTAL.mobilePixelRatio:CRYSTAL.pixelRatio));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.transmissionResolutionScale=low?.4:CRYSTAL.transmissionScale;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,60),backdrop=createCrystalBackdrop(renderer,canvas,studio);
 let model,env,field,frame=0,visible=false,disposed=false,finished=false,last=0,ambient=0,frames=0,width=1,height=1,cameraDistance=10;
 camera.layers.enable(1);
 let lost=false,spreadFactor=1,timeline,hovered=-1,started=false,replays=0;const weights=new Float32Array(9),phase={time:reduced?CRYSTAL.duration:0},pointerMode=matchMedia('(hover: hover) and (pointer: fine)'),ndc=new T.Vector2(10,10);
 let services,serviceMedia,servicesLoading,serviceError=null,serviceState={transition:0,chapter:0,index:0,mobile:innerWidth<=700},viewH=6.6,serviceTime=0,serviceActive=false;
 let products,productsLoading,productsState={entry:0,index:0,local:0,visible:false,mobile:false};const floor=studio.querySelector('#services-floor'),productsSection=studio.querySelector('#products-section');
 const destination=new T.Vector3(),screenQ=new T.Quaternion(),startQ=new T.Quaternion(),basis=new T.Matrix4();
 try{model=await loadCrystal(signal,low,backdrop);scene.add(model.root);env=createReflectionEnvironment(renderer);scene.environment=env.texture;scene.environmentIntensity=1;field=createGlassField(renderer,low,studio.querySelector('#crystal-fluid-canvas'))}catch(e){model?.dispose();env?.dispose();backdrop.dispose();renderer.dispose();throw e}
 const key=new T.DirectionalLight(0xf6faff,.5);key.position.set(-3,4,6);scene.add(key);
 const rotation=new T.Euler(),quaternion=new T.Quaternion(),offset=new T.Vector3();
 function apply(dt=0){
  const travel=reduced?(serviceState.transition>.5?1:0):serviceState.transition;
  const t=travel>0?CRYSTAL.duration:phase.time,turn=ease(t,CRYSTAL.rotateStart,CRYSTAL.rotateEnd),moving=Math.sin(turn*Math.PI),settled=t>=CRYSTAL.duration;
  model.root.position.set(0,0,0);model.root.scale.setScalar(1);model.root.visible=travel<CRYSTAL_HANDOFF.resolveEnd;model.amber.value=ease(travel,CRYSTAL_HANDOFF.amberStart,CRYSTAL_HANDOFF.amberEnd);
  model.root.rotation.set(.045+moving*.2+(finished&&!reduced&&travel===0?Math.sin(ambient*.18)*.004:0),-.06+(settled?0:turn*CRYSTAL.turn)+(finished&&!reduced&&travel===0?Math.sin(ambient*.13)*.006:0),moving*Math.sin(turn*5)*.055);
  camera.position.set(moving*.42,.1+moving*.12,cameraDistance);camera.lookAt(0,.1,0);camera.updateMatrixWorld();model.proxyRoot.rotation.copy(model.root.rotation);model.proxyRoot.updateMatrixWorld(true);
  const target=finished&&travel===0&&!reduced&&pointerMode.matches?hovered:-1;
  model.facets.forEach((f,i)=>{const delay=i*CRYSTAL.stagger,p=ease(t,CRYSTAL.spreadStart+delay,CRYSTAL.spreadEnd+delay)*(1-ease(t,CRYSTAL.reformStart+delay,CRYSTAL.reformEnd+delay));
   const distance=target<0?Infinity:f.rest.distanceTo(model.facets[target].rest),wanted=target===i?1:distance<1.5?Math.exp(-distance*distance/.7)*.34:0;
   if(dt>0)weights[i]+=(wanted-weights[i])*(1-Math.exp(-dt/(wanted>weights[i]?.11:.16)));if(wanted===0&&weights[i]<.00001)weights[i]=0;const h=weights[i];
   // A coherent fan follows the C's sweep: neighboring facets share depth and turn.
   offset.set(f.rest.x*.75,f.rest.y*.65,(f.rest.x*.35+f.rest.y*.2)*CRYSTAL.depth/CRYSTAL.spread).multiplyScalar(p*CRYSTAL.spread*spreadFactor);
   offset.x+=f.rest.x*.11*h;offset.y+=f.rest.y*.11*h;offset.z+=.42*h;
   f.pivot.position.copy(f.rest).add(offset);
   rotation.set(f.rest.y*.16*CRYSTAL.facetRotation*p+.16*h,f.rest.x*.55*CRYSTAL.facetRotation*p+Math.sin(i*1.3)*.2*h,-f.rest.y*.08*CRYSTAL.facetRotation*p+Math.cos(i)*.045*h);
   quaternion.setFromEuler(rotation);f.pivot.quaternion.copy(f.quaternion).multiply(quaternion);
  });
  if(services&&travel>.001){
   if(!serviceActive){serviceMedia.resume();serviceActive=true}
   const presentation=sampleServices(serviceState.chapter,reduced);services.update(serviceTime,presentation,travel,reduced);
   const screen=services.screen,join=ease(travel,.08,CRYSTAL_HANDOFF.settle),resolve=ease(travel,CRYSTAL_HANDOFF.resolveStart,CRYSTAL_HANDOFF.resolveEnd),scale=T.MathUtils.lerp(1,screen.height*.68/4.265,join)*(1-resolve*.99);
   destination.copy(screen.center).addScaledVector(screen.normal,.09+scale*.22);
   model.root.position.copy(destination).multiplyScalar(join);model.root.position.y+=Math.sin(join*Math.PI)*.35;
   model.root.scale.setScalar(scale);basis.makeBasis(screen.right,screen.up,screen.normal);screenQ.setFromRotationMatrix(basis);startQ.copy(model.root.quaternion);model.root.quaternion.slerpQuaternions(startQ,screenQ,join);
   const fade=ease(travel,CRYSTAL_HANDOFF.resolveStart,CRYSTAL_HANDOFF.resolveEnd);
   serviceMedia.draw(presentation.index,serviceTime,fade,reduced,presentation);
  }else if(services){services.setVisible(false);if(serviceActive){serviceMedia.pause();serviceActive=false}}
  model.probeCenter.value.copy(model.root.position);model.probeScale.value=model.root.scale.x;model.root.updateMatrixWorld(true);
 }
 async function preloadProducts(){if(productsLoading||disposed)return;productsLoading=true;try{const {createProductsExperience}=await import('./products-experience.js');if(disposed)return;products=createProductsExperience(renderer,signal,(index,error)=>{productsSection.querySelector('.products-status').textContent=error?'3D view unavailable. Product description and assembled preview remain available.':'';productsSection.toggleAttribute('data-model-failed',!!error);if(visible)wake();if(reduced&&visible)draw()});products.resize(width,height);products.load(productsState.index)}catch(error){productsSection.dataset.modelFailed='';productsSection.querySelector('.products-status').textContent='3D product views unavailable.';console.warn('Products unavailable:',error.message)}}
 function setProductsState(state){productsState=state;if(state.near)preloadProducts();if(reduced&&visible)draw();else wake()}
 function draw(dt=0){if(disposed||lost)return;ambient+=reduced?0:dt;
  const entering=productsState.entry,productMode=entering>=.5;
  field.update(dt,!reduced&&pointerMode.matches);renderer.setViewport(0,0,width,height);renderer.setScissorTest(false);renderer.setClearColor(0x000000,0);
  if(productMode){serviceMedia?.pause();serviceActive=false;model.root.visible=false;if(services)services.setVisible(false);floor.style.opacity='0';const ready=products?.update(productsState,dt);productsSection.toggleAttribute('data-model-ready',!!ready);const edge=productsState.simple?1:Math.max(.5,ease(productsState.local,0,.035)*(productsState.index===3?1:1-ease(productsState.local,.965,1)));canvas.style.opacity=String(ready?ease(entering,.5,1)*edge:0);if(ready){renderer.toneMappingExposure=.75;products.render();renderer.toneMappingExposure=1}else renderer.clear();}
  else{products?.deactivate();if(serviceState.transition>=1)serviceTime+=reduced?0:dt;else serviceTime=0;scene.environmentRotation.set(0,reduced?0:Math.sin(ambient*.16)*.12,0);apply(dt);backdrop.setTextVisibility(1-ease(serviceState.transition,0,.3));backdrop.draw();canvas.style.opacity=String(1-ease(entering,0,.5));renderer.render(scene,camera);
   if(services){const point=services.floorPoint().project(camera);const anchorX=(point.x+1)*width*.5,anchorY=(1-point.y)*height*.5,u=706.96/1439,gridWidth=Math.ceil(Math.max(width+2,(anchorX+1)/u,(width-anchorX+1)/(1-u))),gridHeight=gridWidth*352/1439;floor.style.width=gridWidth+'px';floor.style.top=(anchorY-gridHeight*.3)+'px';floor.style.left=(anchorX-gridWidth*u)+'px';floor.style.opacity=String(.3*ease(serviceState.transition,.3,.7)*(1-ease(entering,0,.5)));}
  }frames++}

 function loop(now){frame=0;if(!visible||document.hidden||disposed||lost)return;const dt=last?Math.min(.05,(now-last)/1000):0;last=now;draw(dt);if(!reduced)frame=requestAnimationFrame(loop)}
 function wake(){if(visible&&!document.hidden&&!disposed&&!lost&&!frame){last=0;frame=requestAnimationFrame(loop)}}
 function stop(){products?.pause();cancelAnimationFrame(frame);frame=0;last=0;timeline?.pause()}
 function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;width=r.width;height=r.height;const aspect=width/height;viewH=Math.max(6.6,4.65/aspect);spreadFactor=Math.min(1,Math.max(.4,(viewH*aspect-3.8)/1.7));camera.aspect=aspect;cameraDistance=viewH/(2*Math.tan(T.MathUtils.degToRad(17.5)));camera.updateProjectionMatrix();renderer.setSize(width,height,false);backdrop.resize(width,height);field.resize(width,height,viewH*aspect,viewH);services?.layout(viewH*aspect,viewH,width<=900);products?.resize(width,height);if(visible)draw()}
 timeline=gsap.timeline({paused:true,onComplete(){finished=true;section.dataset.phase='settled'}}).to(phase,{time:CRYSTAL.duration,duration:CRYSTAL.duration,ease:'none'});
 if(reduced){timeline.progress(1);finished=true;section.dataset.phase='settled'}
 function clearHover(){hovered=-1;ndc.set(10,10)}
 function setVisible(value){if(visible===value)return;visible=value;if(!value){stop();field.reset();clearHover();weights.fill(0);serviceMedia?.pause()}else{if(serviceState.transition>.001)serviceMedia?.resume();if(started&&!reduced&&!finished){section.dataset.phase='playing';timeline.resume()}wake()}}
 function reset(preserveFluid=false){timeline.pause(0);started=false;finished=reduced;clearHover();weights.fill(0);ambient=0;phase.time=reduced?CRYSTAL.duration:0;if(!preserveFluid)field.reset();section.dataset.phase=reduced?'settled':'ready';apply()}
 function replayAnimation(){if(reduced)return;reset(visible);started=true;finished=false;replays++;section.dataset.phase='playing';timeline.restart();if(!visible||document.hidden)timeline.pause();wake()}
 function finishC(){timeline.pause();phase.time=CRYSTAL.duration;finished=true;clearHover();weights.fill(0)}
 function setServicesState(state){serviceState=state;if(state.transition>0&&!finished)finishC();if(state.chapter>2.5)preloadProducts();if(state.transition>0){clearHover();weights.fill(0)}if(reduced&&visible)draw();else wake()}
 async function preloadServices(){if(servicesLoading||disposed)return;servicesLoading=true;try{const [{createServicesRobot},{createServicesMedia}]=await Promise.all([import('./services-robot.js'),import('./services-media.js')]);if(disposed)return;serviceMedia=createServicesMedia();services=await createServicesRobot(scene,signal,serviceMedia.texture,renderer);if(disposed){services.dispose();serviceMedia.dispose();return}services.layout(viewH*width/height,viewH,width<=700);services.update(0,sampleServices(0,reduced),serviceState.transition,reduced);await renderer.compileAsync(scene,camera);studio.dataset.servicesReady='';if(visible)draw()}catch(error){serviceError=error.message;studio.dataset.servicesFailed='';console.warn('Services robot unavailable:',error.message)}}
 function setReduced(value){reduced=value;replay.disabled=value;clearHover();weights.fill(0);field.reset();if(value){timeline.pause();phase.time=CRYSTAL.duration;finished=true;section.dataset.phase='settled';stop();if(visible)draw()}else wake()}
 function visibility(){if(document.hidden){stop();serviceMedia?.pause()}else if(visible){if(serviceState.transition>.001)serviceMedia?.resume();if(started&&!finished&&!reduced)timeline.resume();wake()}}
 function move(e){if(!visible||reduced||e.pointerType!=='mouse'||!pointerMode.matches||e.target.closest('button,a,input,nav,header,dialog')){clearHover();return}const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;field.pointer(x,1-y,performance.now());serviceMedia?.pointer(x,y);ndc.set(x*2-1,1-y*2);hovered=finished&&serviceState.transition===0?model.pick(ndc,camera):-1}
 studio.addEventListener('pointermove',move,{passive:true,signal:events.signal});studio.addEventListener('pointerleave',()=>{field.leave();clearHover()},{signal:events.signal});replay.addEventListener('click',replayAnimation,{signal:events.signal});document.addEventListener('visibilitychange',visibility,{signal:events.signal});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;productsSection.removeAttribute('data-model-ready');productsSection.dataset.modelFailed='';stop();replay.hidden=true;section.dataset.failed='';canvas.hidden=true},{signal:events.signal});
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 try{resize();apply();await renderer.compileAsync(scene,camera);draw();section.dataset.ready='';studio.dataset.ready='';replay.disabled=reduced}catch(error){stop();timeline.kill();observer.disconnect();events.abort();field.dispose();model.dispose();env.dispose();backdrop.dispose();renderer.dispose();throw error}
 document.fonts.ready.then(()=>{if(!disposed)resize()});
 return {setVisible,setReduced,replay:replayAnimation,reset,finishC,setServicesState,preloadServices,setProductsState,preloadProducts,
 dnaQA(action,value){products?.dnaQA(action,value);if(reduced&&visible)draw();else wake()},
 orbitQA(time){products?.orbitQA(time);if(reduced&&visible)draw();else wake()},
 matrixQA(action,value){products?.matrixQA(action,value);if(reduced&&visible)draw();else wake()},
 helixQA(action,value){products?.helixQA(action,value);if(reduced&&visible)draw();else wake()},
 productsDiagnostics(){return {...products?.diagnostics(),rendererCount:field.diagnostics.solver==='disabled'?1:2}},
 servicesDiagnostics(){return {robot:services?.diagnostics(camera),media:serviceMedia?.diagnostics,error:serviceError,cPosition:model.root.position.toArray(),cScale:model.root.scale.x,cVisible:model.root.visible,cAmber:model.amber.value,cAmberHold:serviceState.transition>=CRYSTAL_HANDOFF.settle&&serviceState.transition<=CRYSTAL_HANDOFF.resolveStart,glassTransmission:model.glass.transmission,fluid:field.diagnostics,rendererCount:field.diagnostics.solver==='disabled'?1:2}},
 diagnostics(){return {ready:true,visible,reduced,low,time:phase.time,finished,started,replays,timelineCount:gsap.getTweensOf(phase).length,frames,fluidEnergy:field.energy,fluid:field.diagnostics,hovered,hoverWeights:Array.from(weights),source:'Crystal_C_Model.glb',meshCount:model.facets.length*2,facetCount:model.facets.length,triangles:model.triangles,bounds:[model.sourceBounds.min.toArray(),model.sourceBounds.max.toArray()],repairedBounds:[model.repairedBounds.min.toArray(),model.repairedBounds.max.toArray()],openEdges:model.openEdges,originalOpenEdges:model.originalOpenEdges,repairs:model.repairs,dispersion:model.glass.dispersion,transmission:model.glass.transmission,rotation:model.root.rotation.toArray(),camera:camera.position.toArray(),viewport:renderer.getViewport(new T.Vector4()).toArray(),buffer:renderer.getDrawingBufferSize(new T.Vector2()).toArray(),restError:Math.max(...model.facets.map(f=>f.pivot.position.distanceTo(f.rest)+f.pivot.quaternion.angleTo(f.quaternion))),rigidPairs:model.facets.every(f=>[f.front,f.side].every((m,i)=>m.matrix.toArray().every((v,j)=>Math.abs(v-f.childMatrices[i][j])<1e-9))),facets:model.facets.map(f=>({name:f.name,position:f.pivot.position.toArray(),rest:f.rest.toArray(),screen:f.front.localToWorld(new T.Vector3().fromBufferAttribute(f.front.geometry.attributes.position,0).add(new T.Vector3().fromBufferAttribute(f.front.geometry.attributes.position,1)).add(new T.Vector3().fromBufferAttribute(f.front.geometry.attributes.position,2)).divideScalar(3)).project(camera).toArray()}))}},
 dispose(){if(disposed)return;disposed=true;stop();timeline.kill();observer.disconnect();events.abort();field.dispose();products?.dispose();services?.dispose();serviceMedia?.dispose();model.dispose();env.dispose();backdrop.dispose();renderer.dispose()}};
}
