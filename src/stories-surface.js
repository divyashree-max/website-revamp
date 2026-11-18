import * as T from 'three';
import {STORY_COMPOSITION} from './stories-config.js';
import {surfacePoint} from './stories-orbit.js';
import {createStoryDeformation} from './stories-deformation.js';
import {createStoryCaption,clipStorySurface} from './stories-caption.js';

/** One canvas; independent deformable surfaces, immutable video UVs and path poses. */
export function createStoriesSurface(host,cards,stories,signal,wake) {
 let renderer,disposed=false,width=0,height=0,layout=null,active=false,projectionDirty=false,lastDraw=0,lastTransitionProgress=null;
 try { renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'}); }
 catch { return null; }
 const canvas=renderer.domElement;canvas.className='stories-surface';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
 renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NoToneMapping;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,1,1,10000),deformation=createStoryDeformation(cards.length);
 const maskCanvas=document.createElement('canvas');maskCanvas.width=256;maskCanvas.height=320;
 const ctx=maskCanvas.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,256,320);ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(0,0,256,320,3);ctx.fill();
 const mask=new T.CanvasTexture(maskCanvas),loader=new T.TextureLoader(),resources=[];
 const tokens=getComputedStyle(host),fontFamily=tokens.getPropertyValue('--font-interface').trim()||tokens.fontFamily,ink=tokens.getPropertyValue('--ink').trim()||'#fffbed';
 function crop(texture,image,i){
  const iw=image.videoWidth||image.naturalWidth,ih=image.videoHeight||image.naturalHeight;if(!iw||!ih)return;
  const ratio=STORY_COMPOSITION.ratio,source=iw/ih,focal=stories[i].focalPoint.split(' ').map(v=>parseFloat(v)/100);
  const rx=Math.min(1,ratio/source),ry=Math.min(1,source/ratio);
  texture.repeat.set(rx,ry);texture.offset.set((1-rx)*focal[0],(1-ry)*(1-focal[1]));texture.colorSpace=T.SRGBColorSpace;
 }
 const meshes=cards.map((card,i)=>{
  // UVs/index never change. Only local surface positions/normals respond to speed.
  const geometry=new T.PlaneGeometry(1,1/STORY_COMPOSITION.ratio,40,8);
  geometry.attributes.position.setUsage(T.DynamicDrawUsage);geometry.attributes.normal.setUsage(T.DynamicDrawUsage);
  // Flat bounds conservatively enclose every supported bend; no stale frustum culling.
  geometry.boundingSphere=new T.Sphere(new T.Vector3(),Math.hypot(.5,.5/STORY_COMPOSITION.ratio));
  const video=card.querySelector('video'),film=new T.VideoTexture(video);film.colorSpace=T.SRGBColorSpace;
  const poster=loader.load(stories[i].poster,texture=>{if(disposed){texture.dispose();return}crop(texture,texture.image,i);wake()});poster.colorSpace=T.SRGBColorSpace;
  const material=new T.MeshBasicMaterial({map:poster,alphaMap:mask,alphaTest:.5,toneMapped:false,side:T.FrontSide});
  const clear={value:0};material.onBeforeCompile=shader=>clipStorySurface(shader,clear);
  const mesh=new T.Mesh(geometry,material);scene.add(mesh);
  const caption=createStoryCaption(mesh,mask,stories[i].title,fontFamily,ink,clear),open=card.querySelector('.story-open');
  open.addEventListener('pointerenter',()=>{caption.setHover(true);wake()},{signal});open.addEventListener('pointerleave',()=>{caption.setHover(false);wake()},{signal});
  open.addEventListener('focus',()=>{caption.setFocus(true);wake()},{signal});open.addEventListener('blur',()=>{caption.setFocus(false);wake()},{signal});
  video.addEventListener('loadedmetadata',()=>{crop(film,video,i);wake()},{signal});
  for(const event of ['loadeddata','playing','pause','seeked','error'])video.addEventListener(event,wake,{signal});
  resources.push({film,poster,material,video,card,geometry,caption,clear,bend:0});return mesh;
 });
 document.fonts.ready.then(()=>{if(!disposed){resources.forEach((r,i)=>r.caption.paint(layout?.cards[i].width||260,true));wake()}});
 const v=new T.Vector3(),direction=new T.Vector3(),euler=new T.Euler(0,0,0,'ZYX');
 function update(next,isActive){
  layout=next;active=isActive;canvas.hidden=!active;
  if(!active){deformation.reset();lastDraw=0;return}
  projectionDirty=true;
  if(width!==layout.width||height!==layout.height){
   width=layout.width;height=layout.height;renderer.setSize(width,height,false);
   camera.aspect=width/height;camera.fov=2*Math.atan(height/(2*layout.perspective))*180/Math.PI;
   camera.position.z=layout.perspective;camera.updateProjectionMatrix();camera.updateMatrixWorld();
  }
  layout.cards.forEach((pose,i)=>{
   const mesh=meshes[i];mesh.visible=pose.frontVisible;
   mesh.position.set(pose.x,-pose.y,pose.z);
   if(pose.alignment===1)mesh.quaternion.identity();else{euler.set(-pose.pitch*Math.PI/180,pose.yaw*Math.PI/180,-pose.roll*Math.PI/180,'ZYX');mesh.quaternion.setFromEuler(euler)}mesh.scale.setScalar(pose.width);mesh.updateMatrixWorld();
   const resource=resources[i],map=resource.card.hasAttribute('data-decoded')&&resource.video.readyState>=2?resource.film:resource.poster;
   resource.clear.value=pose.clear??0;
   resource.caption.paint(pose.width);
   if(resource.material.map!==map){resource.material.map=map;resource.material.needsUpdate=true}
  });
 }
 function deform(i,bend){
  const r=resources[i];if(r.bend===bend)return false;r.bend=bend;
  const {position,normal,uv}=r.geometry.attributes;
  for(let k=0;k<position.count;k++){
   const s=uv.getX(k),t=1-uv.getY(k),[x,y,z]=surfacePoint(s,t,1,1/STORY_COMPOSITION.ratio,bend),angle=(s-.5)*bend;
   position.setXYZ(k,x,-y,z);normal.setXYZ(k,Math.sin(angle),0,Math.cos(angle));
  }
  position.needsUpdate=true;normal.needsUpdate=true;return true;
 }
 function projectHitRegion(pose,i,bend){
  const mesh=meshes[i],top=[],bottom=[];direction.copy(camera.position).sub(mesh.position);
  for(let k=0;k<40&&pose.frontVisible;k++){
   const angle=((k+.5)/40-.5)*bend;
   v.set(Math.sin(angle),0,Math.cos(angle)).applyQuaternion(mesh.quaternion);
   if(v.dot(direction)<=0)continue;
   const bottomV=1-(pose.clear??0);
   for(const [s,out,y] of [[k/40,top,0],[(k+1)/40,top,0],[k/40,bottom,bottomV],[(k+1)/40,bottom,bottomV]]){
    const [x,yy,z]=surfacePoint(s,y,pose.width,pose.height,bend);
    v.set(x,-yy,z).applyQuaternion(mesh.quaternion).add(mesh.position).project(camera);
    // Match the CSS-scaled video without changing the approved camera/path width.
    out.push([(v.x+1)*layout.cssWidth/2,(1-v.y)*layout.cssHeight/2]);
   }
  }
  let outline=[...top,...bottom.reverse()];
  pose.hitOutline=outline;
  const left=outline.length?Math.min(...outline.map(p=>p[0])):0,upper=outline.length?Math.min(...outline.map(p=>p[1])):0;
  const right=outline.length?Math.max(...outline.map(p=>p[0])):0,lower=outline.length?Math.max(...outline.map(p=>p[1])):0;
  const button=cards[i].querySelector('.story-open');
  button.style.left=left+'px';button.style.top=upper+'px';button.style.width=(right-left)+'px';button.style.height=(lower-upper)+'px';
  button.style.clipPath=outline.length?'polygon('+outline.map(([x,y])=>(x-left)+'px '+(y-upper)+'px').join(',')+')':'polygon(0 0,0 0,0 0)';
  cards[i].inert=!pose.frontVisible||!outline.length;
 }
 function draw(now=performance.now()){
  if(!active||!layout||disposed)return;
  // Preserve the approved velocity response in Stories. During convergence a
  // stationary scroll holds even the surface pose while its video keeps playing.
  const progress=layout.transition?.progress;
  const states=progress===undefined||progress!==lastTransitionProgress?deformation.step(layout,now):deformation.states;
  lastTransitionProgress=progress;
  const dt=lastDraw?Math.min(.05,Math.max(0,(now-lastDraw)/1000)):1/60;lastDraw=now;
  layout.cards.forEach((pose,i)=>{const bend=states[i].bend*(1-pose.alignment)*(pose.bendWeight??1),changed=deform(i,bend);if(projectionDirty||changed)projectHitRegion(pose,i,bend);resources[i].caption.step(i===layout.active?pose.alignment:0,dt,pose.frontVisible,pose.captionWeight??1)});
  projectionDirty=false;renderer.render(scene,camera);
 }
 function dispose(){if(disposed)return;disposed=true;resources.forEach(r=>{r.caption.dispose();r.film.dispose();r.poster.dispose();r.material.dispose();r.geometry.dispose()});mask.dispose();renderer.dispose();canvas.remove()}
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();canvas.hidden=true;host.closest('section').dataset.surfaceFailed='';wake()},{signal});
 canvas.addEventListener('webglcontextrestored',()=>{delete host.closest('section').dataset.surfaceFailed;wake()},{signal});signal.addEventListener('abort',dispose,{once:true});
 const settling=()=>active&&((!layout?.transition&&deformation.settling)||resources.some(r=>r.caption.settling));
 return {update,draw,dispose,get settling(){return settling()},get diagnostics(){return {
  rendererCount:1,triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,dpr:renderer.getPixelRatio(),settling:settling(),
  cards:resources.map((r,i)=>({bend:r.bend,speed:deformation.states[i].speed,velocity:[...deformation.states[i].velocity],flatness:Math.max(...Array.from({length:r.geometry.attributes.position.count},(_,k)=>Math.abs(r.geometry.attributes.position.getZ(k)))),uvVersion:r.geometry.attributes.uv.version,uvTransform:[...r.film.repeat.toArray(),...r.film.offset.toArray()],position:meshes[i].position.toArray(),quaternion:meshes[i].quaternion.toArray(),caption:r.caption.diagnostics}))
 }}};
}
