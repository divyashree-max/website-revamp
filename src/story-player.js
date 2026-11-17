/** Native modal owns focus/inertness. Media suspension preserves the card clock. */
export function createStoryPlayer({signal,onOpen,onClose}) {
 const dialog=document.createElement('dialog');
 dialog.className='showreel-dialog story-player';dialog.dataset.cursorNative='';dialog.setAttribute('aria-labelledby','story-player-title');
 dialog.innerHTML='<div class="showreel-panel"><button type="button" class="showreel-close" aria-label="Close story">Close ×</button><h2 id="story-player-title"></h2><video controls playsinline preload="metadata"></video><button type="button" class="story-play-toggle">Pause story</button><button type="button" class="story-sound" aria-pressed="false">Turn sound on</button><p class="story-player-status" role="status"></p></div>';
 const video=dialog.querySelector('video'),title=dialog.querySelector('h2'),close=dialog.querySelector('.showreel-close'),play=dialog.querySelector('.story-play-toggle'),sound=dialog.querySelector('.story-sound'),status=dialog.querySelector('.story-player-status');
 let opener,scroll=0,overflow='',closed=true,attempt=0;
 function resetCursor(){document.dispatchEvent(new Event('cursor-reset'))}
 function update(){play.textContent=video.paused?'Play story':'Pause story';sound.textContent=video.muted?'Turn sound on':'Mute sound';sound.setAttribute('aria-pressed',String(!video.muted))}
 function start(){const token=++attempt;status.textContent='';video.play()?.catch(()=>{if(dialog.open&&token===attempt){status.textContent='Press Play to watch this story.';update()}})}
 function finish(){if(closed)return;closed=true;attempt++;video.pause();video.muted=true;document.documentElement.style.overflow=overflow;window.scrollTo({top:scroll,behavior:'instant'});dialog.remove();resetCursor();onClose();if(opener?.isConnected)opener.focus({preventScroll:true})}
 function dismiss(){dialog.close();finish()}
 close.addEventListener('click',dismiss,{signal});dialog.addEventListener('close',finish,{signal});
 dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss()},{signal});
 play.addEventListener('click',()=>{if(video.paused)start();else video.pause()},{signal});
 sound.addEventListener('click',()=>{video.muted=!video.muted;update()},{signal});
 for(const event of ['playing','pause','volumechange','ended'])video.addEventListener(event,update,{signal});
 video.addEventListener('error',()=>{status.textContent='This film could not load. Close the player and try again.'},{signal});
 // Native dialog traps document focus; keep the keyboard cycle explicit around media controls.
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[close,video,play,sound],i=controls.indexOf(document.activeElement);if(event.shiftKey&&i===0){event.preventDefault();sound.focus()}else if(!event.shiftKey&&i===controls.length-1){event.preventDefault();close.focus()}},{signal});
 signal.addEventListener('abort',()=>{if(dialog.open)dialog.close();finish();video.removeAttribute('src');video.load();dialog.remove()},{once:true});
 return {get isOpen(){return dialog.open},open(story,button){if(dialog.open)return;opener=button;scroll=scrollY;overflow=document.documentElement.style.overflow;closed=false;onOpen();document.documentElement.style.overflow='hidden';title.textContent=story.title;video.setAttribute('aria-label',story.title+' story');video.muted=true;video.defaultMuted=true;video.poster=story.poster;video.src=story.source;video.load();update();resetCursor();document.body.append(dialog);dialog.showModal();close.focus({preventScroll:true});start()}};
}
