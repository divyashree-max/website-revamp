const root=document.querySelector('#experience'),canvas=document.querySelector('#scene');
const skip=document.querySelector('#skip'),replay=document.querySelector('#replay'),pause=document.querySelector('#pause'),status=document.querySelector('#status'),fallback=document.querySelector('#fallback');
const media=matchMedia('(prefers-reduced-motion: reduce)');const abort=new AbortController();
let experience=null,skipped=false,failed=false,paused=media.matches;
// Available during loading too; useful when verifying delayed or failed critical assets.
window.craftechDiagnostics=()=>({state:root.dataset.state,reduced:media.matches,failed,...experience?.getState()});
const fallbackImage=fallback.querySelector('img');function missingLogo(){fallbackImage.hidden=true;fallback.querySelector('.fallback-name').hidden=false;}fallbackImage.addEventListener('error',missingLogo);if(fallbackImage.complete&&!fallbackImage.naturalWidth)missingLogo();
function state(value){if(failed)return;root.dataset.state=value;document.querySelector('#loading-note').hidden=value!=='loading'&&value!=='waiting';if(value==='waiting')status.textContent='Preparing the homepage';if(value!=='loading'&&value!=='hero'){skip.hidden=false;replay.hidden=true;pause.hidden=true;document.querySelector('.hero-note').hidden=true;}}
function completed(){const returnFocus=document.activeElement===skip;state('hero');root.dataset.ready='';skip.hidden=true;skip.disabled=false;replay.hidden=false;replay.disabled=!experience;pause.hidden=media.matches||!experience;document.querySelector('.hero-note').hidden=media.matches||failed;status.textContent='Craftech360 interactive hero ready';if(returnFocus)replay.focus({preventScroll:true});}
function failure(error){if(failed)return;failed=true;abort.abort();console.warn('Interactive graphics unavailable; using lightweight hero.',error?.stack||error?.message);experience?.dispose();experience=null;canvas.hidden=true;fallback.hidden=false;completed();root.dataset.state='hero';replay.hidden=true;pause.hidden=true;document.querySelector('#loading-note').hidden=true;document.querySelector('#shell').hidden=true;status.textContent='Craftech360. Lightweight hero ready';clearTimeout(watchdog);}
skip.addEventListener('click',()=>{skipped=true;if(experience)experience.skip();else{skip.disabled=true;status.textContent='Preparing the homepage';}});
replay.addEventListener('click',()=>{if(!experience)return;skipped=false;paused=media.matches;pause.setAttribute('aria-pressed',String(paused));pause.querySelector('.pause-label').textContent=paused?'Resume motion':'Pause motion';fallback.hidden=true;skip.hidden=false;replay.hidden=true;pause.hidden=true;document.querySelector('.hero-note').hidden=true;experience.replay();if(media.matches)completed();else skip.focus({preventScroll:true});});
pause.addEventListener('click',()=>{paused=media.matches||!paused;experience?.pause(paused);pause.setAttribute('aria-pressed',String(paused));pause.querySelector('.pause-label').textContent=paused?'Resume motion':'Pause motion';});
media.addEventListener('change',()=>{paused=media.matches;experience?.setReducedMotion(paused);if(media.matches)skipped=true;pause.hidden=media.matches||failed;pause.setAttribute('aria-pressed',String(paused));pause.querySelector('.pause-label').textContent=paused?'Resume motion':'Pause motion';});
const watchdog=setTimeout(()=>{abort.abort();failure(new Error('Graphics readiness timed out'))},45000);
pause.setAttribute('aria-pressed',String(paused));pause.querySelector('.pause-label').textContent=paused?'Resume motion':'Pause motion';
try{
 const {createExperience}=await import('./experience.js');
 experience=await createExperience(canvas,{reduced:media.matches,onState:state,onComplete:completed,onFailure:failure,signal:abort.signal});
 clearTimeout(watchdog);
 if(failed){experience?.dispose();experience=null;}else if(experience){experience.setReducedMotion(media.matches);root.dataset.ready='';document.querySelector('#loading-note').hidden=!experience.getState().waiting;if(skipped)experience.skip();fallback.hidden=true;if(experience.getState().hero)completed();}
}catch(error){failure(error);}
window.addEventListener('pagehide',()=>{abort.abort();experience?.dispose();clearTimeout(watchdog)},{once:true});
