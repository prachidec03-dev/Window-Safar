/* Window Safar · Ride it for real, UPI tips, sign-in, curtains, co-passenger, the main loop, routes and controls. */
/* ---------- your settings: UPI and affiliate IDs ---------- */

/* ---------- ride it for real ---------- */
function renderReal(){
  const box=$("realLinks");box.innerHTML="";const from=route.st[0][0],to=dest();
  const amz="https://www.amazon.in/s?k="+encodeURIComponent(route.souvenir)+(AFF.amazonTag?"&tag="+encodeURIComponent(AFF.amazonTag):"");
  const stay=AFF.hotelUrl&&!AFF.bookingAid?AFF.hotelUrl:"https://www.booking.com/searchresults.html?ss="+encodeURIComponent(to+", India")+(AFF.bookingAid?"&aid="+encodeURIComponent(AFF.bookingAid):"");
  const links=[[lang==="hi"?"यह ट्रेन बुक करें":"Book this train",AFF.trainUrl],[(lang==="hi"?"रुकिए: ":"Stay in ")+to,stay],[(lang==="hi"?"घर ले जाइए: ":"Take home: ")+route.souvenir,amz]];
  for(const [t,u] of links){const a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener sponsored";a.textContent=t+" ↗";box.appendChild(a)}
}

/* ---------- buy the maker a chai (UPI) ---------- */
const TIPS={chai:[10,"a kulhad chai"],coffee:[20,"a filter coffee"],momos:[60,"a plate of momos"]};
const upiLink=(amt,what)=>"upi://pay?pa="+encodeURIComponent(PAY.upi)+"&pn="+encodeURIComponent(PAY.name)+"&am="+amt+".00&cu=INR&tn="+encodeURIComponent("Window Safar: "+what);
const isPhone=()=>/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
document.querySelectorAll("[data-tip]").forEach(b=>b.onclick=async()=>{track("tip_"+b.dataset.tip);
  const [amt,what]=TIPS[b.dataset.tip];document.querySelectorAll("[data-tip]").forEach(x=>x.setAttribute("aria-pressed",x===b));
  if(!PAY.upi){toast("Tips switch on once the UPI ID is added.");return}
  const link=upiLink(amt,what);$("tipWhat").textContent="₹"+amt+" for "+what+". Thank you!";$("tipId").textContent=PAY.upi;$("tipOpen").href=link;
  $("tipOpen").hidden=!isPhone();$("tipHow").textContent=isPhone()?"Tap below to pay with any UPI app, or scan the code from another phone.":"Scan with any UPI app: Google Pay, PhonePe, Paytm or BHIM.";
  $("tipPay").hidden=false;const box=$("tipQR");box.innerHTML="";
  try{const q=qrcode(0,"M");q.addData(link);q.make();box.innerHTML=q.createImgTag(6,0);box.hidden=false}catch(e){box.hidden=true}
  if(isPhone())location.href=link;
});
$("tipClose").onclick=()=>{$("tipPay").hidden=true;document.querySelectorAll("[data-tip]").forEach(x=>x.setAttribute("aria-pressed","false"))};
$("tipCopy").onclick=async()=>{try{await navigator.clipboard.writeText(PAY.upi);toast("UPI ID copied.")}catch(e){toast(PAY.upi)}};

/* ---------- sign-in and sync ---------- */
if(window.WSAuth&&WSAuth.enabled())WSAuth.onChange(async u=>{
  const el=$("navLogin");
  if(!u){el.textContent=lang==="hi"?"साइन इन":"Sign in";el.removeAttribute("title");return}
  el.textContent=(u.displayName||u.email||"").split(/[ @]/)[0]||"Account";el.title="Your account";window.__wsName=u.displayName||el.textContent;
  const m=await WSAuth.sync(u);if(!m)return;
  stamps=m["ws-stamps"]||{};prog=m["ws-prog"]||{};bought=m["ws-bought"]||[];
  const was=owned;owned=!!m["ws-pass"];renderStamps();if(owned!==was)setRoute(route);
});

/* ---------- regional curtains ---------- */
let curT=0;
const curUrl=x=>'url("data:image/svg+xml,'+encodeURIComponent(x)+'")';
function dressCurtains(){const c=CURT[route.id];if(!c)return;
  document.querySelectorAll(".cur").forEach(el=>{el.style.backgroundImage=curUrl(c.body);el.style.backgroundSize=c.bs;
    el.querySelectorAll(".cb").forEach(b=>{const show=!!c.border&&(!b.classList.contains("ct")||!!c.top);b.hidden=!show;
      if(show){b.style.backgroundImage=curUrl(c.border);b.style.height=c.bh;b.style.backgroundSize="auto "+c.bh}})});
  $("curTag").textContent=lang==="hi"?c.hi:c.n+" · "+c.place}
const setCurtain=o=>$("curtains").classList.toggle("open",o);
function curtainCall(){clearTimeout(curT);const el=$("curtains");
  if(!el.classList.contains("open")){dressCurtains();curT=setTimeout(()=>setCurtain(true),1400);return}
  setCurtain(false);curT=setTimeout(()=>{dressCurtains();curT=setTimeout(()=>setCurtain(true),900)},1550)}
document.querySelectorAll(".cur").forEach(c=>c.onclick=()=>{clearTimeout(curT);setCurtain(!$("curtains").classList.contains("open"))});

/* ---------- co-passenger ---------- */
let cpOn=true,cpSaid={},cpIdle=0,cpGap=0,cpHide=0;
const cpChar=()=>COPAX[route.id];
const cpIsHi=c=>c.hello.length>1;
function cpShow(line){
  const c=cpChar();if(!c||!cpOn)return false;
  $("cpAv").textContent=c.n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  $("cpName").textContent=c.n;$("cpRole").textContent=c.who;
  $("cpLine").textContent=line[0];const tr=$("cpTr");tr.textContent=line[1]||"";tr.hidden=!line[1]||lang==="hi";
  const el=$("copax");el.hidden=false;requestAnimationFrame(()=>el.classList.add("show"));
  clearTimeout(cpHide);cpHide=setTimeout(cpClose,10000);cpGap=0;return true}
function cpClose(){const el=$("copax");el.classList.remove("show");clearTimeout(cpHide);cpHide=setTimeout(()=>el.hidden=true,400)}
function cpSay(key,line){if(cpSaid[key]||!line)return false;cpSaid[key]=1;return cpShow(line)}
function cpReset(){cpSaid={};cpIdle=0;cpGap=8;cpClose()}
function cpFood(){const f=route.food[0].toLowerCase();return cpIsHi(cpChar())?["Platform pe "+f+" mile toh zaroor lena.","If you see "+f+" on the platform, get some."]:["If you see "+f+" on the platform, get some."]}
function cpTick(dt){
  const c=cpChar();if(!c||!cpOn||view!=="ride"||locked()||!$("copax").hidden)return;
  cpGap+=dt;cpIdle+=dt;if(cpGap<14)return;
  if(cpSay("hello",c.hello))return;
  const nx=Math.min(n()-1,curStation()+1),nm=route.st[nx][0];if(c.st&&c.st[nm]&&cpSay("st:"+nm,c.st[nm]))return;
  const wk=sceneWx();if((wk==="rain"||wk==="storm")&&cpSay("rain",c.rain))return;
  if(sceneTime()==="night"&&cpSay("night",c.night))return;
  const w=wx?wx.list[curStation()]:null;if(w&&w.hi>=32&&cpSay("hot",c.hot))return;
  if(cpIdle>45){cpIdle=0;const pool=c.any.filter((_,i)=>!cpSaid["any"+i]);if(pool.length){const i=c.any.indexOf(pool[0]);cpSay("any"+i,c.any[i])}else cpSay("food",cpFood())}
}
$("copax").onclick=e=>{if(e.target.closest("#cpX")){cpClose();return}const c=cpChar(),pool=c.any.filter((_,i)=>!cpSaid["any"+i]);
  if(pool.length){const i=c.any.indexOf(pool[0]);cpSaid["any"+i]=1;cpShow(c.any[i])}else if(!cpSaid.food){cpSaid.food=1;cpShow(cpFood())}else cpClose()};
$("cpBtn").onclick=e=>{cpOn=!cpOn;e.currentTarget.setAttribute("aria-pressed",cpOn);if(!cpOn)cpClose();else{cpGap=14;cpTick(0)}};

/* ---------- loop ---------- */
let last=performance.now(),lastSt=-1,ideaTick=0,ideaShown=-1,trayTick=0,announced={},hornStage=0;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;const lk=!$("lock").hidden;
  if(view==="platform"){
    if(W)drawPlatform(dt);sound.tick(0);platTime+=dt;
    if(platTime>25&&hornStage===0){hornStage=1;horn(false);setTimeout(()=>horn(true),1100);announce(...A.leaving())}
    if(platTime>45&&hornStage===1){hornStage=2;horn(true);announce(...A.last())}
    if(platTime>55&&hornStage===2){hornStage=3;horn(false);setView("ride");toast(lang==="hi"?"आप ठीक समय पर गाड़ी में चढ़ गए!":"You jumped back on just in time!")}
  }else if(mode==="anim"){
    const si=Math.round(dist/GAP),near=Math.abs(dist-si*GAP),atSt=si>0&&si<n();
    let v=220*speedMul*(atSt?Math.max(.08,Math.min(1,near/2600)):1);
    if(matchMedia("(prefers-reduced-motion: reduce)").matches)v*=.4;if(lk)v=0;
    const before=dist;dist+=v*dt;if(dist>(n()-1)*GAP+2500){dist=0;announced={}}
    const ahead=si*GAP-dist;
    if(atSt&&ahead>0&&ahead<3400&&!announced[si]&&!lk){announced[si]=1;announce(...A.next(route.st[si][0]))}
    if(atSt&&near<260&&!locked())collect(si);
    sound.tick(v);if(W)draw();
  }else sound.tick(lk?0:160*speedMul);
  if(locked()&&!lk&&view==="ride"){preview+=dt;if(preview>30){$("lock").hidden=false;$("lockTitle").textContent=route.name+" is in the Window Safar Pass";if(player&&player.pauseVideo)player.pauseVideo()}}
  const cs=curStation();
  if(cs!==lastSt&&view==="ride"){if(mode==="foot"&&lastSt>=0&&!locked()){collect(cs);announce(...A.arrive(route.st[cs][0]))}lastSt=cs;markTrack();platStn=cs;renderPlatStations();renderStory(cs);if(!userPicked){selStn=Math.min(n()-1,cs+(frac()*(n()-1)>cs?1:0));renderDetail()}}
  const f=frac(),nx=Math.min(n()-1,Math.floor(f*(n()-1)+.02)+1);
  $("hudNext").innerHTML=(view==="platform"?t("platform")+" · ":t("next")+": ")+"<b></b>";$("hudNext").querySelector("b").textContent=view==="platform"?route.st[platStn][0]:f>=.999?t("end"):route.st[nx][0];
  const tr=$("track");if(tr.firstChild){const w=tr.scrollWidth-104;$("progress").style.width=(w*f)+"px";$("train").style.left=(52+w*f)+"px"}
  if(fogOn&&++fogT%6===0){fctx.fillStyle="rgba(214,226,232,.012)";fctx.fillRect(0,0,FW,FH)}
  trayTick+=dt;if(trayTick>2){trayTick=0;if(view==="ride")renderTray();updateSky();cpTick(2)}
  requestAnimationFrame(frame);
}

