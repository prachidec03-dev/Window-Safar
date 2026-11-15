/* POST /.netlify/functions/pass-checkout
   Signed-in user asks to buy the Pass: create a Dodo Payments checkout for the ₹149 Pass, tied to their account.
   The browser is sent to Dodo's secure checkout page and comes back to /?pass=return. */
import { handle, json, userFrom, getPass, dodo, env, isTestMode, HttpError } from "../lib/ws.mjs";

export default handle(async req => {
  if (req.method !== "POST") throw new HttpError(405, "Use POST.");
  const user = await userFrom(req);
  const cur = await getPass(user.uid);
  if (cur.pass) return json(200, { already: true, pass: true, passUntil: cur.passUntil });
  const origin = new URL(req.url).origin;
  const s = await dodo("checkouts", {
    method: "POST",
    body: JSON.stringify({
      product_cart: [{ product_id: env("DODO_PRODUCT_ID"), quantity: 1 }],
      customer: user.email ? { email: user.email, name: user.name || user.email.split("@")[0] } : undefined,
      return_url: origin + "/?pass=return",
      metadata: { uid: user.uid, product: "window-safar-pass" }
    })
  });
  if (!s.checkout_url) throw new HttpError(502, "Dodo Payments didn't return a checkout page.");
  return json(200, { url: s.checkout_url, test: isTestMode() });
});
