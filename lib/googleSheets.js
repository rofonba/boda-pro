/**
 * Integración con Google Sheets API
 *
 * ARQUITECTURA:
 * ─────────────────────────────────────────────────────────────────
 * Las credenciales se cargan desde un ARCHIVO LOCAL (no variable de entorno)
 * porque el JWT requiere formato exacto y Vercel corrompe las newlines en env vars.
 *
 * Archivo: ./google-credentials.json (raíz del proyecto)
 *   → Contiene el JSON completo de la Service Account
 *   → Se carga con require('../google-credentials.json')
 *   → Funciona en desarrollo y Vercel
 *
 * FLUJO DE LECTURA:
 * ─────────────────────────────────────────────────────────────────
 * 1. Cargar credenciales desde google-credentials.json
 * 2. Autenticarse con Google Sheets API usando JWT
 * 3. Leer hoja "Vercel", rango A6:B500 (Nº, Quién)
 * 4. Procesar nombres y generar slugs normalizados
 * 5. Cachear por 5 minutos para minimizar llamadas API
 * 6. Retornar objeto con estructura: { "juan-perez": {...}, ... }
 *
 * CACHÉ:
 * ─────────────────────────────────────────────────────────────────
 * Los datos se cachean en memoria durante 5 minutos.
 * Después expira y se re-fetch desde Google Sheets.
 * ─────────────────────────────────────────────────────────────────
 */

// Integración con Google Sheets API con autenticación JWT explícita
// Los datos se cachean en memoria para minimizar llamadas a la API
// Formato: Columna A = Nº, B = Quién

let GUESTS_CACHE = null;
let CACHE_TIMESTAMP = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Convertir nombre a slug (Juan Pérez -> juan-perez)
 */
