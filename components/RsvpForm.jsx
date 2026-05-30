"use client";

import { useState } from "react";
import { submitRsvp } from "@/lib/guests";

/* Grupo tipo "radio" elegante (dos opciones) */
function Opciones({ value, onChange, opciones }) {
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
            className={`px-6 py-2.5 text-sm tracking-wide transition-colors ${
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

/* Interruptor (switch) minimalista */
function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-champagne" : "bg-linea"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className="text-sm text-carbon">{label}</span>
    </button>
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
  // Estado inicial: si ya respondió, precargamos sus datos; si no, valores
  // por defecto (acompañante se pre-marca según esPareja de la invitación).
  const yaRespondio = guest?.confirmado === true;

  const [nombreCompleto, setNombreCompleto] = useState(
    guest?.nombreCompleto || guest?.nombres || ""
  );
  const [asiste, setAsiste] = useState(yaRespondio ? guest.asiste : null);
  const [acompanante, setAcompanante] = useState(
    yaRespondio ? Boolean(guest.acompanante) : Boolean(guest?.esPareja)
  );
  const [nombreAcompanante, setNombreAcompanante] = useState(
    guest?.nombreAcompanante || ""
  );
  const [autobus, setAutobus] = useState(Boolean(guest?.autobus));
  const [ninos, setNinos] = useState(guest?.ninos ?? 0);
  const [alergias, setAlergias] = useState(guest?.alergias ?? "");

  const [estado, setEstado] = useState("idle"); // idle | enviando | ok | error

  // Al desmarcar acompañante, limpiamos el nombre.
  function toggleAcompanante(v) {
    setAcompanante(v);
    if (!v) setNombreAcompanante("");
  }

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

  // Validación: nombre obligatorio; asistencia elegida; nombre de acompañante
  // si va a venir acompañado.
  const valido =
    nombreCompleto.trim() !== "" &&
    asiste !== null &&
    (!(asiste && acompanante) || nombreAcompanante.trim() !== "");

  async function onSubmit(e) {
    e.preventDefault();
    if (!valido) return;
    setEstado("enviando");
    try {
      await submitRsvp(guest.id, {
        nombreCompleto,
        asiste,
        acompanante: asiste ? acompanante : false,
        nombreAcompanante,
        autobus: asiste ? autobus : false,
        ninos: asiste ? ninos : 0,
        alergias: asiste ? alergias : "",
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
            ? "Hemos recibido tu confirmación. Nos hace muchísima ilusión compartir este día contigo."
            : "Sentimos que no puedas acompañarnos. Gracias de corazón por hacérnoslo saber."}
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
        Rogamos confirmes tu asistencia.
      </p>

      <div className="mt-10 space-y-8">
        <Campo etiqueta="Nombre completo">
          <input
            type="text"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            required
            placeholder="Tu nombre y apellidos"
            className="w-full rounded-sm border border-linea bg-crema px-4 py-3 text-sm text-carbon outline-none transition-colors placeholder:text-grafito/60 focus:border-champagne"
          />
        </Campo>

        <Campo etiqueta="¿Podrás asistir?">
          <Opciones
            value={asiste}
            onChange={setAsiste}
            opciones={[
              { v: true, label: "Sí, confirmo" },
              { v: false, label: "No puedo ir" },
            ]}
          />
        </Campo>

        {/* El resto solo tiene sentido si asiste */}
        {asiste && (
          <>
            <Campo etiqueta="Acompañante">
              <Switch
                checked={acompanante}
                onChange={toggleAcompanante}
                label="Voy con acompañante"
              />
              {/* Subformulario condicional: aparece/desaparece con animación */}
              <div
                className={`grid transition-all duration-300 ${
                  acompanante
                    ? "mt-1 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <input
                    type="text"
                    value={nombreAcompanante}
                    onChange={(e) => setNombreAcompanante(e.target.value)}
                    placeholder="Nombre completo del acompañante"
                    className="w-full rounded-sm border border-linea bg-crema px-4 py-3 text-sm text-carbon outline-none transition-colors placeholder:text-grafito/60 focus:border-champagne"
                  />
                </div>
              </div>
            </Campo>

            <Campo etiqueta="Transporte">
              <Switch
                checked={autobus}
                onChange={setAutobus}
                label="Necesito plaza en el autobús"
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

            <Campo etiqueta="Alergias o intolerancias">
              <textarea
                value={alergias}
                onChange={(e) => setAlergias(e.target.value)}
                rows={3}
                placeholder="Indícanos cualquier alergia o intolerancia alimentaria"
                className="w-full resize-none rounded-sm border border-linea bg-crema px-4 py-3 text-sm text-carbon outline-none transition-colors placeholder:text-grafito/60 focus:border-champagne"
              />
            </Campo>
          </>
        )}
      </div>

      <div className="mt-12 text-center">
        <button
          type="submit"
          disabled={!valido || estado === "enviando"}
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
