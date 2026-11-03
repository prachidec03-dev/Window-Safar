/* POST /.netlify/functions/pass-order
   Signed-in user asks to buy the Pass: create a Razorpay order for ₹149 tied to their account. */
import { handle, json, userFrom, getPass, razorpay, env, PRICE_PAISE, isTestMode, HttpError } from "../lib/ws.mjs";

export default handle(async req => {
  if (req.method !== "POST") throw new HttpError(405, "Use POST.");
  const user = await userFrom(req);
  const cur = await getPass(user.uid);
  if (cur.pass) return json(200, { already: true, pass: true, passUntil: cur.passUntil });
  const order = await razorpay("orders", {
    method: "POST",
    body: JSON.stringify({
      amount: PRICE_PAISE, currency: "INR",
      receipt: ("pass_" + Date.now()).slice(0, 40),
      notes: { uid: user.uid, email: user.email, product: "window-safar-pass" }
    })
  });
  return json(200, { orderId: order.id, amount: order.amount, currency: order.currency, keyId: env("RAZORPAY_KEY_ID"), test: isTestMode() });
});
