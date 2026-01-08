import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzzie9Zbr0bZX3Z4pKeKHnaLaa0L5tqMQ",
  authDomain: "transito-mapa-da-forca-dco.firebaseapp.com",
  projectId: "transito-mapa-da-forca-dco",
  storageBucket: "transito-mapa-da-forca-dco.firebasestorage.app",
  messagingSenderId: "353706314590",
  appId: "1:353706314590:web:8fa13367c9e81b8be4ddcf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;