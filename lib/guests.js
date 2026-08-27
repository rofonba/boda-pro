// Lectura en tiempo real de los invitados desde el NAVEGADOR.
//
// Solo la usa /backstage, que muestra el resumen actualizándose en vivo. El
// resto de la app lee en el servidor con lib/invitados.js, que es más rápido.
//
// El esquema es el mismo que documenta lib/invitados.js.

import { collection, onSnapshot } from "firebase/firestore";
// Importante: la constante viene de lib/constantes.js y NO de lib/firebase.js.
// Ese último carga el Admin SDK (fs, path) y meterlo aquí rompería el build del
// cliente, que es exactamente lo que ocurría antes.
import { ASISTENCIA_PENDIENTE, COLECCION_INVITADOS } from "./constantes";
import { getDbClient } from "./firebaseClient";

/**
 * Se suscribe a la colección de invitados y avisa en cada cambio.
 *
 * Normaliza igual que lib/invitados.js para que las vistas reciban siempre la
 * misma forma de objeto, vengan los datos del servidor o de aquí.
 *
 * @param {(invitados: object[]) => void} alRecibir
 * @param {(error: Error) => void} [alFallar]
 * @returns {() => void} función para cancelar la suscripción
 */
export function subscribeGuests(alRecibir, alFallar) {
  const ref = collection(getDbClient(), COLECCION_INVITADOS);

  return onSnapshot(
    ref,
    (snap) => {
      const invitados = snap.docs
        .map((doc) => {
          const d = doc.data() ?? {};
          return {
            id: doc.id,
            nombre: d.nombre ?? "",
            numero: typeof d.numero === "number" ? d.numero : null,
            asistencia: d.asistencia ?? ASISTENCIA_PENDIENTE,
            autobus: d.autobus === true,
            alergia: d.alergia ?? "",
            cancion: d.cancion ?? "",
          };
        })
        .sort(
          (a, b) =>
            (a.numero ?? Number.MAX_SAFE_INTEGER) - (b.numero ?? Number.MAX_SAFE_INTEGER)
        );

      alRecibir(invitados);
    },
    alFallar
  );
}
