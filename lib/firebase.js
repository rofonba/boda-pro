// Conexión a Firebase Firestore (Admin SDK) — SOLO SERVIDOR.
//
// Se usa desde los Route Handlers, los Server Components y el script migrar.js.
// Nunca lo importes desde un componente con "use client": el Admin SDK depende
// de módulos de Node (fs, path) y rompería el build del cliente.
// Para el navegador está lib/firebaseClient.js.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { COLECCION_INVITADOS } from "./constantes.js";

export { COLECCION_INVITADOS };

/**
 * Localiza las credenciales de la cuenta de servicio.
 *
 * En local basta con tener serviceAccountKey.json en la raíz. En Vercel ese
 * archivo NO se despliega (está en .gitignore), así que allí es obligatorio
 * definir la variable de entorno FIREBASE_ADMIN_SDK con el JSON completo.
 *
 * @returns {object} el objeto de credenciales de la cuenta de servicio
 */
function leerCredenciales() {
  // 1) Variable de entorno — la vía de producción (Vercel).
  //    Se acepta el JSON tal cual o codificado en base64, porque al pegar el
  //    JSON en algunos paneles los saltos de línea de la clave privada se
  //    corrompen y la firma deja de validar.
  const bruto = process.env.FIREBASE_ADMIN_SDK;
  if (bruto) {
    const texto = bruto.trim().startsWith("{")
      ? bruto
      : Buffer.from(bruto, "base64").toString("utf8");
    return JSON.parse(texto);
  }

  // 2) Archivo local — la vía de desarrollo.
  const ruta = path.join(process.cwd(), "serviceAccountKey.json");
  try {
    return JSON.parse(readFileSync(ruta, "utf8"));
  } catch (error) {
    throw new Error(
      "No hay credenciales de Firebase. En local coloca serviceAccountKey.json " +
        "en la raíz del proyecto; en Vercel define la variable de entorno " +
        `FIREBASE_ADMIN_SDK con el contenido de ese archivo. (${error.message})`
    );
  }
}

/**
 * Devuelve la instancia de Firestore, inicializándola la primera vez.
 *
 * La inicialización es perezosa (no ocurre al importar el módulo) para que un
 * despliegue sin credenciales falle al atender una petición con un mensaje
 * claro, en lugar de romper el build entero de forma opaca.
 *
 * @returns {import("firebase-admin/firestore").Firestore}
 */
export function getDb() {
  if (getApps().length === 0) {
    const credenciales = leerCredenciales();
    initializeApp({
      credential: cert(credenciales),
      projectId: credenciales.project_id,
    });
  }
  return getFirestore();
}

/** Atajo a la colección de invitados. */
export function invitadosRef() {
  return getDb().collection(COLECCION_INVITADOS);
}
