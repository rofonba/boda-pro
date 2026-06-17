"use client";

import { BODA } from "@/lib/event";
import RsvpForm from "./RsvpForm";
import GiftSection from "./GiftSection";
import Countdown from "./Countdown";
import LocationCard from "./LocationCard";
import ParkingInfo from "./ParkingInfo";
import HeroVideo from "./HeroVideo";
import Timeline from "./Timeline";
import { useTheme } from "./theme/ThemeProvider";

/* Generador de saludo personalizado elegante */
function generarSaludo(guest) {
  if (!guest?.nombres) {
    return "Tenemos el honor de invitarte a celebrar nuestro día más especial";
  }

  const verbo = guest.esPareja ? "Nos gustaría" : "Queremos";
  const pronombre = guest.esPareja ? "que forméis" : "que formes";
  return `${guest.nombres}, ${verbo} que ${pronombre} parte de nuestro día más especial`;
}

/* Pequeño separador con rombo dorado centrado */
function Separador() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <span className="h-px w-16 bg-linea" />
      <span className="rotate-45 text-champagne text-xs">◆</span>
      <span className="h-px w-16 bg-linea" />
    </div>
  );
}

export default function Invitation({ guest }) {
  const { isNight } = useTheme();
  const saludo = generarSaludo(guest);

  return (
    <main className="mx-auto w-full max-w-4xl px-3 sm:px-6 pb-24">
      {/* Timeline lateral (scroll-spy) */}
      <Timeline />

      {/* ── PORTADA (HERO ZOOM-IN) ── */}
      <section className="flex min-h-[100vh] flex-col items-center justify-center pt-8 sm:pt-12 text-center" data-timeline-section>
        {/* Vídeo hero: intro cinematográfica + imagen estática (ZOOM-IN CERCANO) */}
        <HeroVideo isNight={isNight} />

        <span className="text-[11px] tracking-luxe text-grafito uppercase">
          {BODA.fecha.dia} · {BODA.fecha.largo}
        </span>

        <h1 className="mt-6 font-script text-7xl leading-[0.9] text-carbon sm:text-8xl">
          {BODA.novios.nombres.split("&")[0].trim()}
        </h1>
        <span className="my-1 font-script text-4xl text-champagne sm:text-5xl">
          &amp;
        </span>
        <h1 className="font-script text-7xl leading-[0.9] text-carbon sm:text-8xl">
          {BODA.novios.nombres.split("&")[1]?.trim()}
        </h1>

        <div className="mt-12">
          <Separador />
        </div>

        <p className="mt-6 max-w-md font-serif text-xl italic leading-relaxed text-carbon">
          {saludo}.
        </p>
      </section>

      {/* ── CUENTA ATRÁS ── */}
      <Separador />
      <Countdown />
      <Separador />

      {/* ── DETALLES DEL EVENTO ── */}
      <section className="py-20" data-timeline-section>
        <h2 className="text-center text-[11px] tracking-luxe text-grafito uppercase">
          La celebración
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <LocationCard data={BODA.ceremonia} />
          <LocationCard data={BODA.convite} />
        </div>
      </section>

      <Separador />

      {/* ── INFORMACIÓN DE ESTACIONAMIENTO (Iglesia) ── */}
      <ParkingInfo />

      <Separador />

      {/* ── CONFIRMACIÓN ── */}
      <section id="confirmacion" className="py-16" data-timeline-section>
        <RsvpForm guest={guest} />
      </section>

      <Separador />

      {/* ── REGALO ── */}
      <section data-timeline-section>
        <GiftSection />
      </section>

      <footer className="mt-20 text-center">
        <div className="font-serif text-2xl text-carbon">
          {BODA.novios.monograma}
        </div>
        <p className="mt-3 text-[11px] tracking-luxe text-grafito uppercase">
          {BODA.fecha.largo}
        </p>
      </footer>
    </main>
  );
}
