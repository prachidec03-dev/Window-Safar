/* Window Safar · shared server code for the Pass (Netlify Functions, no npm packages).
   - checks the Firebase sign-in token sent by the browser
   - reads and writes the user's Pass in Firestore with the service account
   - talks to Razorpay with the secret key
   All secrets come from Netlify environment variables and never reach the browser. */
import crypto from "node:crypto";

export const PRICE_PAISE = 14900;            // ₹149
export const PASS_DAYS = 365;

export class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }

/* public, non-secret settings (the Firebase project ID is already visible in auth.js) */
const PUBLIC = { FIREBASE_PROJECT_ID: "windowsafar" };

export function env(k) {
  const v = String(process.env[k] || PUBLIC[k] || "").trim().replace(/^["']+|["',]+$/g, "");   // forgive stray quotes or spaces from pasting
  if (!v) throw new HttpError(500, "The Pass is not set up yet (missing " + k + ").");
  return v;
}

export const json = (status, obj) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json", "cache-control": "no-store" }
});

/* wrap a handler so errors become clean JSON */
export const handle = fn => async (req, ctx) => {
  try { return await fn(req, ctx); }
  catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    if (status >= 500) console.error(e);
    return json(status, { error: e instanceof HttpError ? e.message : "Something went wrong on the server." });
  }
};

const b64u = s => Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64");

/* ---------- Firebase sign-in token ---------- */
let certs = null, certsExp = 0;
async function googleCerts() {
  if (certs && Date.now() < certsExp) return certs;
  const r = await fetch("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com");
  if (!r.ok) throw new HttpError(503, "Could not check sign-in right now.");
  certs = await r.json();
  const m = /max-age=(\d+)/.exec(r.headers.get("cache-control") || "");
  certsExp = Date.now() + (m ? +m[1] * 1000 : 3600e3);
  return certs;
}

export async function verifyIdToken(tok) {
  const [h, p, s] = String(tok).split(".");
  if (!h || !p || !s) throw new Error("bad token");
  const header = JSON.parse(b64u(h)), pay = JSON.parse(b64u(p));
  if (header.alg !== "RS256" || !header.kid) throw new Error("bad alg");
  const pem = (await googleCerts())[header.kid];
  if (!pem) throw new Error("unknown key");
  const key = new crypto.X509Certificate(pem).publicKey;
  if (!crypto.verify("RSA-SHA256", Buffer.from(h + "." + p), key, b64u(s))) throw new Error("bad signature");
  const proj = env("FIREBASE_PROJECT_ID"), now = Date.now() / 1000;
  if (pay.aud !== proj || pay.iss !== "https://securetoken.google.com/" + proj) throw new Error("wrong project");
  if (!(pay.exp > now) || pay.iat > now + 300 || !pay.sub) throw new Error("expired");
  return { uid: pay.sub, email: pay.email || "", name: pay.name || "" };
}

export async function userFrom(req) {
  const t = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!t) throw new HttpError(401, "Please sign in first.");
  try { return await verifyIdToken(t); }
  catch (e) { if (e instanceof HttpError) throw e; throw new HttpError(401, "Your sign-in has expired. Please sign in again."); }
}

/* accept the private key however it was pasted: with or without quotes, with \n or real line breaks,
   with spaces instead of line breaks, or even the whole service-account JSON */
