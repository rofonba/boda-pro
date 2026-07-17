/**
 * Script de Migración: CSV a Firebase Firestore
 *
 * Uso:
 *   node migrar.js
 *
 * Archivo esperado:
 *   invitados_csv.csv (formato: numero,nombre)
 *
 * Proceso:
 * 1. Lee invitados_csv.csv
 * 2. Para cada invitado:
 *    - Genera un slug del nombre (juan-perez)
 *    - Crea un documento en Firestore/invitados
 *    - Campos: nombre, numero, asistencia, autobus, alergia, cancion
 * 3. Reporta resultados
 */

import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────────────────────────────────────────────────────────
// UTILIDADES
// ────────────────────────────────────────────────────────────────────

/**
 * Convertir nombre a slug (Juan Pérez → juan-perez)
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

/**
 * Cargar credenciales de Firebase Admin
 */
function loadFirebaseCredentials() {
  console.log("[Migración] Cargando credenciales de Firebase...");

  const keyPath = path.join(__dirname, "serviceAccountKey.json");
  if (!fs.existsSync(keyPath)) {
    throw new Error(`serviceAccountKey.json no encontrado en: ${keyPath}`);
  }

  const credentials = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  console.log("[Migración] ✓ Credenciales cargadas");
  return credentials;
}

/**
 * Inicializar Firebase Admin
 */
function initializeFirebase(credentials) {
  console.log("[Migración] Inicializando Firebase...");

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId: credentials.project_id,
    });
  }

  console.log("[Migración] ✓ Firebase inicializado");
  return admin.firestore();
}

/**
 * Leer CSV y parsear invitados
 */
function readCSV(filePath) {
  console.log(`[Migración] Leyendo archivo: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Archivo no encontrado: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.trim().split("\n");

  const invitados = [];
  let skipped = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Saltar líneas vacías y encabezados
    if (!line || line === "numero,nombre" || line === "número,nombre") {
      continue;
    }

    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 2) {
      console.warn(`[Migración] ⚠ Línea ${i + 1} inválida: "${line}"`);
      skipped++;
      continue;
    }

    const numero = parts[0];
    const nombre = parts.slice(1).join(","); // Por si hay comas en el nombre

    if (!nombre || nombre.length === 0) {
      console.warn(`[Migración] ⚠ Nombre vacío en línea ${i + 1}`);
      skipped++;
      continue;
    }

    invitados.push({
      numero: numero || "",
      nombre: nombre.trim(),
    });
  }

  console.log(`[Migración] ✓ ${invitados.length} invitados leídos (${skipped} omitidos)`);
  return invitados;
}

/**
 * Migrar invitados a Firestore
 */
async function migrateToFirestore(db, invitados) {
  console.log("\n[Migración] ════════════════════════════════════════════════════");
  console.log("[Migración] INICIANDO MIGRACIÓN A FIRESTORE");
  console.log("[Migración] ════════════════════════════════════════════════════\n");

  const collection = db.collection("invitados");
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (let i = 0; i < invitados.length; i++) {
    const { numero, nombre } = invitados[i];
    const slug = slugify(nombre);

    try {
      const docData = {
        nombre: nombre,
        numero: numero,
        asistencia: "Pendiente",
        autobus: false,
        alergia: "",
        cancion: "",
        createdAt: new Date().toISOString(),
      };

      await collection.doc(slug).set(docData);
      successCount++;
      results.push({ slug, nombre, status: "✓ Éxito" });
      console.log(`[Migración] ${i + 1}/${invitados.length} - ✓ "${nombre}" → "${slug}"`);
    } catch (error) {
      errorCount++;
      results.push({ slug, nombre, status: "✗ Error: " + error.message });
      console.error(
        `[Migración] ${i + 1}/${invitados.length} - ✗ Error con "${nombre}": ${error.message}`
      );
    }
  }

  console.log("\n[Migración] ════════════════════════════════════════════════════");
  console.log("[Migración] RESULTADOS DE LA MIGRACIÓN");
  console.log("[Migración] ════════════════════════════════════════════════════");
  console.log(`[Migración] Total procesados: ${invitados.length}`);
  console.log(`[Migración] ✓ Éxitos: ${successCount}`);
  console.log(`[Migración] ✗ Errores: ${errorCount}`);
  console.log("[Migración] ════════════════════════════════════════════════════\n");

  return {
    total: invitados.length,
    success: successCount,
    errors: errorCount,
    results,
  };
}

// ────────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────────

async function main() {
  try {
    console.log("\n" + "=".repeat(70));
    console.log("MIGRACIÓN: CSV → Firebase Firestore");
    console.log("=".repeat(70) + "\n");

    // Cargar credenciales e inicializar Firebase
    const credentials = loadFirebaseCredentials();
    const db = initializeFirebase(credentials);

    // Leer CSV
    const csvPath = path.join(__dirname, "invitados_csv.csv");
    const invitados = readCSV(csvPath);

    // Confirmar migración
    console.log("\n[Migración] ⚠ Se van a crear/actualizar " + invitados.length + " documentos en Firestore");
    console.log("[Migración] Colección: invitados");
    console.log("[Migración] Campos: nombre, numero, asistencia, autobus, alergia, cancion\n");

    // Migrar
    const result = await migrateToFirestore(db, invitados);

    console.log("[Migración] ✓ Migración completada exitosamente");
    console.log("[Migración] Próximo paso: actualizar app/api/guests/route.js para leer de Firestore\n");

    process.exit(0);
  } catch (error) {
    console.error("\n[Migración] ✗ ERROR FATAL:", error.message);
    console.error("[Migración] Stack:", error.stack);
    process.exit(1);
  }
}

main();
