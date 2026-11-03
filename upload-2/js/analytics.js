/* Window Safar · usage events for Microsoft Clarity (the dashboard only Prachi can see).
   Each important step of a ride sends a named event, so Clarity can count how many visitors
   picked a route, got down at a platform, collected a stamp, boarded again or came back another day. */
function track(name){
  try{if(typeof window.clarity==="function")window.clarity("event",name)}catch(e){}
}
/* returning visitors: remember the days this browser visited (no personal data) */
(function(){
  try{
    const k="ws-visits",today=new Date().toISOString().slice(0,10);
    const v=JSON.parse(localStorage.getItem(k)||"{}");v.days=v.days||[];
    const returning=v.days.length>0&&!v.days.includes(today);
    if(!v.days.includes(today))v.days.push(today);v.days=v.days.slice(-60);
    localStorage.setItem(k,JSON.stringify(v));
    const tag=v.days.length>1?"returning":"new";
    if(typeof window.clarity==="function"){window.clarity("set","visitor",tag);window.clarity("set","visit_days",String(v.days.length))}
    if(returning)track("return_visit");
  }catch(e){}
})();
