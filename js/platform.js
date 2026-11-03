/* Window Safar · The station platform, fogged glass, horn and announcements. */
/* ---------- platform scene ---------- */
const HAWK=()=>[
  {x:-560,name:"Chai",price:10,kind:"cup",col:"#b5532c",sign:"CHAI ₹10",detail:"Boiled with ginger"},
  {x:-200,name:route.food[0],price:route.food[1],kind:route.food[2],detail:route.food[3],col:"#2f6a8a",sign:(route.food[0]+" ₹"+route.food[1]).toUpperCase()},
  {x:200,name:"Samosa (2)",price:30,kind:"plate",col:"#7a5b12",sign:"SAMOSA ₹30",detail:"Potato and peas"},
  {x:560,name:"Magazines",price:0,kind:"book",col:"#5a3f8a",sign:"BOOK STALL"}
];
let hawkRects=[],hoverHawk=-1;
const WALKERS=Array.from({length:10},(_,i)=>({x:rnd(i,201)*2400-1200,dir:rnd(i,202)<.5?-1:1,sp:30+rnd(i,203)*40,col:["#c9472f","#2f5a8a","#e0b45a","#6b8f3a","#8a3f6a","#3a7a7a"][i%6],coolie:i%5===0,bag:i%3===0,h:.9+rnd(i,204)*.2}));
function drawPlatform(dt){
  const time=sceneTime(),night=time==="night",L=Math.max(LIGHT[time],.55),s=H/400,wk=sceneWx(),name=route.st[platStn][0],cx=W/2-platX;
  const sky=SKY[time];const g=ctx.createLinearGradient(0,0,0,H*.3);g.addColorStop(0,sky[0]);g.addColorStop(1,sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H*.3);
  const wall=era?shade(fc(5),L*.9):shade("#d9c7a3",L);ctx.fillStyle=wall;ctx.fillRect(0,H*.14,W,H*.46);
  ctx.fillStyle=era?shade(fc(4),L*.7):shade("#a0462a",L);ctx.fillRect(0,H*.14,W,8*s);ctx.fillRect(0,H*.56,W,6*s);
  for(let i=Math.floor((platX-W)/180)-1;i<(platX+W)/180+1;i++){const x=cx+i*180;ctx.fillStyle=night?"#ffd98a":shade("#3a4a52",L);ctx.beginPath();ctx.moveTo(x-28*s,H*.48);ctx.lineTo(x-28*s,H*.3);ctx.arc(x,H*.3,28*s,Math.PI,0);ctx.lineTo(x+28*s,H*.48);ctx.fill();ctx.fillStyle=wall;ctx.fillRect(x-2*s,H*.24,4*s,H*.24)}
  ctx.fillStyle="#f4f1de";ctx.beginPath();ctx.arc(cx+320,H*.22,16*s,0,7);ctx.fill();ctx.strokeStyle="#222";ctx.lineWidth=2;ctx.stroke();
  const d=new Date(),hh=d.getHours()%12+d.getMinutes()/60,mm=d.getMinutes();ctx.beginPath();ctx.moveTo(cx+320,H*.22);ctx.lineTo(cx+320+Math.sin(hh/12*6.283)*8*s,H*.22-Math.cos(hh/12*6.283)*8*s);ctx.moveTo(cx+320,H*.22);ctx.lineTo(cx+320+Math.sin(mm/60*6.283)*12*s,H*.22-Math.cos(mm/60*6.283)*12*s);ctx.stroke();
  ctx.fillStyle=shade("#4a3a2a",L*.8);ctx.fillRect(0,0,W,H*.1);ctx.fillStyle=shade("#6b5a44",L*.8);for(let x=-(((platX%40)+40)%40);x<W;x+=40)ctx.fillRect(x,H*.1,20*s,6*s);
  for(let i=Math.floor((platX-W)/300)-1;i<(platX+W)/300+1;i++){const x=cx+i*300+150;ctx.fillStyle=era?shade(fc(i+6),L*.8):shade("#2f4a3a",L);ctx.fillRect(x-5*s,H*.1,10*s,H*.66)}
  board(cx,H*.3,s*1.3,name,L);
  ctx.fillStyle=shade("#9a9284",L);ctx.fillRect(0,H*.6,W,H*.4);
  ctx.strokeStyle=shade("#827a6c",L);ctx.lineWidth=1;for(let x=-(((platX%60)+60)%60);x<W+60;x+=60){ctx.beginPath();ctx.moveTo(x,H*.6);ctx.lineTo(x-40*s,H);ctx.stroke()}
  ctx.fillStyle="#f2c230";ctx.fillRect(0,H*.9,W,5*s);ctx.fillStyle="#2a2522";ctx.fillRect(0,H*.93,W,H*.07);
  for(let i=-3;i<=3;i++){const x=cx+i*420+300;ctx.fillStyle=shade("#5a4128",L);ctx.fillRect(x,H*.62,70*s,6*s);ctx.fillRect(x+4*s,H*.62,4*s,16*s);ctx.fillRect(x+62*s,H*.62,4*s,16*s)}
  hawkRects=[];
  HAWK().forEach((h,i)=>{
    const x=cx+h.x*s,y=H*.82,w=96*s,ht=48*s,hov=i===hoverHawk;
    ctx.fillStyle=shade(h.col,L);ctx.fillRect(x-w/2,y-ht,w,ht);ctx.fillStyle=shade("#2a2522",L);ctx.beginPath();ctx.arc(x-w/2+12*s,y+4*s,6*s,0,7);ctx.arc(x+w/2-12*s,y+4*s,6*s,0,7);ctx.fill();
    ctx.fillStyle="#f4f1de";ctx.fillRect(x-w/2-4*s,y-ht-16*s,w+8*s,14*s);ctx.fillStyle="#141414";ctx.font=`700 ${8.5*s}px Figtree, sans-serif`;ctx.textAlign="center";
    const sw=ctx.measureText(h.sign).width,fit=Math.min(1,w/sw);ctx.save();ctx.translate(x,y-ht-6*s);ctx.scale(fit,1);ctx.fillText(h.sign,0,0);ctx.restore();
    if(h.kind==="cup"){ctx.fillStyle="#c0c4c8";ctx.fillRect(x-8*s,y-ht-34*s,16*s,18*s);ctx.strokeStyle="rgba(255,255,255,.5)";for(let k=0;k<3;k++){const q=performance.now()/600+k;ctx.beginPath();ctx.moveTo(x-4*s+k*4*s,y-ht-36*s);ctx.quadraticCurveTo(x-8*s+k*4*s+Math.sin(q)*4*s,y-ht-46*s,x-4*s+k*4*s,y-ht-56*s);ctx.stroke()}}
    const vx=x+w/2+14*s;ctx.fillStyle=shade("#f0e3c8",L);ctx.fillRect(vx-7*s,y-46*s,14*s,30*s);ctx.fillStyle=shade("#7a4a2a",L);ctx.beginPath();ctx.arc(vx,y-54*s,7*s,0,7);ctx.fill();ctx.fillStyle=shade("#2a2522",L);ctx.fillRect(vx-6*s,y-16*s,4*s,16*s);ctx.fillRect(vx+2*s,y-16*s,4*s,16*s);
    if(hov&&h.price){ctx.strokeStyle="#f2c230";ctx.lineWidth=3;ctx.strokeRect(x-w/2-8*s,y-ht-20*s,w+40*s,ht+30*s);ctx.fillStyle="#f2c230";ctx.font=`700 ${10*s}px Figtree, sans-serif`;ctx.fillText("Tap to buy",x,y+18*s)}
    hawkRects.push({x:x-w/2-8*s,y:y-ht-60*s,w:w+40*s,h:ht+70*s,i});
  });
  for(const p of WALKERS){
    p.x+=p.dir*p.sp*dt;if(p.x>1300)p.x=-1300;if(p.x<-1300)p.x=1300;
    const x=cx+p.x*s,y=H*.88,k=s*p.h,bob=Math.sin(performance.now()/180+p.x)*1.5*k;if(x<-40||x>W+40)continue;
    ctx.fillStyle=shade(p.coolie?"#c9472f":p.col,L);ctx.fillRect(x-8*k,y-58*k+bob,16*k,32*k);ctx.fillStyle=shade("#7a4a2a",L);ctx.beginPath();ctx.arc(x,y-66*k+bob,8*k,0,7);ctx.fill();
    ctx.fillStyle=shade("#2a2522",L);const st=Math.sin(performance.now()/160+p.x)*5*k;ctx.fillRect(x-6*k+st,y-26*k,5*k,26*k);ctx.fillRect(x+1*k-st,y-26*k,5*k,26*k);
    if(p.coolie){ctx.fillStyle=shade("#5a4128",L);ctx.fillRect(x-14*k,y-88*k+bob,28*k,14*k);ctx.fillStyle=shade("#e0b45a",L);ctx.fillRect(x-6*k,y-56*k+bob,12*k,6*k)}
    else if(p.bag){ctx.fillStyle=shade("#3a3f44",L);ctx.fillRect(x+10*k*p.dir,y-24*k,14*k,20*k)}
  }
  if(wk==="rain"||wk==="storm")drawRain(s,90,true);
  if(night){ctx.fillStyle="rgba(255,200,120,.08)";ctx.fillRect(0,0,W,H)}
  if(era){ctx.fillStyle="rgba(143,227,200,.07)";ctx.fillRect(0,0,W,H)}
}

