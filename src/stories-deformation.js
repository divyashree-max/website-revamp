import {STORY_COMPOSITION} from './stories-config.js';

/** Surface response only. Never writes path progress, mesh position or rotation. */
export function createStoryDeformation(count=4) {
 const states=Array.from({length:count},()=>({bend:0,speed:0,velocity:Array(6).fill(0),previous:null}));
 let last=null;
 function reset(){last=null;states.forEach(s=>{s.bend=0;s.speed=0;s.velocity.fill(0);s.previous=null})}
 function step(layout,now){
  const elapsed=last===null?0:(now-last)/1000;
  // Hidden tabs / a modal must not integrate a large time step on their return.
  const dt=elapsed>0&&elapsed<.25?elapsed:1/60;last=now;
  const velocityFollow=1-Math.exp(-dt/.075),bendFollow=1-Math.exp(-dt/.11);
  layout.cards.forEach((pose,i)=>{
   const s=states[i];
   // Normalize actual transform movement, so resize alone is not a speed impulse.
   const current=[pose.x/layout.width,pose.y/layout.height,pose.z/layout.perspective,pose.yaw/900,pose.pitch/900,pose.roll/900];
   s.velocity.forEach((v,k)=>{const raw=s.previous?(current[k]-s.previous[k])/dt:0;s.velocity[k]=v+(raw-v)*velocityFollow});
   s.previous=current;s.speed=Math.hypot(...s.velocity);
   const target=STORY_COMPOSITION.bend*(1-Math.exp(-s.speed/.3));
   s.bend+=(target-s.bend)*bendFollow;
   // Exponential tails below 0.01px become exact flat planes; no visible snap.
   if(s.speed<1e-5&&s.bend<1e-5){s.velocity.fill(0);s.speed=0;s.bend=0}
  });
  return states;
 }
 return {step,reset,get settling(){return states.some(s=>s.bend!==0||s.speed!==0)},get states(){return states}};
}
