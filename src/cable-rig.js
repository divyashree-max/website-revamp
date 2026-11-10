import * as T from 'three';

/** Rebind the genuine source hose between its base and elbow attachments. No connector is added. */
export function createCableRig(model){
 const mesh=model.source.getObjectByName('Cable'),base=model.bones[0],elbow=model.bones[2];
 if(!mesh?.isMesh)return {update(){},diagnostics:{corrected:false,reason:'Source Cable mesh missing'}};
 const original=mesh.geometry,geometry=original.clone();mesh.geometry=geometry;
 if(!model.meshes.some(m=>m!==mesh&&m.geometry===original))original.dispose();
 const position=geometry.attributes.position,normal=geometry.attributes.normal,rest=new Float32Array(position.array),normals=new Float32Array(normal.array),weights=new Float32Array(position.count);
 const bindMesh=mesh.matrixWorld.clone(),bindBase=base.matrixWorld.clone().invert(),bindElbow=elbow.matrixWorld.clone().invert();
 const invMesh=new T.Matrix4(),lower=new T.Matrix4(),upper=new T.Matrix4(),lowerNormal=new T.Matrix3(),upperNormal=new T.Matrix3(),last=new T.Matrix4().makeScale(0,0,0);
 const p=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3();
 for(let i=0;i<position.count;i++){p.fromArray(rest,i*3).applyMatrix4(bindMesh);weights[i]=T.MathUtils.smoothstep(p.y,.7,1.8);}
 position.setUsage(T.DynamicDrawUsage);normal.setUsage(T.DynamicDrawUsage);let updates=0;
 function update(){
  invMesh.copy(mesh.matrixWorld).invert();lower.copy(invMesh).multiply(base.matrixWorld).multiply(bindBase).multiply(bindMesh);upper.copy(invMesh).multiply(elbow.matrixWorld).multiply(bindElbow).multiply(bindMesh);
  if(upper.elements.every((v,i)=>Math.abs(v-last.elements[i])<1e-10))return;
  last.copy(upper);lowerNormal.getNormalMatrix(lower);upperNormal.getNormalMatrix(upper);
  for(let i=0;i<position.count;i++){
   const w=weights[i];p.fromArray(rest,i*3);a.copy(p).applyMatrix4(lower);b.copy(p).applyMatrix4(upper);a.lerp(b,w).toArray(position.array,i*3);
   p.fromArray(normals,i*3);a.copy(p).applyMatrix3(lowerNormal);b.copy(p).applyMatrix3(upperNormal);a.lerp(b,w).normalize().toArray(normal.array,i*3);
  }
  position.needsUpdate=true;normal.needsUpdate=true;geometry.computeBoundingBox();geometry.computeBoundingSphere();updates++;
 }
 return {update,get diagnostics(){return {corrected:true,sourceMesh:'Cable',method:'two-anchor deformation of original hose mesh',vertices:position.count,updates,addedConnectorMeshes:0}}};
}
