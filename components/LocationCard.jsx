"use client";

export default function LocationCard({ data }) {
  const handleOpenMap = () => {
    if (data.mapsUrl) {
      window.open(data.mapsUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col items-center rounded-lg border border-linea bg-marfil/50 px-6 py-8 backdrop-blur-sm transition-all duration-500 hover:border-champagne/50 hover:shadow-lg"
      style={{
        borderColor: "var(--color-linea)",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        transitionProperty: "all",
        transitionDuration: "0.5s",
        transitionTimingFunction: "ease-in-out",
      }}>
      {/* Etiqueta superior */}
      <span className="text-[11px] tracking-luxe text-champagne uppercase">
        {data.titulo}
      </span>

      {/* Lugar principal */}
      <h3 className="mt-4 text-center font-serif text-2xl text-carbon">
        {data.lugar}
      </h3>

      {/* Ciudad */}
      {data.ciudad && (
        <p className="mt-2 text-sm text-grafito">{data.ciudad}</p>
      )}

      {/* Hora (si aplica) */}
      {data.hora && (
        <p className="mt-2 font-serif text-sm italic text-grafito">{data.hora}</p>
      )}

      {/* Botón de Google Maps */}
      {data.mapsUrl && (
        <button
          type="button"
          onClick={handleOpenMap}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-champagne bg-champagne/5 px-4 py-2.5 text-[11px] tracking-luxe text-champagne uppercase transition-all hover:bg-champagne/15 hover:shadow-md"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15l-5-5.41 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          Abrir en Mapas
        </button>
      )}
    </div>
  );
}
