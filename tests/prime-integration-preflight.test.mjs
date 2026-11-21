import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {inspectPrime} from '../scripts/prime-integration-preflight.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(readFileSync(join(root,'config/prime-candidate-lock.json'),'utf8'));
const hash=data=>createHash('sha256').update(data).digest('hex');
function fixture(t) {
 const dir=mkdtempSync(join(tmpdir(),'prime-bridge-')); t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const lock=structuredClone(base), entries=[], required=['index.html','_headers','scripts/service-state.js','assets/deliver-assets-mark.png','assets/scene-choose.webp','assets/scene-prepare.webp','assets/scene-move.webp','assets/v62-commerce.glb','assets/v62-courier.glb','assets/v62-destination.glb'];
 const names=required.concat(Array.from({length:20},(_,i)=>'assets/extra-'+i+'.svg')); let total=0;
 for(const path of names){ let bytes;
  if(path==='index.html') bytes=Buffer.from('<meta name="robots" content="noindex,nofollow"><a href="#contacto">Hablemos de tu negocio</a>'+['choose','prepare','move'].map(x=>'<source srcset="./assets/scene-'+x+'.webp">').join('')+'<a data-channel-review="pending"></a>'.repeat(3));
  else if(path==='_headers') bytes=Buffer.from("Content-Security-Policy: script-src 'self'");
  else if(path==='scripts/service-state.js') bytes=Buffer.from('applicationDistribution:"not_published"; verified:false');
  else if(path.endsWith('.glb')) {bytes=Buffer.alloc(12);bytes.write('glTF');bytes.writeUInt32LE(2,4);}
  else bytes=Buffer.from('fixture:'+path);
  mkdirSync(dirname(join(dir,path)),{recursive:true});writeFileSync(join(dir,path),bytes);
  entries.push({path,bytes:bytes.length,sha256:hash(bytes)});total+=bytes.length;
 }
 const manifest=JSON.stringify({schema:'desset-prime-static-web-package-v1',domain:'none',noindex:true,totalBytes:total,files:entries});
 writeFileSync(join(dir,'site-manifest.json'),manifest);lock.manifest_sha256=hash(manifest);lock.package_bytes=total;
 return {dir,lock};
}
test('valid 30-file archive passes integrity but remains NO-GO',t=>{const f=fixture(t),r=inspectPrime(f.dir,f.lock.source_sha,f.lock);assert.equal(r.integrity,'PASS');assert.equal(r.release_authorized,false);assert.equal(r.release_decision,'NO-GO');});
test('photo byte tampering fails',t=>{const f=fixture(t);writeFileSync(join(f.dir,'assets/scene-move.webp'),'MUTATED');assert.equal(inspectPrime(f.dir,f.lock.source_sha,f.lock).integrity,'FAIL');});
test('wrong commit SHA fails',t=>{const f=fixture(t);assert.equal(inspectPrime(f.dir,'0'.repeat(40),f.lock).integrity,'FAIL');});
test('unlisted file or symlink fails',t=>{const f=fixture(t);writeFileSync(join(f.dir,'unknown.js'),'oops');symlinkSync(join(f.dir,'index.html'),join(f.dir,'linked.html'));const r=inspectPrime(f.dir,f.lock.source_sha,f.lock);assert.equal(r.integrity,'FAIL');assert.ok(r.errors.some(x=>x.includes('Link or invalid object')));});
test('authorizing in the lock fails',t=>{const f=fixture(t);f.lock.policy='GO';assert.equal(inspectPrime(f.dir,f.lock.source_sha,f.lock).integrity,'FAIL');});
