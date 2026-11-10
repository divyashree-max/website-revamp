const {chromium}=require('@playwright/test'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage();await p.goto('http://127.0.0.1:5173/tools/audit-anatomy.html');await p.waitForFunction(()=>window.anatomyReady);
 const report=await p.evaluate(()=>{const {model,T,createRigMotion}=window.anatomy;
 // Restore source local offsets/scales after the isolated raw-clip audit before evaluating the corrected rig.
 model.bones.forEach((bone,i)=>{bone.position.fromArray(model.bindTransforms[i].position);bone.scale.fromArray(model.bindTransforms[i].scale);bone.quaternion.fromArray(model.bindTransforms[i].quaternion)});model.updateScreen();const rig=createRigMotion(model),v=new T.Vector3(),delta=new T.Vector3(),samples=[];
 for(let i=0;i<=32;i++){const time=6+5.2*i/32;rig.apply(time);const s=model.screen;let rear=0,front=0;
  model.face.parent.traverse(mesh=>{if(!mesh.isMesh)return;for(let n=0;n<mesh.geometry.attributes.position.count;n+=8){mesh.getVertexPosition(n,v).applyMatrix4(mesh.matrixWorld);delta.subVectors(v,s.center);const depth=delta.dot(s.normal);rear=Math.min(rear,depth);front=Math.max(front,depth);}});
  let candidates=0,penetrations=0,nearestRearGap=Infinity;
  for(const mesh of model.meshes){let n=mesh,exclude=false;while(n){if(/^Bone00[4567]$/.test(n.name)||/Kuka_LED/.test(n.name)){exclude=true;break}n=n.parent}if(exclude)continue;
   for(let j=0;j<mesh.geometry.attributes.position.count;j+=16){mesh.getVertexPosition(j,v).applyMatrix4(mesh.matrixWorld);delta.subVectors(v,s.center);if(Math.abs(delta.dot(s.right))>s.width/2||Math.abs(delta.dot(s.up))>s.height/2)continue;const depth=delta.dot(s.normal);candidates++;if(depth>rear+.003&&depth<front-.003)penetrations++;else if(depth<=rear)nearestRearGap=Math.min(nearestRearGap,rear-depth);}
  }samples.push({time,unwrappedTurn:rig.revolution,cabinetRearDepth:rear,cabinetFrontDepth:front,candidates,penetrations,nearestRearGap:Number.isFinite(nearestRearGap)?nearestRearGap:null});
 }
 return {method:'33 poses; sampled source vertices against the actual oriented cabinet bounds. Wrist/mount contact components excluded. Not an engineering collision solver.',samples,totalPenetrations:samples.reduce((s,v)=>s+v.penetrations,0)};
 });fs.writeFileSync('evidence/current-clearance-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify({totalPenetrations:report.totalPenetrations,minimumSampledRearGap:Math.min(...report.samples.map(s=>s.nearestRearGap??Infinity))}));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
