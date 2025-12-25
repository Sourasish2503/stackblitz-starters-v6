import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2U79OZDNouamR79KOwgtlacdB-0HpghA",
  authDomain: "algofomo-churn-buster.firebaseapp.com",
  projectId: "algofomo-churn-buster",
  storageBucket: "algofomo-churn-buster.firebasestorage.app",
  messagingSenderId: "855194396858",
  appId: "1:855194396858:web:7d316d313f72202ddf3a83",
  measurementId: "G-3YHR566HW1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);