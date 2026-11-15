/* Window Safar · the Pass (₹149 a year).
   1. You sign in (Firebase), so the Pass belongs to your account, not to one browser.
   2. The server creates a Dodo Payments checkout (pass-checkout) and you pay on Dodo's secure page.
   3. Back on Window Safar, the server asks Dodo whether that payment succeeded (pass-verify) and saves
      the Pass in Firestore. Dodo's webhook does the same if the tab was closed.
   4. On every visit the server says whether you hold the Pass (pass-status) and only then sends
      the Pass routes' real footage. Changing anything in the browser can't unlock it. */
const PASSAPI="/.netlify/functions/";
const authOn=()=>!!(window.WSAuth&&WSAuth.enabled());
let passUntil=(store.get("ws-pass2",null)||{}).until||"";
async function passApi(name,body){
  const tok=await WSAuth.token();if(!tok)throw new Error(lang==="hi"?"पहले साइन इन कीजिए।":"Please sign in first.");
  let r;try{r=await fetch(PASSAPI+name,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+tok},body:JSON.stringify(body||{})})}
  catch(e){throw new Error("Couldn't reach the Window Safar server. Check your connection.")}
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"The server didn't answer ("+r.status+").");return j}
const fmtDate=iso=>{try{return new Date(iso).toLocaleDateString(lang==="hi"?"hi-IN":"en-IN",{day:"numeric",month:"short",year:"numeric"})}catch(e){return iso}};
function passNote(){
  const note=$("passNote"),btn=$("unlock"),u=authOn()&&WSAuth.user();
  btn.disabled=false;
  if(owned){note.textContent=(lang==="hi"?"आपका पास "+fmtDate(passUntil)+" तक चालू है। सारे रूट खुले हैं।":"Your Pass is active until "+fmtDate(passUntil)+". All routes are open.");btn.textContent=lang==="hi"?"पास चालू ✓":"Pass active ✓";btn.disabled=true;return}
  if(!authOn()){note.textContent=lang==="hi"?"भुगतान जल्द शुरू होगा।":"Payments open soon. Sign-in is being set up.";btn.textContent=lang==="hi"?"पास · ₹149/साल":"Get the Pass · ₹149/year";return}
  btn.textContent=u?(lang==="hi"?"पास लीजिए · ₹149/साल":"Get the Pass · ₹149/year"):(lang==="hi"?"साइन इन करके पास लीजिए · ₹149":"Sign in and get the Pass · ₹149/year");
  note.textContent=PASS.test
    ?(lang==="hi"?"टेस्ट मोड: Dodo Payments के टेस्ट कार्ड से भुगतान कीजिए। असली पैसे नहीं कटते।":"Test mode for now: pay with Dodo Payments' test card. No real money moves.")
    :(lang==="hi"?"सुरक्षित भुगतान Dodo Payments से: UPI या कार्ड।":"Secure payment by Dodo Payments: UPI or cards. The Pass is saved to your account.");
}
function passApply(s){
  const was=owned;owned=!!(s&&s.pass);let gotClips=false;
  if(owned){passUntil=s.passUntil||passUntil;store.set("ws-pass2",{until:passUntil});
    if(s.clips)for(const r of ROUTES)if(s.clips[r.id]&&!r.clips.length){r.clips=s.clips[r.id];gotClips=true}}
  else{passUntil="";try{localStorage.removeItem("ws-pass2")}catch(e){}}
  passNote();
  if(owned!==was||(gotClips&&!route.free))setRoute(route);else renderTickets();
}
async function passCheck(){if(!authOn()||!WSAuth.user()){passApply({pass:false});return}try{passApply(await passApi("pass-status"))}catch(e){console.warn("Pass check:",e.message)}}
let passBusy=false;
async function buyPass(){
  if(passBusy)return;track("pass_click");
  if(!authOn()){toast(lang==="hi"?"साइन इन तैयार हो रहा है, पास जल्द खुलेगा।":"Sign-in is being set up, so the Pass opens soon.");return}
  await WSAuth.init();const u=WSAuth.user();
  if(!u){location.href="login.html?next=pass";return}
  if(owned){toast(lang==="hi"?"आपका पास पहले से चालू है।":"Your Pass is already active.");return}
  const btn=$("unlock");passBusy=true;btn.disabled=true;btn.textContent=lang==="hi"?"सुरक्षित भुगतान खुल रहा है…":"Opening secure payment…";
  try{
    const o=await passApi("pass-checkout");
    if(o.already){await passCheck();passBusy=false;passNote();return}
    track("pass_checkout_open");location.href=o.url;
  }catch(e){toast(e.message);passBusy=false;passNote()}
}
/* back from Dodo's checkout page: /?pass=return&payment_id=…&status=… */
async function passReturn(q){
  const id=q.get("payment_id"),st=(q.get("status")||"").toLowerCase();
  try{history.replaceState(null,"",location.pathname)}catch(e){}
  if(!id){toast(lang==="hi"?"भुगतान पूरा नहीं हुआ।":"The payment wasn't completed.");return}
  if(st&&st!=="succeeded"&&st!=="processing"){track("pass_payment_failed");toast(lang==="hi"?"भुगतान नहीं हुआ, फिर से कोशिश कीजिए।":"The payment didn't go through. Please try again.");return}
  await WSAuth.init();const btn=$("unlock");btn.disabled=true;btn.textContent=lang==="hi"?"भुगतान की पुष्टि हो रही है…":"Confirming payment…";
  for(let i=0;i<4;i++){
    try{passApply(await passApi("pass-verify",{payment_id:id}));track("pass_purchased");
      toast(lang==="hi"?"भुगतान मिल गया। पास में आपका स्वागत है! सारे रूट खुले हैं।":"Payment received. Welcome to the Pass! All routes are open.");
      $("tickets").scrollIntoView({behavior:"smooth",block:"center"});return}
    catch(e){if(i===3||!/hasn't gone through/.test(e.message)){toast(e.message+(lang==="hi"?" अगर पैसे कटे हैं तो पास एक मिनट में खुल जाएगा।":" If money was taken, the Pass opens within a minute."));setTimeout(passCheck,20000);passNote();return}
      await new Promise(r=>setTimeout(r,4000))}
  }
}
$("unlock").onclick=buyPass;
passNote();
/* back from the sign-in page to buy the Pass */
try{const q=new URLSearchParams(location.search);if(q.get("pass")==="return"&&authOn())setTimeout(()=>passReturn(q),300)}catch(e){}
try{if(new URLSearchParams(location.search).get("pass")==="1")setTimeout(()=>{$("pass").scrollIntoView({behavior:"smooth",block:"center"});if(authOn())WSAuth.onChange(u=>{if(u&&!owned)toast(lang==="hi"?"आप साइन इन हैं। पास लेने के लिए बटन दबाइए।":"You're signed in. Tap Get the Pass to pay.")})},900)}catch(e){}
