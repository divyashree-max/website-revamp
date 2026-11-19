import * as T from 'three';

// A bounded product stage needs one directional map, not cascades or another renderer.
export const PRODUCT_SHADOWS=Object.freeze({
 revealStart:.58,revealEnd:.70,mapSize:2048,mobileMapSize:1024,hz:30,mobileHz:20,
 profiles:[{reach:.65},{reach:1.1},{reach:.25},{reach:.45}],
 floorOpacity:1,groundClearance:.00025,
});

export function createProductShadows(renderer,scene,key){
 const config=PRODUCT_SHADOWS,ground=new T.MeshPhysicalMaterial({
  name:'Near-black matte studio floor',color:0x282828,roughness:1,metalness:0,
  envMapIntensity:0,specularIntensity:0,transparent:true,depthWrite:false,opacity:0,
 });
 const footprint={value:new T.Vector2(1,1)};
 ground.onBeforeCompile=shader=>{
  shader.uniforms.productFootprint=footprint;
  shader.vertexShader='varying vec2 productFloorPosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
   '#include <begin_vertex>\nproductFloorPosition=position.xy;');
  shader.fragmentShader='varying vec2 productFloorPosition;\nuniform vec2 productFootprint;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <shadowmap_pars_fragment>',
   '#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>');
  // The silhouette comes from the GLB depth map. Only the filter widens away from contact.
  const softness='mix(0.65,28.0,smoothstep(0.0,0.7,length(max(abs(productFloorPosition)-productFootprint,vec2(0.0)))))';
  // The softboxes supply the floor's illumination and physical distance falloff.
  // The aligned directional is a shadow proxy here: it must not light an infinite
  // plane uniformly, which would produce a visible grey horizon.
  const lighting=T.ShaderChunk.lights_fragment_begin.replace(
   'getDirectionalLightInfo( directionalLight, directLight );',
   'getDirectionalLightInfo( directionalLight, directLight );\ndirectLight.color = vec3(0.0);').replace(
   'irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );','');
  shader.fragmentShader=shader.fragmentShader.replace('#include <shadowmask_pars_fragment>',
   T.ShaderChunk.shadowmask_pars_fragment.replace('directionalLight.shadowRadius,',`directionalLight.shadowRadius * ${softness},`));
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',lighting);
  // r187 uses scene.environmentIntensity when material.envMap is absent. Suppress
  // only the floor's IBL diffuse term, so distant floor tends to unlit black.
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_maps>',
   T.ShaderChunk.lights_fragment_maps.replace('iblIrradiance += getIBLIrradiance( geometryNormal );',''));
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
   // Reuse the geometry depth map to occlude the softbox illumination. No oval,
   // radial alpha, painted light pool or footprint texture is present.
   'outgoingLight *= mix(0.08,1.0,getShadowMask());\n#include <opaque_fragment>');
 };
 ground.customProgramCacheKey=()=> 'product-studio-floor-v3';
 const floor=new T.Mesh(new T.PlaneGeometry(200,200),ground);
 floor.name='Product grounding floor';floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
 floor.visible=false;scene.add(floor);key.castShadow=true;key.shadow.autoUpdate=false;
 key.shadow.bias=-.000015;key.shadow.normalBias=.0005;key.shadow.radius=1;
 let current=null,low=false,elapsed=0,dirty=true,updates=0,renderMs=0,casters=0;
 const lightBounds=new T.Box3(),point=new T.Vector3(),motion=new T.Box3();

 function configure(asset,index){
  current=asset;low=innerWidth<650||navigator.hardwareConcurrency<=4;
  const size=asset.bounds.getSize(new T.Vector3()),center=asset.bounds.getCenter(new T.Vector3());
  const floorY=asset.bounds.min.y-config.groundClearance,height=size.y;
  // Fixed envelope includes all ring orientations / hinges; no frame-to-frame frustum fitting.
  motion.copy(asset.presentationBounds||asset.bounds);
  const reach=config.profiles[index].reach;
  motion.expandByVector(new T.Vector3(reach,.03,reach));
  if(index===1){motion.min.z=Math.min(motion.min.z,-size.y*.55);motion.max.z=Math.max(motion.max.z,size.y*.55)}
  const contact=new T.Box3(),meshBounds=new T.Box3();
  asset.source.updateWorldMatrix(true,true);
  asset.source.traverse(o=>{if(o.isMesh){meshBounds.setFromObject(o);if(meshBounds.min.y<=asset.bounds.min.y+height*.025)contact.union(meshBounds)}});
  const contactSize=contact.isEmpty()?size:contact.getSize(new T.Vector3());
  // Fit only the bounded cast-shadow region, not the entire seamless studio floor.
  const rx=Math.max(2.5,size.x*.5+height*.8),rz=Math.max(2.5,size.z*.5+height*1.1);
  footprint.value.set(Math.max(.1,contactSize.x*.5),Math.max(.1,contactSize.z*.5));
  floor.position.set(center.x,floorY,center.z);
  scene.updateMatrixWorld(true);key.shadow.updateMatrices(key);
  lightBounds.makeEmpty();
  for(const x of [motion.min.x,motion.max.x])for(const y of [motion.min.y,motion.max.y])for(const z of [motion.min.z,motion.max.z])
   lightBounds.expandByPoint(point.set(x,y,z).applyMatrix4(key.shadow.camera.matrixWorldInverse));
  for(const x of [-rx,rx])for(const z of [-rz,rz])
   lightBounds.expandByPoint(point.set(center.x+x,floorY,center.z+z).applyMatrix4(key.shadow.camera.matrixWorldInverse));
  const camera=key.shadow.camera,pad=.15;
  Object.assign(camera,{left:lightBounds.min.x-pad,right:lightBounds.max.x+pad,bottom:lightBounds.min.y-pad,top:lightBounds.max.y+pad,near:Math.max(.05,-lightBounds.max.z-pad),far:-lightBounds.min.z+pad});
  camera.updateProjectionMatrix();
  const resolution=low?config.mobileMapSize:config.mapSize;
  if(key.shadow.mapSize.x!==resolution){key.shadow.map?.dispose();key.shadow.map=null;key.shadow.mapSize.set(resolution,resolution)}
  casters=0;asset.source.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;casters++}});
  elapsed=1;dirty=true;
 }
 return {
  update(asset,index,state,dt){
   const mobile=innerWidth<650||navigator.hardwareConcurrency<=4;
   if(asset!==current||mobile!==low)configure(asset,index);
   ground.opacity=(state.simple?1:T.MathUtils.smoothstep(state.local,config.revealStart,config.revealEnd))*config.floorOpacity;
   floor.visible=ground.opacity>.001&&state.visible!==false;
   elapsed+=Math.max(0,dt);
   if(floor.visible&&(dirty||(!state.simple&&elapsed>=1/(low?config.mobileHz:config.hz)))){dirty=true;elapsed=0}
  },
  render(camera){
   const saved={enabled:renderer.shadowMap.enabled,type:renderer.shadowMap.type,autoUpdate:renderer.shadowMap.autoUpdate,needsUpdate:renderer.shadowMap.needsUpdate};
   renderer.shadowMap.enabled=floor.visible;renderer.shadowMap.type=T.PCFShadowMap;
   renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=dirty&&floor.visible;
   key.shadow.needsUpdate=dirty&&floor.visible;
   const start=performance.now();
   try{renderer.render(scene,camera);if(dirty&&floor.visible){updates++;dirty=false}}
   finally{renderMs=performance.now()-start;Object.assign(renderer.shadowMap,saved)}
  },
  get diagnostics(){
   let frustumContainsModel=true;
   if(current){const b=new T.Box3().setFromObject(current.root),c=key.shadow.camera;
    for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
     point.set(x,y,z).applyMatrix4(c.matrixWorldInverse);
     if(point.x<c.left||point.x>c.right||point.y<c.bottom||point.y>c.top||-point.z<c.near||-point.z>c.far)frustumContainsModel=false;
    }
   }
   return {visible:floor.visible,opacity:ground.opacity,floorY:floor.position.y,baseY:current?.bounds.min.y,casters,updates,mapSize:key.shadow.mapSize.x,hz:low?config.mobileHz:config.hz,bias:key.shadow.bias,normalBias:key.shadow.normalBias,lightPosition:key.position.toArray(),frustumContainsModel,frustum:{left:key.shadow.camera.left,right:key.shadow.camera.right,top:key.shadow.camera.top,bottom:key.shadow.camera.bottom,near:key.shadow.camera.near,far:key.shadow.camera.far},renderMs,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures};
  },
  dispose(){floor.removeFromParent();floor.geometry.dispose();ground.dispose();key.shadow.dispose()},
 };
}
