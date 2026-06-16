"use client";

import { createContext, useContext, useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import VideoTransitionOverlay from "../VideoTransitionOverlay";

// Estado global del tema (Día / Noche) compartido por toda la app.
const ThemeContext = createContext({
  isNight: false,
  setIsNight: () => {},
  toggle: () => {},
  isPlayingTransition: false,
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const [isNight, setIsNight] = useState(false);
  const [isPlayingTransition, setIsPlayingTransition] = useState(false);

  // Recordar la preferencia entre visitas.
  useEffect(() => {
    try {
      if (localStorage.getItem("boda-tema") === "night") setIsNight(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("boda-tema", isNight ? "night" : "day");
    } catch {}
  }, [isNight]);

  const toggle = () => {
    setIsPlayingTransition(true);
  };

  const handleTransitionComplete = () => {
    // Cambiar tema mientras el vídeo está en el último frame
    setIsNight((v) => !v);
    // Desvanecerse el vídeo después de que el tema cambió
    setTimeout(() => setIsPlayingTransition(false), 300);
  };

  return (
    <ThemeContext.Provider value={{ isNight, setIsNight, toggle, isPlayingTransition }}>
      {/* Fondo dinámico de vídeo (-z-10, no bloquea interacción) */}
      <VideoTransitionOverlay
        videoSrc="/videos/video-transicion-casa-boda-pro.mp4"
        isPlaying={isPlayingTransition}
        onComplete={handleTransitionComplete}
      />

      <div
        data-theme={isNight ? "night" : "day"}
        className="bg-paper relative flex min-h-screen flex-1 flex-col transition-colors duration-700"
        style={{ backgroundColor: "var(--color-marfil)" }}
      >
        {/* Destellos / estrellas: solo de noche, se desvanecen suavemente */}
        <div
          aria-hidden
          className={`starfield pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            isNight ? "opacity-100" : "opacity-0"
          }`}
        />

        <ThemeToggle isLoading={isPlayingTransition} />

        {/* Contenido por encima del fondo y las estrellas */}
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}
