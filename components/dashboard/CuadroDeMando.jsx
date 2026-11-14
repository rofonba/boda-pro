"use client";

import { useMemo, useState } from "react";
import { slugify } from "@/lib/slug";
import { calcularResumen } from "@/lib/stats";

/**
 * Cuadro de mando: cifras, buscador y listados con nombres.
 *
 * Recibe las invitaciones ya normalizadas (ver lib/invitacion.js) y no accede a
 * datos: lo usan /dashboard (que lee en el servidor y le pasa la lista) y
 * /backstage (que la recibe en tiempo real). Un solo sitio que mantener.
 *
 * Todos los listados trabajan en PERSONAS: cada invitación (grupo) se
 * desenrolla en sus miembros, y cada persona conserva una referencia a su
 * grupo para el autobús, la canción y el enlace.
 */

const SIN_TILDES = (texto) => slugify(texto);

/** Invitaciones → personas, con su grupo a mano. */
function desenrollar(invitaciones) {
  return invitaciones.flatMap((inv) =>
    inv.miembros.map((m, i) => ({
      clave: `${inv.id}-${i}`,
      nombre: m.nombre,
      asistencia: m.asistencia,
      alergia: m.alergia,
      // El autobús es del grupo, pero solo cuenta para quien viene.
      autobus: m.asistencia === "Sí" && inv.autobus,
      grupo: inv,
      esGrupo: inv.miembros.length > 1,
    }))
  );
}

// ── Piezas visuales ─────────────────────────────────────────────────────────

