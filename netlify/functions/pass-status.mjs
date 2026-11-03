/* GET or POST /.netlify/functions/pass-status
   Tells the signed-in user whether they hold the Pass, and sends the Pass routes' footage if they do. */
import { handle, json, userFrom, getPass } from "../lib/ws.mjs";
import { PASS_CLIPS } from "../lib/pass-clips.mjs";

export default handle(async req => {
  const user = await userFrom(req);
  const p = await getPass(user.uid);
  return json(200, p.pass ? { pass: true, passUntil: p.passUntil, clips: PASS_CLIPS } : { pass: false });
});
