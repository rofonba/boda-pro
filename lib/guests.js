// Acceso a la colección "invitados" de Firestore.
//
// ─────────────────────────────────────────────────────────────────────────
//  ESQUEMA — colección `invitados`
//  El ID del documento ES el id de la URL (ej: invitados/pareja-01  →  ?id=pareja-01)
// ─────────────────────────────────────────────────────────────────────────
//  {
//    // ── Pre-cargados por el script de importación ──
//    id:         string   // mismo valor que el ID del documento (para la URL)
//    nombres:    string   // nombre con el que personalizamos el saludo
//    esPareja:   boolean   // solo se usa para PRE-MARCAR el checkbox de acompañante
//
//    // ── Rellenados por el invitado al confirmar (RSVP) ──
//    confirmado:        boolean | null  // null = aún no ha respondido
//    nombreCompleto:    string   // nombre completo del invitado principal
//    asiste:            boolean   // true = asistirá, false = no puede ir
//    acompanante:       boolean   // ¿viene con acompañante?
//    nombreAcompanante: string   // nombre del acompañante (si acompanante=true)
//    autobus:           boolean   // necesita plaza en el autobús
//    ninos:             number    // nº de niños menores de 13 años
//    alergias:          string    // alergias / intolerancias (texto libre)
//    respondidoEn:      Timestamp | null  // cuándo respondió
//  }
// ─────────────────────────────────────────────────────────────────────────

import {
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

const COLECCION = "invitados";

/** Lee un invitado por su id (= ID del documento). Devuelve null si no existe. */
export async function getGuest(id) {
  if (!id) return null;
  const ref = doc(db, COLECCION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Guarda la respuesta del formulario de confirmación.
 * payload: { nombreCompleto, asiste, acompanante, nombreAcompanante,
 *            autobus, ninos, alergias }
 */
export async function submitRsvp(id, payload) {
  const ref = doc(db, COLECCION, id);
  const acompanante = Boolean(payload.acompanante);
  await updateDoc(ref, {
    confirmado: true,
    nombreCompleto: payload.nombreCompleto?.trim() ?? "",
    asiste: Boolean(payload.asiste),
    acompanante,
    // Si no viene con acompañante, dejamos el nombre vacío (se "limpia").
    nombreAcompanante: acompanante ? payload.nombreAcompanante?.trim() ?? "" : "",
    autobus: Boolean(payload.autobus),
    ninos: Number(payload.ninos) || 0,
    alergias: payload.alergias ?? "",
    respondidoEn: serverTimestamp(),
  });
}

/**
 * Suscripción en tiempo real a toda la colección (para el panel /backstage).
 * Devuelve la función para cancelar la suscripción.
 */
export function subscribeGuests(callback, onError) {
  const q = query(collection(db, COLECCION), orderBy("nombres"));
  return onSnapshot(
    q,
    (snap) => {
      const invitados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(invitados);
    },
    onError
  );
}
