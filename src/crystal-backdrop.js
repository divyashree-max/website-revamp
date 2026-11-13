import * as T from 'three';
/** Optical scene behind the glass. HTML stays semantic; only its reflected/refracted image is sampled. */
export function createCrystalBackdrop(renderer,canvas,section){
 const image=document.createElement('canvas'),ctx=image.getContext('2d'),texture=new T.CanvasTexture(image);texture.colorSpace=T.SRGBColorSpace;
 const target=new T.WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false});
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,2);camera.position.z=1;
 const geometry=new T.PlaneGeometry(2,2),material=new T.ShaderMaterial({uniforms:{copy:{value:texture},textVisibility:{value:1}},depthTest:false,toneMapped:false,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`varying vec2 v;uniform sampler2D copy;uniform float textVisibility;void main(){
  vec3 text=texture2D(copy,v).rgb*textVisibility;
  float sweep=exp(-pow((v.x*.65+v.y-.88)*7.,2.));
  float card=exp(-pow((v.x-.54)*9.,2.))*exp(-pow((v.y-.52)*2.5,2.));
  vec3 studio=vec3(.00015)+vec3(.0008)*sweep+vec3(.0012)*card;
  gl_FragColor=vec4(max(text,studio),1.);
 }`});scene.add(new T.Mesh(geometry,material));
 const size=new T.Vector2(1,1);
 return {texture:target.texture,size,setTextVisibility(value){material.uniforms.textVisibility.value=value},resize(w,h){image.width=Math.ceil(w);image.height=Math.ceil(h);ctx.clearRect(0,0,w,h);const bounds=canvas.getBoundingClientRect();
  for(const word of section.querySelectorAll('.crystal-word')){const s=getComputedStyle(word),r=word.getBoundingClientRect();ctx.font=`${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;ctx.fontKerning='none';ctx.fillStyle=s.color;ctx.textBaseline='top';ctx.letterSpacing=s.letterSpacing;ctx.fillText(word.textContent,r.left-bounds.left,r.top-bounds.top+(parseFloat(s.lineHeight)-parseFloat(s.fontSize))*.5)}
  texture.needsUpdate=true;const scale=Math.min(1,1400/w,1000/h);target.setSize(Math.ceil(w*scale),Math.ceil(h*scale));size.set(target.width,target.height);},
 draw(){renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null)},dispose(){texture.dispose();target.dispose();geometry.dispose();material.dispose()}};
}
