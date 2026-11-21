/** Prime -> DESSET migration preflight. Read-only/offline. NEVER authorizes release. */
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isAbsolute, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const frozen = JSON.parse(readFileSync(resolve(root, 'config/prime-candidate-lock.json'),'utf8'));
const sha256 = data => createHash('sha256').update(data).digest('hex');
const safePath = name => typeof name === 'string' && /^[a-z0-9_./-]+$/.test(name) &&
  !name.startsWith('/') && !name.split('/').some(x => !x || x === '.' || x === '..');
const needed = ['index.html','_headers','scripts/service-state.js','assets/deliver-assets-mark.png',
  'assets/scene-choose.webp','assets/scene-prepare.webp','assets/scene-move.webp',
  'assets/v62-commerce.glb','assets/v62-courier.glb','assets/v62-destination.glb'];
export function inspectPrime(dist, sourceSha, lock=frozen) {
  const errors=[];
  const fail=m=>errors.push(m);
  if (!isAbsolute(dist)) fail('Absolute dist directory required');
  if (lock.schema !== 'desset-prime-integrity-lock-v1' || lock.policy !== 'NO-GO') fail('Invalid frozen policy');
  if (sourceSha !== lock.source_sha) fail('Wrong exact source SHA');
  let manifest, manifestBytes;
  try {
    manifestBytes=readFileSync(resolve(dist,'site-manifest.json'));
    if(sha256(manifestBytes)!==lock.manifest_sha256) fail('Frozen manifest SHA256 changed');
    manifest=JSON.parse(manifestBytes.toString('utf8'));
  } catch { fail('Manifest missing or invalid JSON'); }
  const tracked=new Map(),seen=new Set();
  if(manifest) {
    if(manifest.schema!=='desset-prime-static-web-package-v1' || manifest.noindex!==true || manifest.domain!=='none') fail('Candidate public-policy metadata changed');
    if(manifest.totalBytes!==lock.package_bytes || manifest.files?.length!==lock.package_files) fail('Manifest package totals changed');
    for(const item of manifest.files || []) {
      if(!safePath(item.path) || tracked.has(item.path)) {fail('Invalid/duplicate manifest path');continue;}
      tracked.set(item.path,item);
      if(!Number.isSafeInteger(item.bytes)||item.bytes<1||!/^[a-f0-9]{64}$/.test(item.sha256)) fail('Invalid manifest hash/size');
    }
    for(const path of needed) if(!tracked.has(path)) fail('Required resource missing: '+path);
  }
  function scan(dir,prefix='') {
    for(const ent of readdirSync(dir,{withFileTypes:true})) {
      const name=prefix?prefix+'/'+ent.name:ent.name, full=resolve(dir,ent.name),st=lstatSync(full);
      if(st.isSymbolicLink()||(!st.isDirectory()&&!st.isFile())) {fail('Link or invalid object: '+name);continue;}
      if(st.isDirectory()) scan(full,name);
      else {
        if(seen.has(name)){fail('Duplicate path: '+name);continue;} seen.add(name);
        if(name==='site-manifest.json') continue;
        const spec=tracked.get(name);
        if(!spec){fail('Extra file: '+name);continue;}
        const bytes=readFileSync(full);
        if(bytes.length!==spec.bytes||sha256(bytes)!==spec.sha256) fail('Content mismatch: '+name);
        if(name.endsWith('.glb') && (bytes.length<12||bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2)) fail('Invalid GLB: '+name);
      }
    }
  }
  try {if(lstatSync(dist).isSymbolicLink()) fail('Symlink distribution');else scan(dist);}
  catch {fail('Cannot inspect distribution');}
  for(const name of tracked.keys()) if(!seen.has(name)) fail('File missing: '+name);
  if(!seen.has('site-manifest.json')) fail('Manifest absent from distribution');
  function txt(path){try{return readFileSync(resolve(dist,path),'utf8');}catch{return '';}}
  const html=txt('index.html'),state=txt('scripts/service-state.js'),headers=txt('_headers');
  if(!html.includes('name="robots" content="noindex,nofollow"')) fail('Noindex safety gate missing');
  if(!headers.includes('Content-Security-Policy')||!headers.includes("script-src 'self'")) fail('CSP missing');
  if(!state.includes('applicationDistribution:"not_published"')||!state.includes('verified:false')) fail('Unverified applications appear available');
  for(const scene of ['choose','prepare','move']) if(!html.includes('srcset="./assets/scene-'+scene+'.webp"')) fail('Distinct story scene missing: '+scene);
  if((html.match(/data-channel-review="pending"/g)||[]).length!==3) fail('Social verification flags changed');
  return {candidate_sha:lock.source_sha,package_files:tracked.size,package_bytes:lock.package_bytes,
    integrity:errors.length?'FAIL':'PASS',release_decision:'NO-GO',release_authorized:false,errors,
    blockers:['Official release currently packages 13 files, not 30','Human visual/legal/channel/hardware approval pending','SEO/canonical/robots release contract not prepared']};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(!process.argv[2]||!process.argv[3]) {console.error('Usage: node scripts/prime-integration-preflight.mjs ABSOLUTE_DIST EXACT_SHA');process.exitCode=2;}
  else {const report=inspectPrime(process.argv[2],process.argv[3]);console.log(JSON.stringify(report,null,2));if(report.integrity!=='PASS')process.exitCode=1;}
}
