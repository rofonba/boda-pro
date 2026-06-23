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
    const range = "Invitados!A2:D500";

    console.log("[Google Sheets] Parámetros:", {
      spreadsheetId,
      range,
      serviceAccount: credentials.client_email,
    });

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
    console.log(`[Google Sheets] Solicitando rango: ${range}`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log(`[Google Sheets] ✓ Datos recibidos: ${rows.length} filas`);

    // 6. Procesar filas
    const guests = {};
    let processedCount = 0;
    let skippedCount = 0;

    rows.forEach((row) => {
      // row[0] = Nº, row[1] = Quién, row[2] = Relación, row[3] = Detalle
      if (row[1] && row[1].trim()) {
        const nombre = row[1].trim();
        const slug = slugify(nombre);
        const relacion = row[2]?.trim() || "";
        const detalle = row[3]?.trim() || "";
        const esPareja = isPareja(relacion, detalle);

        guests[slug] = {
          id: slug,
          nombres: nombre,
          esPareja,
          relacion,
          detalle,
        };

        processedCount++;
      } else {
        skippedCount++;
      }
    });

    console.log(
      `[Google Sheets] ✓ Procesados: ${processedCount} invitados, ${skippedCount} filas vacías`
    );
    console.log(
      "[Google Sheets] IDs generados:",
      Object.keys(guests).slice(0, 5).join(", ") +
        (Object.keys(guests).length > 5 ? "..." : "")
    );

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
