"use client";

import { BODA } from "@/lib/event";
import GuestGreeting from "./GuestGreeting";
import RsvpFormComplete from "./RsvpFormComplete";
import KeyInfo from "./KeyInfo";
import WhatsAppContact from "./WhatsAppContact";
import GiftSection from "./GiftSection";
import { useLanguage } from "./i18n/LanguageProvider";

// Separador elegante (el mismo que en la web completa)
function Separator() {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <span className="h-px w-12 bg-linea" />
      <span className="rotate-45 text-sm text-champagne">◆</span>
      <span className="h-px w-12 bg-linea" />
    </div>
  );
}

/**
 * "Modo invitación": lo que ve un invitado al entrar por su enlace personal.
 *
 * Vista limpia y enfocada, sin menú ni monograma: saludo, formulario de
 * confirmación, resumen de fecha y lugares, contacto, regalo y un botón para
 * pasar a la web completa. El cambio de vista lo gestiona HomeClient (estado
 * `modo`). Contacto y regalo son los mismos componentes de la web completa:
 * mismos datos (lib/event.js) y mismo estilo.
 *
 * @param {{ onVerTodo: () => void }} props
 */
export default function InvitacionCompacta({ onVerTodo }) {
  const { t } = useLanguage();
  return (
    <main className="mx-auto w-full max-w-4xl px-3 pb-24 pt-10 sm:px-6 sm:pt-16">
      {/* Cabecera breve: monograma y fecha, para situar al invitado */}
      <header className="text-center">
        <div className="font-script text-5xl text-carbon">{BODA.novios.monograma}</div>
        <p className="mt-3 text-xs tracking-luxe text-grafito uppercase">
          {t(`${BODA.fecha.dia} · ${BODA.fecha.largo}`, BODA.fecha.en)}
        </p>
      </header>

      {/* Bienvenida (saludo dinámico con los nombres del grupo) */}
      <GuestGreeting />

      <Separator />

      {/* 1. Confirmación de asistencia */}
      <RsvpFormComplete />

      <Separator />

      {/* 2. Información de la boda: fecha, calendario, lugares y cómo llegar */}
      <KeyInfo />

      <Separator />

      {/* 3. Contacto (teléfonos de lib/event.js) */}
      <WhatsAppContact />

      <Separator />

      {/* 4. Regalo / luna de miel (IBAN de lib/event.js) */}
      <GiftSection />

      {/* Pasar a la web completa */}
      <div className="mt-12 flex flex-col items-center gap-6 text-center">
        <button
          type="button"
          onClick={onVerTodo}
          className="w-full max-w-md rounded-full border border-champagne bg-champagne px-6 py-5 text-sm font-semibold tracking-luxe text-marfil uppercase shadow-lg transition-all hover:bg-oro hover:shadow-xl active:scale-[0.99]"
        >
          {t("Ver todos los detalles de la boda", "See all the wedding details")}
        </button>
        <p className="max-w-md text-base text-grafito">
          {t(
            "Cronograma del día, mapa, parkings, código de vestimenta y preguntas frecuentes.",
            "Schedule of the day, map, parking, dress code and frequently asked questions."
          )}
        </p>
      </div>

      <footer className="mt-20 text-center">
        <div className="font-script text-4xl text-carbon">{BODA.novios.monograma}</div>
        <p className="mt-3 text-xs tracking-luxe text-grafito uppercase">
          {t(BODA.fecha.largo, "15 May 2027")}
        </p>
      </footer>
    </main>
  );
}
