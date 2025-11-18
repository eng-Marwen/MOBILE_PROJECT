import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJVLFzO8qNuXxL6hCmXpBLYO7bJiZKQxs",
  authDomain: "web-project-8d1ab.firebaseapp.com",
  projectId: "web-project-8d1ab",
  storageBucket: "web-project-8d1ab.firebasestorage.app",
  messagingSenderId: "109048466545",
  appId: "1:109048466545:web:96fa8d57632a8cbbd4dfd0",
  measurementId: "G-SF5TP7X02W",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
