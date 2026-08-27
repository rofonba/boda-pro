"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";

/* Iconos finos con acabado dorado (stroke = currentColor del champagne) */
function IconoSol() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
    </svg>
  );
}

function IconoLuna() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { toggle, enTransicion } = useTheme();
  const [girando, setGirando] = useState(false);

  const alPulsar = () => {
    setGirando(true);
    toggle();
    setTimeout(() => setGirando(false), 600);
  };

  return (
    <button
      type="button"
      onClick={alPulsar}
      disabled={enTransicion}
      // La etiqueta no depende del tema a propósito: si dependiera, el servidor
      // y el navegador podrían renderizar textos distintos y React avisaría de
      // un desajuste de hidratación.
      aria-label="Cambiar entre modo día y modo noche"
      title="Cambiar entre modo día y modo noche"
      className="fixed right-5 top-5 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-champagne/45 bg-white/[0.06] text-champagne shadow-[0_2px_14px_-6px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-transform duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 active:scale-95 disabled:opacity-60"
      style={{ transform: girando ? "rotate(180deg) scale(0.8)" : undefined }}
    >
      {/* Se pintan los dos iconos y el CSS muestra el que toca según
          data-theme. Así el icono correcto aparece en el primer fotograma,
          sin esperar a que React hidrate. */}
      <span className="solo-de-dia">
        <IconoLuna />
      </span>
      <span className="solo-de-noche">
        <IconoSol />
      </span>
    </button>
  );
}