/* ---------- fogged glass ---------- */
const fog=$("fog"),fctx=fog.getContext("2d");let fogOn=false,FW=0,FH=0,drawPtr=null,fogT=0;
function fogResize(){const r=fog.getBoundingClientRect();if(!r.width)return;FW=r.width;FH=r.height;fog.width=FW;fog.height=FH;if(fogOn)fogFill()}
function fogFill(){fctx.globalCompositeOperation="source-over";fctx.fillStyle="rgba(214,226,232,.62)";fctx.fillRect(0,0,FW,FH)}
const fpt=(e,el)=>{const r=el.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
function wipe(a,b){fctx.globalCompositeOperation="destination-out";fctx.lineCap="round";fctx.lineWidth=Math.max(14,FW/40);fctx.beginPath();fctx.moveTo(a.x,a.y);fctx.lineTo(b.x,b.y);fctx.stroke();fctx.globalCompositeOperation="source-over"}
fog.addEventListener("pointerdown",e=>{drawPtr=fpt(e,fog);fog.setPointerCapture(e.pointerId);wipe(drawPtr,drawPtr)});
fog.addEventListener("pointermove",e=>{if(!drawPtr)return;const p=fpt(e,fog);wipe(drawPtr,p);drawPtr=p});
fog.addEventListener("pointerup",()=>drawPtr=null);fog.addEventListener("pointercancel",()=>drawPtr=null);

let drag=null;
cv.addEventListener("pointerdown",e=>{if(view!=="platform")return;drag={x:e.clientX,start:platX,moved:false};cv.setPointerCapture(e.pointerId)});
cv.addEventListener("pointermove",e=>{if(view!=="platform")return;const p=fpt(e,cv);hoverHawk=-1;for(const r of hawkRects)if(p.x>r.x&&p.x<r.x+r.w&&p.y>r.y&&p.y<r.y+r.h)hoverHawk=r.i;
  if(drag){const dx=e.clientX-drag.x;if(Math.abs(dx)>4)drag.moved=true;platX=Math.max(-W*1.4,Math.min(W*1.4,drag.start-dx))}});
cv.addEventListener("pointerup",e=>{if(view!=="platform"||!drag)return;const moved=drag.moved;drag=null;if(moved)return;const p=fpt(e,cv);for(const r of hawkRects)if(p.x>r.x&&p.x<r.x+r.w&&p.y>r.y&&p.y<r.y+r.h){buy(HAWK()[r.i]);return}});
window.addEventListener("keydown",e=>{if(view!=="platform"||/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;if(e.key==="ArrowLeft")platX=Math.max(-W*1.4,platX-60);if(e.key==="ArrowRight")platX=Math.min(W*1.4,platX+60)});
function buy(h){
  const st=route.st[platStn][0];
  if(!h.price){toast("The book stall: newspapers, comics and railway timetables. Nothing to eat here.");return}
  bought.unshift({name:h.name,kind:h.kind,where:st,price:h.price,detail:h.detail});bought=bought.slice(0,6);store.set("ws-bought",bought);
  prog.buys=(prog.buys||0)+1;saveProg();
  toast(h.name+" · ₹"+h.price+" from "+st+" platform. It's on your table.");renderTray(h);
}

/* ---------- shared audio: horn, chime ---------- */
let AX=null;const audio=()=>{if(!AX)AX=new (window.AudioContext||window.webkitAudioContext)();if(AX.state==="suspended")AX.resume();return AX};
function horn(long){
  const ac=audio(),t0=ac.currentTime+.02,dur=long?1.6:.9,g=ac.createGain(),f=ac.createBiquadFilter();f.type="lowpass";f.frequency.value=1400;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.22,t0+.06);g.gain.setValueAtTime(.22,t0+dur);g.gain.linearRampToValueAtTime(0,t0+dur+.35);
  f.connect(g).connect(ac.destination);[311,370,466].forEach(fr=>{const o=ac.createOscillator();o.type="sawtooth";o.frequency.value=fr;o.connect(f);o.start(t0);o.stop(t0+dur+.4)});
  $("hornFx").hidden=false;clearTimeout(horn.h);horn.h=setTimeout(()=>$("hornFx").hidden=true,1600);
}
function chime(){const ac=audio(),t0=ac.currentTime+.02;[659.25,523.25,392].forEach((fr,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type="sine";o.frequency.value=fr;g.gain.setValueAtTime(0,t0+i*.32);g.gain.linearRampToValueAtTime(.16,t0+i*.32+.02);g.gain.exponentialRampToValueAtTime(.001,t0+i*.32+1);o.connect(g).connect(ac.destination);o.start(t0+i*.32);o.stop(t0+i*.32+1.1)})}

/* ---------- announcements (Hindi + English) ---------- */
let annOn=true,annQueue=0,acted=false;
["pointerdown","keydown"].forEach(ev=>window.addEventListener(ev,()=>{acted=true},{once:true,capture:true}));
function voiceFor(l){try{const vs=speechSynthesis.getVoices();return vs.find(v=>v.lang&&v.lang.toLowerCase().startsWith(l))||null}catch(e){return null}}
function announce(hiText,enText,withChime=true){
  const chip=$("annChip");chip.innerHTML="";const a=document.createElement("span");a.className="hi";a.textContent=hiText;const b=document.createElement("span");b.textContent=enText;chip.append(a,b);chip.hidden=false;
  clearTimeout(announce.h);announce.h=setTimeout(()=>chip.hidden=true,9000);
  if(!annOn||!acted)return;
  try{if(withChime)chime()}catch(e){}
  try{
    if(!("speechSynthesis" in window))return;speechSynthesis.cancel();
    const id=++annQueue;setTimeout(()=>{if(id!==annQueue)return;
      const u1=new SpeechSynthesisUtterance(hiText);u1.lang="hi-IN";const v1=voiceFor("hi");if(v1)u1.voice=v1;u1.rate=.95;
      const u2=new SpeechSynthesisUtterance(enText);u2.lang="en-IN";const v2=voiceFor("en-in")||voiceFor("en");if(v2)u2.voice=v2;u2.rate=.95;
      speechSynthesis.speak(u1);speechSynthesis.speak(u2)},withChime?1100:50);
  }catch(e){}
}
const A={
  next:s=>["कृपया ध्यान दें। अगला स्टेशन "+s+" है।","Attention please. The next station is "+s+"."],
  arrive:s=>["यात्रीगण कृपया ध्यान दें। गाड़ी "+s+" स्टेशन पर आ रही है।","Passengers, the train is arriving at "+s+"."],
  platform:s=>["यात्रीगण कृपया ध्यान दें। गाड़ी प्लेटफ़ॉर्म नंबर एक पर खड़ी है। अपने सामान का ध्यान रखें।","Your train is standing on platform number one at "+s+". Please keep your luggage with you."],
  leaving:()=>["कृपया ध्यान दें। गाड़ी छूटने वाली है। कृपया अपनी सीट पर लौट आएँ।","The train is about to leave. Please return to your seat."],
  last:()=>["अंतिम सूचना। गाड़ी चल रही है।","Final call. The train is moving now."],
  welcome:r=>["यात्रीगण, "+r+" यात्रा में आपका स्वागत है।","Welcome aboard the "+r+" journey."]
};
