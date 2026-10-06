// Tarjeta de un lugar de la celebración.
//
// El botón "Cómo llegar" es un enlace real (<a>), no un botón con window.open:
// así funciona el toque en móvil, el clic con rueda, "abrir en pestaña nueva"
// y la app de Google Maps, y no necesita JavaScript. Por eso el componente no
// lleva "use client".

/** Icono de pin de mapa. */
function IconoMapa({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** Icono de reloj. */
function IconoReloj({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

/** Fila "Cuándo: / Dónde:" con su icono dorado en un círculo fino. */
function Dato({ icono, etiqueta, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-champagne/40 bg-champagne/5 text-champagne">
        {icono}
      </span>
      <div>
        <dt className="text-[10px] tracking-luxe text-champagne uppercase">{etiqueta}</dt>
        <dd className="mt-1 text-sm leading-snug text-carbon">{children}</dd>
      </div>
    </div>
  );
}

export default function LocationCard({ data }) {
  const { titulo, lugar, ciudad, direccion, hora, mapsUrl } = data;

  return (
    <div className="flex flex-col items-center rounded-lg border border-linea bg-crema/10 px-6 py-8 backdrop-blur-sm transition-all duration-500 hover:border-champagne/50 hover:shadow-lg">
      <span className="text-[11px] tracking-luxe text-champagne uppercase">{titulo}</span>

      <h3 className="mt-4 text-center font-serif text-2xl text-carbon">{lugar}</h3>

      <dl className="mt-7 w-full max-w-xs space-y-5 text-left">
        {hora && (
          <Dato icono={<IconoReloj />} etiqueta="Cuándo:">
            <span className="font-serif text-lg">{hora}</span>
          </Dato>
        )}
        <Dato icono={<IconoMapa />} etiqueta="Dónde:">
          <span className="font-serif">{lugar}</span>
          {(direccion || ciudad) && (
            <span className="mt-0.5 block text-xs text-grafito">{direccion || ciudad}</span>
          )}
        </Dato>
      </dl>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Ver ${lugar} en Google Maps`}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-champagne bg-champagne/5 px-4 py-2.5 text-[11px] tracking-luxe text-champagne uppercase transition-all hover:bg-champagne/15 hover:shadow-md"
        >
          <IconoMapa />
          Cómo llegar
        </a>
      )}
    </div>
  );
}
