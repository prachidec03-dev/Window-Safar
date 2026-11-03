/* POST /.netlify/functions/razorpay-webhook
   Razorpay calls this when an order is paid, even if the buyer closed the tab before the page could confirm.
   The request is trusted only if its signature matches RAZORPAY_WEBHOOK_SECRET. */
import { handle, json, razorpay, grantPass, hmacHex, safeEqual, env, PRICE_PAISE, HttpError } from "../lib/ws.mjs";

export default handle(async req => {
  if (req.method !== "POST") throw new HttpError(405, "Use POST.");
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  if (!safeEqual(hmacHex(env("RAZORPAY_WEBHOOK_SECRET"), raw), sig)) throw new HttpError(400, "Bad signature.");
  const ev = JSON.parse(raw), pl = ev.payload || {};
  if (ev.event !== "order.paid" && ev.event !== "payment.captured") return json(200, { ignored: ev.event });
  const pay = pl.payment && pl.payment.entity;
  let order = pl.order && pl.order.entity;
  if (!pay) return json(200, { ignored: "no payment" });
  if (!order && pay.order_id) order = await razorpay("orders/" + encodeURIComponent(pay.order_id));
  const uid = order && order.notes && order.notes.uid;
  if (!uid || !order.notes || order.notes.product !== "window-safar-pass") return json(200, { ignored: "not a Pass order" });
  const paid = pay.status === "captured" || ev.event === "order.paid";
  if (order.amount !== PRICE_PAISE || !paid) return json(200, { ignored: "not paid" });
  await grantPass(uid, pay.id, order.id);
  return json(200, { ok: true });
});
