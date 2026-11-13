import * as T from 'three';
import {ConvexHull} from 'three/addons/math/ConvexHull.js';
/** Bounded two-interface/internal-bounce optics on a convex proxy of each repaired source facet. */
export function crystalOptics(material,front,side,backdrop,low,amber,probeCenter,probeScale){
 const points=[];for(const mesh of [front,side]){const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++)points.push(new T.Vector3().fromBufferAttribute(p,i))}
 const hull=new ConvexHull().setFromPoints(points),planes=hull.faces.map(f=>new T.Vector4(f.normal.x,f.normal.y,f.normal.z,-f.constant));while(planes.length<20)planes.push(new T.Vector4(0,0,0,-1e6));
 const palette=[0xfccc00,0xf7a504,0xd66f20,0x994f2a].map(hex=>{const c=new T.Color(hex);return new T.Vector3(c.r,c.g,c.b)});
 const localCamera=new T.Vector3(),uniforms={uCrystalPlanes:{value:planes.slice(0,20)},uCrystalCamera:{value:localCamera},uCrystalBackdrop:{value:backdrop.texture},uCrystalAmber:amber,uCrystalProbeCenter:probeCenter,uCrystalProbeScale:probeScale,uCrystalAmberPalette:{value:palette}};
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='varying vec3 vCrystalNormal;varying vec3 vCrystalLocal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCrystalLocal=position;vCrystalNormal=normal;');
  shader.fragmentShader='varying vec3 vCrystalNormal;varying vec3 vCrystalLocal;uniform vec4 uCrystalPlanes[20];uniform vec3 uCrystalCamera;uniform sampler2D uCrystalBackdrop;uniform float uCrystalAmber;uniform vec3 uCrystalProbeCenter;uniform float uCrystalProbeScale;uniform vec3 uCrystalAmberPalette[4];\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_pars_fragment>',`#include <transmission_pars_fragment>
   // Hidden finite studio cards. Both reflected and refracted rays see the same
   // lighting, so highlights travel with the glass rather than its UV coordinates.
   vec3 opticalStudio(vec3 p,vec3 d){
    // A local LED reflection probe keeps the miniature prism as readable as the hero glass.
    p=mix(p,(p-uCrystalProbeCenter)/max(uCrystalProbeScale,.001),uCrystalAmber);
    vec3 light=vec3(.0025);
    if(abs(d.z)>.0001){
     float t=((d.z>0.?4.5:-4.5)-p.z)/d.z;vec2 q=(p+d*t).xy;
     if(t>0.){
      float white=exp(-pow((q.x+q.y*.42-.65)*8.,2.))*exp(-pow(q.y*.19,4.));
      float cool=exp(-pow((q.x-q.y*.35+1.8)*12.,2.))*exp(-pow(q.y*.2,4.));
      float warm=exp(-pow((q.y+q.x*.3+1.6)*14.,2.))*exp(-pow(q.x*.22,4.));
      light+=vec3(1.5)*white+vec3(.25,.65,1.1)*cool+vec3(.7,.38,.12)*warm;
     }
    }
    // Side and overhead softboxes keep thin/oblique faces legible.
    light+=vec3(.5,.65,.8)*pow(abs(d.x),28.)+vec3(.65)*pow(abs(d.y),36.);
    float spectrum=clamp(.5+d.y*.3+d.x*.18,0.,1.);
    vec3 amberHighlight=mix(uCrystalAmberPalette[0],uCrystalAmberPalette[1],smoothstep(0.,.35,spectrum));
    amberHighlight=mix(amberHighlight,uCrystalAmberPalette[2],smoothstep(.35,.73,spectrum));
    amberHighlight=mix(amberHighlight,uCrystalAmberPalette[3],smoothstep(.73,1.,spectrum));
    // Tint light travelling through the prism, retaining clear white specular cores.
    return light*mix(vec3(1.),mix(vec3(1.),amberHighlight*1.5,.9),uCrystalAmber);
   }
   vec3 opticalExit(vec3 p,vec3 d){
    vec3 worldP=(modelMatrix*vec4(p,1.)).xyz,worldD=normalize(mat3(modelMatrix)*d);
    vec3 background=vec3(0.);
    if(worldD.z<-.025){float t=(-1.5-worldP.z)/worldD.z;vec4 clip=projectionMatrix*viewMatrix*vec4(worldP+worldD*t,1.);vec2 uv=clip.xy/clip.w*.5+.5;
     if(all(greaterThanEqual(uv,vec2(0.)))&&all(lessThanEqual(uv,vec2(1.))))background=texture2D(uCrystalBackdrop,uv).rgb;
    }
    background+=opticalStudio(worldP,worldD);
    return background;
   }
   vec3 opticalRay(vec3 entry,vec3 incoming,vec3 surfaceNormal,float index){
    vec3 direction=refract(incoming,surfaceNormal,1./index);
    vec3 p=entry+direction*.0003,result=vec3(0.);float weight=1.,distanceTravelled=0.;
    for(int bounce=0;bounce<${low?3:5};bounce++){
     float nearest=10000.;vec3 hitNormal=vec3(0.,0.,-1.);
     for(int k=0;k<20;k++){vec4 plane=uCrystalPlanes[k];float denominator=dot(plane.xyz,direction);float t=-(dot(plane.xyz,p)+plane.w)/denominator;
      if(denominator>.00001&&t>.00001&&t<nearest){nearest=t;hitNormal=plane.xyz;}
     }
     if(nearest>1000.)break;
     p+=direction*nearest;distanceTravelled+=nearest;
     vec3 outgoing=refract(direction,-hitNormal,index);
     float cosine=clamp(dot(direction,hitNormal),0.,1.);float f=.04+.96*pow(1.-cosine,5.);
     vec3 absorption=mix(vec3(.012,.008,.004),vec3(.045,.55,3.2),uCrystalAmber);
     if(dot(outgoing,outgoing)>.00001){result+=weight*(1.-f)*opticalExit(p,normalize(outgoing))*exp(-absorption*distanceTravelled);weight*=f;}
     direction=reflect(direction,hitNormal);p+=direction*.0003;
    }
    return result*(1.-(.04+.96*pow(1.-abs(dot(incoming,surfaceNormal)),5.)));
   }
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_fragment>',`#include <transmission_fragment>
   vec3 localNormal=normalize(vCrystalNormal);vec3 incoming=normalize(vCrystalLocal-uCrystalCamera);
   if(dot(localNormal,incoming)>0.)localNormal=-localNormal;
   ${low?'vec3 solidTransmission=opticalRay(vCrystalLocal,incoming,localNormal,1.5);':`vec3 solidTransmission=vec3(opticalRay(vCrystalLocal,incoming,localNormal,1.49).r,opticalRay(vCrystalLocal,incoming,localNormal,1.5).g,opticalRay(vCrystalLocal,incoming,localNormal,1.512).b);`}
   vec3 worldPoint=(modelMatrix*vec4(vCrystalLocal,1.)).xyz;
   vec3 reflectionDirection=normalize(mat3(modelMatrix)*reflect(incoming,localNormal));
   float faceFresnel=.04+.96*pow(1.-abs(dot(incoming,localNormal)),5.);
   totalDiffuse=solidTransmission;
   totalSpecular=totalSpecular*.12+opticalStudio(worldPoint,reflectionDirection)*faceFresnel;
   material.transmissionAlpha=1.;
  `);
 };
 material.customProgramCacheKey=()=>`closed-crystal-optics-amber-${low?'low':'high'}`;
 return mesh=>{mesh.onBeforeRender=(r,s,c)=>{localCamera.copy(c.position);mesh.worldToLocal(localCamera)}};
}
