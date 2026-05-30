// Inicialización de Firebase (cliente).
// Las credenciales se leen de variables de entorno (.env.local en local,
// y en Vercel desde Project Settings → Environment Variables).
//
// Todas llevan el prefijo NEXT_PUBLIC_ porque el SDK de cliente de Firebase
// se ejecuta en el navegador. Esto es seguro: la protección real de los datos
// se hace con las Reglas de Seguridad de Firestore (ver firestore.rules).

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Evita reinicializar en hot-reload / múltiples imports.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
