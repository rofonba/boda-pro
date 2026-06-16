"use client";

import { useEffect, useRef } from "react";

// Fondo dinámico de vídeo: transición día/noche sin bloquear navegación
export default function VideoTransitionOverlay({
  videoSrc,
  isPlaying,
  onComplete,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (onComplete) onComplete();
    };

    video.addEventListener("ended", handleEnded);

    if (isPlaying) {
      video.currentTime = 0;
      video.play();
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [isPlaying, onComplete]);

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      muted
      playsInline
      className={`fixed inset-0 -z-10 h-full w-full object-cover transition-opacity duration-700 ${
        isPlaying ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    />
  );
}
