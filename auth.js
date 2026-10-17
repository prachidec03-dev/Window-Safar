/* Window Safar sign-in, powered by Firebase (free Spark plan).
   To switch it on, paste your Firebase web app config into the object below.
   Until then the site works normally and the login page says sign-in is coming soon. */
window.WS_FIREBASE = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};

(function () {
  const V = "10.12.2", base = "https://www.gstatic.com/firebasejs/" + V + "/";
  const KEYS = ["ws-stamps", "ws-pass", "ws-bought", "ws-prog"];
  const on = () => !!(window.WS_FIREBASE.apiKey && window.WS_FIREBASE.projectId);
  let ready = null, auth = null, db = null, pushT = 0;

  const load = src => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const lget = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  function init() {
    if (!on()) return Promise.resolve(null);
    if (ready) return ready;
    ready = load(base + "firebase-app-compat.js")
      .then(() => Promise.all([load(base + "firebase-auth-compat.js"), load(base + "firebase-firestore-compat.js")]))
      .then(() => { firebase.initializeApp(window.WS_FIREBASE); auth = firebase.auth(); db = firebase.firestore(); return auth; })
      .catch(() => null);
    return ready;
  }

  /* combine what's in the cloud with what's on this device, never losing a stamp */
  function merge(cloud) {
    return {
      "ws-stamps": Object.assign({}, cloud["ws-stamps"] || {}, lget("ws-stamps", {})),
      "ws-pass": !!(cloud["ws-pass"] || lget("ws-pass", false)),
      "ws-bought": [...(cloud["ws-bought"] || []), ...lget("ws-bought", [])].slice(-40),
      "ws-prog": Object.assign({}, cloud["ws-prog"] || {}, lget("ws-prog", {}))
    };
  }

  async function sync(user) {
    if (!db || !user) return null;
    const ref = db.collection("users").doc(user.uid);
    let cloud = {};
    try { const snap = await ref.get(); cloud = snap.exists ? (snap.data().progress || {}) : {}; } catch (e) {}
    const m = merge(cloud);
    KEYS.forEach(k => lset(k, m[k]));
    try { await ref.set({ name: user.displayName || "", email: user.email || "", progress: m, updated: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }); } catch (e) {}
    return m;
  }

  function push() {
    clearTimeout(pushT);
    pushT = setTimeout(async () => {
      const u = auth && auth.currentUser; if (!u || !db) return;
      const m = {}; KEYS.forEach(k => m[k] = lget(k, null));
      try { await db.collection("users").doc(u.uid).set({ progress: m, updated: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }); } catch (e) {}
    }, 1500);
  }

  window.WSAuth = {
    enabled: on, init, sync, push, KEYS,
    onChange(cb) { init().then(a => { if (!a) { cb(null); return; } a.onAuthStateChanged(cb); }); },
    async google() {
      const a = await init(); if (!a) throw new Error("off");
      const p = new firebase.auth.GoogleAuthProvider();
      try { return await a.signInWithPopup(p); }
      catch (e) { if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") return a.signInWithRedirect(p); throw e; }
    },
    async emailLink(email) {
      const a = await init(); if (!a) throw new Error("off");
      await a.sendSignInLinkToEmail(email, { url: location.href.split("#")[0].split("?")[0], handleCodeInApp: true });
      lset("ws-email", email);
    },
    async finishEmailLink() {
      const a = await init(); if (!a || !a.isSignInWithEmailLink(location.href)) return null;
      let email = lget("ws-email", "");
      if (!email) email = prompt("Type your email again to finish signing in");
      if (!email) return null;
      const r = await a.signInWithEmailLink(email, location.href);
      try { localStorage.removeItem("ws-email"); } catch (e) {}
      history.replaceState(null, "", location.pathname);
      return r;
    },
    signOut() { return init().then(a => a && a.signOut()); },
    async deleteData() {
      const u = auth && auth.currentUser; if (!u || !db) return;
      await db.collection("users").doc(u.uid).delete();
      await u.delete();
    }
  };
})();
