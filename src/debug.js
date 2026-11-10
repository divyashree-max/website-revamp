/** Explicitly opt-in, localhost development controls. Production bundles never show them. */
export function createDebug(api,params,signal){
 const panel=document.createElement('aside');panel.id='development-controls';panel.setAttribute('aria-label','Development timeline controls');
 Object.assign(panel.style,{position:'absolute',bottom:'20px',left:'20px',zIndex:5,background:'#141414ed',padding:'12px',border:'1px solid #69502c',display:'flex',gap:'10px',alignItems:'center',font:'11px sans-serif'});
 const select=document.createElement('select');select.setAttribute('aria-label','Development stage');
 for(const label of Object.keys(api.labels)){const o=document.createElement('option');o.value=label;o.textContent=label;select.append(o)}
 const scrub=document.createElement('input');scrub.type='range';scrub.min=0;scrub.max=api.labels.hero;scrub.step=.01;scrub.setAttribute('aria-label','Development timeline time');
 const play=document.createElement('button');play.textContent='Play';const readout=document.createElement('output');
 function seek(value){api.seek(value);scrub.value=value;readout.textContent=Number(value).toFixed(2)+'s';}
 select.addEventListener('change',()=>seek(api.labels[select.value]),{signal});scrub.addEventListener('input',()=>seek(Number(scrub.value)),{signal});play.addEventListener('click',()=>api.play(),{signal});
 const lock=document.createElement('button');let locked=params.get('camera')==='locked';lock.textContent='Lock camera';lock.setAttribute('aria-pressed',String(locked));lock.addEventListener('click',()=>{locked=!locked;api.setCameraLocked(locked);lock.setAttribute('aria-pressed',String(locked))},{signal});
 panel.append(select,scrub,play,lock,readout);document.querySelector('#experience').append(panel);
 if(params.has('t'))seek(Number(params.get('t')));else if(params.has('stage')){select.value=params.get('stage');seek(api.labels[select.value]||0)}
 signal.addEventListener('abort',()=>panel.remove(),{once:true});panel.dataset.ready='';
}
