"use client";

import { URL_GOOGLE_CALENDAR, URL_ICS } from "@/lib/calendario";
import { useLanguage } from "./i18n/LanguageProvider";

/** Icono de calendario. */
function IconoCalendario() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

const OPCION =
  "block px-5 py-3 text-xs tracking-luxe text-carbon uppercase transition-colors hover:bg-champagne/10 hover:text-champagne";

const BOTON_BASE =
  "inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-champagne tracking-luxe uppercase transition-all hover:shadow-md [&::-webkit-details-marker]:hidden";

const BOTON = {
  // Discreto, a juego con "Cómo llegar".
  secundario: `${BOTON_BASE} bg-champagne/5 px-5 py-2.5 text-xs text-champagne hover:bg-champagne/15`,
  // Grande y relleno de dorado: la acción principal del resumen de arriba.
  primario: `${BOTON_BASE} bg-champagne px-6 py-3 text-sm font-semibold text-marfil shadow-lg hover:bg-oro`,
};

// Botón "Añadir al calendario" con dos opciones: Google Calendar (Android y
// web) y el archivo .ics (iPhone, Mac y Outlook). Es un <details> nativo, así
// que el desplegable funciona sin JavaScript.
export default function AddToCalendar({ primario = false }) {
  const { t } = useLanguage();
  return (
    <details className="group relative inline-block">
      <summary className={primario ? BOTON.primario : BOTON.secundario}>
        <IconoCalendario />
        {t("Añadir al calendario", "Add to calendar")}
      </summary>

      <div className="absolute left-1/2 z-20 mt-2 w-60 -translate-x-1/2 overflow-hidden rounded-lg border border-linea bg-crema text-center shadow-xl">
        <a href={URL_GOOGLE_CALENDAR} target="_blank" rel="noopener noreferrer" className={OPCION}>
          Google Calendar
        </a>
        <a href={URL_ICS} className={`${OPCION} border-t border-linea`}>
          Apple · Outlook
        </a>
      </div>
    </details>
  );
}