/* ---------- route strip + weather ---------- */
function renderTrack(){
  const tr=$("track");tr.innerHTML='<div class="progress" id="progress"></div><svg class="train" id="train" viewBox="0 0 30 22" aria-hidden="true"><rect x="1" y="3" width="26" height="14" rx="4" fill="#e0b45a"/><rect x="4" y="6" width="6" height="5" rx="1" fill="#173238"/><rect x="12" y="6" width="6" height="5" rx="1" fill="#173238"/><rect x="20" y="6" width="5" height="5" rx="1" fill="#173238"/><circle cx="8" cy="19" r="2.5" fill="#8a8a8a"/><circle cx="20" cy="19" r="2.5" fill="#8a8a8a"/></svg>';
  route.st.forEach((s,i)=>{const w=wx?wx.list[i]:null,d=document.createElement("div");d.className="stn";d.dataset.i=i;
    d.innerHTML=`<span class="dot"></span><button type="button"><span class="sname"></span>${w?`<span class="wx">${icon(w.kind,w.day===0)}${w.temp}°</span><span class="rainp">${w.rain}% rain</span>`:'<span class="wx">…</span>'}</button>`;
    d.querySelector(".sname").textContent=s[0];d.querySelector("button").onclick=()=>{userPicked=true;selStn=i;renderDetail();markTrack();renderStory(i)};tr.appendChild(d)});
  markTrack();renderDetail();
}
function markTrack(){const cs=curStation();document.querySelectorAll(".stn").forEach(el=>{const i=+el.dataset.i;el.classList.toggle("past",i<cs);el.classList.toggle("here",i===cs);el.setAttribute("aria-current",i===selStn)})}
function renderDetail(){
  const s=route.st[selStn],w=wx?wx.list[selStn]:null,el=$("detail");if(!w){el.innerHTML='<span class="dline">Loading weather…</span>';return}
  el.innerHTML=`${icon(w.kind,w.day===0)}<div><div class="dname"></div><div class="dline">${WXNAME[w.kind]} · ${w.temp}°C now · high ${w.hi}° / low ${w.lo}° · ${w.rain}% chance of rain</div><div class="pack">${packTip(w)}</div></div><div class="ctrls"><button class="go" type="button" data-a="ride">Ride here</button><button class="go" type="button" data-a="down">Get down here</button></div>`;
  el.querySelector(".dname").textContent=s[0];el.querySelector('[data-a="ride"]').onclick=()=>{userPicked=false;if(view==="platform")setView("ride");seekTo(selStn)};el.querySelector('[data-a="down"]').onclick=()=>getDown(selStn);
}
async function refreshWeather(){const r=route;wx=null;$("wxsrc").textContent="Loading weather…";renderTrack();const got=await loadWeather(r);if(r!==route)return;wx=got;
  if(got.live){const tm=new Date(got.time+":00+05:30");$("wxsrc").innerHTML=`<b>Live</b> · updated ${tm.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit",timeZone:"Asia/Kolkata"})} IST · Open-Meteo`}
  else $("wxsrc").innerHTML="Typical mid-October weather · <b>live forecast</b> loads when the page is hosted";renderTrack();lastSnack="";renderTray()}

