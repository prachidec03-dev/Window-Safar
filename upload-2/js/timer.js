/* Window Safar · focus and sleep timer.
   Focus: the window keeps running while your co-passenger and the announcements stay quiet; a chime when time is up.
   Sleep: when time is up the train stops for the night, the curtains close and the music and sounds stop. */
const timer=(()=>{
  let tmode="off",end=0,mins=25,iv=0,keepCp=null,keepAnn=null;
  const chip=$("hudTimer");
  const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
  const label=()=>tmode==="focus"?(lang==="hi"?"⏱ फ़ोकस ":"⏱ Focus "):(lang==="hi"?"🌙 नींद ":"🌙 Sleep ");
  function buttons(){document.querySelectorAll("[data-tmode]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.tmode===tmode))}
  function tick(){const left=end-Date.now();if(left<=0){finish();return}chip.textContent=label()+fmt(left)}
  function quiet(on){
    if(on){keepCp=cpOn;keepAnn=annOn;cpOn=false;cpClose();annOn=false;try{speechSynthesis.cancel()}catch(e){}}
    else if(keepCp!==null){cpOn=keepCp;annOn=keepAnn;keepCp=keepAnn=null}
  }
  function clear(){clearInterval(iv);iv=0;if(tmode==="focus")quiet(false);tmode="off";chip.hidden=true;buttons()}
  function start(m){
    clear();wake(true);tmode=m;mins=+$("tMins").value||25;end=Date.now()+mins*60000;chip.hidden=false;
    if(m==="focus")quiet(true);
    buttons();tick();iv=setInterval(tick,1000);track(m+"_timer_start");
    toast(m==="focus"
      ?(lang==="hi"?mins+" मिनट का फ़ोकस सफ़र शुरू। खिड़की चलती रहेगी, बाकी सब चुप।":"Focus ride: "+mins+" minutes. The window keeps going, everyone else stays quiet.")
      :(lang==="hi"?mins+" मिनट बाद गाड़ी रात के लिए रुक जाएगी।":"Sleep timer: in "+mins+" minutes the train stops for the night."));
  }
  function finish(){
    const m=tmode;clear();
    if(m==="focus"){
      try{chime()}catch(e){}
      prog.focusMin=(prog.focusMin||0)+mins;prog.focusRuns=(prog.focusRuns||0)+1;saveProg();track("focus_timer_done");
      toast(lang==="hi"?"फ़ोकस पूरा: "+mins+" मिनट खिड़की के पास। अब चाय! ☕ (कुल "+prog.focusMin+" मिनट)":"Focus done: "+mins+" minutes at the window. Time for chai! ☕ ("+prog.focusMin+" minutes in total)");
      const c=cpChar();if(c&&cpOn)setTimeout(()=>cpShow(cpIsHi(c)?["Bahut badhiya! Ab ek chai ho jaaye?","Well done! Time for a chai now?"]:["Well done! Time for a chai?"]),1500);
    }
    if(m==="sleep")sleep();
  }
  function sleep(){
    track("sleep_timer_done");
    if($("music").classList.contains("playing"))$("musicBtn").click();
    if($("sound").getAttribute("aria-pressed")==="true")$("sound").click();
    try{speechSynthesis.cancel()}catch(e){}
    if(player&&player.pauseVideo)try{player.pauseVideo()}catch(e){}
    speedMul=0;setCurtain(false);
    const at=route.st[curStation()][0];
    $("sleepText").textContent=lang==="hi"?"गाड़ी रात के लिए "+at+" पर रुकी है। आराम से सोइए।":"The train has stopped at "+at+" for the night. Sleep well.";
    $("sleepCover").hidden=false;
  }
  function wake(silent){
    if($("sleepCover").hidden)return;$("sleepCover").hidden=true;speedMul=1;setCurtain(true);
    if(mode==="foot"&&view==="ride"&&player&&player.playVideo)try{player.playVideo()}catch(e){}
    if(!silent)toast(lang==="hi"?"सुप्रभात! सफ़र जारी है।":"Good morning! The ride goes on.");
  }
  document.querySelectorAll("[data-tmode]").forEach(b=>b.onclick=()=>{try{audio()}catch(e){}b.dataset.tmode==="off"?clear():start(b.dataset.tmode)});
  $("tMins").onchange=()=>{if(tmode!=="off")start(tmode)};
  $("wakeBtn").onclick=()=>wake(false);
  return{start,stop:clear,wake,get mode(){return tmode}};
})();
/* a few more usage events */
$("realLinks").addEventListener("click",e=>{const a=e.target.closest("a");if(!a)return;const h=a.href||"";track(/amazon/.test(h)?"affiliate_amazon":/booking|Me1HKoN/i.test(h)?"affiliate_stay":"affiliate_train")});
$("openBook").addEventListener("click",()=>track("stamp_book_open"));$("navJourney").addEventListener("click",()=>track("stamp_book_open"));
