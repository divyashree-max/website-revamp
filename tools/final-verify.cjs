const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const files=[...fs.readdirSync('src').filter(n=>n.endsWith('.js')).map(n=>'src/'+n),'tests/experience.spec.cjs','public/assets/robot-reveal.json','public/assets/robot-reveal.bin'];
const fingerprint=()=>Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const before=fingerprint(),run=spawnSync(process.execPath,[path.resolve('node_modules/@playwright/test/cli.js'),'test'],{stdio:'inherit'}),after=fingerprint(),changed=files.filter(file=>before[file]!==after[file]);
fs.writeFileSync('evidence/final-source-verification.json',JSON.stringify({exitCode:run.status,changedDuringVerification:changed,files:after},null,2));
if(changed.length)console.error('Source/test files changed during verification:',changed);process.exit(changed.length?1:run.status??1);
