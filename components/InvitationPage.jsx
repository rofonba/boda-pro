"use client";

import { BODA } from "@/lib/event";
import HeroVideo from "./HeroVideo";
import GuestGreeting from "./GuestGreeting";
import LocationCard from "./LocationCard";
import ParkingInfo from "./ParkingInfo";
import RsvpFormComplete from "./RsvpFormComplete";
import GiftSection from "./GiftSection";
import Countdown from "./Countdown";
import { useTheme } from "./theme/ThemeProvider";

// Separador elegante
function Separator() {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <span className="h-px w-12 bg-linea" />
      <span className="rotate-45 text-xs text-champagne">◆</span>
      <span className="h-px w-12 bg-linea" />
    </div>
  );
}

export default function InvitationPage({ guestId }) {
  const { isNight } = useTheme();

  return (
    <main className="mx-auto w-full max-w-4xl px-3 sm:px-6 pb-24">
      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 1: HERO - Mansión + Presentación */}
      {/* ─────────────────────────────────────────── */}
      <section className="flex min-h-[100vh] flex-col items-center justify-center pt-8 sm:pt-12 text-center">
        {/* Vídeo hero: intro cinematográfica */}
        <HeroVideo isNight={isNight} />

        {/* Presentación de los novios */}
        <div className="mt-12">
          <span className="text-[11px] tracking-luxe text-grafito uppercase">
            {BODA.fecha.dia} · {BODA.fecha.largo}
          </span>

          <h1 className="mt-6 font-script text-7xl leading-[0.9] text-carbon sm:text-8xl">
            {BODA.novios.nombres.split("&")[0].trim()}
          </h1>
          <span className="my-2 font-script text-4xl text-champagne sm:text-5xl">
            &amp;
          </span>
          <h1 className="font-script text-7xl leading-[0.9] text-carbon sm:text-8xl">
            {BODA.novios.nombres.split("&")[1]?.trim()}
          </h1>
        </div>
      </section>

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 2: Bienvenida personalizada */}
      {/* ─────────────────────────────────────────── */}
      <GuestGreeting guestId={guestId} />

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 3: Countdown */}
      {/* ─────────────────────────────────────────── */}
      <Countdown />

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 4: Información - Ubicaciones */}
      {/* ─────────────────────────────────────────── */}
      <section className="py-20">
        <h2 className="text-center text-[11px] tracking-luxe text-grafito uppercase">
          La celebración
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <LocationCard data={BODA.ceremonia} />
          <LocationCard data={BODA.convite} />
        </div>
      </section>

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 5: Logística - Parkings */}
      {/* ─────────────────────────────────────────── */}
      <ParkingInfo />

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 6: RSVP - Formulario completo */}
      {/* ─────────────────────────────────────────── */}
      <RsvpFormComplete guestId={guestId} />

      <Separator />

      {/* ─────────────────────────────────────────── */}
      {/* SECCIÓN 7: Regalo - Detalles bancarios */}
      {/* ─────────────────────────────────────────── */}
      <GiftSection />

      {/* ─────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ─────────────────────────────────────────── */}
      <footer className="mt-20 text-center">
        <div className="font-serif text-2xl text-carbon">{BODA.novios.monograma}</div>
        <p className="mt-3 text-[11px] tracking-luxe text-grafito uppercase">
          {BODA.fecha.largo}
        </p>
      </footer>
    </main>
  );
}
