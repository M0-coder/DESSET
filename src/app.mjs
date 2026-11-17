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
    dialogContent.querySelector(".identity-prose")?.remove();
    dialogContent.querySelector(".channel-links")?.remove();
    dialogContent.querySelector(".channel-note")?.remove();
    const isProject=button.dataset.detail==="project";
    const isIdentity=button.dataset.detail==="company";
    const isChannels=button.dataset.detail==="contact";
    dialogContent.classList.toggle("dialog-content--project",isProject);
    dialog.classList.toggle("detail-dialog--project",isProject);
    dialogContent.classList.toggle("dialog-content--identity",isIdentity);
    dialog.classList.toggle("detail-dialog--identity",isIdentity);
    dialogContent.classList.toggle("dialog-content--channels",isChannels);
    dialog.classList.toggle("detail-dialog--channels",isChannels);
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
        const prefix=["Nuestra visión","Nuestro propósito:","Nuestro horizonte:"].find(label=>text.startsWith(label));
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
    }else if(isIdentity){
      const [firstLine,secondLine]=detail.title.split("\n");
      const accent=document.createElement("span");
      accent.className="identity-accent";
      accent.textContent=secondLine;
      heading.replaceChildren(document.createTextNode(firstLine),document.createElement("br"),accent);
      body.textContent=detail.body;

      const prose=document.createElement("div");
      prose.className="identity-prose";
      detail.points.forEach((text,index)=>{
        const p=document.createElement("p");
        if(index===1){
          const phrase="conexión, confianza y evolución";
          const pos=text.indexOf(phrase);
          if(pos<0)throw new Error("Principios de identidad modificados");
          const strong=document.createElement("strong");
          strong.textContent=phrase;
          p.append(document.createTextNode(text.slice(0,pos)),strong,document.createTextNode(text.slice(pos+phrase.length)));
        }else if(index===2){
          const strong=document.createElement("strong");
          strong.textContent=text;
          p.append(strong);
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
    }else if(isChannels){
      body.textContent=detail.body;
      points.replaceChildren();
      points.hidden=true;
      points.style.display="none";

      const links=document.createElement("nav");
      links.className="channel-links";
      links.setAttribute("aria-label","Canales oficiales de DESSET");
      const allowedHosts=new Set(["x.com","www.instagram.com","www.tiktok.com","www.facebook.com","www.youtube.com"]);
      detail.links.forEach(({label,url})=>{
        const target=new URL(url);
        if(target.protocol!=="https:"||!allowedHosts.has(target.hostname)||target.username||target.password){
          throw new Error("Destino externo no autorizado: "+label);
        }
        const a=document.createElement("a");
        a.href=target.href;
        a.target="_blank";
        a.rel="noopener noreferrer";
        a.textContent=label;
        a.setAttribute("aria-label","Abrir "+label+" de DESSET (sitio externo)");
        const arrow=document.createElement("span");
        arrow.textContent="↗";
        arrow.setAttribute("aria-hidden","true");
        a.append(arrow);
        links.append(a);
      });
      const note=document.createElement("p");
      note.className="channel-note";
      note.textContent=detail.points[1];
      points.after(links,note);
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