/** Scroll selects visibility, never media time. One element per film, no cloned players. */
export function createStoriesMedia(cards,stories,signal,onChange){
 let visible=new Set(),active=0,reduced=false,userPaused=false,suspended=false,disposed=false;
 const optIn=new Set(),blocked=new Set(),failed=new Set(),loaded=new Set();
 const videos=cards.map((card,i)=>{
  const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;video.preload='none';video.poster=stories[i].poster;video.tabIndex=-1;video.setAttribute('aria-hidden','true');video.style.objectFit=stories[i].fit;video.style.objectPosition=stories[i].focalPoint;card.querySelector('.story-film').append(video);
  video.addEventListener('playing',()=>{if(!wanted(i)){video.pause();return}blocked.delete(i);card.dataset.decoded='';onChange()},{signal});
  video.addEventListener('pause',onChange,{signal});video.addEventListener('error',()=>{failed.add(i);delete card.dataset.decoded;onChange()},{signal});return video;
 });
 function wanted(i){return !disposed&&!suspended&&!document.hidden&&visible.has(i)&&!userPaused&&(!reduced||optIn.has(i))&&!failed.has(i)}
 function load(i,preload='auto'){const video=videos[i];if(!video)return;video.preload=preload;if(!loaded.has(i)){loaded.add(i);video.src=stories[i].source;video.load()}}
 function sync(){
  videos.forEach((video,i)=>{if(!wanted(i))video.pause();else if(!blocked.has(i)){load(i);if(video.paused)video.play()?.catch(()=>{if(!disposed){blocked.add(i);onChange()}})}});
  if(visible.size&&!document.hidden&&!reduced){load((active+1)%4,'auto');load((active+3)%4,'metadata')}onChange();
 }
 function update(indices,index,isReduced){const next=new Set(indices),same=index===active&&reduced===isReduced&&next.size===visible.size&&[...next].every(i=>visible.has(i));if(same)return;visible=next;active=index;reduced=isReduced;sync()}
 function toggle(index=active){if(reduced){if(optIn.has(index)&&!userPaused)optIn.delete(index);else optIn.add(index);userPaused=false}else userPaused=!userPaused;blocked.clear();sync()}
 document.addEventListener('visibilitychange',sync,{signal});
 return {update,toggle,suspend(value){suspended=value;sync()},get paused(){return userPaused||(reduced&&!optIn.has(active))||blocked.has(active)},isPlaying(i){return !videos[i].paused},get failed(){return failed.has(active)},get diagnostics(){return {visible:[...visible],active,reduced,userPaused,blocked:[...blocked],failed:[...failed],videos:videos.map((v,i)=>({id:stories[i].id,time:v.currentTime,duration:v.duration,ready:v.readyState,paused:v.paused,source:v.currentSrc,loaded:loaded.has(i)}))}},dispose(){disposed=true;videos.forEach(video=>{video.pause();video.removeAttribute('src');video.load();video.remove()})}};
}
