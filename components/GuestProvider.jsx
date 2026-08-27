"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Contexto del invitado.
 *
 * No hace ninguna petición al montarse: el invitado llega ya resuelto desde el
 * servidor (ver app/page.js), así que el saludo se pinta en el primer render.
 * La única llamada a red que ocurre es el PATCH al guardar la respuesta.
 */
const GuestContext = createContext(null);

export function useGuest() {
  const contexto = useContext(GuestContext);
  if (!contexto) {
    throw new Error("useGuest debe usarse dentro de <GuestProvider>");
  }
  return contexto;
}

export default function GuestProvider({ children, invitadoInicial = null, slug = null }) {
  const [invitado, setInvitado] = useState(invitadoInicial);

  /**
   * Guarda la respuesta del invitado.
   * Solo envía los cuatro campos que le pertenecen; el nombre y el número los
   * protege la API, que no los admite.
   *
   * @param {{asistencia?: string, autobus?: boolean, alergia?: string, cancion?: string}} respuesta
   */
  const guardarRespuesta = useCallback(
    async (respuesta) => {
      if (!invitado) {
        throw new Error("No hay invitación que actualizar.");
      }

      const res = await fetch(`/api/guests?id=${encodeURIComponent(invitado.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuesta),
      });

      const datos = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(datos.error ?? "No se pudo guardar la respuesta.");
      }

      setInvitado(datos.invitado);
      return datos.invitado;
    },
    [invitado]
  );

  const valor = useMemo(
    () => ({
      invitado,
      // Se pidió invitación concreta pero el slug no existe en la lista.
      invitacionNoEncontrada: Boolean(slug) && invitado === null,
      // Se entró a la web sin enlace personalizado.
      sinEnlace: !slug,
      guardarRespuesta,
    }),
    [invitado, slug, guardarRespuesta]
  );

  return <GuestContext.Provider value={valor}>{children}</GuestContext.Provider>;
}
