/* Window Safar · Station stories, stamps and the stamp book. */
/* ---------- station stories ---------- */
let storyShown=-1;
function renderStory(i){if(i===storyShown)return;storyShown=i;$("storyName").textContent=route.st[i][0];$("storyText").textContent=route.stories[i]}
$("storyBtn").onclick=()=>{try{audio();speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(route.st[storyShown][0]+". "+route.stories[storyShown]);u.lang="en-IN";const v=voiceFor("en-in")||voiceFor("en");if(v)u.voice=v;speechSynthesis.speak(u)}catch(e){toast("Your browser can't read this aloud.")}};

/* ---------- progress, stamps, badges ---------- */
let stamps=store.get("ws-stamps",{}),prog=store.get("ws-prog",{});const saveProg=()=>store.set("ws-prog",prog);
const skey=(r,i,kind)=>r.id+":"+i+(kind?":"+kind:"");
/* ---------- stamps: one design per station ---------- */
const STAMP_ICON={
  shimla:'<path d="M-11 7l7-11 4 6 3-4 8 9z" fill="C"/><path d="M5 7v-3" stroke="C" stroke-width="1.6"/>',
  konkan:'<circle cx="5" cy="-5" r="3.2" fill="C"/><path d="M-11 3c3-3 5-3 8 0s5 3 8 0 5-3 8 0M-11 8c3-3 5-3 8 0s5 3 8 0 5-3 8 0" fill="none" stroke="C" stroke-width="1.6"/>',
  thar:'<circle cx="4" cy="-5" r="3.6" fill="C"/><path d="M-12 8c5-7 10-7 14-1 3-4 6-4 10 1z" fill="C"/>',
  pune:'<path d="M-11 8l8-13 5 7 3-3 7 9z" fill="C"/><path d="M-1 -6v-4M3 -6v-4M7 -6v-4" stroke="C" stroke-width="1.3"/>',
  ooty:'<path d="M0-10c8 5 8 14 0 19-8-5-8-14 0-19z" fill="C"/><path d="M0-7v15" stroke="#fff" stroke-width="1.1" opacity=".8"/>',
  darjeeling:'<path d="M-12 8l7-12 4 5 4-9 9 16z" fill="C"/><path d="M-5-4l2 3 2-1M3-8l2 4" stroke="#fff" stroke-width="1.2" fill="none"/>',
  kerala:'<path d="M1 8c0-6 0-11 1-15" stroke="C" stroke-width="1.8" fill="none"/><path d="M2-7c-4-3-9-2-11 1 4-1 7-1 11-1zM2-7c4-3 9-2 11 1-4-1-7-1-11-1zM2-7c-2-4-6-5-9-4 3 1 6 2 9 4zM2-7c2-4 6-5 9-4-3 1-6 2-9 4z" fill="C"/>',
  pamban:'<path d="M-12 1h24M-12 1v6M-4 1v6M4 1v6M12 1v6" stroke="C" stroke-width="1.6" fill="none"/><path d="M-12 1c2-5 6-5 8 0M-4 1c2-5 6-5 8 0M4 1c2-5 6-5 8 0" stroke="C" stroke-width="1.4" fill="none"/><path d="M-12 10c3-2 5-2 8 0s5 2 8 0 5-2 8 0" stroke="C" stroke-width="1.2" fill="none"/>',
  araku:'<path d="M-12 8c4-8 8-8 12-2 4-6 8-6 12 2z" fill="C"/><path d="M-6-4a4 4 0 0 1 7-2 3 3 0 0 1 5 2z" fill="C"/>'
};
const sEsc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function stampArt(r,i,date,kind){
  const nm=r.st[i][0].toUpperCase(),col=kind?"#c9302c":r.ink,rot=(rnd(i,r.id.length)*18-9).toFixed(1),uid="s"+r.id+i+(kind?"d":"")+Math.random().toString(36).slice(2,6);
  const fs=nm.length>12?7:nm.length>9?8:9.5,dt=sEsc(date||""),icon=(STAMP_ICON[r.id]||"").replace(/C/g,col);
  if(!date)return`<svg viewBox="0 0 100 100" aria-hidden="true" class="st-empty"><circle cx="50" cy="50" r="40" fill="none" stroke="#b8ab8a" stroke-width="1.4" stroke-dasharray="4 4"/><text x="50" y="54" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="${Math.min(fs,8.5)}" fill="#a89a78">${sEsc(nm.slice(0,13))}</text></svg>`;
  let shape,txt;
  if(kind){
    shape=`<rect x="12" y="24" width="76" height="52" rx="3" fill="none" stroke="${col}" stroke-width="3"/><rect x="17" y="29" width="66" height="42" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="2 2"/>`;
    txt=`<text x="50" y="43" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="8.5" fill="${col}" letter-spacing="1">GOT DOWN</text><text x="50" y="55" text-anchor="middle" font-family="Hind, sans-serif" font-weight="700" font-size="${fs}" fill="${col}">${sEsc(nm)}</text><text x="50" y="66" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7" fill="${col}">PLATFORM 1 · ${dt}</text>`;
  }else{
    const v=i%4;
    if(v===0){shape=`<circle cx="50" cy="50" r="44" fill="none" stroke="${col}" stroke-width="3"/><circle cx="50" cy="50" r="31" fill="none" stroke="${col}" stroke-width="1.4"/><path id="${uid}" d="M14 50a36 36 0 0 1 72 0" fill="none"/>`;
      txt=`<text font-family="IBM Plex Mono, monospace" font-weight="600" font-size="${fs}" fill="${col}" letter-spacing="1"><textPath href="#${uid}" startOffset="50%" text-anchor="middle">${sEsc(nm)}</textPath></text><g transform="translate(50 50) scale(1.05)">${icon}</g><text x="50" y="72" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="${col}">${dt}</text>`}
    else if(v===1){shape=`<rect x="10" y="18" width="80" height="64" rx="6" fill="none" stroke="${col}" stroke-width="3"/><rect x="15" y="23" width="70" height="54" rx="3" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="3 2"/>`;
      txt=`<g transform="translate(50 38) scale(.9)">${icon}</g><text x="50" y="60" text-anchor="middle" font-family="Hind, sans-serif" font-weight="700" font-size="${Math.min(fs,nm.length>8?8.5:10)}" fill="${col}">${sEsc(nm)}</text><text x="50" y="72" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7" fill="${col}">${dt}</text>`}
    else if(v===2){shape=`<path d="M33 8h34l25 25v34L67 92H33L8 67V33z" fill="none" stroke="${col}" stroke-width="3"/><path d="M36 15h28l21 21v28L64 85H36L15 64V36z" fill="none" stroke="${col}" stroke-width="1.2"/>`;
      txt=`<g transform="translate(50 37) scale(.95)">${icon}</g><text x="50" y="60" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="${fs}" fill="${col}">${sEsc(nm)}</text><text x="50" y="72" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7" fill="${col}">${dt}</text>`}
    else{shape=`<ellipse cx="50" cy="50" rx="45" ry="33" fill="none" stroke="${col}" stroke-width="3"/><ellipse cx="50" cy="50" rx="39" ry="27" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="1.5 2.5"/><path d="M10 50h11M79 50h11" stroke="${col}" stroke-width="1.4"/>`;
      txt=`<g transform="translate(50 39) scale(.8)">${icon}</g><text x="50" y="58" text-anchor="middle" font-family="Hind, sans-serif" font-weight="700" font-size="${fs+.5}" fill="${col}">${sEsc(nm)}</text><text x="50" y="69" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="6.5" fill="${col}">${dt}</text>`}
  }
  return`<svg viewBox="0 0 100 100" aria-hidden="true" class="st"><g transform="rotate(${rot} 50 50)" filter="url(#inkf)" opacity=".9">${shape}${txt}</g></svg>`;
}
const stampSVG=stampArt;
function collect(i,kind){
  const k=skey(route,i,kind);if(stamps[k])return;
  stamps[k]=new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short"}).toUpperCase();store.set("ws-stamps",stamps);
  const wk=sceneWx(),tm=sceneTime();if(wk==="rain"||wk==="storm")prog.rain=true;if(tm==="night")prog.night=true;
  const done=!kind&&route.st.every((_,j)=>stamps[skey(route,j)]);if(done)(prog.done=prog.done||{})[route.id]=true;saveProg();
  renderStamps(k);pressStamp(route,i,stamps[k],kind);track("stamp_collected");if(done)track("route_completed");
  toast(done?(lang==="hi"?"रूट पूरा! आपकी किताब में सुनहरी मुहर लगी।":"Route complete! A gold seal is in your stamp book."):(kind?"Got-down stamp: ":"Stamp collected: ")+route.st[i][0]);
}
/* the rubber-stamp moment on the window */
function pressStamp(r,i,date,kind){
  const el=$("press");el.innerHTML=stampArt(r,i,date,kind);el.hidden=false;el.classList.remove("go");void el.offsetWidth;el.classList.add("go");
  clearTimeout(pressStamp.t);pressStamp.t=setTimeout(()=>{el.hidden=true;el.classList.remove("go")},2600);
  try{if(AX&&AX.state==="running"){const ac=AX,t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(140,t+.18);o.frequency.exponentialRampToValueAtTime(45,t+.34);g.gain.setValueAtTime(0,t+.17);g.gain.linearRampToValueAtTime(.5,t+.19);g.gain.exponentialRampToValueAtTime(.001,t+.42);o.connect(g).connect(ac.destination);o.start(t+.17);o.stop(t+.45)}}catch(e){}
}
/* ---------- the stamp book ---------- */
let bookPage=0,bookFresh=null;
const routeGot=r=>r.st.filter((_,i)=>stamps[skey(r,i)]).length;
function renderStamps(fresh){
  if(fresh)bookFresh=fresh;
  const total=ROUTES.reduce((a,r)=>a+r.st.length,0),got=Object.keys(stamps).length;
  $("stampCount").textContent=got+(lang==="hi"?" ठप्पे":got===1?" stamp":" stamps");
  const recent=Object.entries(stamps).slice(-4).reverse(),mini=$("miniStamps");mini.innerHTML="";
  if(!recent.length)mini.innerHTML='<p class="mutedline">Your first stamp arrives at the next station.</p>';
  for(const [k,d] of recent){const [rid,i,kind]=k.split(":"),r=ROUTES.find(x=>x.id===rid);if(r){const w=document.createElement("span");w.innerHTML=stampArt(r,+i,d,kind);if(k===fresh)w.firstChild.classList.add("stamp-new");mini.appendChild(w.firstChild)}}
  if(!$("stamps").hidden)drawBook();
}
function fabricStrip(r){const c=CURT[r.id];return c?`background-image:url('data:image/svg+xml,${encodeURIComponent(c.body).replace(/'/g,"%27")}');background-size:${c.bs}`:""}
function drawBook(dir){
  const sp=$("sbSpread"),pages=ROUTES.length+1;bookPage=Math.max(0,Math.min(pages-1,bookPage));
  const total=ROUTES.reduce((a,r)=>a+r.st.length,0),got=Object.keys(stamps).filter(k=>k.split(":").length===2).length,downs=Object.keys(stamps).filter(k=>k.endsWith(":down")).length,full=ROUTES.filter(r=>routeGot(r)===r.st.length).length;
  let L,R;
  if(bookPage===0){
    L=`<div class="sb-cover"><div class="sb-emb"><svg viewBox="0 0 60 60" aria-hidden="true"><rect x="8" y="6" width="44" height="40" rx="8" fill="none" stroke="#e9c46a" stroke-width="2.4"/><path d="M8 20h44M8 33h44M30 6v40" stroke="#e9c46a" stroke-width="1.6"/><path d="M14 52h32" stroke="#e9c46a" stroke-width="2.4"/></svg></div><div class="sb-hi">विंडो सफ़र</div><div class="sb-en">WINDOW SAFAR</div><div class="sb-sub">STAMP BOOK · ठप्पों की किताब</div><div class="sb-no">No. ${String(4521187+got).slice(-6)}</div></div>`;
    R=`<div class="sb-paper"><span class="eyebrow">Belongs to</span><div class="sb-owner">${sEsc(window.__wsName||"Traveller")}</div>
      <div class="sb-stats"><div><b>${got}</b><span>of ${total} station stamps</span></div><div><b>${full}</b><span>routes complete</span></div><div><b>${downs}</b><span>got-down stamps</span></div></div>
      <ol class="sb-index">${ROUTES.map((r,ix)=>{const g=routeGot(r),n=r.st.length;return`<li><button type="button" data-page="${ix+1}"><span class="sw" style="${fabricStrip(r)}"></span><span class="nm">${sEsc(r.name)}</span><span class="bar"><i style="width:${g/n*100}%;background:${r.ink}"></i></span><span class="ct">${g}/${n}</span></button></li>`}).join("")}</ol>
      <p class="sb-hint">You get a stamp each time your train stops at a station, and a red one when you get down at the platform.</p></div>`;
  }else{
    const r=ROUTES[bookPage-1],g=routeGot(r),n=r.st.length,done=g===n,c=CURT[r.id];
    L=`<div class="sb-paper"><div class="sb-fabric" style="${fabricStrip(r)}"></div><span class="eyebrow">Page ${bookPage} · ${r.free?"Free route":"Pass route"}</span><h3 class="sb-route">${sEsc(r.name)}</h3>
      <p class="sb-blurb">${sEsc(r.blurb)}</p><div class="sb-prog"><span class="bar"><i style="width:${g/n*100}%;background:${r.ink}"></i></span><span>${g} of ${n} stations</span></div>
      ${c?`<p class="sb-fab">Curtains: ${sEsc(c.n)}, ${sEsc(c.place)}</p>`:""}
      ${done?`<div class="sb-seal" title="Route complete"><svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#d4a017">${Array.from({length:16},(_,k)=>`<path d="M50 4l5 10h-10z" transform="rotate(${k*22.5} 50 50)"/>`).join("")}</g><circle cx="50" cy="50" r="38" fill="#d4a017"/><circle cx="50" cy="50" r="31" fill="none" stroke="#fff3c4" stroke-width="1.5"/><text x="50" y="47" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="9" fill="#5a3d00">ROUTE</text><text x="50" y="60" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="9" fill="#5a3d00">COMPLETE</text></svg></div>`:`<p class="sb-hint">${n-g} more ${n-g===1?"stamp":"stamps"} to fill this page.</p>`}
      <button type="button" class="sb-ride" data-ride="${r.id}">Ride this route</button></div>`;
    R=`<div class="sb-paper sb-grid">${r.st.map((s,i)=>{const k=skey(r,i),d=stamps[k],dd=stamps[k+":down"];return`<figure class="${k===bookFresh||k+":down"===bookFresh?"fresh":""}">${stampArt(r,i,d)}${dd?`<span class="sb-down">${stampArt(r,i,dd,"down")}</span>`:""}<figcaption>${sEsc(s[0])}</figcaption></figure>`}).join("")}</div>`;
  }
  sp.innerHTML=`<div class="sb-page l">${L}</div><div class="sb-page r">${R}</div>`;
  sp.classList.remove("turn-f","turn-b");if(dir){void sp.offsetWidth;sp.classList.add(dir>0?"turn-f":"turn-b")}
  $("sbPage").textContent=bookPage===0?"Cover":"Page "+bookPage+" of "+ROUTES.length;$("sbPrev").disabled=bookPage===0;$("sbNext").disabled=bookPage===pages-1;
  sp.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{bookPage=+b.dataset.page;drawBook(1)});
  sp.querySelectorAll("[data-ride]").forEach(b=>b.onclick=()=>{const r=ROUTES.find(x=>x.id===b.dataset.ride);closeBook();if(r.free||owned)setRoute(r);else setRoute(r);document.getElementById("ride").scrollIntoView({behavior:"smooth"})});
  bookFresh=null;
}
function openBook(page){bookPage=page==null?Math.max(0,ROUTES.indexOf(route)+1):page;$("stamps").hidden=false;document.body.classList.add("booking");drawBook(1);$("closeBook").focus()}
function closeBook(){$("stamps").hidden=true;document.body.classList.remove("booking")}
$("openBook").onclick=()=>openBook();$("closeBook").onclick=closeBook;
$("sbPrev").onclick=()=>{bookPage--;drawBook(-1)};$("sbNext").onclick=()=>{bookPage++;drawBook(1)};
$("stamps").addEventListener("click",e=>{if(e.target===$("stamps"))closeBook()});
document.addEventListener("keydown",e=>{if($("stamps").hidden)return;if(e.key==="Escape")closeBook();if(e.key==="ArrowRight"&&!$("sbNext").disabled){bookPage++;drawBook(1)}if(e.key==="ArrowLeft"&&!$("sbPrev").disabled){bookPage--;drawBook(-1)}});
$("navJourney").onclick=e=>{e.preventDefault();openBook(0)};
