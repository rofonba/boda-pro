import { BODA } from "@/lib/event";
import AddToCalendar from "./AddToCalendar";

// Resumen de los datos clave, lo primero que ve el invitado al entrar por su
// enlace: fecha, ceremonia y banquete, en texto grande y con sus acciones.
//
// Los enlaces salen de lib/event.js (mapsUrl de ceremonia y convite) y el
// botón de calendario de lib/calendario.js: para cambiar una URL, tócala ahí
// y se actualiza en toda la web.

/** Enlace discreto a Google Maps, debajo del lugar. */
function ComoLlegar({ href, lugar }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Ver ${lugar} en Google Maps`}
      className="text-sm text-grafito/80 underline decoration-champagne/40 underline-offset-4 transition-colors hover:text-champagne hover:decoration-champagne"
    >
      ¿Cómo llegar?
    </a>
  );
}

/** Pregunta en pequeño y respuesta en grande. */
function Dato({ pregunta, children, accion }) {
  return (
    <li className="flex flex-col items-center gap-3 text-center">
      <span className="text-xs tracking-luxe text-grafito uppercase">{pregunta}</span>
      <p className="font-serif text-xl leading-relaxed text-carbon sm:text-2xl">{children}</p>
      {accion && <div>{accion}</div>}
    </li>
  );
}

export default function KeyInfo() {
  const { fecha, ceremonia, convite } = BODA;

  return (
    <section id="fecha" className="scroll-mt-24 py-12 sm:py-16">
      <ul className="mx-auto flex max-w-2xl flex-col gap-8 rounded-2xl border border-linea bg-crema/20 px-6 py-10 backdrop-blur-sm sm:gap-10 sm:px-10">
        <Dato pregunta="¿Cuándo?" accion={<AddToCalendar primario />}>
          {fecha.dia}, {fecha.largo}
        </Dato>

        <Dato
          pregunta="¿Cuándo y dónde es la ceremonia?"
          accion={<ComoLlegar href={ceremonia.mapsUrl} lugar={ceremonia.lugar} />}
        >
          {ceremonia.hora} en la {ceremonia.lugar}
        </Dato>

        <Dato
          pregunta="¿Cuándo y dónde es el banquete?"
          accion={<ComoLlegar href={convite.mapsUrl} lugar={convite.lugar} />}
        >
          {convite.hora} en la {convite.lugar}
        </Dato>
      </ul>
    </section>
  );
}
