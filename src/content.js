import * as T from 'three';
import {CONFIG} from './config.js';
/** Display content only. Environment, robot materials and choreography stay untouched. */
export function createContent(logo,media){
 const scene=new T.Scene();scene.background=new T.Color(CONFIG.colors.black);
 const camera=new T.OrthographicCamera(-1,1,1,-1,.1,30);camera.position.z=10;
 const identity=new T.Mesh(new T.PlaneGeometry(1,.438),new T.MeshBasicMaterial({map:logo,transparent:true,toneMapped:false}));scene.add(identity);
 let finishPoster;const ready=new Promise(resolve=>finishPoster=resolve);
 const poster=new T.TextureLoader().load(new URL('../public/assets/tunnel-poster.jpg',import.meta.url).href,finishPoster,undefined,finishPoster);poster.colorSpace=T.SRGBColorSpace;
 const uniforms={clip:{value:media.texture},still:{value:poster},decoded:{value:0},crop:{value:new T.Vector2(9/16,1)}};
 const panel=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({uniforms,toneMapped:false,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D clip;uniform sampler2D still;uniform float decoded;uniform vec2 crop;varying vec2 v;void main(){vec2 p=(v-.5)*crop+.5;gl_FragColor=mix(texture2D(still,p),sRGBTransferEOTF(texture2D(clip,p)),decoded);\n#include <colorspace_fragment>\n}'}));panel.visible=false;scene.add(panel);
 function update(time,aspect,projectedHeight=1){
 // Decode/play during dissolution, then replace the identity only once the solid
 // screen is entirely gone. Particle-to-solid fill therefore exposes live video.
 if(time>=CONFIG.timing.dissolve)media.start();
 const active=time>=CONFIG.timing.swarm;identity.visible=!active;panel.visible=active;uniforms.decoded.value=media.ready?1:0;
 const ratio=media.video.videoWidth/media.video.videoHeight||16/9;
 // Expand the sampled field only as the physical square passes beyond the viewport.
 // Both axes share one scale: no distortion or clamped bands on the visible panel.
 const scale=time>=CONFIG.timing.enterScreen?Math.min(Math.max(1,aspect),ratio,Math.max(1,projectedHeight)):1;
 uniforms.crop.value.set(scale/ratio,scale);}
 return {scene,camera,identity,ready,get mode(){return identity.visible?'logo':(media.ready?'video':'poster')},dispose(){poster.dispose()},resize(){},square(){},update};
}
