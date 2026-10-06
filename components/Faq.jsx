import { BODA } from "@/lib/event";
import SectionTitle from "./SectionTitle";

// Preguntas frecuentes. Cada una es un <details> nativo: se abre y cierra sin
// JavaScript y es accesible con teclado y lectores de pantalla.
const PREGUNTAS = [
  {
    pregunta: "¿A qué hora debo llegar a la ceremonia?",
    respuesta: `La misa empieza a las ${BODA.ceremonia.hora} en la ${BODA.ceremonia.lugar}. Te recomendamos estar allí a las 11:45h para entrar con calma y buscar sitio.`,
  },
  {
    pregunta: "¿Dónde puedo aparcar cerca de la iglesia?",
    respuesta:
      "La iglesia está en el centro histórico y aparcar en la calle es complicado. Más arriba tienes los parkings más cercanos con su ubicación. Si lo prefieres, el autobús es la opción más cómoda.",
  },
  {
    pregunta: "¿Habrá autobús?",
    respuesta:
      "Sí, habrá un servicio de autobús gratuito. Indícanos en el formulario de confirmación si lo vas a usar y te avisaremos de horarios y puntos de recogida más cerca de la fecha.",
  },
  {
    pregunta: "¿Cómo llego de la iglesia a la finca?",
    respuesta: `El banquete es en ${BODA.convite.lugar}, a unos 15-30 minutos en coche según el tráfico. En su tarjeta tienes el botón "Cómo llegar" con la ruta en Google Maps.`,
  },
  {
    pregunta: "¿Cuál es el código de vestimenta?",
    respuesta:
      "De etiqueta, formal de día. Tienes todos los detalles en la sección de código de vestimenta.",
  },
  {
    pregunta: "Tengo alergias o una dieta especial, ¿qué hago?",
    respuesta:
      "Cuéntanoslo en el formulario de confirmación, en el apartado de alergias, y nos encargamos de que el menú se adapte a ti.",
  },
  {
    pregunta: "¿Puedo ir acompañado?",
    respuesta:
      "La invitación es para las personas que aparecen en ella. Si tienes cualquier duda, escríbenos y lo hablamos.",
  },
  {
    pregunta: "¿Hasta qué hora durará la fiesta?",
    respuesta:
      "¡Hasta las 00:00h! Y para volver tranquilo, habrá autobús de regreso.",
  },
  {
    pregunta: "¿Qué hago si tengo otra duda?",
    respuesta:
      "Escríbenos por WhatsApp desde los botones de justo aquí arriba y te contestamos encantados.",
  },
];

export default function Faq() {
  return (
    <section className="py-20">
      <SectionTitle antetitulo="Resolvemos tus dudas" titulo="Preguntas frecuentes" />

      <div className="mx-auto mt-12 max-w-2xl divide-y divide-linea border-y border-linea">
        {PREGUNTAS.map(({ pregunta, respuesta }) => (
          <details key={pregunta} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg text-carbon transition-colors hover:text-champagne [&::-webkit-details-marker]:hidden">
              {pregunta}
              <span
                aria-hidden
                className="shrink-0 text-xl leading-none text-champagne transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 pr-8 text-sm leading-relaxed text-grafito">{respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
