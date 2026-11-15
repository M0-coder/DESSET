import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
const script=fileURLToPath(new URL("./release-package.mjs",import.meta.url));
const cases=[
 ["sin modo",{DESSET_OFFICIAL_ORIGIN:"https://desset.lat"}],
 ["modo de producción no permitido",{DESSET_PACKAGE_MODE:"PRODUCTION",DESSET_OFFICIAL_ORIGIN:"https://desset.lat"}],
 ["dominio equivocado",{DESSET_PACKAGE_MODE:"LOCAL_TEST_ONLY",DESSET_OFFICIAL_ORIGIN:"https://desset.com"}],
 ["http inseguro",{DESSET_PACKAGE_MODE:"LOCAL_TEST_ONLY",DESSET_OFFICIAL_ORIGIN:"http://desset.lat"}],
 ["ruta no permitida",{DESSET_PACKAGE_MODE:"LOCAL_TEST_ONLY",DESSET_OFFICIAL_ORIGIN:"https://desset.lat/comprar"}],
 ["credencial antigua no autorizada",{DESSET_PACKAGE_MODE:"LOCAL_TEST_ONLY",DESSET_RELEASE_APPROVED:"YES",DESSET_OFFICIAL_ORIGIN:"https://desset.lat"}]
];
for(const [name,values] of cases){
 const {DESSET_OFFICIAL_ORIGIN,DESSET_PACKAGE_MODE,DESSET_RELEASE_APPROVED,...env}=process.env;
 const r=spawnSync(process.execPath,[script],{env:{...env,...values},encoding:"utf8",timeout:10000});
 assert.equal(r.status,2,name+" no debe generar paquete; stdout="+r.stdout+" stderr="+r.stderr);
 assert.match(r.stderr,/NO-GO/);
}
console.log("Seguridad del empaquetador: 6/6 llamadas no autorizadas rechazadas. Solo está permitido el ensayo local.");
