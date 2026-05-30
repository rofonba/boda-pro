// Acceso a la colección "invitados" de Firestore.
//
// ─────────────────────────────────────────────────────────────────────────
//  ESQUEMA — colección `invitados`
//  El ID del documento ES el id de la URL (ej: invitados/pareja-01  →  ?id=pareja-01)
// ─────────────────────────────────────────────────────────────────────────
//  {
//    id:         string   // mismo valor que el ID del documento (para la URL)
//    nombres:    string   // "Pablo y María"  |  "Carlos"
//    esPareja:   boolean   // true si la invitación es para dos personas
//    confirmado: boolean | null  // null = aún no ha respondido
//    asiste:     boolean   // true = asistirá, false = no asistirá
//    autobus:    boolean   // necesita autobús
//    alergias:   string    // alergias / intolerancias (texto libre)
//    ninos:      number     // nº de niños menores de 13 años
//
//    // Campos opcionales útiles para el panel:
//    respondidoEn: Timestamp | null  // cuándo respondió
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
 * payload: { asiste, autobus, alergias, ninos }
 */
export async function submitRsvp(id, payload) {
  const ref = doc(db, COLECCION, id);
  await updateDoc(ref, {
    confirmado: true,
    asiste: Boolean(payload.asiste),
    autobus: Boolean(payload.autobus),
    alergias: payload.alergias ?? "",
    ninos: Number(payload.ninos) || 0,
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
