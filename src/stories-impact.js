import {clamp,smooth} from './stories-config.js';
import {layoutStoryOrbit} from './stories-orbit.js';

// Recording 3.30–3.90s: surrounding planes clear while still separated;
// the final readable plane and first text line overlap. There is no deck hold.
export const IMPACT=Object.freeze({start:4.05,duration:2.65,stageViewports:8.9});
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10)};
export function sampleImpact(scroll){
 const progress=clamp((scroll-IMPACT.start)/IMPACT.duration);
 return {progress,gather:ease(progress/.55),clear:smooth((progress-.38)/.25),oldTitle:1-smooth(progress/.22),controls:1-smooth(progress/.16)};
}
export function layoutStoriesScene(width,height,sample,pinTop,view){
 const layout=layoutStoryOrbit(width,height,sample,pinTop,view);
 if(sample.scroll<=IMPACT.start)return layout;
 const transition=sampleImpact(sample.scroll),{progress}=transition,target=view.targetX??.5;
 layout.transition=transition;layout.active=3;
 layout.cards=layout.cards.map((path,i)=>{
  const final=i===3,converge=ease(progress/(final?.43:.58)),clear=smooth((progress-[.035,.12,.22,.38][i])/[.23,.24,.23,.25][i]);
  // Continue the authored path underneath the blend, retaining its incoming
  // derivative. Surrounding cards disappear before they can form a central pile.
  const depth=mix(path.z/layout.perspective,final?-.12:-.18+i*.045,converge);
  const cx=mix(path.projectedCenter[0],target+(final?0:[-.24,-.13,.19][i]),converge);
  const cy=mix(path.projectedCenter[1],final?.49+progress*.035+clear*.12:[.35,.61,.37][i],converge);
  return {...path,x:(cx-.5)*width*(1-depth),y:(cy-.5)*height*(1-depth),z:depth*layout.perspective,depth:depth*layout.perspective,yaw:mix(path.yaw,final?0:[-48,-24,34][i],converge),pitch:mix(path.pitch,0,converge),roll:mix(path.roll,0,converge),alignment:path.alignment*(1-converge),bendWeight:1-converge,captionWeight:1-smooth(progress/.13),clear,frontVisible:clear<1,projectedCenter:[cx,cy]};
 });
 return layout;
}
// The first line is readable before the last card clears; subsequent text follows.
export function impactLineReveal(progress,index,count){return ease((progress-(.29+index*.18/Math.max(1,count-1)))/.27)};
