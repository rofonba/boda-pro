"use client";

import { BODA } from "@/lib/event";
import HeroVideo from "./HeroVideo";
import GuestGreeting from "./GuestGreeting";
import ParkingInfo from "./ParkingInfo";
import RsvpFormComplete from "./RsvpFormComplete";
import GiftSection from "./GiftSection";
import Countdown from "./Countdown";
import DressCode from "./DressCode";
import Faq from "./Faq";
import KeyInfo from "./KeyInfo";
import NavDrawer from "./NavDrawer";
import HowToGetThere from "./HowToGetThere";
import WhatsAppContact from "./WhatsAppContact";
import { useTheme } from "./theme/ThemeProvider";

// Monograma R&C fijo en la parte superior, a juego con el botón de tema.
// Al pulsarlo vuelve al principio de la invitación.
function Monograma() {
  const [inicialA, inicialB] = BODA.novios.monograma.split("&");

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
      <a
        href="#"
        aria-label={`${BODA.novios.nombres} · volver al inicio`}
        className="pointer-events-auto flex h-14 items-baseline justify-center gap-0.5 rounded-full border border-champagne/45 bg-white/[0.06] px-5 pt-2 font-script text-3xl leading-none text-carbon shadow-[0_2px_14px_-6px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-transform hover:scale-105"
      >
        <span>{inicialA}</span>
        <span className="text-xl text-champagne">&amp;</span>
        <span>{inicialB}</span>
      </a>
    </div>
  );
}

// Separador elegante
function Separator() {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <span className="h-px w-12 bg-linea" />
      <span className="rotate-45 text-sm text-champagne">◆</span>
      <span className="h-px w-12 bg-linea" />
    </div>
  );
}

export default function InvitationPage() {
  const { isNight } = useTheme();

  return (
    <main className="mx-auto w-full max-w-4xl px-3 sm:px-6 pb-24">
      <NavDrawer />
      <Monograma />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 1: HERO - Mansión + Presentación */}
      {/* ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center pt-8 sm:pt-12 text-center">
        {/* Presentación de los novios */}
        <div className="mt-12">
          <span className="text-xs tracking-luxe text-grafito uppercase">
            {BODA.fecha.dia} · {BODA.fecha.largo}
          </span>

          <h1 className="mt-6 font-script text-6xl leading-[0.9] text-carbon sm:text-8xl">
            {BODA.novios.nombres.split("&")[0].trim()}
          </h1>
          <span className="my-2 font-script text-4xl text-champagne sm:text-5xl">
            &amp;
          </span>
          <h1 className="font-script text-6xl leading-[0.9] text-carbon sm:text-8xl">
            {BODA.novios.nombres.split("&")[1]?.trim()}
          </h1>
        </div>
      </section>

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 1b: Bienvenida (genérica o personalizada) */}
      {/* ─────────────────────────────────────────── */}
      <GuestGreeting />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 1c: Resumen de datos clave (fecha, ceremonia, banquete) */}
      {/* ─────────────────────────────────────────── */}
      <KeyInfo />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 1d: Ilustración de la finca (y vídeo de intro) */}
      {/* ─────────────────────────────────────────── */}
      <div className="mt-4">
        <HeroVideo isNight={isNight} />
      </div>

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 3: Countdown */}
      {/* ─────────────────────────────────────────── */}
      <Countdown />

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 4b: Cómo llegar - Mapa ilustrado */}
      {/* ─────────────────────────────────────────── */}
      <HowToGetThere />
      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 5: Logística - Parkings */}
      {/* ─────────────────────────────────────────── */}
      <ParkingInfo />

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 6: Código de vestimenta */}
      {/* ─────────────────────────────────────────── */}
      <DressCode />

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 7: RSVP - Formulario completo */}
      {/* ─────────────────────────────────────────── */}
      <RsvpFormComplete />

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 8: Regalo - Detalles bancarios */}
      {/* ─────────────────────────────────────────── */}
      <GiftSection />

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 9: Contacto por WhatsApp */}
      {/* ─────────────────────────────────────────── */}
      <WhatsAppContact />

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 10: Preguntas frecuentes */}
      {/* ─────────────────────────────────────────── */}
      <Faq />

      {/* ─────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ─────────────────────────────────────────── */}
      <footer className="mt-20 text-center">
        <div className="font-script text-4xl text-carbon">{BODA.novios.monograma}</div>
        <p className="mt-3 text-xs tracking-luxe text-grafito uppercase">
          {BODA.fecha.largo}
        </p>
      </footer>
    </main>
  );
}
