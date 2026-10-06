// "Añadir al calendario": el evento de la boda en los dos formatos que entienden
// los calendarios (enlace de Google Calendar y archivo .ics para Apple/Outlook).

import { BODA } from "./event";

// Horas en UTC. El 15 de mayo Valencia está en horario de verano (UTC+2):
// 12:00h de la ceremonia → 10:00Z; fin de fiesta a las 00:00h → 22:00Z.
const INICIO = "20270515T100000Z";
const FIN = "20270515T220000Z";

const TITULO = `Boda de ${BODA.novios.nombres}`;
const LUGAR = `${BODA.ceremonia.lugar}, ${BODA.ceremonia.direccion}`;
const DESCRIPCION = [
  `${BODA.ceremonia.titulo}: ${BODA.ceremonia.hora} en ${BODA.ceremonia.lugar} (te recomendamos llegar a las 11:45h).`,
  `${BODA.convite.titulo}: ${BODA.convite.lugar}, ${BODA.convite.direccion}.`,
].join("\n");

/** Ruta del archivo .ics (ver app/boda.ics/route.js). */
export const URL_ICS = "/boda.ics";

/** Enlace que abre Google Calendar con el evento ya relleno. */
export const URL_GOOGLE_CALENDAR = `https://calendar.google.com/calendar/render?${new URLSearchParams({
  action: "TEMPLATE",
  text: TITULO,
  dates: `${INICIO}/${FIN}`,
  details: DESCRIPCION,
  location: LUGAR,
})}`;

/** Escapa texto según RFC 5545 (comas, punto y coma, barras y saltos de línea). */
function escaparIcs(texto) {
  return texto.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

/** Contenido del archivo .ics, con un aviso el día antes. */
export function generarIcs() {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Boda R&C//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:boda-roberto-cristina-20270515@boda-pro",
    "DTSTAMP:20261006T000000Z",
    `DTSTART:${INICIO}`,
    `DTEND:${FIN}`,
    `SUMMARY:${escaparIcs(TITULO)}`,
    `LOCATION:${escaparIcs(LUGAR)}`,
    `DESCRIPTION:${escaparIcs(DESCRIPCION)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escaparIcs(TITULO)}`,
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