/** Bloque de cuatro cifras (Asistencia / Autobús). */
function Contador({ titulo, datos }) {
  const filas = [
    { etiqueta: "Confirmados", valor: datos.confirmados },
    { etiqueta: "Pendientes", valor: datos.pendientes },
    { etiqueta: "Rechazados", valor: datos.rechazados },
    { etiqueta: "Total", valor: datos.total, destacado: true },
  ];

  return (
    <section>
      <h2 className="text-[11px] tracking-luxe text-grafito uppercase">{titulo}</h2>
      <dl className="mt-4 divide-y divide-linea border-y border-linea">
        {filas.map(({ etiqueta, valor, destacado }) => (
          <div key={etiqueta} className="flex items-baseline justify-between py-3">
            <dt className={destacado ? "text-carbon" : "text-grafito"}>{etiqueta}</dt>
            <dd className={`font-serif text-2xl ${destacado ? "text-champagne" : "text-carbon"}`}>
              {valor}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Etiqueta pequeña con el estado de asistencia. */
function Estado({ valor }) {
  const estilo = {
    Sí: "border-champagne/60 text-champagne",
    No: "border-linea text-grafito line-through",
    Pendiente: "border-linea text-grafito",
  }[valor];
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] tracking-widest uppercase ${estilo}`}>
      {valor}
    </span>
  );
}

/** Nombre de una persona y, si va en grupo, el nombre del grupo debajo. */
function Persona({ persona, children }) {
  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-carbon">{persona.nombre}</p>
        {persona.esGrupo && (
          <p className="mt-0.5 text-xs tracking-wide text-grafito">{persona.grupo.nombre}</p>
        )}
        {children}
      </div>
      <Estado valor={persona.asistencia} />
    </li>
  );
}

/** Sección desplegable con un contador en el título. */
function Desplegable({ titulo, cantidad, vacio, abierto = false, children }) {
  return (
    <details open={abierto} className="group">
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 border-b border-linea py-3 [&::-webkit-details-marker]:hidden">
        <h2 className="text-[11px] tracking-luxe text-grafito uppercase">
          {titulo}
          <span className="ml-2 text-champagne">({cantidad})</span>
        </h2>
        <span aria-hidden className="text-champagne transition-transform duration-300 group-open:rotate-45">
          +
        </span>
      </summary>
      {cantidad === 0 ? (
        <p className="py-4 text-sm italic text-grafito">{vacio}</p>
      ) : (
        <ul className="divide-y divide-linea">{children}</ul>
      )}
    </details>
  );
}

/** Tarjeta de una invitación completa: resultado del buscador. */
function TarjetaInvitacion({ invitacion }) {
  const inv = invitacion;
  const alguienViene = inv.miembros.some((m) => m.asistencia === "Sí");

  return (
    <li className="rounded-lg border border-linea bg-crema/40 px-5 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-xl text-carbon">{inv.nombre}</h3>
        <a
          href={`/?id=${inv.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-champagne underline"
        >
          /?id={inv.id}
        </a>
      </div>

      <ul className="mt-4 divide-y divide-linea border-y border-linea">
        {inv.miembros.map((m, i) => (
          <li key={i} className="flex items-start justify-between gap-4 py-2.5">
            <div>
              <p className="text-carbon">{m.nombre}</p>
              {m.alergia && (
                <p className="mt-0.5 text-sm text-grafito">
                  <span className="text-[10px] tracking-widest uppercase">Alergia · </span>
                  {m.alergia}
                </p>
              )}
            </div>
            <Estado valor={m.asistencia} />
          </li>
        ))}
      </ul>

      <dl className="mt-4 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-grafito">Autobús:</dt>
          <dd className="text-carbon">{alguienViene && inv.autobus ? "Sí" : "No"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-grafito">Canción:</dt>
          <dd className="text-carbon">{inv.cancion || "—"}</dd>
        </div>
      </dl>
    </li>
  );
}

// ── Cuadro de mando ─────────────────────────────────────────────────────────

export default function CuadroDeMando({ invitados }) {
  const [busqueda, setBusqueda] = useState("");

  const resumen = useMemo(() => calcularResumen(invitados), [invitados]);
  const personas = useMemo(() => desenrollar(invitados), [invitados]);

  // Búsqueda sin tildes ni mayúsculas, por nombre de persona o de invitación.
  const resultados = useMemo(() => {
    const termino = SIN_TILDES(busqueda.trim());
    if (!termino) return null;
    return invitados.filter(
      (inv) =>
        SIN_TILDES(inv.nombre).includes(termino) ||
        inv.miembros.some((m) => SIN_TILDES(m.nombre).includes(termino))
    );
  }, [busqueda, invitados]);

  const pendientes = personas.filter((p) => p.asistencia === "Pendiente");
  const confirmados = personas.filter((p) => p.asistencia === "Sí");
  const rechazados = personas.filter((p) => p.asistencia === "No");
  const autobus = personas.filter((p) => p.autobus);
  const alergias = personas.filter((p) => p.asistencia === "Sí" && p.alergia.trim());
  const canciones = invitados.filter((inv) => inv.cancion.trim());

  return (
    <>
      {/* ── Buscador ── */}
      <section>
        <label htmlFor="buscador" className="text-[11px] tracking-luxe text-grafito uppercase">
          Buscar invitado
        </label>
        <input
          id="buscador"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Nombre de la persona o de la invitación"
          autoComplete="off"
          className="mt-3 w-full rounded-lg border border-linea bg-crema px-4 py-3 text-carbon placeholder-grafito/50 transition-all focus:border-champagne focus:outline-none focus:ring-2 focus:ring-champagne/20"
        />

        {resultados && (
          <div className="mt-6">
            {resultados.length === 0 ? (
              <p className="text-sm italic text-grafito">Nadie coincide con «{busqueda.trim()}».</p>
            ) : (
              <ul className="space-y-4">
                {resultados.map((inv) => (
                  <TarjetaInvitacion key={inv.id} invitacion={inv} />
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* ── Cifras ── */}
      <div className="mt-16 grid gap-12 sm:grid-cols-2">
        <Contador titulo="Asistencia (personas)" datos={resumen.asistencia} />
        <Contador titulo="Autobús (personas)" datos={resumen.autobus} />
      </div>

      {/* ── Listados con nombres ── */}
      <div className="mt-16 space-y-8">
        <Desplegable
          titulo="Pendientes · sin respuesta"
          cantidad={pendientes.length}
          vacio="Todo el mundo ha contestado."
          abierto
        >
          {pendientes.map((p) => (
            <Persona key={p.clave} persona={p}>
              <a
                href={`/?id=${p.grupo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-champagne underline"
              >
                /?id={p.grupo.id}
              </a>
            </Persona>
          ))}
        </Desplegable>

        <Desplegable
          titulo="Confirmados"
          cantidad={confirmados.length}
          vacio="Todavía nadie ha confirmado."
        >
          {confirmados.map((p) => (
            <Persona key={p.clave} persona={p} />
          ))}
        </Desplegable>

        <Desplegable
          titulo="Rechazados"
          cantidad={rechazados.length}
          vacio="Nadie ha dicho que no."
        >
          {rechazados.map((p) => (
            <Persona key={p.clave} persona={p} />
          ))}
        </Desplegable>

        <Desplegable
          titulo="Autobús · plazas reservadas"
          cantidad={autobus.length}
          vacio="Nadie ha pedido plaza en el autobús."
        >
          {autobus.map((p) => (
            <Persona key={p.clave} persona={p} />
          ))}
        </Desplegable>

        <Desplegable
          titulo="Alergias e intolerancias"
          cantidad={alergias.length}
          vacio="Ningún asistente ha indicado alergias."
        >
          {alergias.map((p) => (
            <Persona key={p.clave} persona={p}>
              <p className="mt-1 text-sm text-grafito">{p.alergia}</p>
            </Persona>
          ))}
        </Desplegable>

        <Desplegable
          titulo="Canciones"
          cantidad={canciones.length}
          vacio="Todavía no hay peticiones musicales."
        >
          {canciones.map((inv) => (
            <li key={inv.id} className="py-3">
              <p className="text-carbon">{inv.cancion}</p>
              <p className="mt-0.5 text-xs tracking-wide text-grafito">{inv.nombre}</p>
            </li>
          ))}
        </Desplegable>
      </div>
    </>
  );
}
