// Integración con Google Sheets API
// Los datos se cachean en memoria para minimizar llamadas a la API
// Formato esperado: Columna A = Nº, B = Quién, C = Relación, D = Detalle

let GUESTS_CACHE = null;
let CACHE_TIMESTAMP = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Convertir nombre a slug (Juan Pérez -> juan-perez)
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD") // Descomponer caracteres acentuados
    .replace(/[̀-ͯ]/g, "") // Quitar acentos
    .trim()
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/[^\w-]/g, "") // Quitar caracteres especiales
    .replace(/-+/g, "-"); // Guiones múltiples a uno
}

/**
 * Detectar si es pareja basándose en Relación o Detalle
 */
function isPareja(relacion = "", detalle = "") {
  const text = `${relacion} ${detalle}`.toLowerCase();
  const pairingKeywords = ["&", "y", "pareja", "familia", "acompañante", "+"];
  return pairingKeywords.some((keyword) => text.includes(keyword));
}

/**
 * Obtener credenciales de Google desde variables de entorno
 */
function getGoogleCredentials() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!credentials) {
    throw new Error(
      "GOOGLE_SHEETS_CREDENTIALS no está configurado en variables de entorno"
    );
  }
  return JSON.parse(credentials);
}

/**
 * Leer invitados del Google Sheet
 * Rango: Columna A = Nº, B = Quién, C = Relación, D = Detalle
 */
async function fetchGuestsFromSheet() {
  const { google } = require("googleapis");
  const credentials = getGoogleCredentials();
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const range = "Invitados!A2:D500"; // Rango de invitados (omite encabezado)

  if (!sheetId) {
    throw new Error("GOOGLE_SHEETS_ID no está configurado");
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = response.data.values || [];
    const guests = {};

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
      }
    });

    return guests;
  } catch (error) {
    console.error("Error leyendo Google Sheets:", error);
    throw new Error("No se pudo conectar a Google Sheets");
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
    return GUESTS_CACHE;
  }

  // Fetch nuevos datos
  const guests = await fetchGuestsFromSheet();
  GUESTS_CACHE = guests;
  CACHE_TIMESTAMP = now;

  return guests;
}

/**
 * Validar si un invitado existe en el Google Sheet
 */
export async function validateGuestId(guestId) {
  const guests = await getGuestsFromSheet();
  return guests[guestId.toLowerCase()] || null;
}

/**
 * Obtener todos los invitados (para admin)
 */
export async function getAllGuestsFromSheet() {
  const guests = await getGuestsFromSheet();
  return Object.values(guests);
}
