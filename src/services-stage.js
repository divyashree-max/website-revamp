import {SERVICES,SERVICE_MOTION} from './services-config.js';
import {sampleServices} from './services-timeline.js';
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
/** Native sticky layout; chapter state is a pure function of document scroll. */
export function mountServicesStage(studio,section,preference,signal,onChange){
 const host=section.querySelector('#service-chapters'),status=section.querySelector('.service-status');
 const articles=SERVICES.map((service,index)=>{
  const article=document.createElement('article');article.className='service-chapter';article.id='service-'+service.id;article.setAttribute('aria-labelledby','service-title-'+service.id);
  article.style.setProperty('--copy-x',service.layout.x+'%');article.style.setProperty('--copy-y',service.layout.y+'%');article.style.setProperty('--copy-width',service.layout.width+'%');
  const copy=document.createElement('div');copy.className='service-copy';const heading=document.createElement('h2');heading.id='service-title-'+service.id;heading.textContent=service.title;const description=document.createElement('p');description.textContent=service.description;
  const action=document.createElement(service.destination?'a':'button');action.className='service-explore';action.textContent='Explore more';action.setAttribute('aria-label','Explore '+service.title);if(service.destination)action.href=service.destination;else{action.type='button';action.addEventListener('click',()=>{status.textContent=`${service.title}: the Explore more destination has not been supplied.`;status.classList.remove('sr-only');},{signal})}
  copy.append(heading,description,action);article.append(copy);host.append(article);return article;
 });
 let frame=0,disposed=false,state={transition:0,chapter:0,index:0,visible:false,mobile:false},lastIndex=-1;
 function measure(){frame=0;if(disposed||studio.hidden)return;
  const viewport=innerHeight,c=studio.getBoundingClientRect(),r=section.getBoundingClientRect(),mobile=innerWidth<=900,transition=clamp(-c.top/viewport);
  const chapter=Math.max(0,Math.min(5,mobile?(-r.top)/(viewport*.95):(-r.top)/(viewport*SERVICE_MOTION.chapterViewport))),timeline=sampleServices(chapter,preference.matches),index=timeline.index,visible=c.top<viewport&&c.bottom>0;
  const arrival=smooth((transition-.94)/.06);
  for(let i=0;i<articles.length;i++){
   const opacity=mobile?1:timeline.from===timeline.to?(i===index?1:0):i===timeline.from?timeline.textOut:i===timeline.to?timeline.textIn:0;
   articles[i].style.setProperty('--chapter-opacity',String(opacity*arrival));articles[i].style.setProperty('--chapter-y',`${i===timeline.from?-8*(1-opacity):12*(1-opacity)}px`);
   articles[i].inert=!mobile&&(opacity<.15||arrival<.9);articles[i].setAttribute('aria-hidden',String(!mobile&&opacity<.01));
  }
  studio.style.setProperty('--c-copy-opacity',String(1-smooth(transition/.3)));
  studio.querySelector('.crystal-replay').hidden=transition>.3;
  document.body.classList.toggle('is-services',transition>.45);section.dataset.active=SERVICES[index].id;
  state={transition,chapter,index,timeline,visible,mobile};if(index!==lastIndex){lastIndex=index;document.dispatchEvent(new Event('cursor-reset'))}onChange(state);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(measure)}
 window.addEventListener('scroll',schedule,{passive:true,signal});window.addEventListener('resize',schedule,{passive:true,signal});preference.addEventListener('change',schedule,{signal});
 signal.addEventListener('abort',()=>{disposed=true;cancelAnimationFrame(frame)},{once:true});
 return {measure,schedule,get state(){return state},services:SERVICES};
}
