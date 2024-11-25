// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuZdyALg_xyJyN01v9lDuO3zFVdoSCm1A",
  authDomain: "qr-menu-ecb49.firebaseapp.com",
  projectId: "qr-menu-ecb49",
  storageBucket: "qr-menu-ecb49.firebasestorage.app",
  messagingSenderId: "481648019715",
  appId: "1:481648019715:web:0c99cdb81c8c96d17dc136",
  measurementId: "G-50DH6SRYL7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
