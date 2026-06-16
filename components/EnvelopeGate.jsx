"use client";

import { useEffect, useState } from "react";
import VideoTransitionOverlay from "./VideoTransitionOverlay";

// Colores FIJOS del sobre: la "carta" se mantiene crema en día y noche
// (una carta de papel crema sobre el fondo nocturno azul resulta elegante).
const CREMA = "#fdfbf6";
const HUESO = "#efe8da";
const TINTA = "#221f1a";
const TINTA_SUAVE = "#6d685d";

/*
  EnvelopeGate — "efecto sobre" de alta gama.

  Secuencia:
   1. Sobre cerrado, vertical, centrado, con el lacre (monograma) como botón.
   2. Al pulsar el lacre, la solapa superior gira en el eje X (transición 3D).
   3. Dispara el vídeo de entrada (POV pasando por la mansión).
   4. El vídeo completo, el sobre se desliza hacia arriba revelando la invitación.

  Velocidades pensadas para sentirse fluidas; ajustables abajo en TIEMPOS.
*/

const TIEMPOS = {
  solapa: 950, // ms que tarda la solapa en abrirse
  esperaAntesDeVideo: 700, // ms tras abrir antes de iniciar video
  video: 6500, // ms aproximado del vídeo (se completa naturalmente)
  subida: 1200, // ms que tarda el sobre en subir
};

const CLAVE_SESION = "boda-sobre-abierto";

