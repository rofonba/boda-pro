"use client";

import { useState, useRef } from "react";

export default function HeroVideo({ isNight }) {
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef(null);

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  return (
    <div className="relative mx-auto mb-12 aspect-[4/3] w-full max-w-lg overflow-hidden rounded-lg">
      {/* Vídeo: intro cinematográfica (solo en modo día) */}
      {!isNight && !videoEnded && (
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
