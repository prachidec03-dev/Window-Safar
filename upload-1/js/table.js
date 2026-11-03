/* Window Safar · The food card beside the window. */
/* ---------- table beside the window ---------- */
let bought=store.get("ws-bought",[]);
/* real station and pantry food by region, with typical prices in rupees (null = included in fare) */
const fmt=v=>v==null?"in fare":"₹"+v;
function autoSnack(){
  const time=sceneTime(),wk=sceneWx(),w=wx?wx.list[curStation()]:null,reg=route.region,at=route.st[curStation()][0];
  let key,why;
  if(wk==="rain"||wk==="storm"){key="rain";why="It's raining at "+at+"."}
  else if(time==="sunrise"){key="sunrise";why="First light over the line. Breakfast before the next stop."}
  else if(time==="dusk"){key="dusk";why="The sunset stretch."}
  else if(time==="night"){key="night";why=route.night?"Dinner on the Rajdhani is served at your berth.":"Dinner, ordered from the pantry car."}
  else if(w&&w.hi>=32){key="hot";why="It's "+w.temp+"° out there."}
  if(key==="night"&&route.night)return{title:RAJDHANI_DINNER[0],why,items:RAJDHANI_DINNER[1]};
  if(key){const m=MENU[key][reg]||MENU[key].north;return{title:m[0],why,items:m[1]}}
  return{title:route.food[0],why:"The thing to buy on this line.",items:[[route.food[0],route.food[1],route.food[3]||""],["Chai",10,""]]};
}
/* dish -> Wikipedia article whose lead photo shows it (freely licensed, via Wikimedia Commons) */
const WIKI={"masala chai":"Masala chai","chai":"Masala chai","cutting chai":"Masala chai","kulhad":"Kulhad","bread pakoda":"Bread pakora","bhajiya":"Pakora",
 "filter coffee":"Indian filter coffee","bajji":"Bajji","darjeeling tea":"Darjeeling tea","momos":"Momo (food)","aloo paratha":"Aloo paratha","poha":"Flattened rice","idli":"Idli",
 "coffee":"Coffee","samosa":"Samosa","bun maska":"Bun maska","vada pav":"Vada pav","masala chana":"Chana masala","thali":"Thali","meals":"Sadhya","thukpa":"Thukpa",
 "tomato soup":"Tomato soup","dal":"Dal","chikki":"Chikki","ice cream":"Kulfi","rice":"Rice","tea":"Masala chai"};
function wikiTitle(name){const k=name.toLowerCase().replace(/\s*\(.*?\)/g,"").replace(/,.*$/,"").trim();if(WIKI[k])return WIKI[k];for(const key of Object.keys(WIKI))if(k.startsWith(key)||k.includes(key))return WIKI[key];return null}
const photoCache=store.get("ws-photos",{});let photoOK=null;
/* where the subject sits in each photo, so crops keep the food centred */
const FOCUS={"01-kulhad-chai":"45% 80%","02-platform-golden-hour":"58% 38%","03-window-fields":"50% 50%","04-friends-jhalmuri":"62% 72%","05-samosa-newspaper":"48% 66%","06-red-coaches-platform":"40% 55%","07-chai-paper-cups-window":"45% 82%","08-jhalmuri-trays":"55% 72%","09-poha-samosa-chai-berth":"45% 74%","10-aloo-paratha":"50% 58%","12-vada-pav":"36% 74%","13-momos-plate":"50% 62%","14-momo-cart-night":"52% 62%","15-veg-thali-trays":"55% 42%"};
const focusOf=src=>{const m=/photos\/([^.]+)\./.exec(src||"");return m&&FOCUS[m[1]]||"50% 50%"};
const LOCAL_PHOTO=[["bun maska","16-bun-maska-chai"],["idli","24-idli-vada"],["filter coffee","25-filter-coffee-night"],["bread pakoda","27-bread-pakoda"],["pakoda","27-bread-pakoda"],
 ["masala chana","28-masala-chana"],["bajji","29-bajji-leaf"],["bhajiya","29-bajji-leaf"],["cutting chai","30-chai-rainy-window"],["chikki","31-chikki-jars"],["chips","32-snacks-berth"],["cold drink","32-snacks-berth"],
 ["ice cream","33-ice-cream"],["kulhad","01-kulhad-chai"],["masala chai","01-kulhad-chai"],["tea","20-chai-irctc-cup"],["chai","07-chai-paper-cups-window"],["samosa","05-samosa-newspaper"],["poha","09-poha-samosa-chai-berth"],
 ["paratha","10-aloo-paratha"],["vada pav","12-vada-pav"],["momos","13-momos-plate"],["thukpa","21-thukpa"],["thali","22-veg-thali-box"],["meals","22-veg-thali-box"],["dal","22-veg-thali-box"],
 ["tomato soup","22-veg-thali-box"],["rice","22-veg-thali-box"],["jhalmuri","08-jhalmuri-trays"]];