export default function EnvelopeGate({ monograma = "R&C", nombres, children }) {
  const [abierto, setAbierto] = useState(false); // solapa abierta
  const [videoPlaying, setVideoPlaying] = useState(false); // vídeo reproduciéndose
  const [subido, setSubido] = useState(false); // telón levantado
  const [fuera, setFuera] = useState(false); // desmontado del DOM

  // Si ya se abrió en esta sesión, no repetimos la animación.
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(CLAVE_SESION)) {
      setFuera(true);
    }
  }, []);

  function abrir() {
    if (abierto) return;
    setAbierto(true);
    try {
      sessionStorage.setItem(CLAVE_SESION, "1");
    } catch {}

    // Iniciamos el vídeo después de que se abra la solapa
    const tiempoVideo = TIEMPOS.solapa + TIEMPOS.esperaAntesDeVideo;
    setTimeout(() => setVideoPlaying(true), tiempoVideo);

    // Levantamos el telón después de que termine el vídeo
    const tiempoSubida = tiempoVideo + TIEMPOS.video;
    setTimeout(() => setSubido(true), tiempoSubida);
    setTimeout(() => setFuera(true), tiempoSubida + TIEMPOS.subida);
  }

  function handleVideoComplete() {
    // El vídeo terminó, puedes hacer algo aquí si lo necesitas
    // (ya manejamos la subida con setTimeout)
  }

  return (
    <>
      {/* Overlay de vídeo: entrada inmersiva */}
      <VideoTransitionOverlay
        videoSrc="/videos/video-casa-dia-entrada-boda-pro.mp4"
        isPlaying={videoPlaying}
        onComplete={handleVideoComplete}
        title="Avanzando hacia la mansión…"
      />

      {/* La invitación vive debajo del sobre y se revela al subir el telón */}
      {children}

      {!fuera && (
        <div
          aria-hidden={subido}
          className="bg-paper fixed inset-0 z-50 flex items-center justify-center px-6 transition-[transform,opacity] ease-[cubic-bezier(0.76,0,0.24,1)]"
          style={{
            backgroundColor: "var(--color-marfil)",
            transitionDuration: `${TIEMPOS.subida}ms`,
            transform: subido ? "translateY(-105%)" : "translateY(0)",
            opacity: subido ? 0 : 1,
          }}
        >
          {/* Filete decorativo de fondo */}
          <div className="pointer-events-none absolute inset-6 border border-linea/70" />

          <div className="perspective relative">
            {/* ── EL SOBRE ── */}
            <div className="preserve-3d relative h-[460px] w-[78vw] max-w-[340px]">
              {/* Forro interior del sobre */}
              <div
                className="absolute inset-0 rounded-[2px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5"
                style={{ backgroundColor: CREMA }}
              />

              {/* Tarjeta interior (teaser) que asoma dentro del sobre */}
              <div
                className="absolute inset-x-5 top-6 bottom-20 flex flex-col items-center justify-center rounded-[2px] text-center shadow-sm ring-1 ring-black/5 transition-transform duration-700"
                style={{
                  backgroundColor: "#ffffff",
                  transform: abierto ? "translateY(-10px)" : "none",
                }}
              >
                <span
                  className="font-serif text-xs tracking-luxe uppercase"
                  style={{ color: TINTA_SUAVE }}
                >
                  Nos casamos
                </span>
                <div
                  className="my-4 font-script text-5xl"
                  style={{ color: TINTA }}
                >
                  {monograma}
                </div>
                <span className="h-px w-10 bg-champagne" />
                <span
                  className="mt-4 font-serif text-sm italic"
                  style={{ color: TINTA_SUAVE }}
                >
                  15 · 05 · 2027
                </span>
              </div>

              {/* Bolsillo frontal del sobre (tapa la parte baja de la tarjeta) */}
              <div
                className="absolute inset-x-0 bottom-0 z-20 h-[58%] rounded-b-[2px] ring-1 ring-black/5"
                style={{
                  backgroundColor: HUESO,
                  clipPath: "polygon(0 22%, 50% 0, 100% 22%, 100% 100%, 0 100%)",
                }}
              />

              {/* Solapa superior — gira en el eje X al abrir */}
              <div
                className="backface-hidden absolute inset-x-0 top-0 z-30 h-[52%] origin-top transition-transform ease-[cubic-bezier(0.6,0.01,0.2,1)]"
                style={{
                  transitionDuration: `${TIEMPOS.solapa}ms`,
                  transform: abierto
                    ? "rotateX(-172deg)"
                    : "rotateX(0deg)",
                  background:
                    "linear-gradient(160deg, #f3ecdd 0%, #efe8da 60%, #e8dfcc 100%)",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  boxShadow: abierto ? "none" : "0 8px 14px -10px rgba(42,39,34,0.4)",
                }}
              >
                {/* Filete dorado en el borde de la solapa */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background:
                      "linear-gradient(160deg, transparent 78%, rgba(200,170,110,0.35) 100%)",
                  }}
                />
              </div>

              {/* Lacre / sello — botón de apertura */}
              <button
                type="button"
                onClick={abrir}
                aria-label="Abrir la invitación"
                className={`absolute left-1/2 top-[44%] z-40 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                  abierto
                    ? "scale-50 opacity-0 pointer-events-none"
                    : "scale-100 opacity-100"
                }`}
              >
                <span className="relative flex h-20 w-20 items-center justify-center">
                  {/* halo sutil que late */}
                  <span className="absolute inset-0 animate-ping rounded-full bg-champagne/20" />
                  <span
                    className="relative flex h-20 w-20 items-center justify-center rounded-full font-serif text-xl shadow-lg ring-1 ring-oro/40"
                    style={{
                      color: "#fbf6ec",
                      background:
                        "radial-gradient(circle at 35% 30%, #d8bd86 0%, #c8aa6e 45%, #b08d52 100%)",
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    {monograma}
                  </span>
                </span>
              </button>
            </div>

            {/* Texto bajo el sobre */}
            <div
              className={`mt-10 text-center transition-opacity duration-500 ${
                abierto ? "opacity-0" : "opacity-100"
              }`}
            >
              {nombres ? (
                <p className="font-serif text-base italic text-carbon">
                  Para {nombres}
                </p>
              ) : null}
              <p className="mt-2 text-[11px] tracking-luxe text-grafito uppercase">
                Toca el sello para abrir
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
