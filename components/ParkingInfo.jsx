"use client";

import { BODA, urlMapas } from "@/lib/event";
import SectionTitle from "./SectionTitle";
import { useLanguage } from "./i18n/LanguageProvider";

// Cronograma del día, en los dos idiomas. Las horas de ceremonia y llegada a
// la finca salen de lib/event.js para que coincidan siempre con la cabecera y
// el calendario.
const cronograma = (t) => [
  {
    id: "ceremonia",
    hora: BODA.ceremonia.hora, // 12:00h
    titulo: t("Ceremonia", "Ceremony"),
    icono: "💍",
    detalles: [
      { label: t("Lugar:", "Venue:"), valor: t(BODA.ceremonia.lugar, BODA.ceremonia.lugarEn) },
      { label: t("Duración estimada:", "Estimated duration:"), valor: t("45 minutos", "45 minutes") },
    ],
    notas: t(
      "La misa empieza a las 12:00h: te recomendamos estar allí a las 11:45h",
      "The ceremony begins at 12:00: we recommend arriving by 11:45"
    ),
    tieneLinea: true,
  },
  {
    id: "coctel",
    hora: BODA.convite.hora, // 14:00h
    titulo: t("Cóctel de Bienvenida", "Welcome Cocktail"),
    icono: "🥂",
    detalles: [{ label: t("Lugar:", "Venue:"), valor: BODA.convite.lugar }],
    notas: t(
      "Disfruta de bebidas y entrantes mientras nos reencontramos",
      "Enjoy drinks and appetisers while we catch up"
    ),
    tieneLinea: true,
  },
  {
    id: "banquete",
    hora: "15:30h",
    titulo: t("Banquete de Celebración", "Wedding Banquet"),
    icono: "🍽️",
    detalles: [
      {
        label: t("Menú:", "Menu:"),
        valor: t("Primer y segundo plato especialmente diseñado", "Specially designed first and main course"),
      },
    ],
    notas: t("Brindis y celebración de nuestro gran día", "Toasts and celebration of our big day"),
    tieneLinea: true,
  },
  {
    id: "fiesta",
    hora: "18:00h",
    titulo: t("Fiesta y Barra Libre", "Party and Open Bar"),
    icono: "🎶",
    detalles: [{ label: t("Hasta:", "Until:"), valor: "00:00h" }],
    notas: t(
      "Último baile, sorpresas finales y autobús de regreso al terminar",
      "Last dance, final surprises and return coach at the end"
    ),
    tieneLinea: false, // Último evento, sin línea
  },
];

const parkingsIglesia = (t) => [
  {
    nombre: "Parking Catedral",
    distancia: "2 min",
    capacidad: t("300 plazas", "300 spaces"),
    notas: t("Subterráneo, bien iluminado", "Underground, well lit"),
  },
  {
    nombre: "Parking Centro Histórico",
    distancia: "4 min",
    capacidad: t("400 plazas", "400 spaces"),
    notas: t("En superficie, tarifado", "Surface car park, paid"),
  },
  {
    nombre: "Parking San Juan",
    distancia: "3 min",
    capacidad: t("150 plazas", "150 spaces"),
    notas: t("Cercano a la iglesia", "Close to the church"),
  },
  {
    nombre: "Parking Barrio",
    distancia: "6 min",
    capacidad: t("200 plazas", "200 spaces"),
    notas: t("Estacionamiento gratuito", "Free parking"),
  },
];

function ParkingCard({ parking }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-linea bg-marfil/40 p-4 backdrop-blur-sm transition-all duration-500 hover:border-champagne/50 hover:shadow-md"
      style={{
        borderColor: "var(--color-linea)",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
      }}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-serif text-base font-medium text-carbon">
          {parking.nombre}
        </h4>
        <span className="whitespace-nowrap rounded-full bg-champagne/15 px-2.5 py-1 text-xs font-semibold text-champagne">
          {parking.distancia} ⓐ
        </span>
      </div>
      <p className="text-sm text-grafito">{parking.capacidad}</p>
      {parking.notas && (
        <p className="text-sm italic text-grafito/70">{parking.notas}</p>
      )}
      <a
        href={urlMapas({ nombre: parking.nombre, ciudad: "Valencia" })}
        target="_blank"
        rel="noopener noreferrer"
        title={t(`Ver ${parking.nombre} en Google Maps`, `View ${parking.nombre} on Google Maps`)}
        className="mt-1 self-start text-xs tracking-luxe text-champagne/80 uppercase underline decoration-champagne/30 underline-offset-4 transition-colors hover:text-champagne hover:decoration-champagne"
      >
        {t("Ver ubicación", "View location")} ↗
      </a>
    </div>
  );
}

export default function ParkingInfo() {
  const { t } = useLanguage();
  const TIMELINE_EVENTOS = cronograma(t);
  const PARKINGS_IGLESIA = parkingsIglesia(t);
  return (
    <section className="py-20">
      {/* ─────────────────────────────────────────── */}
      {/* TIMELINE: DÍA COMPLETO */}
      {/* ─────────────────────────────────────────── */}
      <div className="mb-16">
        <div className="mb-12">
          <SectionTitle antetitulo={t("Nuestro día", "Our day")} titulo={t("Cronograma del día", "Schedule of the day")} />
        </div>

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
                <p className="mt-2 text-base font-semibold text-champagne">
                  {evento.hora}
                </p>

                {/* Detalles */}
                {evento.detalles.map((detalle, i) => (
                  <p key={i} className="mt-2 text-base text-grafito">
                    {detalle.label}{" "}
                    <span className="font-semibold">{detalle.valor}</span>
                  </p>
                ))}

                {/* Notas */}
                {evento.notas && (
                  <p className="mt-2 text-sm italic text-grafito/70">
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
            <h3 className="font-serif text-lg text-carbon">{t("Servicio de Autobús", "Coach Service")}</h3>
            <p className="mt-3 text-base leading-relaxed text-grafito">
              {t("Hemos habilitado un ", "We have arranged a ")}
              <span className="font-semibold text-champagne">
                {t("servicio de autobús cómodo y gratuito", "comfortable, complimentary coach service")}
              </span>
              {t(
                " para todos los invitados que lo deseen. Es una excelente opción para disfrutar del día sin preocupaciones de conducción.",
                " for all guests who wish to use it. It is an excellent way to enjoy the day without worrying about driving."
              )}
            </p>
            <p className="mt-3 text-sm italic text-grafito/70">
              {t(
                "Puedes confirmar tu interés en el formulario de confirmación de asistencia",
                "You can let us know on the RSVP form"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────── */}
      {/* PARKINGS */}
      {/* ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-center text-xs tracking-luxe text-champagne uppercase mb-8">
          {t("Estacionamiento (Iglesia)", "Parking (Church)")}
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PARKINGS_IGLESIA.map((parking) => (
            <ParkingCard key={parking.nombre} parking={parking} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs italic text-grafito">
          {t(
            "Los tiempos indicados son estimados caminando a paso normal.",
            "Times shown are estimates at a normal walking pace."
          )}
          <br />
          <span className="text-xs">ⓐ {t("a pie desde el parking", "on foot from the car park")}</span>
        </p>
      </div>
    </section>
  );
}
