/* POST /.netlify/functions/pass-verify
   Back from Dodo's checkout, the browser sends the payment ID here.
   The server asks Dodo itself whether that payment succeeded, is for the Pass and belongs to this account,
   and only then saves the Pass in Firestore. Nothing the browser says is trusted on its own. */
import { handle, json, userFrom, dodo, grantPass, passPaymentFor, HttpError } from "../lib/ws.mjs";
import { PASS_CLIPS } from "../lib/pass-clips.mjs";

export default handle(async req => {
  if (req.method !== "POST") throw new HttpError(405, "Use POST.");
  const user = await userFrom(req);
  const b = await req.json().catch(() => ({}));
  const id = String(b.payment_id || "");
  if (!/^[A-Za-z0-9_-]{4,80}$/.test(id)) throw new HttpError(400, "Payment details are missing.");
  const pay = await dodo("payments/" + encodeURIComponent(id));
  const why = passPaymentFor(pay, user.uid);
  if (why) throw new HttpError(why.startsWith("The payment hasn't") ? 402 : 403, why);
  const p = await grantPass(user.uid, pay.payment_id || id, pay.checkout_session_id || "");
  return json(200, { ...p, clips: PASS_CLIPS });
});
