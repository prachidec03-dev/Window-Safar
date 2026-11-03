/* Window Safar · Real window footage (YouTube player) and music (Spotify player). */
/* ---------- YouTube ---------- */
function loadYT(){return new Promise(res=>{if(window.YT&&YT.Player){ytOK=true;return res(true)}const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";const to=setTimeout(()=>{ytOK=false;res(false)},6000);s.onerror=()=>{clearTimeout(to);ytOK=false;res(false)};window.onYouTubeIframeAPIReady=()=>{clearTimeout(to);ytOK=true;res(true)};document.head.appendChild(s)})}
const hasFoot=()=>route.clips.length>0;
function startClip(){if(!hasFoot()){setMode("anim");return}const [id,start]=route.clips[clipIdx];$("yt").hidden=false;
  if(!player)player=new YT.Player("yt",{videoId:id,playerVars:{autoplay:1,mute:1,controls:0,start,rel:0,playsinline:1,modestbranding:1,iv_load_policy:3,disablekb:1},events:{onReady:e=>{e.target.mute();e.target.playVideo()},onError:()=>nextClip(true),onStateChange:e=>{if(e.data===1)credit(true)}}});
  else player.loadVideoById({videoId:id,startSeconds:start});$("vidAudio").setAttribute("aria-pressed","false");credit()}
/* who filmed this footage: shown on the window, taken from YouTube itself when it can be */
const clipAuthor={};
function credit(live){const el=$("credit");if(mode!=="foot"||view!=="ride"||!hasFoot()||!ytOK){el.hidden=true;return}
  const [id,start,cr]=route.clips[clipIdx];
  if(live&&player&&player.getVideoData){try{const d=player.getVideoData();if(d&&d.video_id===id&&d.author)clipAuthor[id]=d.author}catch(e){}}
  const fallback=/·\s*(.+)$/.exec(cr||"");const who=clipAuthor[id]||(fallback&&!/YouTube/.test(fallback[1])?fallback[1]:"");
  el.href="https://www.youtube.com/watch?v="+id+"&t="+start+"s";el.textContent=(lang==="hi"?"🎥 फ़ुटेज: ":"🎥 Footage: ")+(who||"YouTube creator")+" ↗";el.title=lang==="hi"?"यह वीडियो YouTube पर देखें":"Watch the full video on YouTube and support the creator";el.hidden=false;
  if(live)footNote()}
function nextClip(auto){
  if(!hasFoot())return;
  if(!ytOK){clipIdx=(clipIdx+1)%route.clips.length;footNote();toast("Footage "+(clipIdx+1)+" of "+route.clips.length+" (link below the window)");return}
  if(auto&&clipIdx===route.clips.length-1){toast("This footage can't play here, switching to the animated window.");setMode("anim");return}
  clipIdx=(clipIdx+1)%route.clips.length;startClip();if(!auto)toast("Footage "+(clipIdx+1)+" of "+route.clips.length);
}
function footNote(){const el=$("footNote");el.textContent="";$("mFoot").disabled=!hasFoot();$("nextClip").hidden=route.clips.length<2;
  if(!hasFoot()){el.textContent="Real window footage for this route is still being chosen, so you're riding the animated window for now.";return}
  const cr=route.clips[clipIdx][2]||"",who=clipAuthor[route.clips[clipIdx][0]];if(ytOK){el.textContent=(who?"Footage by "+who+" on YouTube":cr)+". Tap Different footage for the next stretch.";return}
  const a=document.createElement("a");a.href="https://www.youtube.com/watch?v="+route.clips[clipIdx][0]+"&t="+route.clips[clipIdx][1]+"s";a.target="_blank";a.rel="noopener";a.textContent="Watch the real "+route.name+" footage on YouTube ↗";el.append(a," · Host the page to play footage inside the window.")}
async function setMode(m){
  if(m==="foot"&&era){toast("2036 can only be imagined, so it uses the animated window.");m="anim"}
  if(m==="foot"&&!hasFoot()){toast("Real footage for this route is coming soon.");m="anim"}
  if(m==="foot"){if(ytOK===null)await loadYT();if(!ytOK){toast("Use the link below the window to watch the real footage.");m="anim"}}
  mode=m;$("mFoot").setAttribute("aria-pressed",m==="foot");$("mAnim").setAttribute("aria-pressed",m==="anim");hudMode();$("vidAudio").hidden=m!=="foot";
  if(m==="foot")track("real_footage");
  if(m==="foot"&&view==="ride")startClip();else{$("yt").hidden=true;if(player&&player.pauseVideo)player.pauseVideo()}
}
function hudMode(){credit();$("hudMode").textContent=view==="platform"?(lang==="hi"?"प्लेटफ़ॉर्म पर · चलने के लिए खींचें":"On the platform · drag to walk"):era?"Window to 2036 · imagined":mode==="foot"?"Real footage":"Animated window"}

/* ---------- music ---------- */
let mix="mix";
const music=(()=>{
  let on=false,mp=null,idx=0,timer=0,nextT=0,step=0,drone=[],deg=2,master=null;
  const SC={hills:{s:[0,2,4,7,9,12,14],f:293.66,b:.42},coast:{s:[0,4,7,9,12,16,19],f:220,b:.28},desert:{s:[0,2,4,5,7,9,10,12],f:261.63,b:.3},palms:{s:[0,2,4,7,9,12],f:246.94,b:.26},night:{s:[0,2,3,7,8,12,14],f:196,b:.6},santoor:{s:[0,2,4,7,9,12,14,16],f:277.18,b:.16}};
  const CHORDS=[[0,4,7],[7,11,14],[9,12,16],[5,9,12]];
  const list=()=>{const l=route.songs.filter(s=>mix==="mix"||s[3]===mix);return l.length?l:route.songs};const song=()=>list()[idx%list().length];
  function note(t0,freq,dur,type,vol){const ac=audio(),o=ac.createOscillator(),g=ac.createGain();o.type=type==="pluck"?"triangle":type==="reed"?"sawtooth":"sine";o.frequency.value=freq;
    if(type==="flute"){const v=ac.createOscillator(),vg=ac.createGain();v.frequency.value=5.5;vg.gain.value=freq*.012;v.connect(vg).connect(o.frequency);v.start(t0);v.stop(t0+dur+.1)}
    if(type==="reed"){const f=ac.createBiquadFilter();f.type="lowpass";f.frequency.value=1600;o.connect(f).connect(g)}else o.connect(g);
    const a=type==="pluck"||type==="bell"?.005:.06;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+a);g.gain.exponentialRampToValueAtTime(.0008,t0+dur);g.connect(master);o.start(t0);o.stop(t0+dur+.05)}
  function drum(t0,low,vol){const ac=audio(),o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(low?110:300,t0);o.frequency.exponentialRampToValueAtTime(low?50:180,t0+.12);g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.001,t0+(low?.25:.1));o.connect(g).connect(master);o.start(t0);o.stop(t0+.3)}
  function shaker(t0,vol){const ac=audio(),b=ac.createBuffer(1,ac.sampleRate*.06,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type="highpass";f.frequency.value=5000;g.gain.value=vol;s.connect(f).connect(g).connect(master);s.start(t0)}
  const walk=(st,mv)=>{deg=Math.max(0,Math.min(st.s.length-1,deg+mv[Math.floor(Math.random()*mv.length)]))};
  function schedule(){const ac=audio(),st=SC[route.style],hz=k=>st.f*Math.pow(2,k/12);
    while(nextT<ac.currentTime+.25){const t0=nextT,beat=step%8,sty=route.style;
      if(sty==="coast"){const ch=CHORDS[Math.floor(step/16)%4];note(t0,hz(ch[step%3]-12),.5,"pluck",.12);if(step%2===0&&Math.random()<.6)note(t0,hz(st.s[Math.floor(Math.random()*st.s.length)]),.4,"pluck",.09);shaker(t0,step%2?.05:.09);if(beat===0||beat===5)drum(t0,true,.25)}
      else if(sty==="desert"){if([0,3,6].includes(beat))drum(t0,true,.35);if([2,4,7].includes(beat))drum(t0,false,.18);if(step%2===0){walk(st,[-1,0,1,1,-2,2]);note(t0,hz(st.s[deg]),st.b*2.2,"reed",.06)}}
      else if(sty==="palms"){if(beat%2===0||Math.random()<.35)drum(t0,beat===0,beat===0?.3:.14);if(step%4===0){walk(st,[-1,1,2,-2]);note(t0,hz(st.s[deg]),st.b*3.6,"reed",.05)}}
      else if(sty==="santoor"){walk(st,[-1,1,1,-1,2,-2]);note(t0,hz(st.s[deg]),.5,"pluck",.08);if(step%8===0)note(t0,hz(st.s[deg]-12),1.2,"pluck",.08)}
      else if(sty==="night"){if(step%2===0){walk(st,[-1,1,0,2,-1]);note(t0,hz(st.s[deg]),2.4,"bell",.09)}}
      else{if(step%3===0||Math.random()<.2){walk(st,[-1,1,1,-1,2,-2,0]);note(t0,hz(st.s[deg]),st.b*(step%3===0?3:1.6),"flute",.1)}}
      nextT+=st.b;step++}}
  function stopDrone(){drone.forEach(o=>{try{o.stop()}catch(e){}});drone=[]}
  function startTune(){const ac=audio();if(!master){master=ac.createGain();master.gain.value=.7;master.connect(ac.destination)}stopDrone();const st=SC[route.style];
    [1,1.5].forEach(m=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=st.f/2*m;g.gain.value=route.style==="coast"?0:.035;o.connect(g).connect(master);o.start();drone.push(o)});
    nextT=ac.currentTime+.1;step=0;clearInterval(timer);timer=setInterval(schedule,90)}
  function stopTune(){clearInterval(timer);stopDrone()}
  let sp=null,spReady=null,spEnd=0;
  function loadSpotify(){if(spReady)return spReady;spReady=new Promise(res=>{const to=setTimeout(()=>res(null),7000);window.onSpotifyIframeApiReady=api=>{const el=document.createElement("div");$("mplayer").appendChild(el);
      api.createController(el,{uri:"spotify:track:"+song()[0],width:"100%",height:80},c=>{clearTimeout(to);sp=c;
        c.addListener("playback_update",e=>{const d=e.data||{};if(on&&!d.isPaused&&d.duration>0&&d.position>=d.duration-800&&Date.now()-spEnd>4000){spEnd=Date.now();next()}});res(c)})};
    const s=document.createElement("script");s.src="https://open.spotify.com/embed/iframe-api/v1";s.async=true;s.onerror=()=>{clearTimeout(to);res(null)};document.head.appendChild(s)});return spReady}
  const spUrl=sg=>"https://open.spotify.com/track/"+sg[0];
  function label(){const sg=song(),tag=sg[3]==="old"?"Classic · ":"";$("npTitle").textContent=sg[1];$("npSub").textContent=tag+sg[2];
    const el=$("musicNote");el.textContent="";
    if(sp&&ytOK){el.textContent="Plays through Spotify. Log in to Spotify in this browser to hear full songs; otherwise you get 30-second previews.";return}
    if(!ytOK){$("npTitle").textContent=route.tune+" (original tune)";$("npSub").textContent="Made in your browser for this route"}
    const a=document.createElement("a");a.href=spUrl(sg);a.target="_blank";a.rel="noopener";a.textContent=sg[1]+" ("+sg[2]+") on Spotify ↗";el.append(tag?"Classic for this route: ":"Film song for this route: ",a,ytOK?"":". Film songs play right here once the page is hosted.")}
  async function playSong(){if(!sp)await loadSpotify();if(!sp){startTune();label();return}stopTune();$("mplayer").hidden=false;sp.loadUri("spotify:track:"+song()[0]);setTimeout(()=>{try{sp.play()}catch(e){}},400);label()}
  function start(){on=true;track("music_play");$("music").classList.add("playing");label();if(ytOK)playSong();else startTune()}
  function stop(){on=false;$("music").classList.remove("playing");stopTune();if(sp)try{sp.pause()}catch(e){}}
  function next(){idx++;label();if(on){if(sp)playSong()}}
  return{toggle(){on?stop():start();return on},route(){idx=0;label();if(on){if(sp)playSong();else startTune()}},next,label,setMix(m){mix=m;idx=0;label();if(on&&sp)playSong()},song};
})();
