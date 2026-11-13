// Supply the actual full film here when available. The ambient tunnel is not a showreel.
export const SHOWREEL_SOURCE=null;
export function createShowreel(opener){
 const dialog=document.createElement('dialog');dialog.className='showreel-dialog';dialog.dataset.cursorNative='';dialog.setAttribute('aria-labelledby','showreel-title');
 dialog.innerHTML='<div class="showreel-panel"><button type="button" class="showreel-close" aria-label="Close showreel">Close ×</button><h2 id="showreel-title">Showreel</h2><p class="showreel-pending">The full showreel is pending. Please check back soon.</p></div>';
 const panel=dialog.querySelector('.showreel-panel'),close=dialog.querySelector('button');let video;
 if(SHOWREEL_SOURCE){video=document.createElement('video');video.src=SHOWREEL_SOURCE;video.controls=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label','Craftech360 showreel');dialog.querySelector('p').remove();panel.append(video)}
 document.body.append(dialog);const events=new AbortController();
 function reset(){document.dispatchEvent(new Event('cursor-reset'))}
 function open(){if(dialog.open)return;reset();dialog.showModal();close.focus({preventScroll:true})}
 opener.addEventListener('click',open,{signal:events.signal});close.addEventListener('click',()=>dialog.close(),{signal:events.signal});
 dialog.addEventListener('close',()=>{video?.pause();reset();if(opener.isConnected&&!opener.closest('[hidden]'))opener.focus({preventScroll:true})},{signal:events.signal});
 return {dispose(){events.abort();video?.pause();dialog.remove()}};
}
