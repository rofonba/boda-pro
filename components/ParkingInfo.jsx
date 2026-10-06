"use client";

import { urlMapas } from "@/lib/event";

// Timeline de eventos del día
const TIMELINE_EVENTOS = [
  {
    id: "ceremonia",
    hora: "12:00h",
    titulo: "Ceremonia",
    icono: "🕐",
    detalles: [
      { label: "Duración estimada:", valor: "45 minutos" },
    ],
    notas: "Por favor, llega con 15 minutos de anticipación",
    tieneLinea: true,
  },
  {
    id: "desplazamiento",
    hora: "~12:45h",
    titulo: "Desplazamiento",
    icono: "🚗",
    detalles: [
      { label: "Tiempo:", valor: "15-30 minutos (según tráfico)" },
    ],
    notas: "Tiempo aproximado hasta la celebración",
    tieneLinea: true,
  },
  {
    id: "coctel",
    hora: "13:00h",
    titulo: "Cóctel de Bienvenida",
    icono: "🥂",
    detalles: [
      { label: "Ubicación:", valor: "Jardines de la Celebración" },
    ],
    notas: "Disfruta de bebidas y camarones mientras nos reencontramos",
    tieneLinea: true,
  },
  {
    id: "almuerzo",
    hora: "15:00h",
    titulo: "Almuerzo de Celebración",
    icono: "🍽️",
    detalles: [
      { label: "Menú:", valor: "Primer y segundo plato especialmente diseñado" },
    ],
    notas: "Brindis y celebración de nuestro gran día",
    tieneLinea: true,
  },
  {
    id: "fiestas",
    hora: "00:00h",
    titulo: "Fin de Fiesta",
    icono: "✨",
    detalles: [
      { label: "Despedida:", valor: "Último baile y sorpresas finales" },
    ],
    notas: "Servicio de autobús disponible para el regreso",
    tieneLinea: false, // Último evento, sin línea
  },
];

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
      <a
        href={urlMapas({ nombre: parking.nombre, ciudad: "Valencia" })}
        target="_blank"
        rel="noopener noreferrer"
        title={`Ver ${parking.nombre} en Google Maps`}
        className="mt-1 self-start text-[10px] tracking-luxe text-champagne/80 uppercase underline decoration-champagne/30 underline-offset-4 transition-colors hover:text-champagne hover:decoration-champagne"
      >
        Ver ubicación ↗
      </a>
    </div>
  );
}

export default function ParkingInfo() {
  return (
    <section className="py-20">
      {/* ─────────────────────────────────────────── */}
      {/* TIMELINE: DÍA COMPLETO */}
      {/* ─────────────────────────────────────────── */}
      <div className="mb-16">
        <h2 className="text-center text-[11px] tracking-luxe text-champagne uppercase mb-10">
          Cronograma del Día
        </h2>

        {/* Timeline Visual */}
        <div className="mx-auto max-w-2xl">
          {TIMELINE_EVENTOS.map((evento, index) => (
            <div key={evento.id} className="mb-12 flex gap-6 last:mb-0">
              {/* Columna izquierda: icono y línea */}
              <div className="flex flex-col items-center">
                {/* Círculo con icono */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-champagne bg-marfil">
                  <span className="text-lg">{evento.icono}</span>
                </div>

                {/* Línea conectora (si no es el último) */}
                {evento.tieneLinea && (
                  <div className="mt-3 h-20 w-px bg-gradient-to-b from-champagne to-champagne/30" />
                )}
              </div>

              {/* Columna derecha: contenido */}
              <div className="flex-1 pt-1 pb-4">
                <h3 className="font-serif text-lg text-carbon">
                  {evento.titulo}
                </h3>
                <p className="mt-2 text-sm font-semibold text-champagne">
                  {evento.hora}
                </p>

                {/* Detalles */}
                {evento.detalles.map((detalle, i) => (
                  <p key={i} className="mt-2 text-sm text-grafito">
                    {detalle.label}{" "}
                    <span className="font-semibold">{detalle.valor}</span>
                  </p>
                ))}

                {/* Notas */}
                {evento.notas && (
                  <p className="mt-2 text-xs italic text-grafito/70">
                    {evento.notas}
                  </p>
                )}
              </div>
            </div>
          ))}
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
