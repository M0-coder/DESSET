import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
const executable=fileURLToPath(new URL("./cloudflare-release-candidate.mjs",import.meta.url));
for(const [label,overrides] of [
 ["sin modo",{}],
 ["modo no local",{DESSET_CF_RELEASE_MODE:"PRODUCTION"}],
 ["credencial activación",{DESSET_CF_RELEASE_MODE:"LOCAL_TEST_ONLY",DESSET_RELEASE_APPROVED:"YES"}],
 ["Cloudflare token",{DESSET_CF_RELEASE_MODE:"LOCAL_TEST_ONLY",CLOUDFLARE_API_TOKEN:"placeholder"}],
 ["CF token",{DESSET_CF_RELEASE_MODE:"LOCAL_TEST_ONLY",CF_API_TOKEN:"placeholder"}]
]){
 const {DESSET_CF_RELEASE_MODE,DESSET_RELEASE_APPROVED,CLOUDFLARE_API_TOKEN,CF_API_TOKEN,...env}=process.env;
 const r=spawnSync(process.execPath,[executable],{env:{...env,...overrides},encoding:"utf8",timeout:10000});
 assert.equal(r.status,2,"Llamada indebida permitida: "+label);
 assert.match(r.stderr,/NO-GO/);
}
console.log("CF RELEASE NEGATIVE: 5/5 contextos de activación inválidos rechazados.");
