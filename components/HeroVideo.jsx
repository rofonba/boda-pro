"use client";

import { useEffect, useState } from "react";

const CLAVE_INTRO = "boda-intro-reproducida";

/**
 * Cabecera del hero: la casa en acuarela, con un vídeo de intro la primera vez.
 *
 * Las dos imágenes (día y noche) se pintan siempre y es el CSS quien decide
 * cuál se ve, a partir de data-theme del <html>. Por eso la casa correcta
 * aparece en el primer fotograma, sin esperar a que React hidrate y sin
 * parpadeo. El vídeo se superpone después, solo si procede.
 *
 * @param {{ isNight: boolean|null }} props isNight es null hasta que se conoce
 *   el tema; mientras lo sea, no se reproduce nada.
 */
export default function HeroVideo({ isNight }) {
  const [reproducirIntro, setReproducirIntro] = useState(false);

  useEffect(() => {
    // isNight === null → el tema aún no se conoce; esperamos.
    if (isNight !== false) return;

    try {
      if (sessionStorage.getItem(CLAVE_INTRO)) return;
      sessionStorage.setItem(CLAVE_INTRO, "1");
    } catch {
      return; // Sin sessionStorage, mejor no reproducir en cada navegación.
    }
    setReproducirIntro(true);
  }, [isNight]);

  return (
    <div className="relative mx-auto mb-12 aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl sm:aspect-[16/10] sm:max-w-3xl">
      <img
        src="/images/house-day.png"
        alt="Ilustración en acuarela de la mansión a la luz del día"
        className="hero-casa hero-casa--dia"
      />
      <img
        src="/images/house-night.png"
        alt=""
        aria-hidden
        className="hero-casa hero-casa--noche"
      />

      {/* Vídeo de intro: se superpone a la imagen y, al acabar, se desmonta
          dejándola a la vista. No hay fundido desde un hueco en blanco. */}
      {reproducirIntro && (
        <video
          src="/videos/video-casa-dia-entrada-boda-pro.mp4"
          autoPlay
          muted
          playsInline
          onEnded={() => setReproducirIntro(false)}
          onError={() => setReproducirIntro(false)}
          className="absolute inset-0 z-10 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
