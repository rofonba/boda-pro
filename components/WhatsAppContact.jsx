import { BODA } from "@/lib/event";
import SectionTitle from "./SectionTitle";

/** Logotipo de WhatsApp en trazo fino. */
function IconoWhatsApp() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4Z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a5 5 0 0 1-2.8-2.8l.8-1-1-2Z" />
    </svg>
  );
}

/** "34699797624" → "+34 699 797 624" */
function formatearTelefono(telefono) {
  return `+${telefono.slice(0, 2)} ${telefono.slice(2).replace(/(\d{3})(?=\d)/g, "$1 ")}`;
}

/** Enlace wa.me que abre el chat con un mensaje ya escrito. */
function urlWhatsApp({ nombre, telefono }) {
  const texto = `¡Hola ${nombre}! Tengo una duda sobre la boda.`;
  return `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
}

export default function WhatsAppContact() {
  return (
    <section className="py-20">
      <SectionTitle antetitulo="¿Alguna duda?" titulo="Escríbenos" />

      <p className="mx-auto mt-8 max-w-md text-center font-serif text-lg italic leading-relaxed text-carbon">
        Si te queda cualquier pregunta, escríbenos directamente por WhatsApp.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        {BODA.contacto.map((persona) => (
          <a
            key={persona.telefono}
            href={urlWhatsApp(persona)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-56 items-center justify-center gap-3 rounded-full border border-champagne bg-champagne/5 px-6 py-3 text-champagne transition-all hover:bg-champagne/15 hover:shadow-md"
          >
            <IconoWhatsApp />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[11px] tracking-luxe uppercase">{persona.nombre}</span>
              <span className="mt-1 text-xs tracking-wide text-grafito">
                {formatearTelefono(persona.telefono)}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
