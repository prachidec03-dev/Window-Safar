/* Window Safar sign-in, powered by Firebase (free Spark plan).
   Firebase project: windowsafar (this config is public by design; security comes from firestore.rules). */
window.WS_FIREBASE = {
  apiKey: "AIzaSyAOoP-JzL7pLbjqYqEquaGXftZ8-FX15xA",
  authDomain: "windowsafar.firebaseapp.com",
  projectId: "windowsafar",
  appId: "1:471808065825:web:7681af1fb6a1bc92b13e60"
};

(function () {
  const V = "10.12.2", base = "https://www.gstatic.com/firebasejs/" + V + "/";
  const KEYS = ["ws-stamps", "ws-bought", "ws-prog"];   // the Pass is never synced from the browser; only the server sets it
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
    user() { return auth && auth.currentUser || null; },
    async token() { const u = auth && auth.currentUser; return u ? u.getIdToken() : ""; },
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
