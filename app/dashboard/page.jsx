// Cuadro de mando de la boda — /dashboard
//
// Sin contraseña ni login: se entra y se ve. Es un Server Component, así que
// lee Firestore directamente en el servidor y le pasa la lista completa al
// cuadro de mando (cliente), que busca y filtra en memoria: no hay petición
// extra desde el navegador ni estado de "cargando".

import CuadroDeMando from "@/components/dashboard/CuadroDeMando";
import { listarInvitados } from "@/lib/invitados";

// Siempre datos frescos: el resumen debe reflejar la última respuesta recibida.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cuadro de mando · Roberto & Cristina",
  // No queremos que Google indexe el resumen de la boda.
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const invitados = await listarInvitados();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header className="text-center">
        <h1 className="font-serif text-3xl text-carbon">Cuadro de mando</h1>
        <p className="mt-2 text-[11px] tracking-luxe text-grafito uppercase">
          Roberto &amp; Cristina · 15 · 05 · 2027
        </p>
      </header>

      <div className="mt-16">
        <CuadroDeMando invitados={invitados} />
      </div>

      <footer className="mt-20 text-center text-xs text-grafito">
        {invitados.length} invitaciones ·{" "}
        {invitados.reduce((n, g) => n + g.miembros.length, 0)} personas · recarga para
        actualizar
      </footer>
    </main>
  );
}
