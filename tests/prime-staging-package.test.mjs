import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {buildPrimeStaging} from '../scripts/prime-staging-package.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(readFileSync(join(root,'config/prime-candidate-lock.json'),'utf8'));
const hash=data=>createHash('sha256').update(data).digest('hex');
function fixture(t){
 const dist=mkdtempSync(join(tmpdir(),'prime02-fixture-'));
 t.after(()=>rmSync(dist,{recursive:true,force:true}));
 const lock=structuredClone(base),entries=[];
 const required=['index.html','_headers','scripts/service-state.js','assets/deliver-assets-mark.png',
   'assets/scene-choose.webp','assets/scene-prepare.webp','assets/scene-move.webp',
   'assets/v62-commerce.glb','assets/v62-courier.glb','assets/v62-destination.glb'];
 let total=0;
 for(const path of required.concat(Array.from({length:20},(_,i)=>'assets/extra-'+i+'.svg'))){
   let bytes;
   if(path==='index.html') bytes=Buffer.from('<meta name="robots" content="noindex,nofollow">'+
    ['choose','prepare','move'].map(x=>'<source srcset="./assets/scene-'+x+'.webp">').join('')+
    '<a data-channel-review="pending"></a>'.repeat(3));
   else if(path==='_headers') bytes=Buffer.from("Content-Security-Policy: script-src 'self'");
   else if(path==='scripts/service-state.js')bytes=Buffer.from('applicationDistribution:"not_published"; verified:false');
   else if(path.endsWith('.glb')){bytes=Buffer.alloc(12);bytes.write('glTF');bytes.writeUInt32LE(2,4);}
   else bytes=Buffer.from('untouched original:'+path);
   mkdirSync(dirname(join(dist,path)),{recursive:true});writeFileSync(join(dist,path),bytes);
   entries.push({path,bytes:bytes.length,sha256:hash(bytes)});total+=bytes.length;
 }
 const manifest=JSON.stringify({schema:'desset-prime-static-web-package-v1',domain:'none',noindex:true,totalBytes:total,files:entries});
 writeFileSync(join(dist,'site-manifest.json'),manifest);
 lock.manifest_sha256=hash(manifest);lock.package_bytes=total;
 return {dist,lock};
}
function build(t,f){const output=buildPrimeStaging({dist:f.dist,sourceSha:f.lock.source_sha,mode:'LOCAL_TEST_ONLY',lock:f.lock});t.after(()=>rmSync(output.stageDir,{recursive:true,force:true}));return output;}

test('build is blocked unless test-only mode is explicit',t=>{
 const f=fixture(t);
 assert.throws(()=>buildPrimeStaging({dist:f.dist,sourceSha:f.lock.source_sha,lock:f.lock}),/LOCAL_TEST_ONLY/);
});
test('safe copy has 33 files, unchanged originals and a report excluded from web root',t=>{
 const f=fixture(t),o=build(t,f);
 assert.equal(o.report.static_files,33);
 assert.equal(o.report.original_files,30);
 assert.equal(o.report.production_deployment_authorized,false);
 assert.equal(o.report.release_decision,'NO-GO');
 assert.equal(o.report.noindex,true);
 assert.equal(o.report.empty_sitemap,true);
 assert.equal(o.report.robots_disallow_all,true);
 assert.deepEqual(readFileSync(join(f.dist,'index.html')),readFileSync(join(o.publicDir,'index.html')));
 assert.equal(readdirSync(o.stageDir).sort().join(','),'public,stage-audit.json');
 assert.ok(!readdirSync(o.publicDir).includes('stage-audit.json'));
 assert.ok(!readdirSync(o.publicDir).includes('site-manifest.json'));
 assert.ok(readFileSync(join(o.publicDir,'robots.txt'),'utf8').includes('Disallow: /'));
 assert.ok(!readFileSync(join(o.publicDir,'sitemap.xml'),'utf8').includes('<loc>'));
});
test('staging does not silently turn into a release and preserves source',t=>{
 const f=fixture(t),original=readFileSync(join(f.dist,'index.html'));
 const o=build(t,f);
 const text=readFileSync(join(o.publicDir,'index.html'),'utf8');
 assert.match(text,/noindex,nofollow/);
 assert.ok(!text.includes('rel="canonical"'));
 assert.deepEqual(readFileSync(join(f.dist,'index.html')),original);
 assert.equal(o.report.blockers.length,3);
});
test('changed photograph fails closed before any stage is produced',t=>{
 const f=fixture(t);writeFileSync(join(f.dist,'assets/scene-move.webp'),'tampered');
 assert.throws(()=>buildPrimeStaging({dist:f.dist,sourceSha:f.lock.source_sha,mode:'LOCAL_TEST_ONLY',lock:f.lock}),/NO-GO/);
});
test('wrong source commit fails closed',t=>{
 const f=fixture(t);
 assert.throws(()=>buildPrimeStaging({dist:f.dist,sourceSha:'f'.repeat(40),mode:'LOCAL_TEST_ONLY',lock:f.lock}),/NO-GO/);
});
test('separate staging builds produce identical file digests',t=>{
 const f=fixture(t),a=build(t,f),b=build(t,f);
 assert.notEqual(a.stageDir,b.stageDir);
 assert.deepEqual(a.report.files,b.report.files);
 assert.equal(a.report.total_bytes,b.report.total_bytes);
});
test('reserved sitemap or robots in source is rejected',t=>{
 const f=fixture(t);const p=join(f.dist,'robots.txt');writeFileSync(p,'Disallow: /');
 assert.throws(()=>buildPrimeStaging({dist:f.dist,sourceSha:f.lock.source_sha,mode:'LOCAL_TEST_ONLY',lock:f.lock}),/NO-GO/);
});