export function slugify(text) {
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
 * Detectar si es pareja
 */
function isPareja(relacion = "", detalle = "") {
  const text = `${relacion} ${detalle}`.toLowerCase();
  const pairingKeywords = ["&", "y", "pareja", "familia", "acompañante", "+"];
  return pairingKeywords.some((keyword) => text.includes(keyword));
}

/**
 * Obtener y validar credenciales de Google
 *
 * ESTRATEGIA DE FALLBACK:
 * 1. Intenta cargar desde google-credentials.json (archivo local)
 *    └─ Funciona en desarrollo (sin problemas de formato JWT)
 * 2. Si falla (archivo no existe), intenta process.env.GOOGLE_SHEETS_CREDENTIALS
 *    └─ Funciona en Vercel (variable de entorno configurada)
 *
 * Esto permite:
 * ✓ Desarrollo local: usar archivo (seguro, sin corrupción de JWT)
 * ✓ Vercel: usar variable de entorno (flexible, sin incluir archivo en repo)
 * ✓ .gitignore activo: google-credentials.json nunca se commitea
 */
function getGoogleCredentials() {
  console.log("\n[Google Sheets] ═══════════════════════════════════════════════════");
  console.log("[Google Sheets] Cargando credenciales de Google...");
  console.log("[Google Sheets] ═══════════════════════════════════════════════════");

  let credentials = null;
  let loadSource = null;

  // INTENTO 1: Cargar desde archivo local (google-credentials.json)
  try {
    console.log("[Google Sheets] Intento 1: Cargando desde google-credentials.json...");
    credentials = require("../google-credentials.json");
    loadSource = "archivo local (google-credentials.json)";
    console.log("[Google Sheets] ✓ Archivo google-credentials.json cargado exitosamente");
  } catch (fileError) {
    console.warn("[Google Sheets] ⚠ Archivo google-credentials.json no encontrado:", fileError.code);
    console.log("[Google Sheets] Intento 2: Cargando desde variable de entorno GOOGLE_SHEETS_CREDENTIALS...");

    // INTENTO 2: Cargar desde variable de entorno
    try {
      const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS;

      if (!credentialsJson) {
        console.error("[Google Sheets] ✗ ERROR: GOOGLE_SHEETS_CREDENTIALS no está configurado");
        throw new Error(
          "Credenciales no encontradas en archivo (google-credentials.json) ni en variable de entorno (GOOGLE_SHEETS_CREDENTIALS)"
        );
      }

      credentials = JSON.parse(credentialsJson);
      loadSource = "variable de entorno (GOOGLE_SHEETS_CREDENTIALS)";
      console.log("[Google Sheets] ✓ Variable GOOGLE_SHEETS_CREDENTIALS parseada exitosamente");
    } catch (envError) {
      if (envError instanceof SyntaxError) {
        console.error(
          "[Google Sheets] ✗ ERROR: GOOGLE_SHEETS_CREDENTIALS no es JSON válido:",
          envError.message
        );
        throw new Error("GOOGLE_SHEETS_CREDENTIALS es JSON inválido");
      }
      throw envError;
    }
  }

  // Validar que las credenciales tengan todos los campos requeridos
  console.log("[Google Sheets]");
  console.log("[Google Sheets] Validando campos requeridos...");
  const requiredFields = {
    type: !!credentials.type,
    project_id: !!credentials.project_id,
    private_key: !!credentials.private_key,
    client_email: !!credentials.client_email,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, present]) => !present)
    .map(([field, _]) => field);

  if (missingFields.length > 0) {
    console.error("[Google Sheets] ✗ ERROR: Credenciales incompletas. Faltan campos:", missingFields);
    throw new Error(`Credenciales incompletas. Faltan: ${missingFields.join(", ")}`);
  }

  console.log("[Google Sheets] ✓ Todos los campos requeridos están presentes");

  // Mostrar resumen de las credenciales cargadas
  console.log("[Google Sheets]");
  console.log("[Google Sheets] ═══════════════════════════════════════════════════");
  console.log("[Google Sheets] CREDENCIALES CARGADAS CORRECTAMENTE");
  console.log("[Google Sheets] ═══════════════════════════════════════════════════");
  console.log(`[Google Sheets] Fuente: ${loadSource}`);
  console.log(`[Google Sheets] Tipo: ${credentials.type}`);
  console.log(`[Google Sheets] Proyecto: ${credentials.project_id}`);
  console.log(`[Google Sheets] Service Account: ${credentials.client_email}`);
  console.log(`[Google Sheets] Private Key: ${credentials.private_key.length} caracteres`);
  console.log("[Google Sheets] ═══════════════════════════════════════════════════");
  console.log("[Google Sheets]\n");

  return credentials;
}

/**
 * Obtener el ID del Google Sheet
 */
function getSheetId() {
  const sheetId = process.env.GOOGLE_SHEETS_ID;

  if (!sheetId) {
    console.error(
      "[Google Sheets] ERROR: GOOGLE_SHEETS_ID no está configurado"
    );
    throw new Error("GOOGLE_SHEETS_ID no está configurado");
  }

  console.log("[Google Sheets] ✓ Sheet ID configurado:", sheetId);
  return sheetId;
}

/**
 * Leer invitados del Google Sheet usando autenticación JWT explícita
 */
