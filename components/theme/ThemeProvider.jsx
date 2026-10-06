"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ThemeToggle from "./ThemeToggle";

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
 *  • Quién CAMBIA el tema: este provider, al pulsar el interruptor. El cambio
 *    es inmediato; si el navegador soporta View Transitions, la página entera
 *    funde de un tema al otro en un solo paso (fondo, textos y casa a la vez).
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

  const toggle = useCallback(() => {
    // Se lee del DOM y no del estado para no depender de un render pendiente.
    const noche = document.documentElement.dataset.theme !== "night";
    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reducirMovimiento) {
      aplicar(noche);
      return;
    }
    document.startViewTransition(() => aplicar(noche));
  }, [aplicar]);

  const valor = useMemo(
    () => ({ isNight, temaListo: isNight !== null, toggle }),
    [isNight, toggle]
  );

  return (
    <ThemeContext.Provider value={valor}>
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
