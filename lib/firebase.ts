
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzzie9Zbr0bZX3Z4pKeKHnaLaa0L5tqMQ",
  authDomain: "transito-mapa-da-forca-dco.firebaseapp.com",
  projectId: "transito-mapa-da-forca-dco",
  storageBucket: "transito-mapa-da-forca-dco.firebasestorage.app",
  messagingSenderId: "353706314590",
  appId: "1:353706314590:web:8fa13367c9e81b8be4ddcf",
  measurementId: "G-ZCX9XWY5L4"
};

const app = initializeApp(firebaseConfig);

// Inicializa analytics apenas no lado do cliente
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export { analytics };
export default app;
