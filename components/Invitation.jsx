"use client";

import { BODA } from "@/lib/event";
import RsvpForm from "./RsvpForm";
import GiftSection from "./GiftSection";
import { useTheme } from "./theme/ThemeProvider";

/* Acuarela de la mansión: crossfade suave entre la versión de día y la de noche.
   Roberto deja los archivos en public/images/house-day.png y house-night.png. */
function HouseWatercolor({ isNight }) {
  return (
    <div className="relative mx-auto mb-12 aspect-[4/3] w-full max-w-lg">
      <img
        src="/images/house-day.png"
        alt="Ilustración en acuarela de la mansión a la luz del día"
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out ${
          isNight ? "opacity-0" : "opacity-100"
        }`}
      />
      <img
        src="/images/house-night.png"
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out ${
          isNight ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
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

function DetalleEvento({ data }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-[11px] tracking-luxe text-champagne uppercase">
        {data.titulo}
      </span>
      <h3 className="mt-3 font-serif text-2xl text-carbon">{data.lugar}</h3>
      {data.ciudad ? (
        <p className="mt-1 text-sm text-grafito">{data.ciudad}</p>
      ) : null}
      {data.hora ? (
        <p className="mt-1 font-serif text-sm italic text-grafito">{data.hora}</p>
      ) : null}
      {data.mapsUrl ? (
        <a
          href={data.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 text-[11px] tracking-luxe text-grafito uppercase underline decoration-champagne/50 underline-offset-4 transition-colors hover:text-carbon"
        >
          Ver mapa
        </a>
      ) : null}
    </div>
  );
}

export default function Invitation({ guest }) {
  const { isNight } = useTheme();

  // Saludo personalizado según el invitado (o genérico si no hay id válido).
  let saludo;
  if (guest?.nombres) {
    saludo = guest.esPareja
      ? `${guest.nombres}, queremos que forméis parte de nuestro día`
      : `${guest.nombres}, queremos que formes parte de nuestro día`;
  } else {
    saludo = "Queremos que formes parte de nuestro día";
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pb-24">
      {/* ── PORTADA ── */}
      <section className="flex min-h-[92vh] flex-col items-center justify-center pt-16 text-center">
        {/* La acuarela de la mansión: el elemento visual rey */}
        <HouseWatercolor isNight={isNight} />

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

      {/* ── DETALLES DEL EVENTO ── */}
      <section className="py-16">
        <h2 className="text-center text-[11px] tracking-luxe text-grafito uppercase">
          La celebración
        </h2>
        <div className="mt-12 grid gap-14 sm:grid-cols-2 sm:gap-8">
          <DetalleEvento data={BODA.ceremonia} />
          <DetalleEvento data={BODA.convite} />
        </div>
      </section>

      <Separador />

      {/* ── CONFIRMACIÓN ── */}
      <section id="confirmacion" className="py-16">
        <RsvpForm guest={guest} />
      </section>

      <Separador />

      {/* ── REGALO ── */}
      <GiftSection />

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
