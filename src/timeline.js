import {gsap} from 'gsap';
import {CONFIG} from './config.js';
export const STAGES=Object.fromEntries(Object.entries(CONFIG.timing).filter(([name])=>!['total','rotationEnd'].includes(name)));
export function createTimeline(state,onState,onHero,beforeEntry){
 const tl=gsap.timeline({paused:true}).timeScale(CONFIG.playbackRate);
 for(const [name,time]of Object.entries(STAGES))tl.addLabel(name,time).call(()=>{onState(name);if(name==='enterScreen')beforeEntry();if(name==='hero')onHero()},[],time);
 tl.to(state,{motionTime:CONFIG.timing.total,duration:CONFIG.timing.total,ease:'none'},0);return tl;
}
