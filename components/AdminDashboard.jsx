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
    // Refresh automático cada 30 segundos
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [password]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log("[Admin Dashboard] Cargando estadísticas...");

      // Obtener estadísticas
      const statsResponse = await fetch(
        `/api/admin/stats?password=${encodeURIComponent(password)}`
      );

      if (!statsResponse.ok) {
        console.error("[Admin Dashboard] Error en stats API:", statsResponse.status);
        throw new Error("No autorizado - " + statsResponse.status);
      }

      const statsData = await statsResponse.json();
      console.log("[Admin Dashboard] Estadísticas cargadas:", statsData);
      setStats(statsData);

      // Obtener lista de invitados
      const guestsResponse = await fetch(
        `/api/admin/guests?password=${encodeURIComponent(password)}`
      );

      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();
        console.log("[Admin Dashboard] Invitados cargados:", guestsData.count);
        setGuests(guestsData.guests || []);
      } else {
        console.warn("[Admin Dashboard] No se pudo obtener lista de invitados:", guestsResponse.status);
      }

      setError("");
    } catch (err) {
      console.error("[Admin Dashboard] Error:", err);
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

      {/* ESTADÍSTICAS - MÉTRICAS PRINCIPALES */}
      <section className="mb-12">
        <h2 className="text-center font-serif text-2xl text-carbon mb-6">Métricas de Invitados</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {/* Total Invitados */}
          <div className="rounded-lg border border-linea bg-marfil/50 p-6">
            <p className="text-xs uppercase text-champagne font-semibold">Total</p>
            <p className="mt-3 text-3xl font-bold text-carbon">
              {stats?.stats.total || 0}
            </p>
            <p className="mt-2 text-[10px] text-grafito">invitados</p>
          </div>

          {/* Confirmados */}
          <div className="rounded-lg border-2 border-champagne bg-champagne/10 p-6">
            <p className="text-xs uppercase text-champagne font-semibold">Confirmados</p>
            <p className="mt-3 text-3xl font-bold text-carbon">
              {stats?.stats.confirmados || 0}
            </p>
            <p className="mt-2 text-[10px] text-grafito">
              {((stats?.stats.confirmados || 0) / (stats?.stats.total || 1) * 100).toFixed(0)}%
            </p>
          </div>

          {/* Rechazados */}
          <div className="rounded-lg border border-linea bg-marfil/50 p-6">
            <p className="text-xs uppercase text-grafito font-semibold">Rechazados</p>
            <p className="mt-3 text-3xl font-bold text-carbon">
              {stats?.stats.rechazados || 0}
            </p>
            <p className="mt-2 text-[10px] text-grafito">
              {((stats?.stats.rechazados || 0) / (stats?.stats.total || 1) * 100).toFixed(0)}%
            </p>
          </div>

          {/* Pendientes */}
          <div className="rounded-lg border border-linea bg-marfil/50 p-6">
            <p className="text-xs uppercase text-carbon font-semibold">Pendientes</p>
            <p className="mt-3 text-3xl font-bold text-carbon">
              {stats?.stats.sinConfirmar || 0}
            </p>
            <p className="mt-2 text-[10px] text-grafito">
              {((stats?.stats.sinConfirmar || 0) / (stats?.stats.total || 1) * 100).toFixed(0)}%
            </p>
          </div>

          {/* Con Autobús */}
          <div className="rounded-lg border border-linea bg-marfil/50 p-6">
            <p className="text-xs uppercase text-champagne font-semibold">🚌 Autobús</p>
            <p className="mt-3 text-3xl font-bold text-carbon">
              {stats?.stats.conBus || 0}
            </p>
            <p className="mt-2 text-[10px] text-grafito">
              {((stats?.stats.conBus || 0) / (stats?.stats.confirmados || 1) * 100).toFixed(0)}% confirmados
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="rounded-lg bg-marfil/50 p-4">
          <div className="flex justify-between text-xs text-grafito mb-2">
            <span>Progreso de Confirmación</span>
            <span className="font-semibold">
              {((stats?.stats.confirmados || 0) / (stats?.stats.total || 1) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-marfil rounded-full overflow-hidden">
            <div
              className="h-full bg-champagne transition-all duration-500"
              style={{
                width: `${((stats?.stats.confirmados || 0) / (stats?.stats.total || 1) * 100).toFixed(1)}%`,
              }}
            />
          </div>
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
