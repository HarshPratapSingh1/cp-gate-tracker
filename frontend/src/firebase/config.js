import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADTobZvs4mMZcjBw_FyI_2BGq79vKsD80",
  authDomain: "cp-gate-tracker.firebaseapp.com",
  projectId: "cp-gate-tracker",
  storageBucket: "cp-gate-tracker.firebasestorage.app",
  messagingSenderId: "351609245920",
  appId: "1:351609245920:web:5d106410aad5c5b7170085"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
