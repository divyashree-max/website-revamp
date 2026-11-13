import {mountProductsStage} from './products-stage.js';
import {createSectionEntryGate} from './crystal-visibility.js';
import {mountServicesStage} from './services-stage.js';
/** One below-fold studio, one glass model, one fluid layer and the existing shared chrome. */
export function mountCrystalSection(root,landing,preference,signal){
 const section=document.querySelector('#crystal-section'),studio=document.querySelector('#studio-sequence'),services=document.querySelector('#services-section'),explore=document.querySelector('.explore'),brand=document.querySelector('.brand');
 const homeLogo=brand.src,crystalLogo=new URL('../public/assets/craftech360-monochrome.svg',import.meta.url).href,events=new AbortController();
 let api,loading=false,disposed=false,fraction=0,resizeUntil=0,active=false,pendingReplay=false;
 const stage=mountServicesStage(studio,services,preference,events.signal,state=>{
  api?.setServicesState(state);api?.setVisible(state.visible&&root.dataset.state==='hero');
  if(pendingReplay&&state.transition===0){pendingReplay=false;api?.replay()}
  const value=state.visible&&studio.getBoundingClientRect().top<innerHeight*.58;
  if(active!==value){active=value;document.body.classList.toggle('is-crystal',value);brand.src=value?crystalLogo:homeLogo;document.dispatchEvent(new Event('cursor-reset'))}
  const label=state.transition>.5?'Back to crystalline C':value?'Back to home':'Scroll to explore the crystalline C';explore.setAttribute('aria-label',label);explore.querySelector('.arrow').textContent=value?'⌃':'⌄';
 });
 const productsStage=mountProductsStage(studio,preference,events.signal,state=>{api?.setProductsState(state);if(state.near)api?.preloadProducts();if(state.entry>.5){explore.setAttribute('aria-label','Back to services')}});
 const gate=createSectionEntryGate({onEnter(){if(-studio.getBoundingClientRect().top/innerHeight>.08)pendingReplay=true;else api?.replay()},onExit(){pendingReplay=false;if(-studio.getBoundingClientRect().top/innerHeight>.08)api?.finishC();else api?.reset()}});
 async function load(){if(loading||api||disposed)return;loading=true;try{
  const {createCrystalExperience}=await import('./crystal-experience.js');if(disposed)return;
  api=await createCrystalExperience(studio.querySelector('#crystal-canvas'),section,{signal:events.signal,reduced:preference.matches});if(disposed){api.dispose();return}
  api.setProductsState(productsStage.state);api.setServicesState(stage.state);stage.measure();productsStage.measure();if(gate.state.inside&&!pendingReplay)api.replay();api.preloadServices();
 }catch(error){if(disposed)return;section.dataset.failed='';studio.dataset.failed='';studio.querySelector('#crystal-canvas').hidden=true;studio.querySelector('.crystal-replay').hidden=true;section.querySelector('.crystal-status').textContent='Static crystalline C. Interactive rendering unavailable.';console.warn('Crystal section fallback:',error.message)}finally{loading=false}}
 const preload=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))load()},{rootMargin:'350px'});preload.observe(studio);
 const viewport=new IntersectionObserver(entries=>{for(const e of entries){fraction=e.isIntersecting?e.intersectionRect.height/Math.min(e.boundingClientRect.height,innerHeight):0;if(performance.now()>resizeUntil)gate.update(root.dataset.state==='hero'?fraction:0);stage.schedule()}},{threshold:Array.from({length:101},(_,i)=>i/100)});viewport.observe(section);
 function connect(){const ready=root.dataset.state==='hero';studio.hidden=!ready;section.hidden=!ready;if(!ready){window.scrollTo({top:0,behavior:'instant'});fraction=0;gate.update(0);api?.setVisible(false);document.body.classList.remove('is-services')}stage.measure();productsStage.measure()}
 const stateObserver=new MutationObserver(connect);stateObserver.observe(root,{attributes:true,attributeFilter:['data-state']});connect();
 window.addEventListener('resize',()=>{resizeUntil=performance.now()+200},{passive:true,signal:events.signal});
 explore.addEventListener('click',()=>{const target=productsStage.state.entry>.5?services:stage.state.transition>.5?section:active?root:section;target.scrollIntoView({behavior:preference.matches?'instant':'smooth',block:'start'})},{signal:events.signal});
 preference.addEventListener('change',()=>{api?.setReduced(preference.matches);stage.schedule()},{signal:events.signal});
 document.querySelector('[data-products-link]').addEventListener('click',()=>productsStage.section.scrollIntoView({behavior:preference.matches?'instant':'smooth',block:'start'}),{signal:events.signal});
 if(new URLSearchParams(location.search).has('debug')){window.dnaQA=(action,value)=>api?.dnaQA(action,value);window.orbitQA=time=>api?.orbitQA(time)}
 window.productsDiagnostics=()=>({...api?.productsDiagnostics(),...productsStage.state});
 window.crystalDiagnostics=()=>({...api?.diagnostics(),ready:!!api,loading,active,visibility:fraction,entryGate:gate.state,failed:studio.hasAttribute('data-failed')});
 window.servicesDiagnostics=()=>({...api?.servicesDiagnostics(),...stage.state,services:stage.services.map(({id,title,description,destination,media,pose,layout})=>({id,title,description,destination,media,pose,layout}))});
 function dispose(){disposed=true;events.abort();preload.disconnect();viewport.disconnect();stateObserver.disconnect();api?.dispose();document.body.classList.remove('is-crystal','is-services')}
 signal.addEventListener('abort',dispose,{once:true});return {dispose};
}
