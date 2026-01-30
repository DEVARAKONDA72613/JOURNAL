// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyComvWDZgMUF2_7DaWbppBbPc6AbBNPf3Q",
  authDomain: "journal-d98dd.firebaseapp.com",
  projectId: "journal-d98dd",
  appId: "1:784836352131:web:1553bf1a549dfee50a23b6"
};

// Init
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 🔐 CRITICAL LINE (this fixes the loop)
await setPersistence(auth, browserLocalPersistence);

// Google provider
export const provider = new GoogleAuthProvider();
