"use client";

import { BODA } from "@/lib/event";
import SectionTitle from "./SectionTitle";
import { useLanguage } from "./i18n/LanguageProvider";

// Preguntas frecuentes, en los dos idiomas. Cada una es un <details> nativo:
// se abre y cierra sin JavaScript y es accesible con teclado y lectores.
const PREGUNTAS = [
  {
    es: {
      pregunta: "¿A qué hora debo llegar a la ceremonia?",
      respuesta: `La misa empieza a las ${BODA.ceremonia.hora} en la ${BODA.ceremonia.lugar}. Te recomendamos estar allí a las 11:45h para entrar con calma y buscar sitio.`,
    },
    en: {
      pregunta: "What time should I arrive at the ceremony?",
      respuesta: `The ceremony begins at ${BODA.ceremonia.hora} at ${BODA.ceremonia.lugarEn}. We recommend arriving by 11:45 so you can come in at ease and find a seat.`,
    },
  },
  {
    es: {
      pregunta: "¿Dónde puedo aparcar cerca de la iglesia?",
      respuesta:
        "La iglesia está en el centro histórico y aparcar en la calle es complicado. Más arriba tienes los parkings más cercanos con su ubicación. Si lo prefieres, el autobús es la opción más cómoda.",
    },
    en: {
      pregunta: "Where can I park near the church?",
      respuesta:
        "The church is in the historic centre, where street parking is difficult. The nearest car parks, with their locations, are listed above. The coach is the most convenient option if you prefer.",
    },
  },
  {
    es: {
      pregunta: "¿Habrá autobús?",
      respuesta:
        "Sí, habrá un servicio de autobús gratuito. Indícanos en el formulario de confirmación si lo vas a usar y te avisaremos de horarios y puntos de recogida más cerca de la fecha.",
    },
    en: {
      pregunta: "Will there be a coach?",
      respuesta:
        "Yes, a complimentary coach service will be available. Let us know on the RSVP form if you would like to use it, and we will share times and pick-up points closer to the date.",
    },
  },
  {
    es: {
      pregunta: "¿Cómo llego de la iglesia a la finca?",
      respuesta: `El banquete es en ${BODA.convite.lugar}, a unos 15-30 minutos en coche según el tráfico. Arriba, junto a la hora, tienes el enlace "¿Cómo llegar?" con la ruta en Google Maps.`,
    },
    en: {
      pregunta: "How do I get from the church to the venue?",
      respuesta: `The reception is at ${BODA.convite.lugar}, around 15–30 minutes away by car depending on traffic. Next to the time at the top you will find the "How to get there?" link with the route on Google Maps.`,
    },
  },
  {
    es: {
      pregunta: "¿Cuál es el código de vestimenta?",
      respuesta: "De etiqueta, formal de día. Tienes todos los detalles en la sección de código de vestimenta.",
    },
    en: {
      pregunta: "What is the dress code?",
      respuesta: "Formal daytime attire. You will find all the details in the dress code section.",
    },
  },
  {
    es: {
      pregunta: "Tengo alergias o una dieta especial, ¿qué hago?",
      respuesta:
        "Cuéntanoslo en el formulario de confirmación, en el apartado de alergias, y nos encargamos de que el menú se adapte a ti.",
    },
    en: {
      pregunta: "I have allergies or a special diet. What should I do?",
      respuesta:
        "Let us know on the RSVP form, in the allergies section, and we will make sure the menu is adapted for you.",
    },
  },
  {
    es: {
      pregunta: "¿Puedo ir acompañado?",
      respuesta:
        "La invitación es para las personas que aparecen en ella. Si tienes cualquier duda, escríbenos y lo hablamos.",
    },
    en: {
      pregunta: "May I bring a guest?",
      respuesta:
        "The invitation is for the people named on it. If you have any questions, please write to us and we will be happy to talk it through.",
    },
  },
  {
    es: {
      pregunta: "¿Hasta qué hora durará la fiesta?",
      respuesta: "¡Hasta las 00:00h! Y para volver tranquilo, habrá autobús de regreso.",
    },
    en: {
      pregunta: "What time does the party end?",
      respuesta: "At midnight! And so you can relax, there will be a return coach.",
    },
  },
  {
    es: {
      pregunta: "¿Qué hago si tengo otra duda?",
      respuesta: "Escríbenos por WhatsApp desde los botones de justo aquí arriba y te contestamos encantados.",
    },
    en: {
      pregunta: "What if I have another question?",
      respuesta: "Message us on WhatsApp using the buttons just above, and we will be glad to help.",
    },
  },
];

export default function Faq() {
  const { idioma, t } = useLanguage();

  return (
    <section className="py-20">
      <SectionTitle
        antetitulo={t("Resolvemos tus dudas", "Your questions answered")}
        titulo={t("Preguntas frecuentes", "Frequently asked questions")}
      />

      <div className="mx-auto mt-12 max-w-2xl divide-y divide-linea border-y border-linea">
        {PREGUNTAS.map((item, i) => {
          const { pregunta, respuesta } = item[idioma] ?? item.es;
          return (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg text-carbon transition-colors hover:text-champagne [&::-webkit-details-marker]:hidden">
                {pregunta}
                <span
                  aria-hidden
                  className="shrink-0 text-xl leading-none text-champagne transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 pr-8 text-base leading-relaxed text-grafito">{respuesta}</p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
