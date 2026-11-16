import { DETAILS } from "./content.mjs";

const board=document.getElementById("board");
const dialog=document.getElementById("detailDialog");
const kicker=document.getElementById("detailKicker");
const heading=document.getElementById("detailTitle");
const body=document.getElementById("detailBody");
const points=document.getElementById("detailPoints");
const themeButton=document.getElementById("themeButton");
const dialogContent=dialog.querySelector(".dialog-content");

document.querySelectorAll("[data-detail]").forEach(button=>{
  button.addEventListener("click",()=>{
    const detail=DETAILS[button.dataset.detail];
    if(!detail) return;
    kicker.textContent=detail.kicker;
    heading.textContent=detail.title;
    dialogContent.querySelector(".project-prose")?.remove();
    const isProject=button.dataset.detail==="project";
    dialogContent.classList.toggle("dialog-content--project",isProject);
    body.replaceChildren();
    if(isProject){
      const emphasis=document.createElement("strong");
      emphasis.textContent=detail.body;
      body.append(emphasis);

      // Preserve every approved paragraph, without changing the site's typography.
      const prose=document.createElement("div");
      prose.className="project-prose";
      detail.points.forEach((text,index)=>{
        const p=document.createElement("p");
        const prefix=["Nuestro propósito:","Nuestro horizonte:"].find(label=>text.startsWith(label));
        if(prefix){
          const strong=document.createElement("strong");
          strong.textContent=prefix;
          p.append(strong,document.createTextNode(text.slice(prefix.length)));
        }else if(index===detail.points.length-1){
          const note=document.createElement("em");
          note.textContent=text;
          p.append(note);
        }else p.textContent=text;
        prose.append(p);
      });
      points.replaceChildren();
      points.hidden=true;
      points.style.display="none";
      points.after(prose);
    }else{
      body.textContent=detail.body;
      points.hidden=false;
      points.style.display="";
      points.replaceChildren(...detail.points.map(text=>{
        const li=document.createElement("li");
        li.textContent=text;
        return li;
      }));
    }
    if(!dialog.open) dialog.showModal();
    dialogContent.scrollTop=0;
  });
});

themeButton.addEventListener("click",()=>{
  const dark=document.body.dataset.theme!=="dark";
  document.body.dataset.theme=dark?"dark":"light";
  themeButton.setAttribute("aria-pressed",String(dark));
  themeButton.setAttribute("aria-label",dark?"Activar el modo claro":"Activar el modo oscuro");
  themeButton.querySelector(".theme-caption").textContent=dark?"ACTIVAR MODO CLARO.":"ACTIVAR MODO OSCURO.";
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