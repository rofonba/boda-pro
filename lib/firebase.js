/**
 * Inicialización de Firebase Admin SDK
 *
 * NOTA: Este archivo se usa SOLO en el lado del servidor (Node.js).
 * Para el lado del cliente, usar la configuración de Firebase Web SDK.
 *
 * Credenciales:
 * - Archivo: serviceAccountKey.json (raíz del proyecto)
 * - Variable de entorno: FIREBASE_ADMIN_SDK (fallback)
 */

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let db = null;

/**
 * Obtener y parsear credenciales de Firebase Admin
 * Estrategia de fallback:
 * 1. Intenta leer serviceAccountKey.json (archivo local)
 * 2. Si falla, intenta parsear FIREBASE_ADMIN_SDK (variable de entorno)
 */
function getFirebaseCredentials() {
  console.log("[Firebase] Cargando credenciales de Firebase Admin...");

  // INTENTO 1: Cargar desde archivo local
  try {
    const keyPath = path.join(process.cwd(), "serviceAccountKey.json");
    if (fs.existsSync(keyPath)) {
      console.log("[Firebase] ✓ Cargando serviceAccountKey.json");
      const credentials = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      console.log("[Firebase] ✓ Credenciales parseadas correctamente");
      return credentials;
    }
  } catch (fileError) {
    console.warn("[Firebase] ⚠ serviceAccountKey.json no encontrado, intentando variable de entorno...");
  }

  // INTENTO 2: Cargar desde variable de entorno
  try {
    const credentialsJson = process.env.FIREBASE_ADMIN_SDK;
    if (!credentialsJson) {
      throw new Error("FIREBASE_ADMIN_SDK no está configurado");
    }
    console.log("[Firebase] ✓ Cargando credenciales desde FIREBASE_ADMIN_SDK");
    const credentials = JSON.parse(credentialsJson);
    console.log("[Firebase] ✓ Credenciales parseadas correctamente");
    return credentials;
  } catch (envError) {
    console.error("[Firebase] ✗ ERROR: No se encontraron credenciales de Firebase");
    throw new Error(
      "Credenciales de Firebase no encontradas en serviceAccountKey.json ni en FIREBASE_ADMIN_SDK"
    );
  }
}

/**
 * Inicializar Firebase Admin SDK si no está inicializado
 */
function initializeFirebase() {
  if (admin.apps.length > 0) {
    console.log("[Firebase] ✓ Firebase Admin ya está inicializado");
    return admin.app();
  }

  console.log("[Firebase] Inicializando Firebase Admin SDK...");

  try {
    const credentials = getFirebaseCredentials();

    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId: credentials.project_id,
    });

    console.log("[Firebase] ✓ Firebase Admin inicializado correctamente");
    console.log(`[Firebase] Proyecto: ${credentials.project_id}`);
    console.log(`[Firebase] Service Account: ${credentials.client_email}`);

    return admin.app();
  } catch (error) {
    console.error("[Firebase] ✗ ERROR inicializando Firebase:", error.message);
    throw error;
  }
}

/**
 * Obtener referencia a Firestore
 */
export function getFirestore() {
  if (!db) {
    const app = initializeFirebase();
    db = admin.firestore(app);
  }
  return db;
}

/**
 * Obtener referencia a una colección
 */
export function getCollection(collectionName) {
  return getFirestore().collection(collectionName);
}

/**
 * Obtener un documento de una colección
 */
export async function getDocument(collectionName, documentId) {
  try {
    const doc = await getCollection(collectionName).doc(documentId).get();
    if (doc.exists) {
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error(`[Firebase] Error obteniendo documento ${documentId}:`, error);
    throw error;
  }
}

/**
 * Actualizar un documento (solo campos específicos)
 */
export async function updateDocument(collectionName, documentId, data) {
  try {
    await getCollection(collectionName).doc(documentId).update(data);
    return true;
  } catch (error) {
    console.error(`[Firebase] Error actualizando documento ${documentId}:`, error);
    throw error;
  }
}

/**
 * Crear un documento
 */
export async function createDocument(collectionName, documentId, data) {
  try {
    await getCollection(collectionName).doc(documentId).set(data);
    return true;
  } catch (error) {
    console.error(`[Firebase] Error creando documento ${documentId}:`, error);
    throw error;
  }
}

/**
 * Obtener todos los documentos de una colección
 */
export async function getAllDocuments(collectionName) {
  try {
    const snapshot = await getCollection(collectionName).get();
    const documents = [];
    snapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return documents;
  } catch (error) {
    console.error(`[Firebase] Error obteniendo documentos de ${collectionName}:`, error);
    throw error;
  }
}

export default {
  getFirestore,
  getCollection,
  getDocument,
  updateDocument,
  createDocument,
  getAllDocuments,
};
