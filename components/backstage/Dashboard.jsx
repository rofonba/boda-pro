"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { getAuthClient } from "@/lib/firebaseClient";
import { subscribeGuests } from "@/lib/guests";
import ResumenBoda from "@/components/dashboard/ResumenBoda";

/**
 * Panel privado con sesión — /backstage
 *
 * Muestra el mismo resumen que /dashboard (mismo componente, mismo cálculo),
 * pero actualizándose en tiempo real y con la tabla completa de invitados y la
 * exportación a CSV.
 */
export default function Dashboard({ user }) {
  const [invitados, setInvitados] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return subscribeGuests(setInvitados, (e) => setError(e.message));
  }, []);

  const csv = useMemo(() => {
    if (!invitados) return "";

    const escapar = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const cabecera = ["Nº", "Nombre", "Enlace", "Asistencia", "Autobús", "Alergia", "Canción"];

    const filas = invitados.map((g) => [
      g.numero ?? "",
      g.nombre,
      `/?id=${g.id}`,
      g.asistencia,
      g.autobus ? "Sí" : "No",
      g.alergia,
      g.cancion,
    ]);

    return [cabecera, ...filas].map((f) => f.map(escapar).join(",")).join("\n");
  }, [invitados]);

  const descargarCsv = () => {
    // BOM al principio para que Excel abra los acentos correctamente.
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invitados-boda.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-carbon">Backstage</h1>
          {user?.email && <p className="mt-1 text-xs text-grafito">{user.email}</p>}
        </div>
        <button
          type="button"
          onClick={() => signOut(getAuthClient())}
          className="text-sm text-grafito underline hover:text-carbon"
        >
          Cerrar sesión
        </button>
      </header>

      {error && (
        <p
          role="alert"
          className="mt-8 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          No se pudo leer la lista de invitados: {error}
        </p>
      )}

      {invitados === null && !error ? (
        <p className="mt-16 text-center font-serif italic text-grafito">Cargando…</p>
      ) : (
        invitados && (
          <>
            <div className="mt-16">
              <ResumenBoda invitados={invitados} />
            </div>

            <section className="mt-16">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="text-[11px] tracking-luxe text-grafito uppercase">
                  Invitados ({invitados.length})
                </h2>
                <button
                  type="button"
                  onClick={descargarCsv}
                  className="rounded-full border border-champagne px-4 py-2 text-[11px] tracking-luxe text-champagne uppercase transition-colors hover:bg-champagne/15"
                >
                  Descargar CSV
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[44rem] text-left text-sm">
                  <thead className="border-b border-linea text-[11px] tracking-luxe text-grafito uppercase">
                    <tr>
                      <th className="py-3 pr-4">Nº</th>
                      <th className="py-3 pr-4">Nombre</th>
                      <th className="py-3 pr-4">Enlace</th>
                      <th className="py-3 pr-4">Asistencia</th>
                      <th className="py-3 pr-4">Autobús</th>
                      <th className="py-3 pr-4">Alergia</th>
                      <th className="py-3">Canción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linea">
                    {invitados.map((g) => (
                      <tr key={g.id}>
                        <td className="py-3 pr-4 text-grafito">{g.numero ?? "—"}</td>
                        <td className="py-3 pr-4 text-carbon">{g.nombre}</td>
                        <td className="py-3 pr-4">
                          <a
                            href={`/?id=${g.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-champagne underline"
                          >
                            /?id={g.id}
                          </a>
                        </td>
                        <td className="py-3 pr-4 text-carbon">{g.asistencia}</td>
                        <td className="py-3 pr-4 text-grafito">{g.autobus ? "Sí" : "—"}</td>
                        <td className="py-3 pr-4 text-grafito">{g.alergia || "—"}</td>
                        <td className="py-3 text-grafito">{g.cancion || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )
      )}
    </main>
  );
}
