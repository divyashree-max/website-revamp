import {STORIES,STORY_ORBIT,clamp,sampleStoryOrbit} from './stories-config.js';
import {layoutStoryOrbit,storyFocalU} from './stories-orbit.js';
import {createStoriesMedia} from './stories-media.js';
import {createStoryPlayer} from './story-player.js';
import {createStoriesSurface} from './stories-surface.js';
/** Native scroll is the sole choreography clock. Video playback has its own normal media clock. */
export function mountStoriesStage(studio,preference,signal,onChange){
 const section=studio.querySelector('#stories-section'),pin=section.querySelector('.stories-pin'),space=section.querySelector('.stories-space'),world=section.querySelector('.stories-world'),ring=section.querySelector('.stories-ring'),headline=section.querySelector('.stories-title'),headingLines=[...section.querySelectorAll('.story-heading-line')],controls=section.querySelector('.stories-controls'),status=section.querySelector('.stories-status');
 section.querySelector('.stories-kicker')?.remove();section.querySelector('.stories-description')?.remove();controls.replaceChildren();
 const menu=document.createElement('details');menu.className='stories-project-menu';const summary=document.createElement('summary');summary.textContent='Choose a story';const choices=document.createElement('div');choices.className='stories-choices';menu.append(summary,choices);const pause=document.createElement('button');pause.type='button';pause.className='stories-pause';controls.append(menu,pause);
 let state={entry:0,index:0,visible:false,simple:false},frame=0,disposed=false,measuring=false,dirty=true,surface;
 const cards=STORIES.map((story,index)=>{
  const article=document.createElement('article');article.className='story-card';article.dataset.story=story.id;article.setAttribute('aria-labelledby','story-title-'+story.id);
  const front=document.createElement('div');front.className='story-front';const film=document.createElement('div');film.className='story-film';const poster=new Image();poster.src=story.poster;poster.alt='';poster.loading='lazy';poster.decoding='async';poster.style.objectFit=story.fit;poster.style.objectPosition=story.focalPoint;film.append(poster);
  const title=document.createElement('h3');title.className='story-caption';title.id='story-title-'+story.id;title.textContent=story.title;front.append(film,title);
  const open=document.createElement('button');open.type='button';open.className='story-open';open.dataset.cursor=story.cursor;open.setAttribute('aria-label','Play '+story.title+' story');open.setAttribute('aria-haspopup','dialog');open.addEventListener('click',()=>player.open(story,open),{signal});front.append(open);
  const copy=document.createElement('p');copy.className='story-static-description';copy.textContent=story.description;
  const play=document.createElement('button');play.type='button';play.className='story-inline-play';play.textContent='Play film';play.addEventListener('click',()=>{state.index=index;media.update([index],index,true);media.toggle(index);updateControls()},{signal});
  article.append(front,copy,play);ring.append(article);
  const choice=document.createElement('button');choice.type='button';choice.textContent=story.title;choice.addEventListener('click',()=>{go(index);menu.open=false;measure();cards[index].querySelector('.story-open').focus({preventScroll:true})},{signal});choices.append(choice);return article;
 });
 const media=createStoriesMedia(cards,STORIES,signal,()=>{if(!measuring)updateControls()});
 surface=createStoriesSurface(world,cards,STORIES,signal,schedule);section.toggleAttribute('data-surface-failed',!surface);
 const player=createStoryPlayer({signal,onOpen(){menu.open=false;media.suspend(true)},onClose(){media.suspend(false);schedule()}});
 function updateControls(){pause.textContent=media.paused?'Play films':'Pause films';pause.setAttribute('aria-pressed',String(media.paused));cards.forEach((card,i)=>{const play=card.querySelector('.story-inline-play');play.textContent=media.isPlaying(i)?'Pause film':'Play film';play.setAttribute('aria-label',`${media.isPlaying(i)?'Pause':'Play'} ${STORIES[i].title} film`)});status.textContent=media.failed?'Film unavailable. Project poster is displayed.':media.paused?'Project films paused.':'';}
 function go(index){if(preference.matches)cards[index].scrollIntoView({block:'center',behavior:'instant'});else scrollTo({top:section.getBoundingClientRect().top+scrollY+(STORY_ORBIT.enterEnd+index*STORY_ORBIT.chapterViewport+((state.layout?.focalU??storyFocalU())-STORY_ORBIT.focus)*STORY_ORBIT.chapterViewport/STORY_ORBIT.spacing)*innerHeight,behavior:'instant'})}
 menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.open=false;summary.focus()}},{signal});pause.addEventListener('click',()=>media.toggle(),{signal});
 function measure(){
  if(disposed||player.isOpen)return;if(studio.hidden){state={...state,entry:0,visible:false};media.update([],state.index,preference.matches);document.body.classList.remove('is-stories');onChange(state);return}
  measuring=true;const rect=section.getBoundingClientRect(),pinRect=pin.getBoundingClientRect(),width=innerWidth,height=innerHeight,simple=preference.matches||section.hasAttribute('data-surface-failed'),inView=rect.top<height*.8&&rect.bottom>height*.15,entry=clamp(1-rect.top/height),scroll=-rect.top/height,sample=sampleStoryOrbit(scroll);section.toggleAttribute('data-simple',simple);
  let index=0,visibleIndices=[],layout;
  if(simple){const bounds=cards.map(card=>card.getBoundingClientRect());index=bounds.reduce((best,r,i)=>Math.abs(r.top+r.height*.5-height*.5)<Math.abs(bounds[best].top+bounds[best].height*.5-height*.5)?i:best,0);visibleIndices=bounds.flatMap((r,i)=>r.bottom>140&&r.top<height-100?[i]:[])}
  else{const worldRect=world.getBoundingClientRect(),logoRect=document.querySelector('.brand').getBoundingClientRect();layout=layoutStoryOrbit(width,height,sample,pinRect.top,{targetX:(logoRect.left+logoRect.width/2-worldRect.left)/worldRect.width,cssWidth:world.clientWidth,cssHeight:world.clientHeight});index=layout.active;if(inView)visibleIndices=layout.cards.filter(card=>card.frontVisible).map(card=>card.index)}
  state={...sample,entry,index,visible:inView,simple,layout};section.dataset.active=STORIES[index].id;section.dataset.phase=simple?'static':scroll<STORY_ORBIT.headlineHold?'headline':scroll<STORY_ORBIT.enterEnd?'entering':scroll<STORY_ORBIT.exitStart?'revolving':'exiting';
  section.style.setProperty('--stories-height',STORY_ORBIT.stageViewports*100+'svh');section.style.setProperty('--stories-tail',STORY_ORBIT.releaseTail*100+'svh');headline.style.opacity=simple?'1':String(sample.headline);
  headline.style.transform=simple?'none':'translate(-50%,-50%)';
  headingLines.forEach((line,i)=>{const reveal=simple?1:sample.lineReveal[i];line.style.transform=`translate3d(0,${(1-reveal)*112}%,0)`;line.parentElement.style.overflow=reveal>=.999?'visible':'clip'});
  if(layout){world.style.top='0';headline.style.top=(48-35*(1-entry))+'%';headline.style.zIndex='0';layout.cards.forEach((pose,i)=>{const card=cards[i];card.style.zIndex=String(200+Math.round(pose.z));card.style.visibility=pose.frontVisible?'visible':'hidden';card.inert=!pose.frontVisible;card.toggleAttribute('data-foreground',i===index)});surface?.update(layout,inView);surface?.draw()}else {surface?.update(null,false);cards.forEach(card=>{card.inert=false;card.style.visibility='visible'})}
  [...choices.children].forEach((button,i)=>button.setAttribute('aria-current',String(i===index)));controls.inert=!inView;media.update(visibleIndices,index,simple);updateControls();measuring=false;document.body.classList.toggle('is-stories',entry>.45&&rect.bottom>0);onChange(state);
 }
 function tick(){frame=0;if(disposed)return;if(dirty){dirty=false;measure()}else if(state.visible&&!state.simple&&!player.isOpen)surface?.draw();if(!frame&&!document.hidden&&state.visible&&!state.simple&&!player.isOpen&&(surface?.settling||cards.some(card=>{const video=card.querySelector('video');return !video.paused})))frame=requestAnimationFrame(tick)}
 function schedule(){dirty=true;if(!frame&&!disposed)frame=requestAnimationFrame(tick)}
 document.addEventListener('visibilitychange',schedule,{signal});
 window.addEventListener('scroll',schedule,{passive:true,signal});window.addEventListener('resize',schedule,{passive:true,signal});preference.addEventListener('change',schedule,{signal});signal.addEventListener('abort',()=>{disposed=true;cancelAnimationFrame(frame);media.dispose();document.body.classList.remove('is-stories')},{once:true});
 return {measure(){dirty=true;schedule()},schedule,section,get state(){return state},get diagnostics(){return {...state,active:STORIES[state.index].id,media:media.diagnostics,surface:surface?.diagnostics,cardCount:cards.length,timelines:0,playerOpen:player.isOpen}}};
}
