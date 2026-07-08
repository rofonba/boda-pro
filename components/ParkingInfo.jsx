"use client";

const PARKINGS_IGLESIA = [
  {
    nombre: "Parking Catedral",
    distancia: "2 min",
    capacidad: "300 plazas",
    notas: "Subterráneo, bien iluminado",
  },
  {
    nombre: "Parking Centro Histórico",
    distancia: "4 min",
    capacidad: "400 plazas",
    notas: "En superficie, tarifado",
  },
  {
    nombre: "Parking San Juan",
    distancia: "3 min",
    capacidad: "150 plazas",
    notas: "Cercano a la iglesia",
  },
  {
    nombre: "Parking Barrio",
    distancia: "6 min",
    capacidad: "200 plazas",
    notas: "Estacionamiento gratuito",
  },
];

function ParkingCard({ parking }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-linea bg-marfil/40 p-4 backdrop-blur-sm transition-all duration-500 hover:border-champagne/50 hover:shadow-md"
      style={{
        borderColor: "var(--color-linea)",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
      }}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-serif text-sm font-medium text-carbon">
          {parking.nombre}
        </h4>
        <span className="whitespace-nowrap rounded-full bg-champagne/15 px-2.5 py-1 text-[10px] font-semibold text-champagne">
          {parking.distancia} ⓐ
        </span>
      </div>
      <p className="text-xs text-grafito">{parking.capacidad}</p>
      {parking.notas && (
        <p className="text-xs italic text-grafito/70">{parking.notas}</p>
      )}
    </div>
  );
}

export default function ParkingInfo() {
  return (
    <section className="py-20">
      {/* ─────────────────────────────────────────── */}
      {/* TIMELINE: CEREMONIA Y DESPLAZAMIENTO */}
      {/* ─────────────────────────────────────────── */}
      <div className="mb-16">
        <h2 className="text-center text-[11px] tracking-luxe text-champagne uppercase mb-10">
          Timing del Evento
        </h2>

        {/* Timeline Visual */}
        <div className="mx-auto max-w-2xl">
          {/* Hora de Ceremonia */}
          <div className="mb-12 flex gap-6">
            {/* Círculo izquierdo */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-champagne bg-marfil">
                <span className="text-lg">🕐</span>
              </div>
              <div className="mt-3 h-16 w-px bg-gradient-to-b from-champagne to-champagne/30" />
            </div>

            {/* Contenido */}
            <div className="flex-1 pt-1">
              <h3 className="font-serif text-lg text-carbon">Ceremonia</h3>
              <p className="mt-2 text-sm font-semibold text-champagne">12:00h</p>
              <p className="mt-2 text-sm text-grafito">
                Duración estimada: <span className="font-semibold">45 minutos</span>
              </p>
              <p className="mt-2 text-xs italic text-grafito/70">
                Por favor, llega con 15 minutos de anticipación
              </p>
            </div>
          </div>

          {/* Desplazamiento */}
          <div className="flex gap-6">
            {/* Círculo izquierdo */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-champagne/60 bg-marfil">
                <span className="text-lg">🚗</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 pt-1">
              <h3 className="font-serif text-lg text-carbon">Desplazamiento</h3>
              <p className="mt-2 text-sm text-grafito">
                <span className="font-semibold text-champagne">15-30 minutos</span> (dependiendo del tráfico)
              </p>
              <p className="mt-3 text-xs italic text-grafito/70">
                Tiempo aproximado desde la ceremonia hasta la celebración
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN AUTOBÚS */}
      {/* ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl rounded-lg border border-champagne/30 bg-champagne/5 p-8 backdrop-blur-sm mb-16">
        <div className="flex gap-4">
          <span className="text-3xl flex-shrink-0">🚌</span>
          <div>
            <h3 className="font-serif text-lg text-carbon">Servicio de Autobús</h3>
            <p className="mt-3 text-sm leading-relaxed text-grafito">
              Hemos habilitado un <span className="font-semibold text-champagne">servicio de autobús cómodo y gratuito</span> para todos los invitados que lo deseen. Es una excelente opción para disfrutar del día sin preocupaciones de conducción.
            </p>
            <p className="mt-3 text-xs italic text-grafito/70">
              Puedes confirmar tu interés en el formulario de confirmación de asistencia
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────── */}
      {/* PARKINGS */}
      {/* ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-center text-[11px] tracking-luxe text-champagne uppercase mb-8">
          Estacionamiento (Iglesia)
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PARKINGS_IGLESIA.map((parking) => (
            <ParkingCard key={parking.nombre} parking={parking} />
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] italic text-grafito">
          Los tiempos indicados son estimados caminando a paso normal.
          <br />
          <span className="text-[10px]">ⓐ a pie desde el parking</span>
        </p>
      </div>
    </section>
  );
}
