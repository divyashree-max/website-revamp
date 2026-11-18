import {clamp,smooth} from './stories-config.js';

export const ABOUT=Object.freeze({start:7.05,dockEnd:8.10,finalApproach:64,finalHold:.35});
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10)};

/** Extends the existing native-scroll scene. The original h2 is never cloned. */
export function mountStoriesAbout(section,statement,wake,signal){
 const content=document.createElement('section');content.className='about-content';content.setAttribute('aria-label','About Craftech360');
 content.innerHTML='<div class="about-reveal"><p class="about-reveal-inner about-copy">We bring ideas to life through creative technology. From kinetic installations and robotics to immersive environments and AI-powered experiences, we combine design, engineering and storytelling to create experiences people can interact with and remember.</p></div><div class="about-reveal"><p class="about-reveal-inner about-copy">Our team develops the software, integrates the hardware and delivers the experience\u2014from the first concept to the live installation.</p></div><dl class="about-statistics">'+[['350+','Projects delivered'],['7+','Countries reached'],['53','Cities activated']].map(([number,label])=>'<div class="about-reveal about-stat"><div class="about-reveal-inner"><dt>'+label+'</dt><dd>'+number+'</dd></div></div>').join('')+'</dl>';
 section.append(content);
 const title=statement.querySelector('h2'),lines=[...statement.querySelectorAll('.impact-line-inner')],reveals=[...content.querySelectorAll('.about-reveal')],finalStat=content.querySelector('.about-stat:last-child');
 let metrics=null,dirty=true,progress=0;
 const observer=new ResizeObserver(()=>{dirty=true;wake()});observer.observe(content);observer.observe(title);
 document.fonts.ready.then(()=>{dirty=true;if(!signal.aborted)wake()});
 signal.addEventListener('abort',()=>{observer.disconnect();content.remove()},{once:true});
 function read(width,height,simple){
  if(simple&&metrics){metrics.currentTop=content.getBoundingClientRect().top;const rect=statement.getBoundingClientRect();metrics.statementTop=rect.top;metrics.statementHeight=rect.height}
  if(!dirty&&metrics?.width===width&&metrics.height===height&&metrics.simple===simple)return metrics;
  const mobile=width<=700,baseFont=parseFloat(getComputedStyle(title).fontSize),scale=mobile?1:Math.min(78,Math.max(44,width*.048))/baseFont;
  const targetTop=mobile?180:Math.max(190,height*.40),copyOffset=mobile?targetTop+title.offsetHeight*scale+64:Math.max(150,height*.20),copyTop=ABOUT.dockEnd*height+copyOffset;
  const contentHeight=content.offsetHeight,travel=Math.max(0,contentHeight-(height-copyOffset-100));
  const titleRect=title.getBoundingClientRect(),statementBox=statement.getBoundingClientRect(),titleMatrix=new DOMMatrixReadOnly(getComputedStyle(title).transform),finalInner=finalStat.firstElementChild,finalRect=finalInner.getBoundingClientRect();
  const finalCenter=finalRect.top-content.getBoundingClientRect().top-new DOMMatrixReadOnly(getComputedStyle(finalStat).transform).m42-new DOMMatrixReadOnly(getComputedStyle(finalInner).transform).m42+finalRect.height/2;
  const titleCenter=targetTop+(titleRect.top-statementBox.top-titleMatrix.m42-title.offsetTop)+titleRect.height/titleMatrix.d*scale/2;
  const finalAlign=copyTop+finalCenter-titleCenter,finalSettle=(finalAlign+ABOUT.finalApproach)/height,finalRelease=finalSettle+ABOUT.finalHold;
  const end=mobile?(copyTop+contentHeight+180)/height:simple?ABOUT.dockEnd+travel/height+.25+1.05:finalRelease+1.05;
  const statementRect=simple?statement.getBoundingClientRect():null;
  metrics={width,height,simple,mobile,scale,targetTop,copyTop,copyOffset,contentHeight,finalAlign,finalSettle,finalRelease,currentTop:simple?content.getBoundingClientRect().top:0,statementTop:statementRect?.top,statementHeight:statementRect?.height,stageViewports:Math.max(8.9,end),pinViewports:mobile?ABOUT.dockEnd+1:null,left:title.offsetLeft,top:title.offsetTop,lineCenters:lines.map(line=>(title.offsetWidth-line.offsetWidth)/2),reveals:reveals.map(el=>({top:el.offsetTop,height:el.offsetHeight}))};
  dirty=false;return metrics;
 }
 function render(scroll,simple,pinTop=0){
  const m=metrics;progress=simple?0:ease((scroll-ABOUT.start)/(ABOUT.dockEnd-ABOUT.start));
  title.style.transformOrigin='0 0';title.style.transform=progress===0?'none':`translate3d(${(m.width*.06-m.left)*progress}px,${(m.targetTop-m.top)*progress}px,0) scale(${mix(1,m.scale,progress)})`;
  section.style.setProperty('--about-dock-end',ABOUT.dockEnd*100+'svh');section.style.setProperty('--about-copy-offset',m.copyOffset+'px');section.style.setProperty('--stories-pin-height',!simple&&m.mobile?m.pinViewports*100+'svh':'calc(100% - var(--stories-tail))');
  const y=simple?m.currentTop:m.copyTop-scroll*m.height,upper=m.mobile?160:150,lower=m.height-(m.mobile?110:100);
  const x=scroll*m.height-m.finalAlign,a=ABOUT.finalApproach,finalOffset=simple||m.mobile?0:x<=-a?0:x<a?(x+a)**2/(4*a):Math.min(x,a+ABOUT.finalHold*m.height);
  finalStat.style.transform=finalOffset?`translate3d(0,${finalOffset}px,0)`:'none';
  // Allow the held row beyond its natural box, still clipped to the chrome-safe viewport.
  content.style.clipPath=`inset(${Math.max(0,upper-y)}px 0 ${Math.max(-finalOffset,y+m.contentHeight-lower)}px 0)`;
  statement.style.clipPath=simple?`inset(${Math.max(0,upper-m.statementTop)}px 0 ${Math.max(0,m.statementTop+m.statementHeight-lower)}px 0)`:scroll>=ABOUT.start?`inset(${Math.max(0,upper-pinTop)}px 0 ${Math.max(0,pinTop+m.height-lower)}px 0)`:'none';
  reveals.forEach((el,i)=>{const reveal=simple?1:smooth((lower-(y+m.reveals[i].top+(el===finalStat?finalOffset:0)))/(m.height*.22));const inner=el.firstElementChild;inner.style.opacity=String(reveal);inner.style.transform=`translate3d(0,${(1-reveal)*24}px,0)`});
  section.toggleAttribute('data-about',!simple&&scroll>=ABOUT.start);
  return {progress,mobile:m.mobile,copyTop:y,stageViewports:m.stageViewports,finalSettle:m.finalSettle,finalRelease:m.finalRelease,phase:scroll<ABOUT.start?'statement':scroll<ABOUT.dockEnd?'docking':'about'};
 }
 return {read,render,lineShift(i){return -progress*(metrics?.lineCenters[i]??0)},get metrics(){return metrics}};
}
