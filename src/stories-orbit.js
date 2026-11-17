import {STORY_COMPOSITION, STORY_ORBIT} from './stories-config.js';
const rad = n => n * Math.PI / 180;

let cachedTarget,cachedFocal;
// The authored cx is the projected center of the upright plane, not local x.
// targetX comes from the logo's final screen position relative to the CSS canvas.
export function storyFocalU(targetX=.5) {
 if(targetX!==cachedTarget){
  let lo=STORY_COMPOSITION.keyframes[0][0],hi=STORY_COMPOSITION.keyframes.at(-1)[0];
  for(let i=0;i<44;i++){const mid=(lo+hi)/2;if(compositionAt(STORY_COMPOSITION.keyframes,mid)[0]<targetX)lo=mid;else hi=mid}
  cachedTarget=targetX;cachedFocal=(lo+hi)/2;
 }
 return cachedFocal;
}
// Retain the approved straightening envelope; move only its position on the path.
export function storyCenterAlignment(u,focalU=storyFocalU()) {
 const t=Math.max(0,Math.min(1,(Math.abs(u-focalU)-.0125)/(.125-.0125)));
 return 1-t*t*t*(t*(t*6-15)+10);
}

// Monotone cubic interpolation of observed compositions; no wrap or repeating orbit.
export function compositionAt(keys, u) {
 u = Math.max(keys[0][0], Math.min(keys.at(-1)[0], u));
 let j = 1;
 while (j < keys.length - 1 && u > keys[j][0]) j++;
 const a = keys[j-1], b = keys[j], dt = b[0]-a[0], t = (u-a[0])/dt;
 return a.slice(1).map((v, k) => {
  const i = k+1, slope = (b[i]-v)/dt;
  const before = j > 1 ? (v-keys[j-2][i])/(a[0]-keys[j-2][0]) : slope;
  const after = j < keys.length-1 ? (keys[j+1][i]-b[i])/(keys[j+1][0]-b[0]) : slope;
  const tangent = (x,y) => x*y <= 0 ? 0 : 2*x*y/(x+y);
  const m0 = tangent(before,slope), m1 = tangent(slope,after);
  return (2*t**3-3*t*t+1)*v + (t**3-2*t*t+t)*dt*m0 + (-2*t**3+3*t*t)*b[i] + (t**3-t*t)*dt*m1;
 });
}
// Shared surface coordinates for the renderer and native polygon buttons.
export function surfacePoint(s, v, width, height, bend = STORY_COMPOSITION.bend) {
 if (Math.abs(bend)<1e-8) return [(s-.5)*width,(v-.5)*height,0];
 const angle = (s-.5)*bend;
 return [Math.sin(angle)*width/bend, (v-.5)*height, (Math.cos(angle)-1)*width/bend];
}
export function rotatePoint([x,y,z], yaw, pitch, roll) {
 const rx=rad(pitch),ry=rad(yaw),rz=rad(roll);
 const ay=y*Math.cos(rx)-z*Math.sin(rx),az=y*Math.sin(rx)+z*Math.cos(rx);
 const bx=x*Math.cos(ry)+az*Math.sin(ry),bz=-x*Math.sin(ry)+az*Math.cos(ry);
 return [bx*Math.cos(rz)-ay*Math.sin(rz),bx*Math.sin(rz)+ay*Math.cos(rz),bz];
}
export function layoutStoryOrbit(width,height,sample,pinTop=0,view={}) {
 const cfg=STORY_COMPOSITION,mobile=width<=700;
 const quality=mobile?cfg.mobile:width<=1100?cfg.tablet:width/height>1.9?cfg.wide:cfg.desktop;
 const P=height*cfg.perspectiveRatio,cardHeight=Math.min(height*quality.height,quality.maxHeight),cardWidth=cardHeight*cfg.ratio,focalU=storyFocalU(view.targetX??.5);
 const cards=Array.from({length:4},(_,index)=>{
  const u=sample.distance-index*STORY_ORBIT.spacing;
  const [cx,cy,d,pathYaw,pathPitch,pathRoll]=compositionAt(cfg.keyframes,u);
  const alignment=storyCenterAlignment(u,focalU),perspectiveWeight=1-alignment;
  const yaw=perspectiveWeight?pathYaw*perspectiveWeight:0,pitch=perspectiveWeight?pathPitch*perspectiveWeight:0,roll=perspectiveWeight?pathRoll*perspectiveWeight:0;
  const x=(cx-.5)*width*(1-d),y=(cy-.5)*height*(1-d),z=d*P;
  const project=(s,v)=>{
   const [dx,dy,dz]=rotatePoint(surfacePoint(s,v,cardWidth,cardHeight,cfg.bend*perspectiveWeight),yaw,pitch,roll),scale=P/(P-z-dz);
   return [width/2+(x+dx)*scale,height/2+(y+dy)*scale];
  };
  const outline=[];
  for(let k=0;k<=32;k++)outline.push(project(k/32,0));
  for(let k=32;k>=0;k--)outline.push(project(k/32,1));
  const bounds={left:Math.min(...outline.map(p=>p[0])),right:Math.max(...outline.map(p=>p[0])),top:Math.min(...outline.map(p=>p[1]))+pinTop,bottom:Math.max(...outline.map(p=>p[1]))+pinTop};
  const [nx,ny,nz]=rotatePoint([0,0,1],yaw,pitch,roll),facing=-nx*x-ny*y+nz*(P-z);
  const frontVisible=u>-.04&&u<1.04&&bounds.right>0&&bounds.left<width&&bounds.bottom>0&&bounds.top<height;
  return {index,u,x,y,z,yaw,pitch,roll,alignment,width:cardWidth,height:cardHeight,depth:z,facing,bounds,outline,frontVisible,opacity:1,projectedCenter:[cx,cy]};
 });
 const visible=cards.filter(c=>c.frontVisible);
 const active=visible.length?visible.reduce((a,b)=>Math.abs(b.u-STORY_ORBIT.focus)<Math.abs(a.u-STORY_ORBIT.focus)?b:a).index:sample.exit>.5?3:0;
 return {cards,active,perspective:P,mobile,centerY:height*.5,headlineDepth:-P,width,height,focalU,cssWidth:view.cssWidth??width,cssHeight:view.cssHeight??height};
}

