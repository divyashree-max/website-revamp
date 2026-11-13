/** DNA-only geometry/UV/motion contract. Block order is top to bottom. Source units are metres. */
export const DNA=Object.freeze({
 video:new URL('../public/assets/products/dna-tunnel.mp4',import.meta.url).href,
 poster:new URL('../public/assets/products/dna-video-poster.jpg',import.meta.url).href,
 sourceAspect:1366/720,crop:{focalX:.5,focalY:.5,zoom:1},brightness:.94,
 chrome:{meshes:['DNA - BASE Full assembly.008','Cylinder.014'],color:0xd9dde2,metalness:1,roughness:.09,envMapIntensity:1.4},
 axis:[0,1,0],spindle:{x:.0012390315532684326,z:.0005897879600524902},
 blocks:[
  {pivotY:2.033860683441162,housing:'Cube.026',front:'Cube.032',back:'Cube.038'},
  {pivotY:1.7329405546188354,housing:'Cube.024',front:'Cube.031',back:'Cube.037'},
  {pivotY:1.432442545890808,housing:'Cube.019',front:'Cube.030',back:'Cube.036'},
  {pivotY:1.1299331188201904,housing:'Cube.003',front:'Cube.029',back:'Cube.035'},
  {pivotY:0.8274675607681274,housing:'Cube.012',front:'Cube.028',back:'Cube.034'},
  {pivotY:0.5257861614227295,housing:'Cube.004',front:'Cube.002',back:'Cube.033'},
 ],
 motion:{startup:.12,revealStart:.7,blendStart:.58,cycle:7.2,stagger:.18,first:{start:0,travel:2.2,returnAt:2.2,returnDuration:2,degrees:82},second:{start:4.2,travel:1.6,returnAt:5.8,returnDuration:1.4,degrees:-55},amplitudeStep:.065},
});
/** Clockwise is negative Y, viewed from above (+Y looking down the spindle).
 * Shared turning points keep adjacent velocities opposed. Monotonic easing lag
 * retains the stagger without stationary dwell intervals or discontinuous wrap. */
export function dnaPoseAt(seconds){
 const m=DNA.motion,t=((seconds%m.cycle)+m.cycle)%m.cycle;
 const hermite=(a,b,va,vb,u,duration)=>{const q=u*u,r=q*u;return (2*r-3*q+1)*a+(r-2*q+u)*va*duration+(-2*r+3*q)*b+(r-q)*vb*duration};
 return DNA.blocks.map((_,i)=>{
  const a=m.first,b=m.second,positive=(1-i*m.amplitudeStep)*a.degrees,negative=(1-(5-i)*m.amplitudeStep)*b.degrees;
  const throughRest=Math.min(positive/a.travel,-negative/b.returnDuration),throughReturn=-Math.min(positive/a.returnDuration,-negative/b.travel);
  let from,to,va,vb,u,duration,lag;
  if(t<a.travel){from=0;to=positive;va=throughRest;vb=0;duration=a.travel;u=t/duration;lag=i*m.stagger}
  else if(t<b.start){from=positive;to=0;va=0;vb=throughReturn;duration=a.returnDuration;u=(t-a.returnAt)/duration;lag=i*m.stagger}
  else if(t<b.returnAt){from=0;to=negative;va=throughReturn;vb=0;duration=b.travel;u=(t-b.start)/duration;lag=(5-i)*m.stagger}
  else{from=negative;to=0;va=0;vb=throughRest;duration=b.returnDuration;u=(t-b.returnAt)/duration;lag=(5-i)*m.stagger}
  // Zero warp derivative at endpoints preserves the matched crossing velocities.
  const warped=u-.4*lag*4*u*u*(1-u)*(1-u),angle=hermite(from,to,va,vb,warped,duration),direction=i%2===0?-1:1;
  return direction*angle*Math.PI/180;
 });
}
