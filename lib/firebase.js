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

// Firestore se puede inicializar siempre (no valida la API key).
export const db = getFirestore(app);

// Auth se inicializa de forma PEREZOSA y SOLO en el navegador.
// getAuth() valida la API key de forma síncrona y lanzaría durante el
// prerender en el servidor (build de Vercel). Como Auth solo se usa en
// el cliente (login/logout del panel), lo creamos bajo demanda.
let _auth;
export function getAuthClient() {
  if (typeof window === "undefined") {
    throw new Error("getAuthClient() solo puede usarse en el navegador.");
  }
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

// Guardar RSVP en Firestore
export async function saveRsvpToFirestore(rsvpData) {
  try {
    const { collection, addDoc } = await import("firebase/firestore");
    const rsvpCollection = collection(db, "rsvps");

    const docRef = await addDoc(rsvpCollection, rsvpData);
    console.log("RSVP guardado con ID:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("Error guardando RSVP en Firestore:", error);
    throw error;
  }
}

export default app;
