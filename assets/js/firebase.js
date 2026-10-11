/* Firebase for lyshub.com: one app, shared by the public pages and the admin portal. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { connectFirestoreEmulator, getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD91Zjau35iptUm5HPiGlggpJY1xoE_al4",
    authDomain: "lyshub-technologies.firebaseapp.com",
    projectId: "lyshub-technologies",
    storageBucket: "lyshub-technologies.firebasestorage.app",
    messagingSenderId: "805961429148",
    appId: "1:805961429148:web:b08465ab2bfc1ff75dfd59",
    measurementId: "G-RLVK578YCM"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/*
 * Local testing against the Firebase emulators (firebase emulators:start): open any page on
 * localhost with ?emulator=1. It sticks for the tab. Never active on the live site.
 */
const local = ["localhost", "127.0.0.1"].includes(location.hostname);
if (local && new URLSearchParams(location.search).has("emulator")) sessionStorage.setItem("lyshubEmulator", "1");
export const useEmulators = local && sessionStorage.getItem("lyshubEmulator") === "1";
if (useEmulators) connectFirestoreEmulator(db, "127.0.0.1", 8080);
