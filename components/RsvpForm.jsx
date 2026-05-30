"use client";

import { useState } from "react";
import { submitRsvp } from "@/lib/guests";

/* Botón de opción Sí / No, elegante y táctil para móvil */
function Toggle({ value, onChange, name }) {
  const opciones = [
    { v: true, label: "Sí" },
    { v: false, label: "No" },
  ];
  return (
    <div className="inline-flex overflow-hidden rounded-full ring-1 ring-linea">
      {opciones.map((o) => {
        const activo = value === o.v;
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={activo}
            onClick={() => onChange(o.v)}
            className={`min-w-[88px] px-6 py-2.5 text-sm tracking-wide transition-colors ${
              activo
                ? "bg-carbon text-marfil"
                : "bg-transparent text-grafito hover:text-carbon"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Campo({ etiqueta, children }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] tracking-luxe text-grafito uppercase">
        {etiqueta}
      </span>
      {children}
    </div>
  );
}

export default function RsvpForm({ guest }) {
  const pareja = Boolean(guest?.esPareja);

  const [asiste, setAsiste] = useState(
    typeof guest?.asiste === "boolean" && guest?.confirmado ? guest.asiste : null
  );
  const [autobus, setAutobus] = useState(
    typeof guest?.autobus === "boolean" ? guest.autobus : null
  );
  const [alergias, setAlergias] = useState(guest?.alergias ?? "");
  const [ninos, setNinos] = useState(guest?.ninos ?? 0);

  const [estado, setEstado] = useState("idle"); // idle | enviando | ok | error

  // Sin enlace personal no se puede confirmar (no hay documento que actualizar)
  if (!guest?.id) {
    return (
      <div className="text-center">
        <h2 className="font-serif text-3xl text-carbon">Confirmación</h2>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-grafito">
          Para confirmar tu asistencia, accede desde el enlace personal que te
          hemos hecho llegar con la invitación.
        </p>
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (asiste === null) return;
    setEstado("enviando");
    try {
      await submitRsvp(guest.id, {
        asiste,
        autobus: Boolean(autobus),
        alergias,
        ninos,
      });
      setEstado("ok");
    } catch (err) {
      console.error(err);
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div className="text-center">
        <span className="rotate-45 text-2xl text-champagne">◆</span>
        <h2 className="mt-4 font-serif text-3xl text-carbon">
          {asiste ? "¡Gracias!" : "Gracias por avisarnos"}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-grafito">
          {asiste
            ? "Hemos recibido vuestra confirmación. Nos hace muchísima ilusión compartir este día con vosotros."
            : "Sentimos que no podáis acompañarnos. Gracias de corazón por hacérnoslo saber."}
        </p>
        <button
          onClick={() => setEstado("idle")}
          className="mt-6 text-[11px] tracking-luxe text-grafito uppercase underline decoration-champagne/50 underline-offset-4 hover:text-carbon"
        >
          Modificar respuesta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md">
      <h2 className="text-center font-serif text-3xl text-carbon">
        Confirmación
      </h2>
      <p className="mt-3 text-center text-sm text-grafito">
        {pareja
          ? "Rogamos confirméis vuestra asistencia."
          : "Rogamos confirmes tu asistencia."}
      </p>

      <div className="mt-10 space-y-8">
        <Campo etiqueta={pareja ? "¿Asistiréis?" : "¿Asistirás?"}>
          <Toggle value={asiste} onChange={setAsiste} name="asiste" />
        </Campo>

        {/* El resto solo tiene sentido si asisten */}
        {asiste && (
          <>
            <Campo etiqueta="¿Necesitáis autobús?">
              <Toggle value={autobus} onChange={setAutobus} name="autobus" />
            </Campo>

            <Campo
              etiqueta={
                pareja
                  ? "Alergias o intolerancias (de ambos)"
                  : "Alergias o intolerancias"
              }
            >
              <textarea
                value={alergias}
                onChange={(e) => setAlergias(e.target.value)}
                rows={3}
                placeholder={
                  pareja
                    ? "Ej: María — sin gluten · Pablo — alérgico a frutos secos"
                    : "Indícanos si tienes alguna alergia o intolerancia"
                }
                className="w-full resize-none rounded-sm border border-linea bg-crema px-4 py-3 text-sm text-carbon outline-none transition-colors placeholder:text-grafito/60 focus:border-champagne"
              />
            </Campo>

            <Campo etiqueta="Niños menores de 13 años">
              <div className="inline-flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setNinos((n) => Math.max(0, n - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-linea text-lg text-grafito transition-colors hover:text-carbon"
                  aria-label="Quitar un niño"
                >
                  −
                </button>
                <span className="w-6 text-center font-serif text-2xl text-carbon">
                  {ninos}
                </span>
                <button
                  type="button"
                  onClick={() => setNinos((n) => Math.min(20, n + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-linea text-lg text-grafito transition-colors hover:text-carbon"
                  aria-label="Añadir un niño"
                >
                  +
                </button>
              </div>
            </Campo>
          </>
        )}
      </div>

      <div className="mt-12 text-center">
        <button
          type="submit"
          disabled={asiste === null || estado === "enviando"}
          className="min-w-[220px] bg-carbon px-10 py-4 text-[11px] tracking-luxe text-marfil uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {estado === "enviando" ? "Enviando…" : "Enviar confirmación"}
        </button>
        {estado === "error" && (
          <p className="mt-4 text-sm text-red-700">
            No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.
          </p>
        )}
      </div>
    </form>
  );
}
