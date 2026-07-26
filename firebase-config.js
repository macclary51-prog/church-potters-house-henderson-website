import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDxGilYZCgUMGb81nThex0kOgynXPFGKoc",
  authDomain: "hendersonpottershouse-aa92d.firebaseapp.com",
  projectId: "hendersonpottershouse-aa92d",
  storageBucket: "hendersonpottershouse-aa92d.firebasestorage.app",
  messagingSenderId: "291820005147",
  appId: "1:291820005147:web:2266349a13ef6bf3f355be",
  measurementId: "G-TNJJXQ8GCK"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


export {
  app,
  auth,
  db,
  firebaseConfig
};
