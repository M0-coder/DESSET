import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
const script=fileURLToPath(new URL("./cloudflare-stage-package.mjs",import.meta.url));
const cases=[
 ["sin autorización",{}],
 ["modo de producción",{DESSET_CLOUDFLARE_STAGE:"PRODUCTION"}],
 ["variable antigua",{DESSET_CLOUDFLARE_STAGE:"LOCAL_TEST_ONLY",DESSET_RELEASE_APPROVED:"YES"}],
 ["origen final activado",{DESSET_CLOUDFLARE_STAGE:"LOCAL_TEST_ONLY",DESSET_OFFICIAL_ORIGIN:"https://desset.lat"}],
 ["token de publicación",{DESSET_CLOUDFLARE_STAGE:"LOCAL_TEST_ONLY",CLOUDFLARE_API_TOKEN:"placeholder"}]
];
for(const [name,values] of cases){
 const {DESSET_CLOUDFLARE_STAGE,DESSET_RELEASE_APPROVED,DESSET_OFFICIAL_ORIGIN,CF_API_TOKEN,CLOUDFLARE_API_TOKEN,...env}=process.env;
 const r=spawnSync(process.execPath,[script],{env:{...env,...values},encoding:"utf8",timeout:10000});
 assert.equal(r.status,2,name+": debe ser rechazado antes de tocar archivos");
 assert.match(r.stderr,/NO-GO/);
}
console.log("CLOUDFLARE NEGATIVE: 5/5 intents de empaquetado indebido rechazados.");
