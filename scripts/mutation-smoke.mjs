import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const svg=readFileSync(new URL("../assets/roles-geometry-v2.svg",import.meta.url),"utf8");
const roles=[
  {name:"Customer",start:"M18 102H235L327 190L235 278H18Z",color:"#1551D8"},
  {name:"Business",start:"M272 12H448V86L360 168L272 86Z",color:"#FFC62F"},
  {name:"Rider",start:"M272 368H448V294L360 212L272 294Z",color:"#111111"},
  {name:"Control",start:"M702 102H485L393 190L485 278H702Z",color:"#FF3328"}
];
const contract=(source)=>roles.every(({start,color})=>source.includes('d="'+start+'" fill="'+color+'"'));
assert.ok(contract(svg),"Los cuatro colores canónicos deben permanecer");
for(const role of roles){
  const target='d="'+role.start+'" fill="'+role.color+'"';
  assert.ok(svg.includes(target),"No aparece "+role.name);
  const mutant=svg.replace(target,'d="'+role.start+'" fill="#987654"');
  assert.equal(contract(mutant),false,"La mutación del rol "+role.name+" debe ser rechazada");
}
const ink='x="535" y="208" fill="#111111"';
assert.ok(svg.includes(ink),"CONTROL exige texto legible");
assert.equal((svg.replace(ink,ink.replace("#111111","#FFC62F"))).includes(ink),false);
console.log("Micro-mutación contractual: 4/4 cambios de color detectados. No equivale a mutation testing integral.");