/* ---------- platform view ---------- */
const ANN=s=>`यात्रीगण कृपया ध्यान दें · Passengers, your attention please. The ${route.name.replace("→","to")} train is standing on platform number 1 at ${s}. Please keep your luggage with you. Chai, ${route.food[0].toLowerCase()} and samosa available on the platform.    `;
function setView(v){
  view=v;$("glass").classList.toggle("plat",v==="platform");$("ticker").hidden=v!=="platform";$("platBtn").textContent=v==="platform"?t("boardAgain"):t("getDown");
  if(v==="platform"){if(player&&player.pauseVideo)player.pauseVideo();$("yt").hidden=true;$("tickerText").textContent=ANN(route.st[platStn][0]).repeat(2);platX=0;platTime=0;hornStage=0;renderStory(platStn)}
  else if(mode==="foot")startClip();
  hudMode();renderPlatStations();
}
function getDown(i){
  if(locked()){toast("This route's platforms open with the Window Safar Pass.");return}
  try{audio()}catch(e){}
  platStn=i;if(mode==="anim")dist=i*GAP;setView("platform");collect(i,"down");track("got_down");if(!cpSaid.down){cpSaid.down=1;setTimeout(()=>{const c=cpChar();if(c&&cpOn)cpShow(cpIsHi(c)?CP_DOWN.hi:CP_DOWN.en)},2500)}announce(...A.platform(route.st[i][0]));
  document.getElementById("ride").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderPlatStations(){const box=$("platStations");box.innerHTML="";route.st.forEach((s,i)=>{const b=document.createElement("button");b.type="button";b.className="tog";b.textContent=(lang==="hi"?"उतरें: ":"Get down at ")+s[0];b.setAttribute("aria-pressed",view==="platform"&&i===platStn);b.onclick=()=>getDown(i);box.appendChild(b)})}
function boardAgain(){setView("ride");track("boarded_again");const nx=route.st[Math.min(n()-1,platStn+1)][0];toast(lang==="hi"?"सब सवार! अगला स्टेशन: "+nx:"All aboard! Next station: "+nx);try{horn(false)}catch(e){}}
$("platBtn").onclick=()=>{if(view==="platform")boardAgain();else getDown(Math.max(0,curStation()))};

function rotateIdea(){}

/* ---------- split-flap board ---------- */
const CH=" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789→·:";const SLOTS=12,boardEl=$("board");let boardText="",phrase=0,boardTimer=0;
for(let i=0;i<SLOTS;i++){const f=document.createElement("span");f.className="flap blank";f.textContent=" ";boardEl.appendChild(f);f.onmouseenter=()=>tick(f,f.dataset.c||" ",4)}
function tick(f,target,steps){let k=0;const go=()=>{f.classList.remove("spin");void f.offsetWidth;f.classList.add("spin");const c=k>=steps?target:CH[Math.floor(Math.random()*CH.length)];f.textContent=c;f.classList.toggle("blank",c===" ");if(k++<steps)setTimeout(go,70)};go()}
function flipTo(text){text=text.toUpperCase().slice(0,SLOTS);const pad=Math.floor((SLOTS-text.length)/2);text=(" ".repeat(pad)+text).padEnd(SLOTS," ");if(text===boardText)return;boardText=text;[...boardEl.children].forEach((f,i)=>{f.dataset.c=text[i];setTimeout(()=>tick(f,text[i],6+((i*3)%7)),i*55)})}
const PHRASES=()=>era?["YEAR 2036","TO "+dest(),"FUTURE STOP"]:["WINDOW SAFAR","TO "+dest(),"CHAI · CHAI","PLATFORM 1","NEXT: "+route.st[Math.min(n()-1,curStation()+1)][0]];
boardEl.onclick=()=>{phrase=(phrase+1)%PHRASES().length;flipTo(PHRASES()[phrase]);clearTimeout(boardTimer);boardTimer=setTimeout(()=>{phrase=0;flipTo(PHRASES()[0])},6000)};

/* ---------- routes, pass ---------- */
function setRoute(r){
  const changed=r!==route;route=r;dist=0;clipIdx=0;userPicked=false;selStn=0;lastSt=-1;ideaShown=-1;platStn=0;preview=0;announced={};storyShown=-1;$("lock").hidden=true;
  if(view==="platform")setView("ride");
  $("rt").textContent=r.name;$("rb").textContent=r.blurb;$("fn").textContent=r.futNote;$("fn").hidden=!era;
  $("routeKind").textContent=r.st.length+" stations · "+(r.free?"free route":owned?"Pass route":"Pass route · 30 second preview");
  $("pnr").textContent="PNR "+(4521187+ROUTES.indexOf(r)*7331).toString().replace(/(\d{3})(\d{4})/,"$1-$2");
  renderTickets();refreshWeather();music.route();cpReset();curtainCall();renderPlatStations();footNote();lastSnack="";renderTray();renderStory(0);updateSky();
  if(mode==="foot"){if(hasFoot())startClip();else setMode("anim")}else if(ytOK&&hasFoot()&&!era)setMode("foot");renderReal();
  flipTo("TO "+dest());clearTimeout(boardTimer);boardTimer=setTimeout(()=>flipTo(era?"YEAR 2036":"WINDOW SAFAR"),2600);
  if(changed)announce(...A.welcome(r.name.replace("→","to")),false);
  if(changed){track("route_"+r.id);try{window.clarity&&clarity("set","route",r.id)}catch(e){}}
}
/* one shareable page per route */
const slugOf=r=>r.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const routeUrl=r=>"https://windowsafar.com/"+slugOf(r)+".html";
$("shareBtn").onclick=async()=>{const url=routeUrl(route),text=(lang==="hi"?"मेरे साथ यह ट्रेन सफ़र कीजिए: ":"Ride the ")+route.name.replace("→","to")+(lang==="hi"?"":" train with me, from your desk. Real window footage, chai and a stamp book.");track("share_route");
  if(navigator.share){try{await navigator.share({title:"Window Safar · "+route.name,text,url});return}catch(e){if(e&&e.name==="AbortError")return}}
  try{await navigator.clipboard.writeText(text+" "+url);toast(lang==="hi"?"लिंक कॉपी हो गया। WhatsApp पर भेजिए!":"Link copied. Paste it in WhatsApp!")}catch(e){toast(url)}};
function renderTickets(){
  const box=$("tickets");box.innerHTML="";
  ROUTES.forEach((r,ix)=>{
    const b=document.createElement("button");b.type="button";b.className="ticket"+(!r.free&&!owned?" locked":"");if(r===route)b.setAttribute("aria-current","true");
    b.innerHTML='<span class="t-top"><span></span><span></span></span><span class="t-name"></span><span class="t-sub"></span><span class="t-class"></span>';
    const tt=b.querySelectorAll(".t-top span");tt[0].textContent="No. "+String(ix+1).padStart(3,"0");tt[1].textContent=r.free?"General":owned?"Pass":"Pass · preview";
    b.querySelector(".t-name").textContent=r.name;b.querySelector(".t-sub").textContent=r.st.length+" stations · "+r.st[0][0]+" to "+r.st[r.st.length-1][0];
    const old=r.songs.find(s=>s[3]==="old");b.querySelector(".t-class").textContent="Soundtrack: "+r.songs[0][1]+(old&&old!==r.songs[0]?" · "+old[1]:"");
    b.onclick=()=>{setRoute(r);document.getElementById("ride").scrollIntoView({behavior:"smooth"})};
    b.onpointermove=e=>{if(e.pointerType!=="mouse"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;const q=b.getBoundingClientRect(),x=(e.clientX-q.left)/q.width-.5,y=(e.clientY-q.top)/q.height-.5;b.style.transform=`rotateY(${x*14}deg) rotateX(${-y*14}deg) translateZ(6px)`};
    b.onpointerleave=()=>b.style.transform="";box.appendChild(b);
  });
}
$("lockBuy").onclick=()=>$("pass").scrollIntoView({behavior:"smooth",block:"center"});$("lockBack").onclick=()=>setRoute(ROUTES[0]);
$("unlock").onclick=()=>{track("pass_demo_unlock");owned=true;store.set("ws-pass",true);setRoute(route);$("passNote").textContent="Unlocked on this device for the demo. All routes are open.";toast("All routes unlocked. Enjoy the ride.")};

/* ---------- controls ---------- */
document.querySelectorAll("[data-mix]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-mix]").forEach(x=>x.setAttribute("aria-pressed",x===b));music.setMix(b.dataset.mix)});
$("sync").onclick=e=>{syncWx=!syncWx;e.currentTarget.setAttribute("aria-pressed",syncWx);lastSnack="";renderTray();toast(syncWx?"The window now matches the weather at each station.":"Weather matching off.")};
$("annBtn").onclick=e=>{annOn=!annOn;e.currentTarget.setAttribute("aria-pressed",annOn);if(!annOn)try{speechSynthesis.cancel()}catch(x){}else{try{audio()}catch(x){}announce(...A.next(route.st[Math.min(n()-1,curStation()+1)][0]))}};
$("ac").onclick=e=>{const on=e.currentTarget.getAttribute("aria-pressed")!=="true";e.currentTarget.setAttribute("aria-pressed",on);$("frame").classList.toggle("ac",on);$("coachno").textContent=on?"Coach B2 · Seat 31":"Coach S4 · Seat 23"};
$("fogBtn").onclick=e=>{fogOn=!fogOn;e.currentTarget.setAttribute("aria-pressed",fogOn);$("glass").classList.toggle("drawing",fogOn);if(fogOn){fogResize();fogFill();toast("Draw on the fogged glass with your finger or mouse.")}else fctx.clearRect(0,0,FW,FH)};
$("mFoot").onclick=()=>setMode("foot");$("mAnim").onclick=()=>setMode("anim");$("nextClip").onclick=()=>nextClip(false);
$("vidAudio").onclick=e=>{if(!player)return;const on=e.currentTarget.getAttribute("aria-pressed")!=="true";on?player.unMute():player.mute();e.currentTarget.setAttribute("aria-pressed",on)};
$("musicBtn").onclick=e=>{const on=music.toggle();e.currentTarget.setAttribute("aria-pressed",on);e.currentTarget.textContent=on?t("pause"):t("play")};
$("musicNext").onclick=()=>music.next();
$("langBtn").onclick=()=>{lang=lang==="hi"?"en":"hi";try{localStorage.setItem("ws-lang",lang)}catch(e){}applyLang();renderPlatStations();renderReal();dressCurtains();lastSnack="";renderTray();hudMode()};
function toast(m){const el=$("toast");el.textContent=m;el.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>el.hidden=true,3400)}
const sound=(()=>{
  let on=false,rumbleG,rainG,white,next=0;
  function init(){const ac=audio(),len=ac.sampleRate*2,br=ac.createBuffer(1,len,ac.sampleRate),d=br.getChannelData(0);let b=0;for(let i=0;i<len;i++){b=(b+.02*(Math.random()*2-1))/1.02;d[i]=b*3.5}
    white=ac.createBuffer(1,len,ac.sampleRate);const wd=white.getChannelData(0);for(let i=0;i<len;i++)wd[i]=Math.random()*2-1;
    const s1=ac.createBufferSource();s1.buffer=br;s1.loop=true;const lp=ac.createBiquadFilter();lp.type="lowpass";lp.frequency.value=220;rumbleG=ac.createGain();rumbleG.gain.value=0;s1.connect(lp).connect(rumbleG).connect(ac.destination);s1.start();
    const s2=ac.createBufferSource();s2.buffer=white;s2.loop=true;const hp=ac.createBiquadFilter();hp.type="highpass";hp.frequency.value=1800;rainG=ac.createGain();rainG.gain.value=0;s2.connect(hp).connect(rainG).connect(ac.destination);s2.start()}
  function clack(t0,v){const ac=audio(),s=ac.createBufferSource();s.buffer=white;const bp=ac.createBiquadFilter();bp.type="bandpass";bp.frequency.value=900;bp.Q.value=2;const g=ac.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.005);g.gain.exponentialRampToValueAtTime(.001,t0+.09);s.connect(bp).connect(g).connect(ac.destination);s.start(t0);s.stop(t0+.12)}
  return{toggle(){if(!white)init();on=!on;const ac=audio();if(!on){rumbleG.gain.setTargetAtTime(0,ac.currentTime,.1);rainG.gain.setTargetAtTime(0,ac.currentTime,.1)}return on},
    tick(v){if(!white||!on)return;const ac=audio(),t0=ac.currentTime,k=Math.min(1,v/220),wk=sceneWx();rumbleG.gain.setTargetAtTime(view==="platform"?.02:.04+.18*k,t0,.3);rainG.gain.setTargetAtTime(wk==="rain"||wk==="storm"?.05:0,t0,.5);
      if(v>15&&t0>next){clack(t0+.02,.3*k+.05);clack(t0+.17,.25*k+.04);next=t0+Math.max(.6,1.25/Math.max(.2,k))}}};
})();
$("sound").onclick=e=>{const on=sound.toggle();e.currentTarget.setAttribute("aria-pressed",on)};


/* ---------- hero photo wall ---------- */
(function(){const m=$("mosaic");if(m)requestAnimationFrame(()=>m.classList.add("pop"))})();
/* ---------- start ---------- */
$("marquee").innerHTML=(ROUTES.map(r=>`<span><b>${r.st[0][0]}</b> → ${r.st[r.st.length-1][0]}</span>`).join("")).repeat(2);
/* a route page (for example kalka-shimla.html) or ?route=shimla opens that route */
const startRoute=(()=>{let id=window.WS_ROUTE||"";try{id=new URLSearchParams(location.search).get("route")||id}catch(e){}return ROUTES.find(r=>r.id===id||slugOf(r)===id)||ROUTES[0]})();
route=null;setRoute(startRoute);resize();renderStamps();applyLang();requestAnimationFrame(frame);
loadYT().then(ok=>{music.label();footNote();if(ok&&!era&&hasFoot())setMode("foot")});
