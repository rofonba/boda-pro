import { BODA } from "@/lib/event";
import AddToCalendar from "./AddToCalendar";

// Resumen de los datos clave, lo primero que ve el invitado al entrar por su
// enlace: fecha, ceremonia y banquete, en texto grande y con sus acciones.
//
// Los enlaces salen de lib/event.js (mapsUrl de ceremonia y convite) y el
// botón de calendario de lib/calendario.js: para cambiar una URL, tócala ahí
// y se actualiza en toda la web.

/** Nombre del lugar como enlace destacado a Google Maps. */
function EnlaceLugar({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-champagne underline decoration-champagne/50 decoration-2 underline-offset-[6px] transition-colors hover:text-oro hover:decoration-oro"
    >
      {children}
    </a>
  );
}

/** Pregunta en pequeño y respuesta en grande. */
function Dato({ pregunta, children, accion }) {
  return (
    <li className="flex flex-col items-center gap-3 text-center">
      <span className="text-xs tracking-luxe text-grafito uppercase">{pregunta}</span>
      <p className="font-serif text-xl leading-relaxed text-carbon sm:text-2xl">{children}</p>
      {accion && <div className="mt-1">{accion}</div>}
    </li>
  );
}

export default function KeyInfo() {
  const { fecha, ceremonia, convite } = BODA;

  return (
    <section className="py-12 sm:py-16">
      <ul className="mx-auto flex max-w-2xl flex-col gap-8 rounded-2xl border border-linea bg-crema/20 px-6 py-10 backdrop-blur-sm sm:gap-10 sm:px-10">
        <Dato pregunta="¿Cuándo?" accion={<AddToCalendar primario />}>
          {fecha.dia}, {fecha.largo}
        </Dato>

        <Dato pregunta="¿Cuándo y dónde es la ceremonia?">
          {ceremonia.hora} en la{" "}
          <EnlaceLugar href={ceremonia.mapsUrl}>{ceremonia.lugar}</EnlaceLugar>
        </Dato>

        <Dato pregunta="¿Cuándo y dónde es el banquete?">
          {convite.hora} en la{" "}
          <EnlaceLugar href={convite.mapsUrl}>{convite.lugar}</EnlaceLugar>
        </Dato>
      </ul>
    </section>
  );
}
