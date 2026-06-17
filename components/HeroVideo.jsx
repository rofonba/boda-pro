"use client";

import { useState, useRef, useEffect } from "react";

const INTRO_SESSION_KEY = "boda-intro-played";

export default function HeroVideo({ isNight }) {
  const [videoEnded, setVideoEnded] = useState(false);
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);
  const videoRef = useRef(null);

  // Solo reproduce el vídeo la primera vez que el usuario carga la página en esta sesión
  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem(INTRO_SESSION_KEY);
    if (!hasPlayedIntro && !isNight) {
      setShouldPlayVideo(true);
      sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    } else {
      // Si ya se reprodujo o estamos en noche, mostrar imagen directamente
      setVideoEnded(true);
    }
  }, [isNight]);

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  return (
    <div className="relative mx-auto mb-8 sm:mb-12 aspect-[3/4] sm:aspect-[4/3] w-full max-w-md sm:max-w-2xl overflow-hidden rounded-xl shadow-2xl">
      {/* Vídeo: intro cinematográfica (solo primera vez en modo día) */}
      {!isNight && shouldPlayVideo && !videoEnded && (
        <video
          ref={videoRef}
          src="/videos/video-casa-dia-entrada-boda-pro.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded}
          className="h-full w-full object-cover transition-opacity duration-1000"
        />
      )}

      {/* Crossfade a imagen estática cuando vídeo termina */}
      <img
        src="/images/house-day.png"
        alt="Ilustración en acuarela de la mansión a la luz del día"
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out ${
          isNight ? "opacity-0" : videoEnded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Imagen noche: aparece directamente en modo noche */}
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
