import * as T from 'three';

/** The caption is a child surface sharing its video's geometry and exact clip mask. */
export function createStoryCaption(mesh,mask,title,fontFamily,ink) {
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=640;
 const context=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const material=new T.MeshBasicMaterial({map:texture,alphaMap:mask,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:false,side:T.FrontSide});
 // The video uses alphaTest=.5. Use the identical boundary without thresholding
 // the caption's translucent gradient itself.
 material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <alphamap_fragment>','#include <alphamap_fragment>\n#ifdef USE_ALPHAMAP\nif (texture2D(alphaMap, vAlphaMapUv).g < 0.5) discard;\n#endif')};
 const surface=new T.Mesh(mesh.geometry,material);surface.visible=false;mesh.add(surface);
 let fontSize=0,lines=[],hovered=false,focused=false,interaction=0,opacity=0;
 function paint(physicalWidth,force=false){
  const next=Math.max(12,Math.min(17,physicalWidth*.052))*512/physicalWidth;
  if(!force&&Math.abs(fontSize-next)<.01)return;fontSize=next;
  context.clearRect(0,0,512,640);
  const gradient=context.createLinearGradient(0,435,0,640);gradient.addColorStop(0,'rgba(0,0,0,0)');gradient.addColorStop(1,'rgba(0,0,0,.76)');
  context.fillStyle=gradient;context.fillRect(0,435,512,205);
  context.font='400 '+fontSize+'px '+fontFamily;context.textBaseline='alphabetic';context.fillStyle=ink;
  lines=[];let line='';
  for(const word of title.split(' ')){const next=line?line+' '+word:word;if(line&&context.measureText(next).width>448){lines.push(line);line=word}else line=next}if(line)lines.push(line);
  const lineHeight=fontSize*1.22,bottom=608;
  lines.forEach((text,i)=>context.fillText(text,32,bottom-(lines.length-1-i)*lineHeight));texture.needsUpdate=true;
 }
 function step(centered,dt,visible){
  const target=hovered||focused?1:0;interaction+=(target-interaction)*(1-Math.exp(-dt/.1));if(Math.abs(target-interaction)<.001)interaction=target;
  opacity=Math.max(centered,interaction);material.opacity=opacity;surface.visible=visible&&opacity>.001;
 }
 return {paint,step,setHover(value){hovered=value},setFocus(value){focused=value},get settling(){return interaction!==(hovered||focused?1:0)},get diagnostics(){return {opacity,visible:surface.visible,lines:[...lines],padding:32/512,sharesGeometry:surface.geometry===mesh.geometry,sharesClip:material.alphaMap===mesh.material.alphaMap,localPosition:surface.position.toArray(),localQuaternion:surface.quaternion.toArray(),matrixMatches:surface.matrixWorld.elements.every((v,i)=>v===mesh.matrixWorld.elements[i])}},dispose(){mesh.remove(surface);texture.dispose();material.dispose()}};
}
