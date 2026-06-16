"use client";

import { useEffect, useRef, useState } from "react";

// Overlay que controla la reproducción de vídeos de transición (entrada, cambio de tema)
export default function VideoTransitionOverlay({
  videoSrc,
  isPlaying,
  onComplete,
  title = "Cargando experiencia…",
}) {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (onComplete) onComplete();
    };

    const handleCanPlay = () => {
      setIsReady(true);
      if (isPlaying) {
        video.play();
      }
    };

    video.addEventListener("ended", handleEnded);
    video.addEventListener("canplay", handleCanPlay);

    if (isPlaying && isReady) {
      video.play();
    }

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [isPlaying, isReady, onComplete]);

  if (!isPlaying) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black"
      aria-hidden="true"
    >
      {/* Vídeo en pantalla completa */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        className="h-full w-full object-cover"
      />

      {/* Fallback mientras carga */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
          <div className="animate-pulse space-y-4 text-center">
            <div className="h-2 w-32 rounded bg-champagne/30" />
            <div className="h-2 w-24 rounded bg-champagne/20" />
          </div>
          <p className="mt-8 text-sm italic text-champagne/60">{title}</p>
        </div>
      )}
    </div>
  );
}
