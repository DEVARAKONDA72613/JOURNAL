// firebase.js
// This file must be in the ROOT (same level as index.html)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🔐 Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyComvWDZgMUF2_7DaWbppBbPc6AbBNPf3Q",
  authDomain: "journal-d98dd.firebaseapp.com",
  projectId: "journal-d98dd",
  appId: "1:784836352131:web:1553bf1a549dfee50a23b6"
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔑 Auth + Provider
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
