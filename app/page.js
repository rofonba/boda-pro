// Invitación — /?id=virginia-agudo
//
// El invitado se lee en el SERVIDOR a partir del ?id= de la URL, así que su
// nombre ya viaja en el primer HTML: el saludo se ve al instante, sin spinner
// ni una segunda petición desde el navegador.

import HomeClient from "@/components/HomeClient";
import { obtenerInvitado } from "@/lib/invitados";

// La página depende del ?id=, así que se renderiza por petición.
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  const { id } = await searchParams;
  const slug = Array.isArray(id) ? id[0] : id;

  // Si Firestore no responde, la invitación se sigue mostrando (sin
  // personalizar) en lugar de caerse: la web de la boda nunca debe dar error.
  let invitado = null;
  try {
    invitado = await obtenerInvitado(slug);
  } catch (error) {
    console.error("[/] No se pudo leer el invitado:", error);
  }

  return <HomeClient invitadoInicial={invitado} slug={slug ?? null} />;
}
