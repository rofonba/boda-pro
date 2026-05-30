"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { getAuthClient } from "@/lib/firebase";
import { subscribeGuests } from "@/lib/guests";

/* nº de adultos de una invitación: el principal + acompañante (si viene).
   Los niños se cuentan aparte en `ninos`. */
const adultosDe = (g) => 1 + (g.acompanante ? 1 : 0);

/* Nombre a mostrar del invitado principal */
const principalDe = (g) => g.nombreCompleto || g.nombres || "";

function Tarjeta({ valor, etiqueta }) {
  return (
    <div className="border border-linea bg-crema px-6 py-7 text-center">
      <div className="font-serif text-4xl text-carbon">{valor}</div>
      <div className="mt-2 text-[11px] tracking-luxe text-grafito uppercase">
        {etiqueta}
      </div>
    </div>
  );
}

function Estado({ g }) {
  if (g.confirmado === true && g.asiste === true)
    return <span className="text-emerald-700">Asiste</span>;
  if (g.confirmado === true && g.asiste === false)
    return <span className="text-red-700">No asiste</span>;
  return <span className="text-grafito">Pendiente</span>;
}

/* Escapa un valor para CSV (comillas, separador, saltos de línea) */
function csvEscape(v) {
  const s = String(v ?? "");
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function Dashboard({ user }) {
  const [guests, setGuests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeGuests(
      (lista) => setGuests(lista),
      (err) => {
        console.error(err);
        setError(
          "No se pudieron cargar los invitados. Revisa las reglas de Firestore."
        );
      }
    );
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const asisten = guests.filter((g) => g.confirmado && g.asiste);
    return {
      total: guests.length,
      respondidos: guests.filter((g) => g.confirmado).length,
      pendientes: guests.filter((g) => !g.confirmado).length,
      adultos: asisten.reduce((acc, g) => acc + adultosDe(g), 0),
      ninos: asisten.reduce((acc, g) => acc + (Number(g.ninos) || 0), 0),
      autobus: asisten
        .filter((g) => g.autobus)
        .reduce((acc, g) => acc + adultosDe(g) + (Number(g.ninos) || 0), 0),
    };
  }, [guests]);

  // Descarga un .csv (compatible con Excel) con los invitados que han respondido.
  function exportarCSV() {
    const confirmados = guests.filter((g) => g.confirmado === true);

    const columnas = [
      "Invitado Principal",
      "Asistencia",
      "Acompañante",
      "Autobús",
      "Niños",
      "Alergias",
    ];

    const filas = confirmados.map((g) => [
      principalDe(g),
      g.asiste ? "Sí" : "No",
      g.acompanante ? g.nombreAcompanante || "Sí" : "No",
      g.asiste && g.autobus ? "Sí" : "No",
      g.asiste ? Number(g.ninos) || 0 : 0,
      g.asiste ? g.alergias || "" : "",
    ]);

    // BOM (﻿) + separador ';' → Excel en español lo abre en columnas.
    const lineas = [columnas, ...filas].map((fila) =>
      fila.map(csvEscape).join(";")
    );
    const csv = "﻿" + lineas.join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "confirmaciones-boda-RyC.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-carbon">Confirmaciones</h1>
          <p className="mt-1 text-xs text-grafito">{user?.email}</p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={exportarCSV}
            className="bg-carbon px-6 py-3 text-[11px] tracking-luxe text-marfil uppercase transition-opacity hover:opacity-90"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => signOut(getAuthClient())}
            className="text-[11px] tracking-luxe text-grafito uppercase underline decoration-champagne/50 underline-offset-4 hover:text-carbon"
          >
            Salir
          </button>
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-700">{error}</p>}

      {/* Contadores en tiempo real */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Tarjeta valor={stats.adultos} etiqueta="Adultos confirmados" />
        <Tarjeta valor={stats.ninos} etiqueta="Niños (-13 años)" />
        <Tarjeta valor={stats.autobus} etiqueta="Personas en autobús" />
        <Tarjeta valor={stats.respondidos} etiqueta="Han respondido" />
        <Tarjeta valor={stats.pendientes} etiqueta="Pendientes" />
        <Tarjeta valor={stats.total} etiqueta="Invitaciones" />
      </div>

      {/* Tabla */}
      <div className="mt-12 overflow-x-auto border border-linea bg-crema">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-linea text-[10px] tracking-luxe text-grafito uppercase">
              <th className="px-4 py-4 font-medium">Invitado principal</th>
              <th className="px-4 py-4 font-medium">Estado</th>
              <th className="px-4 py-4 font-medium">Acompañante</th>
              <th className="px-4 py-4 text-center font-medium">Autobús</th>
              <th className="px-4 py-4 text-center font-medium">Niños</th>
              <th className="px-4 py-4 font-medium">Alergias</th>
            </tr>
          </thead>
          <tbody>
            {guests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-grafito">
                  Aún no hay invitados en Firestore.
                </td>
              </tr>
            )}
            {guests.map((g) => (
              <tr
                key={g.id}
                className="border-b border-linea/60 last:border-0 text-carbon"
              >
                <td className="px-4 py-4 font-serif">{principalDe(g)}</td>
                <td className="px-4 py-4">
                  <Estado g={g} />
                </td>
                <td className="px-4 py-4 text-grafito">
                  {g.confirmado && g.asiste && g.acompanante
                    ? g.nombreAcompanante || "Sí"
                    : "—"}
                </td>
                <td className="px-4 py-4 text-center">
                  {g.confirmado && g.asiste && g.autobus ? "Sí" : "—"}
                </td>
                <td className="px-4 py-4 text-center">
                  {g.confirmado && g.asiste ? Number(g.ninos) || 0 : "—"}
                </td>
                <td className="px-4 py-4 text-grafito">{g.alergias || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
