import { DETAILS } from "./content.mjs";

const board=document.getElementById("board");
const dialog=document.getElementById("detailDialog");
const kicker=document.getElementById("detailKicker");
const heading=document.getElementById("detailTitle");
const body=document.getElementById("detailBody");
const points=document.getElementById("detailPoints");
const themeButton=document.getElementById("themeButton");

document.querySelectorAll("[data-detail]").forEach(button=>{
  button.addEventListener("click",()=>{
    const detail=DETAILS[button.dataset.detail];
    if(!detail) return;
    kicker.textContent=detail.kicker;
    heading.textContent=detail.title;
    body.textContent=detail.body;
    points.replaceChildren(...detail.points.map(text=>{
      const li=document.createElement("li");
      li.textContent=text;
      return li;
    }));
    if(!dialog.open) dialog.showModal();
  });
});

themeButton.addEventListener("click",()=>{
  const dark=document.body.dataset.theme!=="dark";
  document.body.dataset.theme=dark?"dark":"light";
  themeButton.setAttribute("aria-pressed",String(dark));
  themeButton.setAttribute("aria-label",dark?"Activar el modo claro":"Activar el modo oscuro");
  themeButton.querySelector(".theme-caption").textContent=dark?"CAMBIAR A MODO CLARO.":"CAMBIAR A MODO OSCURO.";
});

document.getElementById("dialogBack").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",event=>{
  if(event.target===dialog) dialog.close();
});

document.querySelectorAll("[data-view-button]").forEach(button=>{
  button.addEventListener("click",()=>{
    const view=button.dataset.viewButton;
    if(view!=="home"&&view!=="sections") return;
    board.dataset.view=view;
    board.setAttribute("aria-label",view==="home"?"Inicio de DELIVER ASSETS":"Secciones de DELIVER ASSETS");
    document.querySelectorAll("[data-view-button]").forEach(item=>{
      if(item.dataset.viewButton===view)item.setAttribute("aria-current","page");
      else item.removeAttribute("aria-current");
    });
  });
});