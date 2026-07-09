// Integración con Google Sheets API con autenticación JWT explícita
// Los datos se cachean en memoria para minimizar llamadas a la API
// Formato: Columna A = Nº, B = Quién, C = Relación, D = Detalle

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
 * Parsear y validar credenciales de Google
 */
function getGoogleCredentials() {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS;

  if (!credentialsJson) {
    console.error(
      "[Google Sheets] ERROR: GOOGLE_SHEETS_CREDENTIALS no está configurado"
    );
    throw new Error(
      "GOOGLE_SHEETS_CREDENTIALS no está configurado en variables de entorno"
    );
  }

  try {
    const parsed = JSON.parse(credentialsJson);

    // Validar campos requeridos
    if (!parsed.type || !parsed.project_id || !parsed.private_key || !parsed.client_email) {
      console.error("[Google Sheets] ERROR: Credenciales incompletas. Faltan campos:", {
        type: !!parsed.type,
        project_id: !!parsed.project_id,
        private_key: !!parsed.private_key,
        client_email: !!parsed.client_email,
      });
      throw new Error("Las credenciales de Google no tienen todos los campos requeridos");
    }

    console.log("[Google Sheets] ✓ Credenciales parseadas correctamente", {
      project_id: parsed.project_id,
      client_email: parsed.client_email,
    });

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(
        "[Google Sheets] ERROR: GOOGLE_SHEETS_CREDENTIALS no es JSON válido:",
        error.message
      );
      throw new Error("GOOGLE_SHEETS_CREDENTIALS es JSON inválido");
    }
    throw error;
  }
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

  console.log("[Google Sheets] Iniciando lectura de invitados...");

  try {
    // 1. Obtener y validar credenciales
    const credentials = getGoogleCredentials();
    const spreadsheetId = getSheetId();
    // Rango ajustado: empieza en fila 6, columna A (incluye Nº, Quién, Relación, Detalle)
    const range = "Invitados!A6:D500";

    console.log("[Google Sheets] ════════════════════════════════════════");
    console.log("[Google Sheets] Configuración de lectura:");
    console.log("[Google Sheets] ════════════════════════════════════════");
    console.log("[Google Sheets] Rango solicitado:", range);
    console.log("[Google Sheets]   Hoja: Invitados");
    console.log("[Google Sheets]   Fila inicial: 6 (primeros datos)");
    console.log("[Google Sheets]   Filas máximo: 500");
    console.log("[Google Sheets]   Columnas: A (Nº), B (Quién), C (Relación), D (Detalle)");
    console.log("[Google Sheets] Spread ID:", spreadsheetId);
    console.log("[Google Sheets] Service Account:", credentials.client_email);
    console.log("[Google Sheets] ════════════════════════════════════════");

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
    console.log(`[Google Sheets] Solicitando rango a Google Sheets API...`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log(`\n[Google Sheets] ✓ Datos recibidos desde Google Sheets: ${rows.length} filas`);

    // 6. Procesar filas con validación robusta
    console.log(`[Google Sheets] Procesando filas...`);
    const guests = {};
    let processedCount = 0;
    let skippedCount = 0;
    const processedNames = [];

    rows.forEach((row, rowIndex) => {
      try {
        // Estructura esperada:
        // row[0] = Nº (número)
        // row[1] = Quién (nombre del invitado)
        // row[2] = Relación
        // row[3] = Detalle

        // Validar que row[1] (Quién/Nombre) existe y tiene contenido
        if (!row || !row[1]) {
          skippedCount++;
          return;
        }

        const nombreRaw = row[1];

        // Validar que es string
        if (typeof nombreRaw !== "string") {
          console.warn(
            `[Google Sheets] ⚠ Fila ${rowIndex + 6}: Columna B no es string, tipo: ${typeof nombreRaw}`
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

        // Generar slug normalizado (lowercase, sin acentos, etc.)
        const slug = slugify(nombre);

        // Obtener relación y detalle
        const relacion = (row[2] && typeof row[2] === "string") ? row[2].trim() : "";
        const detalle = (row[3] && typeof row[3] === "string") ? row[3].trim() : "";

        // Detectar si es pareja
        const esPareja = isPareja(relacion, detalle);

        // Agregar al objeto de invitados
        guests[slug] = {
          id: slug,
          nombres: nombre,
          esPareja,
          relacion,
          detalle,
        };

        processedNames.push({
          original: nombre,
          slug: slug,
          relacion: relacion,
          detalle: detalle,
          esPareja: esPareja,
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

    console.log(`\n[Google Sheets] ════════════════════════════════════════`);
    console.log(`[Google Sheets] RESULTADOS DEL PROCESAMIENTO`);
    console.log(`[Google Sheets] ════════════════════════════════════════`);
    console.log(`[Google Sheets] ✓ Total procesados: ${processedCount} invitados`);
    console.log(`[Google Sheets] ⊘ Total omitidos: ${skippedCount} filas vacías`);
    console.log(`[Google Sheets] Primeros 5 invitados:`);
    processedNames.slice(0, 5).forEach((guest) => {
      console.log(`[Google Sheets]   "${guest.original}" → slug: "${guest.slug}" (pareja: ${guest.esPareja})`);
    });
    if (processedNames.length > 5) {
      console.log(`[Google Sheets]   ... y ${processedNames.length - 5} más`);
    }
    console.log(`[Google Sheets] ════════════════════════════════════════\n`);

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
