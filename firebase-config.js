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
  apiKey: "PASTE_API_KEY_HERE",
  authDomain: "PASTE_AUTH_DOMAIN_HERE",
  projectId: "hendersonpottershouse-aa92d",
  storageBucket: "PASTE_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_APP_ID_HERE"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


export {
  app,
  auth,
  db
};