export function cleanKey(raw) {
  let k = String(raw).trim();
  if (k.startsWith("{")) { try { k = JSON.parse(k).private_key || k; } catch (e) {} }
  k = k.replace(/^["']+|["',]+$/g, "").replace(/\\r/g, "").replace(/\\n/g, "\n");
  const m = /-----BEGIN ([A-Z ]+)-----([\s\S]*?)-----END \1-----/.exec(k);
  if (!m) return k;
  const body = m[2].replace(/[^A-Za-z0-9+/=]/g, "");
  return "-----BEGIN " + m[1] + "-----\n" + body.match(/.{1,64}/g).join("\n") + "\n-----END " + m[1] + "-----\n";
}

/* ---------- Firestore with the service account ---------- */
let gTok = null, gExp = 0;
async function googleToken() {
  if (gTok && Date.now() < gExp - 60e3) return gTok;
  const email = env("FIREBASE_CLIENT_EMAIL"), key = cleanKey(env("FIREBASE_PRIVATE_KEY"));
  const now = Math.floor(Date.now() / 1000);
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({
    iss: email, scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600
  });
  let pk;
  try { pk = crypto.createPrivateKey(key); }
  catch (e) {   // describe the shape of the setting (never its contents) so a bad paste is easy to spot
    const raw = String(process.env.FIREBASE_PRIVATE_KEY || "");
    const body = ((/-----BEGIN [A-Z ]+-----([\s\S]*?)-----END/.exec(key) || [])[1] || "").replace(/[^A-Za-z0-9+/=]/g, "");
    throw new HttpError(500, "FIREBASE_PRIVATE_KEY can't be read: " + raw.length + " characters, " +
      (raw.trim().startsWith("{") ? "JSON" : "text") + ", BEGIN " + /BEGIN/.test(raw) + ", END " + /END/.test(raw) +
      ", key body " + body.length + " characters (a complete key has about 1620).");
  }
  const sig = crypto.sign("RSA-SHA256", Buffer.from(unsigned), pk).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: unsigned + "." + sig })
  });
  const j = await r.json();
  if (!j.access_token) throw new HttpError(500, "The server could not reach Firestore (check the service account settings).");
  gTok = j.access_token; gExp = Date.now() + (j.expires_in || 3600) * 1000;
  return gTok;
}

const docUrl = uid => "https://firestore.googleapis.com/v1/projects/" + env("FIREBASE_PROJECT_ID") +
  "/databases/(default)/documents/users/" + encodeURIComponent(uid);

async function readDoc(uid) {
  const r = await fetch(docUrl(uid), { headers: { authorization: "Bearer " + await googleToken() } });
  if (r.status === 404) return {};
  if (!r.ok) throw new HttpError(500, "Could not read the Pass from Firestore.");
  return (await r.json()).fields || {};
}

export async function getPass(uid) {
  const f = await readDoc(uid);
  const until = f.passUntil && f.passUntil.timestampValue || null;
  const pass = !!(f.pass && f.pass.booleanValue && until && Date.parse(until) > Date.now());
  return { pass, passUntil: until, lastPaymentId: f.passPaymentId && f.passPaymentId.stringValue || "" };
}

/* give (or extend) the Pass. Safe to call twice for the same payment. */
export async function grantPass(uid, paymentId, orderId) {
  const cur = await getPass(uid);
  if (cur.lastPaymentId === paymentId && cur.pass) return { pass: true, passUntil: cur.passUntil };
  const base = cur.pass ? Date.parse(cur.passUntil) : Date.now();
  const until = new Date(base + PASS_DAYS * 864e5).toISOString(), now = new Date().toISOString();
  const fields = {
    pass: { booleanValue: true }, passUntil: { timestampValue: until },
    passPaymentId: { stringValue: paymentId }, passOrderId: { stringValue: orderId || "" }, passUpdated: { timestampValue: now }
  };
  const mask = Object.keys(fields).map(k => "updateMask.fieldPaths=" + k).join("&");
  const r = await fetch(docUrl(uid) + "?" + mask, {
    method: "PATCH", headers: { authorization: "Bearer " + await googleToken(), "content-type": "application/json" },
    body: JSON.stringify({ fields })
  });
  if (!r.ok) throw new HttpError(500, "Payment received, but saving the Pass failed. It will be retried.");
  return { pass: true, passUntil: until };
}

/* ---------- Razorpay ---------- */
export async function razorpay(path, opt = {}) {
  const auth = "Basic " + Buffer.from(env("RAZORPAY_KEY_ID") + ":" + env("RAZORPAY_KEY_SECRET")).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/" + path, {
    ...opt, headers: { authorization: auth, "content-type": "application/json" }
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new HttpError(502, "Razorpay: " + (j.error && j.error.description || ("error " + r.status)));
  return j;
}

export const hmacHex = (secret, data) => crypto.createHmac("sha256", secret).update(data).digest("hex");
export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
export const isTestMode = () => String(process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_");
