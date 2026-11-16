"use client";

import { BODA } from "@/lib/event";
import AddToCalendar from "./AddToCalendar";
import { useLanguage } from "./i18n/LanguageProvider";

// Resumen de los datos clave, lo primero que ve el invitado al entrar por su
// enlace: fecha, ceremonia y banquete, en texto grande y con sus acciones.
//
// Los enlaces salen de lib/event.js (mapsUrl de ceremonia y convite) y el
// botón de calendario de lib/calendario.js: para cambiar una URL, tócala ahí
// y se actualiza en toda la web.

/** Enlace discreto a Google Maps, debajo del lugar. */
function ComoLlegar({ href, lugar }) {
  const { t } = useLanguage();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={t(`Ver ${lugar} en Google Maps`, `View ${lugar} on Google Maps`)}
      className="text-sm text-grafito/80 underline decoration-champagne/40 underline-offset-4 transition-colors hover:text-champagne hover:decoration-champagne"
    >
      {t("¿Cómo llegar?", "How to get there?")}
    </a>
  );
}

/** Pregunta en pequeño y respuesta en grande. */
function Dato({ id, pregunta, children, accion }) {
  return (
    <li id={id} className="scroll-mt-24 flex flex-col items-center gap-3 text-center">
      <span className="text-xs tracking-luxe text-grafito uppercase">{pregunta}</span>
      <p className="font-serif text-xl leading-relaxed text-carbon sm:text-2xl">{children}</p>
      {accion && <div>{accion}</div>}
    </li>
  );
}

export default function KeyInfo() {
  const { fecha, ceremonia, convite } = BODA;
  const { t } = useLanguage();

  return (
    <section id="fecha" className="scroll-mt-24 py-12 sm:py-16">
      <ul className="mx-auto flex max-w-2xl flex-col gap-8 rounded-2xl border border-linea bg-crema/20 px-6 py-10 backdrop-blur-sm sm:gap-10 sm:px-10">
        <Dato pregunta={t("¿Cuándo?", "When?")} accion={<AddToCalendar primario />}>
          {t(`${fecha.dia}, ${fecha.largo}`, fecha.en)}
        </Dato>

        <Dato
          id="ceremonia"
          pregunta={t("¿Cuándo y dónde es la ceremonia?", "When and where is the ceremony?")}
          accion={<ComoLlegar href={ceremonia.mapsUrl} lugar={t(ceremonia.lugar, ceremonia.lugarEn)} />}
        >
          {ceremonia.hora} {t("en la", "at")} {t(ceremonia.lugar, ceremonia.lugarEn)}
        </Dato>

        <Dato
          id="banquete"
          pregunta={t("¿Cuándo y dónde es el banquete?", "When and where is the reception?")}
          accion={<ComoLlegar href={convite.mapsUrl} lugar={convite.lugar} />}
        >
          {convite.hora} {t("en la", "at")} {t(convite.lugar, convite.lugarEn)}
        </Dato>
      </ul>
    </section>
  );
}
