/* POST /.netlify/functions/pass-verify
   After Razorpay Checkout succeeds, the browser sends the payment details here.
   The server checks Razorpay's signature, confirms the order belongs to this user and is paid,
   and only then saves the Pass in Firestore. */
import { handle, json, userFrom, razorpay, grantPass, hmacHex, safeEqual, env, PRICE_PAISE, HttpError } from "../lib/ws.mjs";
import { PASS_CLIPS } from "../lib/pass-clips.mjs";

export default handle(async req => {
  if (req.method !== "POST") throw new HttpError(405, "Use POST.");
  const user = await userFrom(req);
  const b = await req.json().catch(() => ({}));
  const orderId = b.razorpay_order_id, paymentId = b.razorpay_payment_id, sig = b.razorpay_signature;
  if (!orderId || !paymentId || !sig) throw new HttpError(400, "Payment details are missing.");
  if (!safeEqual(hmacHex(env("RAZORPAY_KEY_SECRET"), orderId + "|" + paymentId), sig)) throw new HttpError(400, "This payment could not be verified.");
  const order = await razorpay("orders/" + encodeURIComponent(orderId));
  if (!order.notes || order.notes.uid !== user.uid) throw new HttpError(403, "This payment belongs to a different account.");
  if (order.amount !== PRICE_PAISE) throw new HttpError(400, "The amount paid doesn't match the Pass price.");
  let pay = await razorpay("payments/" + encodeURIComponent(paymentId));
  if (pay.order_id !== orderId) throw new HttpError(400, "This payment doesn't match the order.");
  if (pay.status === "authorized") pay = await razorpay("payments/" + encodeURIComponent(paymentId) + "/capture", { method: "POST", body: JSON.stringify({ amount: PRICE_PAISE, currency: "INR" }) });
  if (pay.status !== "captured") throw new HttpError(402, "The payment hasn't gone through yet (status: " + pay.status + ").");
  const p = await grantPass(user.uid, paymentId, orderId);
  return json(200, { ...p, clips: PASS_CLIPS });
});
