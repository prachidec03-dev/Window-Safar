/* POST /.netlify/functions/dodo-webhook
   Dodo Payments calls this when a payment succeeds, even if the buyer closed the tab before coming back.
   The request is trusted only if its signature matches DODO_WEBHOOK_SECRET. */
import { handle, json, dodo, grantPass, passPaymentFor, webhookOk, env, HttpError } from "../lib/ws.mjs";

export default handle(async req => {
  if (req.method !== "POST") throw new HttpError(405, "Use POST.");
  const raw = await req.text(), h = req.headers;
  if (!webhookOk(env("DODO_WEBHOOK_SECRET"), h.get("webhook-id"), h.get("webhook-timestamp"), raw, h.get("webhook-signature")))
    throw new HttpError(400, "Bad signature.");
  const ev = JSON.parse(raw);
  if (ev.type !== "payment.succeeded") return json(200, { ignored: ev.type });
  const id = ev.data && ev.data.payment_id;
  if (!id) return json(200, { ignored: "no payment" });
  const pay = await dodo("payments/" + encodeURIComponent(id));          // re-check with Dodo rather than trusting the payload
  const uid = pay.metadata && pay.metadata.uid;
  if (!uid || passPaymentFor(pay, uid)) return json(200, { ignored: "not a paid Pass" });
  await grantPass(uid, pay.payment_id || id, pay.checkout_session_id || "");
  return json(200, { ok: true });
});
