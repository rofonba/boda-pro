"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import VideoTransitionOverlay from "../VideoTransitionOverlay";

const CLAVE_TEMA = "boda-tema";

/**
 * Estado global del tema Día / Noche.
 *
 * Reparto de responsabilidades, y es la clave de que no haya parpadeo:
 *
 *  • Quién PINTA el tema: el CSS, a partir del atributo data-theme del <html>.
 *    Ese atributo lo pone un script síncrono del <head> (ver app/layout.js)
 *    antes del primer pintado.
 *
 *  • Quién CAMBIA el tema: este provider, al pulsar el interruptor.
 *
 * React nunca decide los colores del primer render, así que no puede haber
 * destello del tema contrario ni desajuste de hidratación.
 *
 * `isNight` empieza como null ("todavía no lo sé") y se resuelve al montar,
 * leyéndolo del DOM. Los componentes que dependen de él (el vídeo de intro)
 * esperan a que deje de ser null en lugar de asumir modo día.
 */
const ThemeContext = createContext(null);

export function useTheme() {
  const contexto = useContext(ThemeContext);
  if (!contexto) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return contexto;
}

export default function ThemeProvider({ children }) {
  const [isNight, setIsNight] = useState(null);
  const [enTransicion, setEnTransicion] = useState(false);

  // Al montar, leemos el tema que el script del <head> ya dejó aplicado.
  useEffect(() => {
    setIsNight(document.documentElement.dataset.theme === "night");
  }, []);

  const aplicar = useCallback((noche) => {
    document.documentElement.dataset.theme = noche ? "night" : "day";
    try {
      localStorage.setItem(CLAVE_TEMA, noche ? "night" : "day");
    } catch {
      // Navegación privada o almacenamiento bloqueado: el tema funciona igual
      // durante la visita, simplemente no se recuerda para la próxima.
    }
    setIsNight(noche);
  }, []);

  // El interruptor lanza el vídeo de transición; el tema cambia al terminar.
  const toggle = useCallback(() => setEnTransicion(true), []);

  const alTerminarTransicion = useCallback(() => {
    aplicar(!isNight);
    // Pequeña espera para que el vídeo se desvanezca ya sobre el tema nuevo.
    setTimeout(() => setEnTransicion(false), 300);
  }, [aplicar, isNight]);

  const valor = useMemo(
    () => ({ isNight, temaListo: isNight !== null, toggle, enTransicion }),
    [isNight, toggle, enTransicion]
  );

  return (
    <ThemeContext.Provider value={valor}>
      <VideoTransitionOverlay
        videoSrc="/videos/video-transicion-casa-boda-pro.mp4"
        isPlaying={enTransicion}
        onComplete={alTerminarTransicion}
      />

      <div className="bg-paper relative flex min-h-screen flex-1 flex-col">
        {/* Estrellas del modo noche. Su visibilidad la controla el CSS mediante
            data-theme, no React, para que no parpadeen al cargar. */}
        <div aria-hidden className="starfield pointer-events-none absolute inset-0" />

        <ThemeToggle />

        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}