function localPhoto(name){const k=name.toLowerCase();
  if(k.includes("coffee")&&!k.includes("filter"))return{src:"photos/food/"+(route.region==="north"?"26-coffee-desert-window":"17-coffee-irctc-cup")+".jpg",title:"Window Safar"};
  for(const [key,f] of LOCAL_PHOTO)if(k.includes(key))return{src:"photos/food/"+f+".jpg",title:"Window Safar"};return null}
async function photosFor(names){
  const loc=names.map(localPhoto);if(loc.every(Boolean))return loc;
  const titles=[...new Set(names.map(wikiTitle).filter(Boolean))].filter(t=>!(t in photoCache));
  if(titles.length&&photoOK!==false){
    try{const ctl=new AbortController();setTimeout(()=>ctl.abort(),5000);
      const url="https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=480&redirects=1&origin=*&titles="+encodeURIComponent(titles.join("|"));
      const j=await (await fetch(url,{signal:ctl.signal})).json();const map={};(j.query.redirects||[]).forEach(r=>map[r.to]=r.from);(j.query.normalized||[]).forEach(r=>map[r.to]=r.from);
      for(const pg of Object.values(j.query.pages||{})){const src=pg.thumbnail&&pg.thumbnail.source;const orig=map[pg.title]?map[map[pg.title]]||map[pg.title]:pg.title;photoCache[pg.title]=src||"";photoCache[orig]=src||""}
      titles.forEach(t=>{if(!(t in photoCache))photoCache[t]=""});photoOK=true;store.set("ws-photos",photoCache);
    }catch(e){photoOK=false}
  }
  return names.map((n,i)=>{if(loc[i])return loc[i];const t=wikiTitle(n);return t&&photoCache[t]?{src:photoCache[t],title:t}:null});
}
const PLATE='<svg viewBox="0 0 120 80" aria-hidden="true"><ellipse cx="60" cy="46" rx="50" ry="22" fill="none" stroke="currentColor" stroke-width="1.5"/><ellipse cx="60" cy="44" rx="34" ry="13" fill="none" stroke="currentColor" stroke-width="1"/><path d="M14 18v14M18 18v14M22 18v14M14 32h8M18 32v28M100 18c6 0 6 14 0 14v28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
function dishFigure(el,ph,name){
  el.innerHTML="";
  if(ph){const img=document.createElement("img");img.src=ph.src;img.alt=name;img.style.objectPosition=focusOf(ph.src);img.loading="lazy";img.onerror=()=>{el.innerHTML='<div class="noimg">'+PLATE+'</div>'};const cap=document.createElement("figcaption");cap.textContent=ph.title==="Window Safar"?"":"Photo: Wikipedia, "+ph.title;el.append(img);if(cap.textContent)el.append(cap)}
  else{el.innerHTML='<div class="noimg">'+PLATE+'</div>'}
}
let lastSnack="",trayReq=0;
async function renderTray(b){
  const a=b?{title:b.name,why:"Bought on the platform at "+route.st[platStn][0]+".",items:[[b.name,b.price,b.detail||""]]}:autoSnack();
  const key=a.title+a.why;if(key===lastSnack&&!b)return;lastSnack=key;const req=++trayReq;
  $("billTime").textContent=new Date().toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"});
  $("trayTitle").textContent=a.title;$("trayWhy").textContent=a.why;
  const ul=$("billItems");ul.innerHTML="";let total=0,anyFare=false;const thumbs=[];
  for(const [nm,pr,dt] of a.items){const li=document.createElement("li"),th=document.createElement("span"),l=document.createElement("span"),r=document.createElement("span");th.className="thumb";l.className="bl";l.textContent=nm;if(dt){const d=document.createElement("small");d.textContent=dt;l.appendChild(d)}r.textContent=fmt(pr);li.append(th,l,r);ul.appendChild(li);thumbs.push(th);if(pr==null)anyFare=true;else total+=pr}
  $("billTotal").textContent=anyFare&&!total?"Included in fare":"₹"+total;
  const bx=$("bought");bx.innerHTML="";bought.forEach(x=>{const s=document.createElement("span");s.textContent=x.name+" · "+x.where;bx.appendChild(s)});
  dishFigure($("dishMain"),null,a.title);thumbs.forEach(t=>t.innerHTML=PLATE);
  const phs=await photosFor(a.items.map(x=>x[0]));if(req!==trayReq)return;
  dishFigure($("dishMain"),phs.find(Boolean)||null,a.title);
  phs.forEach((ph,i)=>{if(ph){thumbs[i].innerHTML="";const im=document.createElement("img");im.src=ph.src;im.alt="";im.style.objectPosition=focusOf(ph.src);thumbs[i].appendChild(im)}});
  $("photoNote").textContent=photoOK===false?"Typical station prices. Food photos load from Wikipedia when the page is hosted on the web.":"Typical station prices. They vary by vendor and city.";
}
