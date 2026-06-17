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
      {/* Nombre y distancia a pie */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-serif text-sm font-medium text-carbon">
          {parking.nombre}
        </h4>
        <span className="whitespace-nowrap rounded-full bg-champagne/15 px-2.5 py-1 text-[10px] font-semibold text-champagne">
          {parking.distancia} ⓐ
        </span>
      </div>

      {/* Capacidad */}
      <p className="text-xs text-grafito">{parking.capacidad}</p>

      {/* Notas */}
      {parking.notas && (
        <p className="text-xs italic text-grafito/70">{parking.notas}</p>
      )}
    </div>
  );
}

export default function ParkingInfo() {
  return (
    <section className="py-20">
      <h2 className="text-center text-[11px] tracking-luxe text-champagne uppercase">
        Estacionamiento (Iglesia)
      </h2>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PARKINGS_IGLESIA.map((parking) => (
          <ParkingCard key={parking.nombre} parking={parking} />
        ))}
      </div>

      {/* Nota al pie */}
      <p className="mt-8 text-center text-[11px] italic text-grafito">
        Los tiempos indicados son estimados caminando a paso normal.
        <br />
        <span className="text-[10px]">ⓐ a pie desde el parking</span>
      </p>
    </section>
  );
}