async function fetchGuestsFromSheet() {
  const { google } = require("googleapis");

  console.log("\n" + "=".repeat(80));
  console.log("[Google Sheets] INICIANDO LECTURA DE INVITADOS");
  console.log("=".repeat(80));

  try {
    // 1. Obtener y validar credenciales
    console.log("[Google Sheets] Obteniendo credenciales...");
    const credentials = getGoogleCredentials();
    const spreadsheetId = getSheetId();

    // Rango ajustado: Hoja "Vercel", filas 6-500, columnas A-B (Nº, Quién)
    const sheetName = "Vercel";
    const range = `${sheetName}!A6:B500`;

    console.log("[Google Sheets]");
    console.log("[Google Sheets] ══════════════════════════════════════════════════════");
    console.log("[Google Sheets] CONFIGURACIÓN DE LECTURA");
    console.log("[Google Sheets] ══════════════════════════════════════════════════════");
    console.log(`[Google Sheets] Leyendo desde hoja Vercel, rango A6:B500...`);
    console.log(`[Google Sheets]`);
    console.log(`[Google Sheets] Detalles:`);
    console.log(`[Google Sheets]   • Nombre de hoja: "${sheetName}"`);
    console.log(`[Google Sheets]   • Rango: "${range}"`);
    console.log(`[Google Sheets]   • Fila inicial: 6 (primeros datos reales)`);
    console.log(`[Google Sheets]   • Fila final: 500 (máximo)`);
    console.log(`[Google Sheets]   • Columna A: Nº (número - para referencia)`);
    console.log(`[Google Sheets]   • Columna B: Quién (NOMBRE del invitado) ← CRÍTICA`);
    console.log(`[Google Sheets]`);
    console.log(`[Google Sheets]   • Spread ID: ${spreadsheetId}`);
    console.log(`[Google Sheets]   • Service Account: ${credentials.client_email}`);
    console.log("[Google Sheets] ══════════════════════════════════════════════════════");
    console.log("[Google Sheets]");

    // 2. Crear cliente JWT explícitamente
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: credentials.type,
        project_id: credentials.project_id,
        private_key_id: credentials.private_key_id,
        private_key: credentials.private_key,
        client_email: credentials.client_email,
        client_id: credentials.client_id,
        auth_uri: credentials.auth_uri,
        token_uri: credentials.token_uri,
        auth_provider_x509_cert_url: credentials.auth_provider_x509_cert_url,
        client_x509_cert_url: credentials.client_x509_cert_url,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    console.log("[Google Sheets] ✓ Autenticación JWT configurada");

    // 3. Obtener cliente autenticado
    const authClient = await auth.getClient();
    console.log("[Google Sheets] ✓ Cliente JWT obtenido");

    // 4. Crear instancia de Sheets API
    const sheets = google.sheets({ version: "v4", auth: authClient });
    console.log("[Google Sheets] ✓ API Sheets instanciada");

    // 5. Hacer solicitud
    console.log(`[Google Sheets] Solicitando datos a Google Sheets API...`);
    console.log(`[Google Sheets] Rango: "${range}"`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log(`[Google Sheets]`);
    console.log(`[Google Sheets] ✓ DATOS RECIBIDOS: ${rows.length} filas desde Google Sheets`);

    // 6. Procesar filas con validación robusta
    console.log(`[Google Sheets]`);
    console.log(`[Google Sheets] ══════════════════════════════════════════════════════`);
    console.log(`[Google Sheets] PROCESANDO FILAS`);
    console.log(`[Google Sheets] ══════════════════════════════════════════════════════`);

    const guests = {};
    let processedCount = 0;
    let skippedCount = 0;
    const processedNames = [];
    let firstRowData = null;

    rows.forEach((row, rowIndex) => {
      try {
        // Estructura esperada (hoja Vercel, columnas A-B):
        // row[0] = Nº (número - columna A)
        // row[1] = Quién (nombre del invitado - columna B) ← CRÍTICA

        // Guardar la primera fila procesada para logs
        if (processedCount === 0 && row && row[1]) {
          firstRowData = {
            numero: row[0] || "N/A",
            nombre: row[1] || "N/A",
          };
        }

        // Validar que row existe
        if (!row) {
          skippedCount++;
          return;
        }

        // Validar que row[1] (Quién/Nombre en columna B) existe y tiene contenido
        if (!row[1]) {
          skippedCount++;
          return;
        }

        const nombreRaw = row[1];

        // Validar que es string
        if (typeof nombreRaw !== "string") {
          console.warn(
            `[Google Sheets] ⚠ Fila ${rowIndex + 6}: Columna B no es string, es: ${typeof nombreRaw}`
          );
          skippedCount++;
          return;
        }

        // Limpiar el nombre
        const nombre = nombreRaw.trim();
        if (!nombre || nombre.length === 0) {
          skippedCount++;
          return;
        }

        // Generar slug normalizado (lowercase, sin acentos, espacios normalizados)
        const slug = slugify(nombre);

        // Por ahora, sin pareja (ya que solo leemos A-B)
        // Si necesitas detectar parejas, necesitarías más columnas (C, D)
        const esPareja = false;

        // Agregar al objeto de invitados
        guests[slug] = {
          id: slug,
          nombres: nombre,
          esPareja,
        };

        processedNames.push({
          numero: row[0] || "N/A",
          original: nombre,
          slug: slug,
        });

        processedCount++;
      } catch (rowError) {
        console.warn(
          `[Google Sheets] ⚠ Error procesando fila ${rowIndex + 6}:`,
          rowError.message
        );
        skippedCount++;
      }
    });

    console.log(`[Google Sheets]`);
    console.log(`[Google Sheets] ══════════════════════════════════════════════════════`);
    console.log(`[Google Sheets] RESULTADOS DEL PROCESAMIENTO`);
    console.log(`[Google Sheets] ══════════════════════════════════════════════════════`);
    console.log(`[Google Sheets] ✓ Total procesados: ${processedCount} invitados`);
    console.log(`[Google Sheets] ⊘ Total omitidos: ${skippedCount} filas vacías`);

    if (firstRowData) {
      console.log(`[Google Sheets]`);
      console.log(`[Google Sheets] Primera fila procesada:`);
      console.log(`[Google Sheets]   Nº: ${firstRowData.numero}`);
      console.log(`[Google Sheets]   Quién: ${firstRowData.nombre}`);
    }

    console.log(`[Google Sheets]`);
    console.log(`[Google Sheets] Primeros 5 invitados generados:`);
    processedNames.slice(0, 5).forEach((guest, idx) => {
      console.log(`[Google Sheets]   ${idx + 1}. "${guest.original}" → slug: "${guest.slug}"`);
    });
    if (processedNames.length > 5) {
      console.log(`[Google Sheets]   ... y ${processedNames.length - 5} más`);
    }
    console.log(`[Google Sheets]`);
    console.log(`[Google Sheets] ══════════════════════════════════════════════════════`);
    console.log(`[Google Sheets]\n`);

    return guests;
  } catch (error) {
    console.error("[Google Sheets] ERROR al leer datos:", {
      message: error.message,
      code: error.code,
      status: error.status,
      errors: error.errors,
    });

    if (error.status === 401 || error.status === 403) {
      console.error(
        "[Google Sheets] ERROR DE AUTENTICACIÓN/AUTORIZACIÓN:",
        "Verificar que la Service Account tiene permisos de 'Lector' en el Sheet"
      );
    }

    if (error.status === 404) {
      console.error(
        "[Google Sheets] ERROR 404: Sheet no encontrado o rango inválido"
      );
    }

    throw new Error(`No se pudo leer Google Sheets: ${error.message}`);
  }
}

/**
 * Obtener invitados con caché de 5 minutos
 */
export async function getGuestsFromSheet() {
  const now = Date.now();

  // Si hay caché válido, retornarlo
  if (
    GUESTS_CACHE &&
    CACHE_TIMESTAMP &&
    now - CACHE_TIMESTAMP < CACHE_DURATION
  ) {
    console.log("[Google Sheets] Usando caché (sin expirar)");
    return GUESTS_CACHE;
  }

  console.log("[Google Sheets] Caché expirado o no existe, fetching nuevos datos...");

  // Fetch nuevos datos
  const guests = await fetchGuestsFromSheet();
  GUESTS_CACHE = guests;
  CACHE_TIMESTAMP = now;

  console.log(`[Google Sheets] ✓ Caché actualizado (expirará en 5 minutos)`);

  return guests;
}

/**
 * Validar si un invitado existe en el Google Sheet
 */
export async function validateGuestId(guestId) {
  const guests = await getGuestsFromSheet();
  const found = guests[guestId.toLowerCase()];

  if (found) {
    console.log(`[Google Sheets] ✓ Invitado validado: ${guestId}`);
  } else {
    console.warn(`[Google Sheets] ⚠ Invitado no encontrado: ${guestId}`);
  }

  return found || null;
}

/**
 * Obtener todos los invitados (para admin)
 */
export async function getAllGuestsFromSheet() {
  const guests = await getGuestsFromSheet();
  return Object.values(guests);
}
