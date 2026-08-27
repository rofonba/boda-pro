// Firebase para el NAVEGADOR (SDK de cliente) — lo usa /backstage.
//
// Está separado de lib/firebase.js a propósito: ese usa el Admin SDK, que
// depende de módulos de Node (fs, path) y no se puede empaquetar para el
// cliente. Mezclarlos rompe el build.
//
// Requiere las variables NEXT_PUBLIC_FIREBASE_* (ver .env.local).

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Inicializa la app de Firebase una sola vez (perezosamente). */
function getAppClient() {
  return getApps().length ? getApp() : initializeApp(config);
}

/** Instancia de Authentication para el navegador. */
export function getAuthClient() {
  return getAuth(getAppClient());
}

/** Instancia de Firestore para el navegador (lectura en tiempo real). */
export function getDbClient() {
  return getFirestore(getAppClient());
}
