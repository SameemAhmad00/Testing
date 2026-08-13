import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBu2uwK2MzBcgOJTlVjA42-hLPYXXrDrU0",
  authDomain: "blog-faf13.firebaseapp.com",
  projectId: "blog-faf13",
  storageBucket: "blog-faf13.firebasestorage.app",
  messagingSenderId: "762326072313",
  appId: "1:762326072313:web:c9f104663baca7c4769b28",
  measurementId: "G-3ER2ZDZ35F"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
