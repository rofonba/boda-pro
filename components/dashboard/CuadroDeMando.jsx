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

/** Porcentaje entero sobre el total; 0 si no hay nadie (evita dividir por cero). */
const porcentaje = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);

/** Las cuatro métricas principales, en personas: cifra grande y porcentaje. */
function Metricas({ asistencia }) {
  const { total } = asistencia;
  const metricas = [
    { etiqueta: "Enviadas", valor: total, destacado: true },
    { etiqueta: "Aceptadas", valor: asistencia.confirmados },
    { etiqueta: "Pendientes", valor: asistencia.pendientes },
    { etiqueta: "Rechazadas", valor: asistencia.rechazados },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-linea bg-linea sm:grid-cols-4">
      {metricas.map(({ etiqueta, valor, destacado }) => (
        <div key={etiqueta} className="flex flex-col items-center bg-crema/60 px-4 py-6 text-center">
          <dt className="text-[11px] tracking-luxe text-grafito uppercase">{etiqueta}</dt>
          <dd className={`mt-3 font-serif text-4xl ${destacado ? "text-champagne" : "text-carbon"}`}>
            {valor}
          </dd>
          <dd className="mt-1 text-sm text-grafito">{porcentaje(valor, total)} %</dd>
        </div>
      ))}
    </dl>
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

/** Barra de pestañas horizontal; en móvil se desplaza en horizontal. */
function Pestanas({ pestanas, activa, onCambiar }) {
  return (
    <div role="tablist" className="-mx-6 flex gap-1 overflow-x-auto border-b border-linea px-6">
      {pestanas.map(({ clave, titulo, cantidad }) => {
        const esActiva = clave === activa;
        return (
          <button
            key={clave}
            type="button"
            role="tab"
            aria-selected={esActiva}
            onClick={() => onCambiar(clave)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-[11px] tracking-luxe uppercase transition-colors ${
              esActiva
                ? "border-champagne text-carbon"
                : "border-transparent text-grafito hover:text-carbon"
            }`}
          >
            {titulo}
            <span className={`ml-2 ${esActiva ? "text-champagne" : "text-grafito/70"}`}>
              {cantidad}
            </span>
          </button>
        );
      })}
    </div>
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
  const [tabActiva, setTabActiva] = useState("pendientes");

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
      {/* ── Métricas principales ── */}
      <Metricas asistencia={resumen.asistencia} />

      {/* ── Buscador ── */}
      <section className="mt-16">
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

      {/* ── Listados con nombres, por pestañas ── */}
      {(() => {
        const enlace = (p) => (
          <a
            href={`/?id=${p.grupo.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs text-champagne underline"
          >
            /?id={p.grupo.id}
          </a>
        );

        const pestanas = [
          {
            clave: "pendientes",
            titulo: "Pendientes",
            elementos: pendientes,
            vacio: "Todo el mundo ha contestado.",
            fila: (p) => <Persona key={p.clave} persona={p}>{enlace(p)}</Persona>,
          },
          {
            clave: "confirmados",
            titulo: "Confirmados",
            elementos: confirmados,
            vacio: "Todavía nadie ha confirmado.",
            fila: (p) => <Persona key={p.clave} persona={p} />,
          },
          {
            clave: "rechazados",
            titulo: "Rechazados",
            elementos: rechazados,
            vacio: "Nadie ha dicho que no.",
            fila: (p) => <Persona key={p.clave} persona={p} />,
          },
          {
            clave: "autobus",
            titulo: "Autobús",
            elementos: autobus,
            vacio: "Nadie ha pedido plaza en el autobús.",
            fila: (p) => <Persona key={p.clave} persona={p} />,
          },
          {
            clave: "alergias",
            titulo: "Alergias",
            elementos: alergias,
            vacio: "Ningún asistente ha indicado alergias.",
            fila: (p) => (
              <Persona key={p.clave} persona={p}>
                <p className="mt-1 text-sm text-grafito">{p.alergia}</p>
              </Persona>
            ),
          },
          {
            clave: "canciones",
            titulo: "Canciones",
            elementos: canciones,
            vacio: "Todavía no hay peticiones musicales.",
            fila: (inv) => (
              <li key={inv.id} className="py-3">
                <p className="text-carbon">{inv.cancion}</p>
                <p className="mt-0.5 text-xs tracking-wide text-grafito">{inv.nombre}</p>
              </li>
            ),
          },
        ];
        const actual = pestanas.find((t) => t.clave === tabActiva) ?? pestanas[0];

        return (
          <section className="mt-16">
            <Pestanas
              pestanas={pestanas.map(({ clave, titulo, elementos }) => ({
                clave,
                titulo,
                cantidad: elementos.length,
              }))}
              activa={actual.clave}
              onCambiar={setTabActiva}
            />
            {actual.elementos.length === 0 ? (
              <p className="py-6 text-sm italic text-grafito">{actual.vacio}</p>
            ) : (
              <ul role="tabpanel" className="divide-y divide-linea">
                {actual.elementos.map(actual.fila)}
              </ul>
            )}
          </section>
        );
      })()}
    </>
  );
}
