/**
 * DESSET Prime INTEGRATION-02: offline-only, no-release rehearsal.
 * Reads a locked Prime CI dist, copies it byte-for-byte to a NEW OS temp folder,
 * and adds 3 intentionally non-indexable support files.
 * Never edits existing directories, official assets, DNS, CI or Cloudflare.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, readdirSync, lstatSync, constants } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { inspectPrime } from './prime-integration-preflight.mjs';

const self = fileURLToPath(import.meta.url);
const root = resolve(dirname(self), '..');
const frozen = JSON.parse(readFileSync(join(root,'config/prime-candidate-lock.json'),'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const EXTRA = Object.freeze({
  'robots.txt': 'User-agent: *\nDisallow: /\n',
  'sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n',
  '404.html': '<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Página no encontrada — DESSET</title></head><body><main><h1>Página no encontrada</h1><p>Esta dirección no está disponible.</p><a href="/">Volver a DESSET</a></main></body></html>\n'
});

export function buildPrimeStaging({dist, sourceSha, mode, lock=frozen}) {
  if(mode!=='LOCAL_TEST_ONLY') throw Error('NO-GO: explicit LOCAL_TEST_ONLY mode is required');
  if(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || process.env.DESSET_RELEASE_APPROVED)
    throw Error('NO-GO: production tokens or release authorization present');
  const preflight=inspectPrime(dist,sourceSha,lock);
  if(preflight.integrity!=='PASS' || preflight.release_authorized!==false || preflight.release_decision!=='NO-GO')
    throw Error('NO-GO: source candidate integrity/policy failed: '+preflight.errors.join(' | '));
  const prime=JSON.parse(readFileSync(join(dist,'site-manifest.json'),'utf8'));
  const primePaths=new Set(prime.files.map(e=>e.path));
  for(const p of Object.keys(EXTRA)) if(primePaths.has(p)) throw Error('NO-GO: source already contains reserved staging path '+p);
  let stageDir;
  try {
    stageDir=mkdtempSync(join(tmpdir(),'desset-prime-stage02-'));
    const publicDir=join(stageDir,'public');
    mkdirSync(publicDir,{recursive:false});
    const files=[];
    for(const entry of prime.files){
      const source=join(dist,entry.path),destination=join(publicDir,entry.path);
      mkdirSync(dirname(destination),{recursive:true});
      copyFileSync(source,destination,constants.COPYFILE_EXCL);
      const bytes=readFileSync(destination);
      // Verify again after copying; blocks a time-of-check / time-of-use substitution.
      if(bytes.length!==entry.bytes || hash(bytes)!==entry.sha256) throw Error('NO-GO: source asset changed during copy: '+entry.path);
      files.push({path:entry.path,sha256:entry.sha256,bytes:entry.bytes});
    }
    for(const [name,content] of Object.entries(EXTRA)){
      const bytes=Buffer.from(content,'utf8');
      writeFileSync(join(publicDir,name),bytes,{flag:'wx'});
      files.push({path:name,sha256:hash(bytes),bytes:bytes.length});
    }
    files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
    const all=[];
    function walk(path,partial='') {
      for(const ent of readdirSync(path,{withFileTypes:true})){
        const rel=partial?partial+'/'+ent.name:ent.name;
        const full=join(path,ent.name),stats=lstatSync(full);
        if(stats.isSymbolicLink()||(!stats.isDirectory()&&!stats.isFile())) throw Error('NO-GO: non-regular output '+rel);
        if(stats.isDirectory()) walk(full,rel); else all.push(rel);
      }
    }
    walk(publicDir);
    if(all.length!==33 || all.some(name=>!files.some(f=>f.path===name))) throw Error('NO-GO: unexpected staging file inventory');
    for(const item of files){
      const bytes=readFileSync(join(publicDir,item.path));
      if(bytes.length!==item.bytes||hash(bytes)!==item.sha256) throw Error('NO-GO: staged bytes mismatch '+item.path);
    }
    const html=readFileSync(join(publicDir,'index.html'),'utf8');
    const robots=readFileSync(join(publicDir,'robots.txt'),'utf8');
    const sitemap=readFileSync(join(publicDir,'sitemap.xml'),'utf8');
    if(!html.includes('name="robots" content="noindex,nofollow"') ||
       !robots.includes('Disallow: /') || robots.includes('Allow: /') ||
       /<loc>/.test(sitemap) || /<link rel="canonical"/.test(html))
       throw Error('NO-GO: staging unexpectedly indexable or release SEO was added');
    const report={schema:'desset-prime-integration02-staging-v1',source_repo:lock.repository,
      source_sha:lock.source_sha,source_manifest_sha256:lock.manifest_sha256,
      files,static_files:files.length,total_bytes:files.reduce((n,f)=>n+f.bytes,0),
      original_files:30,staging_only_files:Object.keys(EXTRA),
      noindex:true,robots_disallow_all:true,empty_sitemap:true,
      production_deployment_authorized:false,release_decision:'NO-GO',
      blockers:['This 33-file staging shape is not the official 13-file release contract',
        'Canonical/OG/SEO release policy not authorized','Channel, legal, accessibility and device validation pending']};
    // Evidence lives OUTSIDE the web root; it cannot be served accidentally with the site.
    writeFileSync(join(stageDir,'stage-audit.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    return {stageDir,publicDir,report};
  } catch(error){ if(stageDir)rmSync(stageDir,{recursive:true,force:true});throw error; }
}

if(process.argv[1] && resolve(process.argv[1])===self){
  try {
    const dist=process.argv[2],sha=process.argv[3];
    if(!dist || !sha) throw Error('Usage: DESSET_PRIME_STAGE_MODE=LOCAL_TEST_ONLY node scripts/prime-staging-package.mjs /absolute/prime/dist EXACT_SHA');
    const out=buildPrimeStaging({dist,sourceSha:sha,mode:process.env.DESSET_PRIME_STAGE_MODE});
    console.log(JSON.stringify({publicDir:out.publicDir,stageDir:out.stageDir,
      source_sha:out.report.source_sha,static_files:out.report.static_files,
      total_bytes:out.report.total_bytes,decision:out.report.release_decision,noindex:true},null,2));
  } catch(error){console.error(error.message);process.exitCode=1;}
}
