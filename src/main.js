import {mountCrystalSection} from './crystal-section.js';
import {createShowreel} from './showreel.js';
﻿import {createMedia} from './media.js';
const root=document.querySelector('#experience'),canvas=document.querySelector('#scene'),landing=document.querySelector('#landing');
const skip=document.querySelector('#skip'),replay=document.querySelector('#replay'),pause=document.querySelector('#pause'),status=document.querySelector('#status');
const preference=matchMedia('(prefers-reduced-motion: reduce)'),abort=new AbortController(),media=createMedia(preference.matches);
const crystalSection=mountCrystalSection(root,landing,preference,abort.signal);
const showreel=createShowreel(document.querySelector('#showreel-trigger'));
let cursor;import('./cursor.js').then(({createContextCursor})=>{if(!abort.signal.aborted)cursor=createContextCursor(root)}).catch(()=>{document.documentElement.classList.remove('has-context-cursor');document.querySelector('.context-cursor')?.remove()});
let experience=null,skipped=false,failed=false;
window.craftechDiagnostics=()=>({state:root.dataset.state,reduced:preference.matches,failed,...experience?.getState(),video:media.diagnostics});
function state(value){root.dataset.state=value;landing.hidden=true;landing.inert=true;skip.hidden=false;document.querySelector('#loading-note').hidden=value!=='loading'&&value!=='waiting';}
function completed(){const focus=document.activeElement===skip;root.dataset.state='hero';root.dataset.ready='';landing.hidden=false;landing.inert=false;skip.hidden=true;skip.disabled=false;document.querySelector('#loading-note').hidden=true;status.textContent='Craftech360 landing ready';if(focus)replay.focus({preventScroll:true});updateVideoControl();}
function updateVideoControl(){pause.setAttribute('aria-pressed',String(media.paused));pause.setAttribute('aria-label',media.paused?'Play background video':'Pause background video');pause.querySelector('.pause-label').textContent=media.paused?'Play video':'Pause video';}
document.addEventListener('background-video-state',updateVideoControl);
skip.addEventListener('click',()=>{skipped=true;if(experience)experience.skip();else skip.disabled=true});
replay.addEventListener('click',()=>{if(!experience||preference.matches){status.textContent='Intro motion is disabled by your reduced-motion preference.';return}state('opening');experience.replay();skip.focus({preventScroll:true});});
pause.addEventListener('click',()=>media.toggle());
preference.addEventListener('change',()=>{media.setReduced(preference.matches);experience?.setReducedMotion(preference.matches)});
for(const button of document.querySelectorAll('[data-pending]'))button.addEventListener('click',()=>{const note=document.querySelector('#pending-message');note.hidden=false;note.textContent=`${button.dataset.pending} is pending implementation.`});
function failure(error){if(failed)return;failed=true;experience?.dispose();experience=null;canvas.hidden=true;media.start();completed();status.textContent='Craftech360 landing ready. 3D introduction unavailable.';console.warn(error.message);}
const watchdog=setTimeout(()=>failure(new Error('Introduction readiness timed out')),45000);
try{const {createExperience}=await import('./experience.js');experience=await createExperience(canvas,{reduced:preference.matches,onState:state,onComplete:completed,onFailure:failure,signal:abort.signal,media});clearTimeout(watchdog);if(failed){experience?.dispose();experience=null}else{root.dataset.ready='';if(skipped)experience.skip();if(experience.getState().hero)completed()}}catch(error){clearTimeout(watchdog);failure(error)}
window.addEventListener('pagehide',()=>{abort.abort();cursor?.dispose();showreel.dispose();experience?.dispose();media.dispose();clearTimeout(watchdog)},{once:true});
