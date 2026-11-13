import {SERVICE_MOTION} from './services-config.js';
const clamp=n=>Math.max(0,Math.min(1,n));
export const serviceEase=n=>{n=clamp(n);return n*n*n*(n*(n*6-15)+10)};
/** The final viewport of the C spacer is exclusively the reversible handoff. */
export function sampleStudioHandoff(servicesTop,viewport){
 const transition=clamp((viewport-servicesTop)/viewport);
 return {transition,stage:transition===0?'c-presentation':transition===1?'services-presentation':'handoff'};
}
/** One scroll sample supplies joint interpolation, HTML visibility and LED blending. */
export function sampleServices(chapter,reduced=false){
 const raw=Math.max(0,Math.min(5,chapter)),from=Math.min(4,Math.floor(raw)),to=from+1;
 const u=clamp((raw-from-SERVICE_MOTION.travelStart)/(SERVICE_MOTION.travelEnd-SERVICE_MOTION.travelStart)),mix=serviceEase(u),index=mix<.5?from:to;
 const mediaMix=serviceEase((u-.4)/.2),textOut=1-serviceEase((u-.4)/.1),textIn=serviceEase((u-.5)/.1);
 if(reduced)return {from:index,to:index,mix:0,index,poseValue:index,mediaMix:0,textOut:1,textIn:0,travel:0,reading:true};
 return {from,to,mix,index,poseValue:from+mix,mediaMix,textOut,textIn,travel:u,reading:u===0||u===1};
}
