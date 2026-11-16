"use client";

import { useLanguage } from "./LanguageProvider";

/**
 * Selector de idioma ES / EN, fijo arriba a la derecha (donde antes estaba
 * el botón de día/noche, con el mismo acabado dorado).
 */
export default function LanguageToggle() {
  const { idioma, idiomas, cambiar } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Idioma"
      className="fixed right-5 top-5 z-[60] flex h-11 items-center gap-1 rounded-full border border-champagne/45 bg-white/[0.06] px-1.5 text-champagne shadow-[0_2px_14px_-6px_rgba(0,0,0,0.35)] backdrop-blur-sm"
    >
      {idiomas.map((codigo) => {
        const activo = codigo === idioma;
        return (
          <button
            key={codigo}
            type="button"
            onClick={() => cambiar(codigo)}
            aria-pressed={activo}
            lang={codigo}
            className={`flex h-8 w-9 items-center justify-center rounded-full text-[11px] font-semibold tracking-widest uppercase transition-all ${
              activo ? "bg-champagne text-marfil shadow-sm" : "hover:bg-champagne/15"
            }`}
          >
            {codigo}
          </button>
        );
      })}
    </div>
  );
}
