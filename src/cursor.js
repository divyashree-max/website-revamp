/** Context labels are shared by every cursor target; unknown controls stay neutral. */
export const CURSOR_STATES=Object.freeze({
 showreel:'PLAY SHOWREEL',demo:'LET’S BOOK',intro:'REPLAY INTRO',products:'VIEW PRODUCTS',
 projects:'SEE OUR PROJECTS',about:'MEET CRAFTECH360',contact:'CONNECT WITH US',scroll:'SCROLL TO EXPLORE',
});

export function createContextCursor(root){
 const capability=matchMedia('(hover: hover) and (pointer: fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const events=new AbortController(),signal=events.signal;
 const overlay=document.createElement('div');overlay.className='context-cursor';overlay.setAttribute('aria-hidden','true');
 const ring=document.createElement('div');ring.className='cursor-ring';
 const labels=[0,1].map(()=>{const el=document.createElement('span');el.className='cursor-label';overlay.append(el);return el});overlay.prepend(ring);document.body.append(overlay);
 let targetX=0,targetY=0,x=0,y=0,size=16,frame=0,last=0,visible=false,current='',slot=0,disposed=false;
 function supported(){return capability.matches&&!reduced.matches&&root.dataset.state==='hero'&&!document.querySelector('dialog[open]')}
 function targetAt(element){
  if(!element?.closest||!element.closest('#experience,#landing,#studio-sequence')||!supported())return null;
  if(element.closest('input,textarea,select,video,audio,[contenteditable]:not([contenteditable="false"]),[data-cursor-native],dialog,[role="dialog"]'))return null;
  // Resolve the closest interactive ancestor first: nested icons inherit that control,
  // while unmapped controls never inherit the background action.
  const control=element.closest('button,a,[role="button"],[data-cursor]');
  if(control?.matches(':disabled,[aria-disabled="true"]'))return null;
  return control?.dataset.cursor||'neutral';
 }
 function label(key){if(current===key)return;current=key;overlay.dataset.context=key;
  const text=CURSOR_STATES[key]||'';overlay.dataset.text=String(Boolean(text));
  labels[slot].classList.remove('is-current');slot=1-slot;labels[slot].textContent=text;labels[slot].classList.add('is-current');
 }
 function tick(now){frame=0;if(!visible||disposed)return;
  const dt=Math.min(50,last?now-last:16);last=now;const follow=1-Math.exp(-dt/38),grow=1-Math.exp(-dt/65);
  x+=(targetX-x)*follow;y+=(targetY-y)*follow;const goal=CURSOR_STATES[current]?102:16;size+=(goal-size)*grow;
  overlay.style.transform=`translate3d(${x}px,${y}px,0)`;ring.style.transform=`translate(-50%,-50%) scale(${size/104})`;
  if(Math.abs(targetX-x)+Math.abs(targetY-y)>.08||Math.abs(goal-size)>.05)frame=requestAnimationFrame(tick);
 }
 function wake(){if(!frame){last=0;frame=requestAnimationFrame(tick)}}
 function hide(){visible=false;overlay.classList.remove('is-visible','is-pressed');document.documentElement.classList.remove('has-context-cursor');cancelAnimationFrame(frame);frame=0;current='';overlay.dataset.context='';}
 function resolve(element,snap=false){const key=targetAt(element);if(!key){hide();return}if(!visible||snap){x=targetX;y=targetY;overlay.style.transform=`translate3d(${x}px,${y}px,0)`}visible=true;label(key);overlay.classList.add('is-visible');document.documentElement.classList.add('has-context-cursor');wake()}
 function move(event){if(event.pointerType!=='mouse'){hide();return}targetX=event.clientX;targetY=event.clientY;resolve(event.target)}
 document.addEventListener('pointermove',move,{passive:true,signal});
 document.addEventListener('pointerover',event=>{if(event.pointerType==='mouse'){targetX=event.clientX;targetY=event.clientY;resolve(event.target)}},{passive:true,signal});
 document.addEventListener('pointerout',event=>{if(!event.relatedTarget)hide()},{signal});
 document.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'){hide();return}if(visible)overlay.classList.add('is-pressed')},{signal});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,()=>overlay.classList.remove('is-pressed'),{signal});
 document.addEventListener('keydown',()=>hide(),{signal});window.addEventListener('blur',hide,{signal});document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()},{signal});
 capability.addEventListener('change',hide,{signal});reduced.addEventListener('change',hide,{signal});document.addEventListener('cursor-reset',hide,{signal});
 // Replay, arrival, hidden controls and routing mutations invalidate the previous target.
 const observer=new MutationObserver(()=>{if(!supported())hide();else if(visible)resolve(document.elementFromPoint(targetX,targetY))});
 observer.observe(root,{attributes:true,attributeFilter:['data-state','hidden','inert'],subtree:true});
 return {dispose(){disposed=true;hide();events.abort();observer.disconnect();overlay.remove()}};
}
