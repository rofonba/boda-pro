"use client";

import { useState } from "react";
import { useGuest } from "./GuestProvider";

const CLASES_CAMPO =
  "mt-3 w-full rounded-lg border border-linea bg-crema px-4 py-4 text-lg text-carbon " +
  "placeholder-grafito/50 transition-all duration-300 focus:border-champagne " +
  "focus:outline-none focus:ring-2 focus:ring-champagne/20";

const OPCIONES_ASISTENCIA = [
  { valor: "Sí", texto: "Sí, allí estaré" },
  { valor: "No", texto: "No podré ir" },
];

const OPCIONES_SI_NO = [
  { valor: true, texto: "Sí" },
  { valor: false, texto: "No" },
];

/** Par de botones Sí / No, en lugar de radios sueltos: más claro en móvil. */
function Eleccion({ etiqueta, valor, onChange, opciones, secundaria = false }) {
  return (
    <fieldset>
      <legend
        className={
          secundaria ? "font-serif text-lg text-carbon" : "font-serif text-xl text-carbon"
        }
      >
        {etiqueta}
      </legend>
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
                "flex-1 rounded-lg border px-4 py-4 text-lg transition-all duration-300 " +
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

/** Bloque sangrado con filete dorado para las preguntas por persona. */
function Desglose({ children }) {
  return <div className="space-y-8 border-l-2 border-champagne/40 pl-5 sm:pl-6">{children}</div>;
}

/**
 * Estado inicial del formulario a partir de lo ya guardado, para que el grupo
 * pueda volver y editar su respuesta sin empezar de cero.
 *
 *  - Si todos tienen "Sí" → la pregunta general es "Sí".
 *  - Si alguien tiene "No" → la general es "No" y se despliega el detalle.
 *  - Si nadie ha contestado → "Pendiente".
 */
function estadoInicial(invitado) {
  const { miembros } = invitado;
  const respondidos = miembros.filter((m) => m.asistencia !== "Pendiente");

  let asistencia = "Pendiente";
  if (respondidos.length === miembros.length && miembros.every((m) => m.asistencia === "Sí")) {
    asistencia = "Sí";
  } else if (respondidos.length > 0) {
    asistencia = "No";
  }

  return {
    asistencia,
    asistenciaPorMiembro: miembros.map((m) =>
      m.asistencia === "Pendiente" ? null : m.asistencia
    ),
    autobus: invitado.autobus ? true : null,
    tieneAlergias: miembros.some((m) => m.alergia) ? true : null,
    alergiaPorMiembro: miembros.map((m) => (m.alergia ? true : null)),
    textoAlergia: miembros.map((m) => m.alergia),
    cancion: invitado.cancion,
  };
}

export default function RsvpFormComplete() {
  const { invitado, sinEnlace, guardarRespuesta } = useGuest();

  const [estado, setEstado] = useState(() => (invitado ? estadoInicial(invitado) : null));
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  // Sin invitación identificada no hay a quién guardar la respuesta.
  if (!invitado) {
    return (
      <section id="asistencia" className="scroll-mt-24 py-20 text-center">
        <h2 className="font-serif text-3xl text-carbon">Confirmación de asistencia</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-grafito">
          {sinEnlace
            ? "Para confirmar tu asistencia, entra desde el enlace personal que te enviamos."
            : "No hemos podido identificar tu invitación. Escríbenos y te reenviamos tu enlace."}
        </p>
      </section>
    );
  }

  const { miembros } = invitado;
  const esGrupo = miembros.length > 1;

  // Un cambio de un campo suelto o de una posición dentro de un array.
  const cambiar = (clave, valor) => setEstado((s) => ({ ...s, [clave]: valor }));
  const cambiarEn = (clave, i, valor) =>
    setEstado((s) => ({ ...s, [clave]: s[clave].map((v, j) => (j === i ? valor : v)) }));

  // Asistencia efectiva de cada miembro según lo marcado:
  // "Sí" general → todos; "No" general → lo que diga cada uno (o "No" si va solo).
  const asistenciaFinal = miembros.map((_, i) => {
    if (estado.asistencia === "Sí") return "Sí";
    if (estado.asistencia === "No") return esGrupo ? estado.asistenciaPorMiembro[i] : "No";
    return null;
  });

  const indicesAsistentes = asistenciaFinal
    .map((a, i) => (a === "Sí" ? i : -1))
    .filter((i) => i !== -1);
  const alguienViene = indicesAsistentes.length > 0;

  const enviar = async (e) => {
    e.preventDefault();
    setError("");

    if (estado.asistencia === "Pendiente") {
      setError(esGrupo ? "Decidnos si podréis acompañarnos." : "Dinos si podrás acompañarnos.");
      return;
    }
    if (asistenciaFinal.some((a) => a === null)) {
      setError("Indicad quién podrá venir y quién no.");
      return;
    }
    if (alguienViene && estado.autobus === null) {
      setError("Decidnos si necesitáis plaza en el autobús.");
      return;
    }
    if (alguienViene && estado.tieneAlergias === null) {
      setError("Decidnos si hay alguna alergia o intolerancia.");
      return;
    }
    if (
      estado.tieneAlergias &&
      indicesAsistentes.some(
        (i) => (esGrupo ? estado.alergiaPorMiembro[i] : true) && !estado.textoAlergia[i].trim()
      )
    ) {
      setError("Contadnos cuáles son las alergias o intolerancias.");
      return;
    }

    setGuardando(true);
    try {
      await guardarRespuesta({
        miembros: miembros.map((_, i) => {
          const asiste = asistenciaFinal[i] === "Sí";
          const conAlergia =
            asiste && estado.tieneAlergias && (esGrupo ? estado.alergiaPorMiembro[i] : true);
          return {
            asistencia: asistenciaFinal[i],
            alergia: conAlergia ? estado.textoAlergia[i].trim() : "",
          };
        }),
        autobus: alguienViene && estado.autobus === true,
        cancion: estado.cancion,
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
      <section id="asistencia" className="scroll-mt-24 py-20 text-center">
        <div className="mx-auto max-w-2xl rounded-lg border border-champagne/50 bg-crema/40 px-6 py-12">
          <h3 className="font-serif text-2xl text-carbon">
            {alguienViene ? "¡Gracias por confirmar!" : "Gracias por avisarnos"}
          </h3>
          <p className="mt-4 text-lg text-grafito">
            {alguienViene
              ? `${esGrupo ? "Os" : "Te"} esperamos el 15 de mayo de 2027.`
              : `Sentimos que no ${esGrupo ? "podáis" : "puedas"} venir. ${
                  esGrupo ? "Os" : "Te"
                } echaremos de menos.`}
          </p>
          <button
            type="button"
            onClick={() => setGuardado(false)}
            className="mt-6 inline-block px-4 py-3 text-lg text-champagne underline hover:text-carbon"
          >
            Editar nuestra respuesta
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="asistencia" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center font-serif text-3xl text-carbon">
          Confirmación de asistencia
        </h2>
        {esGrupo && (
          <p className="mt-4 text-center text-base text-grafito">
            Invitación para {miembros.map((m) => m.nombre).join(", ")}
          </p>
        )}

        <form onSubmit={enviar} className="mt-12 space-y-10">
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-base text-red-700"
            >
              {error}
            </p>
          )}

          {/* ── 1. Asistencia ── */}
          <Eleccion
            etiqueta={
              esGrupo ? `¿Nos acompañaréis los ${miembros.length}?` : "¿Nos acompañarás?"
            }
            valor={estado.asistencia}
            onChange={(v) => cambiar("asistencia", v)}
            opciones={
              esGrupo
                ? [
                    { valor: "Sí", texto: "Sí, allí estaremos" },
                    { valor: "No", texto: "No todos / ninguno" },
                  ]
                : OPCIONES_ASISTENCIA
            }
          />

          {/* Si no vienen todos, se pregunta por cada persona */}
          {esGrupo && estado.asistencia === "No" && (
            <Desglose>
              {miembros.map((m, i) => (
                <Eleccion
                  key={m.nombre + i}
                  secundaria
                  etiqueta={`¿Nos acompañará ${m.nombre}?`}
                  valor={estado.asistenciaPorMiembro[i]}
                  onChange={(v) => cambiarEn("asistenciaPorMiembro", i, v)}
                  opciones={OPCIONES_ASISTENCIA}
                />
              ))}
            </Desglose>
          )}

          {alguienViene && (
            <>
              {/* ── 2. Autobús (global) ── */}
              <Eleccion
                etiqueta={
                  indicesAsistentes.length > 1
                    ? "¿Necesitáis plaza en el autobús?"
                    : "¿Necesitas plaza en el autobús?"
                }
                valor={estado.autobus}
                onChange={(v) => cambiar("autobus", v)}
                opciones={[
                  { valor: true, texto: indicesAsistentes.length > 1 ? "Sí, resérvanos" : "Sí, resérvame" },
                  { valor: false, texto: "No, gracias" },
                ]}
              />

              {/* ── 3. Alergias ── */}
              <Eleccion
                etiqueta="¿Alergias o intolerancias?"
                valor={estado.tieneAlergias}
                onChange={(v) => cambiar("tieneAlergias", v)}
                opciones={OPCIONES_SI_NO}
              />

              {estado.tieneAlergias && (
                <Desglose>
                  {indicesAsistentes.map((i) => {
                    const m = miembros[i];
                    // En un grupo se pregunta por cada asistente; si va una sola
                    // persona, el "Sí" de arriba ya es suyo: directo al texto.
                    const preguntar = esGrupo;
                    const mostrarTexto = !preguntar || estado.alergiaPorMiembro[i] === true;
                    return (
                      <div key={m.nombre + i}>
                        {preguntar && (
                          <Eleccion
                            secundaria
                            etiqueta={`¿Alergias de ${m.nombre}?`}
                            valor={estado.alergiaPorMiembro[i]}
                            onChange={(v) => cambiarEn("alergiaPorMiembro", i, v)}
                            opciones={OPCIONES_SI_NO}
                          />
                        )}
                        {mostrarTexto && (
                          <div className={preguntar ? "mt-4" : ""}>
                            <label
                              htmlFor={`alergia-${i}`}
                              className="block font-serif text-lg text-carbon"
                            >
                              {preguntar
                                ? `Alergias o intolerancias de ${m.nombre}`
                                : "Cuéntanos cuáles"}
                            </label>
                            <textarea
                              id={`alergia-${i}`}
                              rows={2}
                              maxLength={500}
                              value={estado.textoAlergia[i]}
                              onChange={(e) => cambiarEn("textoAlergia", i, e.target.value)}
                              placeholder="Gluten, lactosa, frutos secos…"
                              className={CLASES_CAMPO}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Desglose>
              )}
            </>
          )}

          {/* ── 4. Canción (global) ── */}
          <div>
            <label htmlFor="cancion" className="block font-serif text-xl text-carbon">
              Y finalmente, una canción que no puede faltar
            </label>
            <textarea
              id="cancion"
              rows={2}
              maxLength={500}
              value={estado.cancion}
              onChange={(e) => cambiar("cancion", e.target.value)}
              placeholder={esGrupo ? "La que os haría salir a la pista" : "La que te haría salir a la pista"}
              className={CLASES_CAMPO}
            />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full rounded-lg border border-champagne bg-champagne/20 px-6 py-5 font-serif text-xl text-champagne transition-all duration-300 hover:bg-champagne/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Enviar respuesta"}
          </button>

          <p className="text-center text-base text-grafito">
            {esGrupo
              ? "Podréis cambiar vuestra respuesta cuando queráis desde este mismo enlace."
              : "Podrás cambiar tu respuesta cuando quieras desde este mismo enlace."}
          </p>
        </form>
      </div>
    </section>
  );
}
