/**
 * API Route: GET /api/guests
 *
 * ACCESO PÚBLICO (sin autenticación requerida)
 * ────────────────────────────────────────────────────────────
 * Esta API es de SOLO LECTURA y está abierta al público.
 * Lee directamente de Firestore (colección: invitados)
 *
 * CASOS DE USO:
 * 1. GET /api/guests → Devuelve lista completa de invitados
 * 2. GET /api/guests?id=juan-perez → Devuelve invitado específico
 * 3. Formulario de invitados - búsqueda pública
 * 4. GuestProvider - cargar datos del invitado en URL
 *
 * NOTA: Los datos de Firestore contienen:
 *   - nombre (string)
 *   - numero (string)
 *   - asistencia (string: Pendiente, Sí, No)
 *   - autobus (boolean)
 *   - alergia (string)
 *   - cancion (string)
 * ────────────────────────────────────────────────────────────
 */

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let db = null;

/**
 * Inicializar Firebase Admin SDK
 */
function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Intentar cargar credenciales del archivo local
  try {
    const keyPath = path.join(process.cwd(), "serviceAccountKey.json");
    if (fs.existsSync(keyPath)) {
      const credentials = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        projectId: credentials.project_id,
      });
      console.log("[API Guests] ✓ Firebase inicializado desde serviceAccountKey.json");
      return admin.app();
    }
  } catch (fileError) {
    console.warn("[API Guests] ⚠ serviceAccountKey.json no disponible");
  }

  // Fallback: intentar variable de entorno
  try {
    const credentialsJson = process.env.FIREBASE_ADMIN_SDK;
    if (credentialsJson) {
      const credentials = JSON.parse(credentialsJson);
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        projectId: credentials.project_id,
      });
      console.log("[API Guests] ✓ Firebase inicializado desde FIREBASE_ADMIN_SDK");
      return admin.app();
    }
  } catch (envError) {
    console.error("[API Guests] ✗ Error con FIREBASE_ADMIN_SDK:", envError.message);
  }

  throw new Error("No se pudo inicializar Firebase - credenciales no encontradas");
}

/**
 * Obtener Firestore
 */
function getFirestore() {
  if (!db) {
    const app = initializeFirebase();
    db = admin.firestore(app);
  }
  return db;
}

/**
 * Convertir nombre a slug (Juan Pérez → juan-perez)
 * Debe coincidir con la lógica en migrar.js
 */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-");
}

export async function GET(request) {
  const timestamp = new Date().toISOString();
  const { searchParams } = new URL(request.url);
  const requestedId = searchParams.get("id");

  console.log("\n" + "=".repeat(80));
  console.log(`[API GUESTS] ${timestamp} - Solicitud de lista de invitados`);
  console.log("=".repeat(80));
  console.log(`[API GUESTS] Acceso: PÚBLICO (sin autenticación)`);
  console.log(`[API GUESTS] Método: ${request.method}`);
  console.log(`[API GUESTS] Fuente: Firestore (colección: invitados)`);

  if (requestedId) {
    console.log(`[DEBUG] Buscando invitado con ID: ${requestedId}`);
  }

  try {
    const firestore = getFirestore();
    const collection = firestore.collection("invitados");

    let guests = {};
    let guestCount = 0;

    if (requestedId) {
      // BÚSQUEDA ESPECÍFICA: un invitado por ID
      console.log(`[API GUESTS] Buscando documento: ${requestedId}`);

      const doc = await collection.doc(requestedId).get();

      if (doc.exists) {
        const data = doc.data();
        guests[requestedId] = {
          id: requestedId,
          ...data,
        };
        guestCount = 1;
        console.log(`[DEBUG] ✓ Invitado encontrado: "${data.nombre}"`);
      } else {
        console.log(`[DEBUG] ✗ Invitado NO encontrado con ID: "${requestedId}"`);
        // Retornar lista vacía si el invitado no existe
        guests = {};
        guestCount = 0;
      }
    } else {
      // LISTA COMPLETA: todos los invitados
      console.log(`[API GUESTS] Obteniendo todos los invitados...`);

      const snapshot = await collection.get();
      snapshot.forEach((doc) => {
        guests[doc.id] = {
          id: doc.id,
          ...doc.data(),
        };
      });
      guestCount = Object.keys(guests).length;
      console.log(`[API GUESTS] ✓ ${guestCount} invitados obtenidos de Firestore`);
    }

    console.log(`[API GUESTS]`);
    console.log(`[API GUESTS] ══════════════════════════════════════════════════════`);
    console.log(`[API GUESTS] RESULTADO`);
    console.log(`[API GUESTS] ══════════════════════════════════════════════════════`);
    console.log(`[API GUESTS] ✓ Total de invitados: ${guestCount}`);
    console.log(`[API GUESTS]`);

    if (guestCount > 0) {
      console.log(`[API GUESTS] Primeros 5 invitados:`);
      Object.keys(guests)
        .slice(0, 5)
        .forEach((id, idx) => {
          const guest = guests[id];
          console.log(`[API GUESTS]   ${idx + 1}. ID: "${id}" → Nombre: "${guest.nombre}"`);
        });

      if (guestCount > 5) {
        console.log(`[API GUESTS]   ... y ${guestCount - 5} más`);
      }
    }

    console.log(`[API GUESTS] ══════════════════════════════════════════════════════`);
    console.log(`[API GUESTS]\n`);

    return Response.json(
      {
        success: true,
        data: guests,
        count: guestCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[API GUESTS] ✗ ERROR:`);
    console.error(`[API GUESTS] Tipo:`, error.constructor.name);
    console.error(`[API GUESTS] Mensaje:`, error.message);
    console.error(`[API GUESTS] Stack:`, error.stack);
    console.log("=".repeat(80) + "\n");

    return Response.json(
      {
        success: false,
        error: "No se pudo obtener los datos de invitados: " + error.message,
      },
      { status: 500 }
    );
  }
}

// ISR: revalidar cada 5 minutos
export const revalidate = 300;
