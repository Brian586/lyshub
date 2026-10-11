/*
 * Who may use the admin: anyone signed in whose uid has a document in `admins/`.
 * That collection can't be written from the browser (see firestore.rules); add a uid in
 * the Firebase console. The "not an admin" screen shows the uid to paste.
 */
import { app, db, useEmulators } from "../../assets/js/firebase.js";
import {
    connectAuthEmulator, getAuth, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail,
    signInWithEmailAndPassword, signInWithPopup, signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

export const auth = getAuth(app);
if (useEmulators) connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });

const $ = (sel) => document.querySelector(sel);

function show(state) {
    document.querySelectorAll("[data-state]").forEach((el) => {
        el.hidden = el.getAttribute("data-state") !== state;
    });
}

function status(el, message, ok = false) {
    el.textContent = message;
    el.className = `form-status show ${ok ? "ok" : "err"}`;
}

const AUTH_ERRORS = {
    "auth/invalid-credential": "That email and password don't match an account.",
    "auth/invalid-email": "That doesn't look like an email address.",
    "auth/too-many-requests": "Too many attempts. Wait a minute and try again.",
    "auth/popup-closed-by-user": "The Google window was closed before signing in.",
    "auth/network-request-failed": "No connection. Check your internet and try again.",
    "auth/operation-not-allowed": "This sign-in method isn't switched on for the Lyshub Firebase project yet."
};

function wireSignIn() {
    const form = $("#signin-form");
    if (!form) return;
    const msg = form.querySelector(".form-status");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = form.querySelector("button[type=submit]");
        btn.disabled = true;
        try {
            await signInWithEmailAndPassword(auth, form.email.value.trim(), form.password.value);
        } catch (err) {
            status(msg, AUTH_ERRORS[err.code] || err.message);
        } finally {
            btn.disabled = false;
        }
    });
    $("#signin-google").addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
        } catch (err) {
            status(msg, AUTH_ERRORS[err.code] || err.message);
        }
    });
    $("#signin-reset").addEventListener("click", async () => {
        const email = form.email.value.trim();
        if (!email) {
            status(msg, "Type your email above first, then tap “Forgot password?” again.");
            form.email.focus();
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            status(msg, `A reset link is on its way to ${email}.`, true);
        } catch (err) {
            status(msg, AUTH_ERRORS[err.code] || err.message);
        }
    });
}

/*
 * Runs `onReady(user)` once a signed-in admin is confirmed; otherwise shows the sign-in
 * or "not an admin" state. Pages mark their states with data-state="loading|signin|denied|app".
 */
export function requireAdmin(onReady) {
    wireSignIn();
    document.querySelectorAll("[data-signout]").forEach((b) => b.addEventListener("click", () => signOut(auth)));
    let started = false;
    show("loading");
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            /* Pages without a sign-in form (the editor) send you to the one that has it. */
            if (!$("#signin-form")) location.replace("index.html");
            else show("signin");
            return;
        }
        document.querySelectorAll("[data-user-email]").forEach((el) => { el.textContent = user.email || user.uid; });
        let isAdmin = false;
        try {
            isAdmin = (await getDoc(doc(db, "admins", user.uid))).exists();
        } catch (err) {
            isAdmin = false;
        }
        if (!isAdmin) {
            if (!$("#denied-uid")) {
                location.replace("index.html");
                return;
            }
            $("#denied-uid").textContent = user.uid;
            show("denied");
            return;
        }
        show("app");
        if (!started) {
            started = true;
            onReady(user);
        }
    });
    const copy = $("#denied-copy");
    if (copy) copy.addEventListener("click", () => navigator.clipboard?.writeText($("#denied-uid").textContent));
}
