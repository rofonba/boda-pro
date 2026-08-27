"use client";

import { useState } from "react";
import { useGuest } from "./GuestProvider";

const CLASES_CAMPO =
  "mt-3 w-full rounded-lg border border-linea bg-crema px-4 py-3 text-carbon " +
  "placeholder-grafito/50 transition-all duration-300 focus:border-champagne " +
  "focus:outline-none focus:ring-2 focus:ring-champagne/20";

/** Par de botones Sí / No, en lugar de radios sueltos: más claro en móvil. */
function Eleccion({ etiqueta, valor, onChange, opciones }) {
  return (
    <fieldset>
      <legend className="font-serif text-lg text-carbon">{etiqueta}</legend>
      <div className="mt-4 flex gap-3">
        {opciones.map((op) => {
          const activo = valor === op.valor;
          return (
            <button
              key={String(op.valor)}
              type="button"
              onClick={() => onChange(op.valor)}
              aria-pressed={activo}
              className={
                "flex-1 rounded-lg border px-4 py-3 transition-all duration-300 " +
                (activo
                  ? "border-champagne bg-champagne/20 text-champagne"
                  : "border-linea text-grafito hover:border-champagne/50")
              }
            >
              {op.texto}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function RsvpFormComplete() {
  const { invitado, sinEnlace, guardarRespuesta } = useGuest();

  // El formulario arranca con lo que el invitado ya hubiera contestado, así
  // puede volver a la web y editar su respuesta sin empezar de cero.
  const [asistencia, setAsistencia] = useState(invitado?.asistencia ?? "Pendiente");
  const [autobus, setAutobus] = useState(invitado?.autobus ?? null);
  const [alergia, setAlergia] = useState(invitado?.alergia ?? "");
  const [cancion, setCancion] = useState(invitado?.cancion ?? "");

  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  // Sin invitación identificada no hay a quién guardar la respuesta.
  if (!invitado) {
    return (
      <section id="rsvp" className="py-20 text-center">
        <h2 className="font-serif text-3xl text-carbon">Confirmación de asistencia</h2>
        <p className="mx-auto mt-6 max-w-xl text-grafito">
          {sinEnlace
            ? "Para confirmar tu asistencia, entra desde el enlace personal que te enviamos."
            : "No hemos podido identificar tu invitación. Escríbenos y te reenviamos tu enlace."}
        </p>
      </section>
    );
  }

  const enviar = async (e) => {
    e.preventDefault();
    setError("");

    if (asistencia === "Pendiente") {
      setError("Dinos si podrás acompañarnos.");
      return;
    }

    setGuardando(true);
    try {
      await guardarRespuesta({
        asistencia,
        // Si no asiste, el autobús no aplica.
        autobus: asistencia === "Sí" ? autobus === true : false,
        alergia,
        cancion,
      });
      setGuardado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (guardado) {
    return (
      <section id="rsvp" className="py-20 text-center">
        <div className="mx-auto max-w-2xl rounded-lg border border-champagne/50 bg-crema/40 px-6 py-12">
          <h3 className="font-serif text-2xl text-carbon">
            {asistencia === "Sí" ? "¡Gracias por confirmar!" : "Gracias por avisarnos"}
          </h3>
          <p className="mt-4 text-grafito">
            {asistencia === "Sí"
              ? "Te esperamos el 15 de mayo de 2027."
              : "Sentimos que no puedas venir. Te echaremos de menos."}
          </p>
          <button
            type="button"
            onClick={() => setGuardado(false)}
            className="mt-6 text-champagne underline hover:text-carbon"
          >
            Editar mi respuesta
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center font-serif text-3xl text-carbon">
          Confirmación de asistencia
        </h2>

        <form onSubmit={enviar} className="mt-12 space-y-10">
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <Eleccion
            etiqueta="¿Nos acompañarás?"
            valor={asistencia}
            onChange={setAsistencia}
            opciones={[
              { valor: "Sí", texto: "Sí, allí estaré" },
              { valor: "No", texto: "No podré ir" },
            ]}
          />

          {asistencia === "Sí" && (
            <Eleccion
              etiqueta="¿Necesitas plaza en el autobús?"
              valor={autobus}
              onChange={setAutobus}
              opciones={[
                { valor: true, texto: "Sí, resérvame" },
                { valor: false, texto: "No, gracias" },
              ]}
            />
          )}

          <div>
            <label htmlFor="alergia" className="block font-serif text-lg text-carbon">
              Alergias o intolerancias
            </label>
            <textarea
              id="alergia"
              rows={3}
              maxLength={500}
              value={alergia}
              onChange={(e) => setAlergia(e.target.value)}
              placeholder="Cuéntanos si hay algo que debamos tener en cuenta"
              className={CLASES_CAMPO}
            />
          </div>

          <div>
            <label htmlFor="cancion" className="block font-serif text-lg text-carbon">
              Una canción que no puede faltar
            </label>
            <textarea
              id="cancion"
              rows={2}
              maxLength={500}
              value={cancion}
              onChange={(e) => setCancion(e.target.value)}
              placeholder="La que te haría salir a la pista"
              className={CLASES_CAMPO}
            />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full rounded-lg border border-champagne bg-champagne/20 px-6 py-4 font-serif text-lg text-champagne transition-all duration-300 hover:bg-champagne/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Enviar respuesta"}
          </button>

          <p className="text-center text-xs text-grafito">
            Podrás cambiar tu respuesta cuando quieras desde este mismo enlace.
          </p>
        </form>
      </div>
    </section>
  );
}
