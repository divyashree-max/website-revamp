import {PRODUCTS,PRODUCT_STORY,productEase} from './products-config.js';
/** Native scroll is the only product timeline. No wheel interception or queued tween. */
export function mountProductsStage(studio,preference,signal,onChange){
 const section=studio.querySelector('#products-section'),host=section.querySelector('.products-pin');
 const articles=PRODUCTS.map(p=>{const a=document.createElement('article');a.className='product-chapter';a.id='product-'+p.id;a.setAttribute('aria-labelledby','product-name-'+p.id);a.innerHTML=`<img loading="lazy" decoding="async" class="product-poster" src="${p.poster}" alt="${p.name} installation, complete assembled view"><div class="product-copy"><h2 id="product-name-${p.id}">${p.name}</h2><p>${p.description}</p></div>`;host.append(a);return a});
 let frame=0,state={entry:0,index:0,local:0,visible:false,mobile:false},disposed=false;
 function measure(){frame=0;if(disposed||studio.hidden)return;const r=section.getBoundingClientRect(),h=innerHeight,simple=preference.matches,mobile=innerWidth<=900;let index,local,chapter;
  if(simple){const sample=Math.max(0,Math.min(3.999,-r.top/h));index=Math.floor(sample);local=1;chapter=index;}else{chapter=Math.max(0,Math.min(3.999,-r.top/(h*PRODUCT_STORY.chapterViewport)));index=Math.floor(chapter);local=chapter-index}
  const entry=Math.max(0,Math.min(1,1-r.top/h)),visible=r.top<h*2&&r.bottom>0;
  state={entry,index,local,chapter,visible,mobile,simple,near:r.top<h*3&&r.bottom>0};
  for(let i=0;i<articles.length;i++){const opacity=simple?1:i===index?productEase((entry-.55)/.45)*(index===3?1:1-productEase((local-.94)/.06)):0;articles[i].style.setProperty('--product-opacity',opacity);articles[i].style.setProperty('--product-copy-y',(simple?0:(1-productEase(local/.25))*16)+'px');articles[i].inert=!simple&&opacity<.1;articles[i].setAttribute('aria-hidden',String(!simple&&opacity<.01));}
  section.toggleAttribute('data-product-active',entry>=.5);
  document.body.classList.toggle('is-products',entry>=.5&&r.bottom>0);onChange(state);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(measure)}
 window.addEventListener('scroll',schedule,{passive:true,signal});window.addEventListener('resize',schedule,{passive:true,signal});preference.addEventListener('change',schedule,{signal});
 signal.addEventListener('abort',()=>{disposed=true;cancelAnimationFrame(frame);document.body.classList.remove('is-products')},{once:true});return {measure,schedule,get state(){return state},section};
}
