// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQlDVNdMn8xVnSYXR6RH4l2T8ykZkuAhA",
  authDomain: "portfolio-d5a64.firebaseapp.com",
  projectId: "portfolio-d5a64",
  storageBucket: "portfolio-d5a64.firebasestorage.app",
  messagingSenderId: "759379255848",
  appId: "1:759379255848:web:5aacbf7b8b306500604b1d",
  measurementId: "G-QZF09MJXYW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
