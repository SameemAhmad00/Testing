import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0GtX2yX_bpIbDVQnkmLSpFRc34rEoD2s",
  authDomain: "blog-150ec.firebaseapp.com",
  databaseURL: "https://blog-150ec-default-rtdb.firebaseio.com",
  projectId: "blog-150ec",
  storageBucket: "blog-150ec.firebasestorage.app",
  messagingSenderId: "188277522305",
  appId: "1:188277522305:web:3d8cd374813b1cd4797280",
  measurementId: "G-7YTTWTZHSP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
