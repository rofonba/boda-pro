import { URL_GOOGLE_CALENDAR, URL_ICS } from "@/lib/calendario";

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
  "block px-5 py-3 text-[11px] tracking-luxe text-carbon uppercase transition-colors hover:bg-champagne/10 hover:text-champagne";

// Botón "Añadir al calendario" con dos opciones: Google Calendar (Android y
// web) y el archivo .ics (iPhone, Mac y Outlook). Es un <details> nativo, así
// que el desplegable funciona sin JavaScript.
export default function AddToCalendar() {
  return (
    <details className="group relative inline-block">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-champagne bg-champagne/5 px-5 py-2.5 text-[11px] tracking-luxe text-champagne uppercase transition-all hover:bg-champagne/15 hover:shadow-md [&::-webkit-details-marker]:hidden">
        <IconoCalendario />
        Añadir al calendario
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
