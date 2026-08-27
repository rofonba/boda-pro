// Tarjeta de un lugar de la celebración.
//
// El nombre del lugar es un enlace real (<a>), no un botón con window.open:
// así funciona el toque en móvil, el clic con rueda, "abrir en pestaña nueva"
// y la app de Google Maps, y no necesita JavaScript. Por eso el componente no
// lleva "use client".

/** Icono de pin de mapa. */
function IconoMapa() {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function LocationCard({ data }) {
  const { titulo, lugar, ciudad, hora, mapsUrl } = data;

  return (
    <div className="flex flex-col items-center rounded-lg border border-linea bg-crema/10 px-6 py-8 backdrop-blur-sm transition-all duration-500 hover:border-champagne/50 hover:shadow-lg">
      <span className="text-[11px] tracking-luxe text-champagne uppercase">{titulo}</span>

      <h3 className="mt-4 text-center font-serif text-2xl text-carbon">
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Ver ${lugar} en Google Maps`}
            className="underline decoration-champagne/40 decoration-1 underline-offset-4 transition-colors hover:text-champagne hover:decoration-champagne"
          >
            {lugar}
          </a>
        ) : (
          lugar
        )}
      </h3>

      {ciudad && <p className="mt-2 text-sm text-grafito">{ciudad}</p>}
      {hora && <p className="mt-2 font-serif text-sm italic text-grafito">{hora}</p>}

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-champagne bg-champagne/5 px-4 py-2.5 text-[11px] tracking-luxe text-champagne uppercase transition-all hover:bg-champagne/15 hover:shadow-md"
        >
          <IconoMapa />
          Cómo llegar
        </a>
      )}
    </div>
  );
}
