"use client";

import { useState } from "react";
import GuestProvider from "./GuestProvider";
import InvitacionCompacta from "./InvitacionCompacta";
import InvitationPage from "./InvitationPage";

/**
 * Puente entre la página (servidor) y el árbol interactivo (cliente).
 * Recibe el invitado ya resuelto en el servidor y lo inyecta en el contexto.
 *
 * Dos vistas sobre la misma URL (el ?id= se conserva, así que recargar
 * vuelve a la invitación):
 *
 *  • "invitacion": quien entra por su enlace personal ve solo lo esencial
 *    (saludo, formulario, fecha y lugares) y un botón para ver el resto.
 *  • "web": la página completa. Es la vista por defecto si no hay enlace
 *    personal, y también si el ?id= no corresponde a ninguna invitación: en
 *    ese caso la web completa explica el problema y no deja al visitante
 *    ante un formulario que no puede rellenar.
 */
export default function HomeClient({ invitadoInicial, slug }) {
  const [modo, setModo] = useState(invitadoInicial ? "invitacion" : "web");

  const verTodo = () => {
    setModo("web");
    // La web completa empieza por la portada: se vuelve arriba del todo.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <GuestProvider invitadoInicial={invitadoInicial} slug={slug}>
      {modo === "invitacion" ? <InvitacionCompacta onVerTodo={verTodo} /> : <InvitationPage />}
    </GuestProvider>
  );
}
