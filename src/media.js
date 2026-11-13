import * as T from 'three';
/** One decoded media source is shared by the LED texture and the HTML landing. */
export function createMedia(reduced){
 const video=document.querySelector('#tunnel-video');
 const texture=new T.VideoTexture(video);texture.colorSpace=T.SRGBColorSpace;
 let ready=false,blocked=false,started=false,userPaused=reduced;
 const notify=()=>document.dispatchEvent(new Event('background-video-state'));
 video.addEventListener('loadeddata',()=>{ready=true;notify()});
 video.addEventListener('error',()=>{blocked=true;notify()});
 video.addEventListener('playing',()=>{blocked=false;notify()});video.addEventListener('pause',notify);
 async function play(){if(userPaused||document.hidden)return;try{await video.play();blocked=false}catch{blocked=true}notify()}
 function start(){if(started)return;started=true;if(!reduced)play()}
 function toggle(){userPaused=!video.paused;if(userPaused)video.pause();else play();notify()}
 function setReduced(value){reduced=value;userPaused=value;if(value)video.pause();else if(started)play();notify()}
 function visibility(){if(document.hidden)video.pause();else if(started&&!userPaused)play()}
 document.addEventListener('visibilitychange',visibility);
 video.load();
 return {video,texture,start,toggle,setReduced,get ready(){return ready||video.readyState>=2},get blocked(){return blocked},get paused(){return video.paused},get diagnostics(){return {ready:video.readyState>=2,blocked,started,paused:video.paused,time:video.currentTime,duration:video.duration,loop:video.loop}},dispose(){document.removeEventListener('visibilitychange',visibility);video.pause();texture.dispose()}};
}
