"use client";

import GuestProvider from "./GuestProvider";
import InvitationPage from "./InvitationPage";

/**
 * Puente entre la página (servidor) y el árbol interactivo (cliente).
 * Recibe el invitado ya resuelto en el servidor y lo inyecta en el contexto.
 */
export default function HomeClient({ invitadoInicial, slug }) {
  return (
    <GuestProvider invitadoInicial={invitadoInicial} slug={slug}>
      <InvitationPage />
    </GuestProvider>
  );
}
