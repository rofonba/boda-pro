"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard({ password }) {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Obtener estadísticas
      const statsResponse = await fetch(
        `/api/admin/stats?password=${encodeURIComponent(password)}`
      );

      if (!statsResponse.ok) {
        throw new Error("No autorizado");
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Obtener lista de invitados
      const guestsResponse = await fetch(
        `/api/admin/guests?password=${encodeURIComponent(password)}`
      );

      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();
        setGuests(guestsData.guests || []);
      }

      setError("");
    } catch (err) {
      setError("Error al cargar datos: " + err.message);
      setStats(null);
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!stats?.rsvps) return;

    const csv = [
      ["Nombre", "Asistencia", "Bus", "Alergias", "Canciones"],
      ...stats.rsvps.map((r) => [
        r.nombre_invitado || "",
        r.asistencia || "",
        r.bus || "",
        r.alergias || "",
        r.canciones || "",
      ]),
    ]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvps-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyAlergias = () => {
    if (!stats?.alergias) return;
    navigator.clipboard.writeText(stats.alergias);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyInvitationLink = (guestId, guestName) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://boda-pro.vercel.app";
    const link = `${baseUrl}/?id=${guestId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(guestId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-marfil">
        <p className="text-grafito">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-marfil">
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl text-carbon">Panel de Administración</h1>
        <p className="mt-2 text-grafito">Roberto & Cristina · Boda 2027</p>
      </div>

      {/* ESTADÍSTICAS */}
      <section className="mb-12 grid gap-6 sm:grid-cols-2">
        {/* Total Confirmados */}
        <div className="rounded-lg border border-linea bg-marfil/50 p-6">
          <p className="text-sm uppercase text-champagne">Confirmados</p>
          <p className="mt-2 text-4xl font-bold text-carbon">
            {stats?.stats.confirmados || 0}
          </p>
          <p className="mt-1 text-xs text-grafito">
            de {stats?.stats.total || 0} invitados
          </p>
        </div>

        {/* Rechazados */}
        <div className="rounded-lg border border-linea bg-marfil/50 p-6">
          <p className="text-sm uppercase text-grafito">No pueden asistir</p>
          <p className="mt-2 text-4xl font-bold text-carbon">
            {stats?.stats.rechazados || 0}
          </p>
          <p className="mt-1 text-xs text-grafito">
            {stats?.stats.sinConfirmar || 0} sin confirmar
          </p>
        </div>

        {/* Con Bus */}
        <div className="rounded-lg border border-linea bg-marfil/50 p-6">
          <p className="text-sm uppercase text-champagne">Con autobús</p>
          <p className="mt-2 text-4xl font-bold text-carbon">
            {stats?.stats.conBus || 0}
          </p>
          <p className="mt-1 text-xs text-grafito">
            {(
              ((stats?.stats.conBus || 0) / (stats?.stats.total || 1)) *
              100
            ).toFixed(0)}
            % de confirmados
          </p>
        </div>

        {/* Total Invitados */}
        <div className="rounded-lg border border-linea bg-marfil/50 p-6">
          <p className="text-sm uppercase text-champagne">Total invitados</p>
          <p className="mt-2 text-4xl font-bold text-carbon">
            {stats?.stats.total || 0}
          </p>
          <p className="mt-1 text-xs text-grafito">
            Confirmación: {(((stats?.stats.confirmados || 0) / (stats?.stats.total || 1)) * 100).toFixed(0)}%
          </p>
        </div>
      </section>

      {/* ALERGIAS */}
      <section className="mb-12 rounded-lg border border-linea bg-marfil/30 p-8">
        <h2 className="font-serif text-2xl text-carbon">Alergias y Restricciones</h2>
        {stats?.alergias ? (
          <div className="mt-6">
            <div className="rounded bg-white p-4 font-mono text-sm text-carbon">
              {stats.alergias}
            </div>
            <button
              onClick={copyAlergias}
              className="mt-4 rounded-lg bg-champagne/20 px-4 py-2 text-sm text-champagne transition-all hover:bg-champagne/30"
            >
              {copied ? "✓ Copiado" : "Copiar al portapapeles"}
            </button>
          </div>
        ) : (
          <p className="mt-4 text-grafito">No hay alergias registradas</p>
        )}
      </section>

      {/* TABLA DE INVITADOS */}
      <section className="mb-12 rounded-lg border border-linea bg-marfil/30 p-8">
        <h2 className="font-serif text-2xl text-carbon mb-6">Generador de Invitaciones</h2>
        {guests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-linea">
                  <th className="text-left px-4 py-3 font-serif text-carbon">Nombre</th>
                  <th className="text-left px-4 py-3 font-serif text-carbon">Relación</th>
                  <th className="text-left px-4 py-3 font-serif text-carbon">Enlace Invitación</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} className="border-b border-linea/50 hover:bg-marfil/50 transition-colors">
                    <td className="px-4 py-3 text-carbon">{guest.nombres}</td>
                    <td className="px-4 py-3 text-grafito">{guest.relacion || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyInvitationLink(guest.id, guest.nombres)}
                        className="inline-flex items-center gap-2 rounded px-3 py-1 text-sm text-champagne bg-champagne/10 hover:bg-champagne/20 transition-all"
                      >
                        {copiedId === guest.id ? (
                          <>
                            <span>✓ Copiado</span>
                          </>
                        ) : (
                          <>
                            <span>🔗 Copiar enlace</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-grafito">No hay invitados cargados</p>
        )}
      </section>

      {/* DESCARGA CSV */}
      <section className="flex justify-center">
        <button
          onClick={downloadCSV}
          className="rounded-lg bg-champagne/30 px-8 py-4 font-serif text-lg text-champagne transition-all hover:bg-champagne/50"
        >
          📥 Descargar RSVPs como CSV
        </button>
      </section>

      {/* LOGOUT */}
      <div className="mt-12 text-center">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-grafito underline hover:text-carbon"
        >
          Salir del panel
        </button>
      </div>
    </main>
  );
}
