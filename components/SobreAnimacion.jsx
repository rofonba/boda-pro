"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./i18n/LanguageProvider";

/**
 * Sobre de apertura para la invitación personalizada.
 *
 * Se superpone a la invitación compacta y, al tocarlo, se abre en 3D y se
 * desvanece. Solo lo monta HomeClient en "modo invitación", así que nunca
 * aparece en la web general (sin ?id=) ni en los paneles.
 *
 * Fases: cerrado → abriendo (sello, solapa y tarjeta) → desvaneciendo → fuera.
 * Con prefers-reduced-motion se salta la apertura y va directo al fundido.
 *
 * El papel del sobre es crema fijo (día y noche): una carta de papel sobre el
 * fondo nocturno azul queda elegante y el texto en tinta siempre se lee.
 */

const PAPEL = "#fdfbf6";
const PAPEL_SOMBRA = "#efe8da";
const PAPEL_INTERIOR = "#e6dcc6";
const TINTA = "#221f1a";
const TINTA_SUAVE = "#6d685d";

const TIEMPOS = {
  apertura: 1100, // ms de la secuencia sello → solapa → tarjeta
  fundido: 600, // ms del fade-out del overlay
};

const claveSesion = (id) => `sobre_abierto_${id}`;

export default function SobreAnimacion({ id, nombre }) {
  const { t } = useLanguage();
  const [fase, setFase] = useState("cerrado");

  // Si ya se abrió en esta sesión (recarga, cambio de idioma…), no se repite.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(claveSesion(id))) setFase("fuera");
    } catch {
      // Sin sessionStorage se muestra igualmente; solo se repetiría al recargar.
    }
  }, [id]);

  // Sin scroll de fondo mientras el sobre esté delante.
  useEffect(() => {
    if (fase === "fuera") return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [fase]);

  const abrir = () => {
    if (fase !== "cerrado") return;
    try {
      sessionStorage.setItem(claveSesion(id), "1");
    } catch {
      // Da igual: el sobre se abre de todos modos.
    }

    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducirMovimiento) {
      setFase("desvaneciendo");
      setTimeout(() => setFase("fuera"), TIEMPOS.fundido);
      return;
    }

    setFase("abriendo");
    setTimeout(() => setFase("desvaneciendo"), TIEMPOS.apertura);
    setTimeout(() => setFase("fuera"), TIEMPOS.apertura + TIEMPOS.fundido);
  };

  if (fase === "fuera") return null;

  const abriendo = fase !== "cerrado";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("Invitación", "Invitation")}
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center bg-marfil px-6 transition-opacity ease-out ${
        fase === "desvaneciendo" ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${TIEMPOS.fundido}ms` }}
    >
      {/* El sobre entero es el botón: vale tocar el papel o el sello */}
      <button
        type="button"
        onClick={abrir}
        disabled={abriendo}
        aria-label={t("Abrir el sobre", "Open the envelope")}
        className="perspective group relative w-full max-w-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-champagne/60 disabled:cursor-default"
      >
        <div className="preserve-3d relative aspect-[4/3] w-full">
          {/* Cuerpo del sobre */}
          <div
            className="absolute inset-0 rounded-md shadow-2xl"
            style={{ backgroundColor: PAPEL_SOMBRA }}
          />

          {/* Tarjeta interior: asoma al abrir */}
          <div
            className="absolute inset-x-6 top-4 bottom-4 rounded-sm border transition-transform ease-out"
            style={{
              backgroundColor: PAPEL,
              borderColor: PAPEL_INTERIOR,
              transform: abriendo ? "translateY(-34px)" : "translateY(0)",
              transitionDuration: "700ms",
              transitionDelay: abriendo ? "350ms" : "0ms",
            }}
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
              <span className="font-script text-3xl" style={{ color: TINTA }}>
                R &amp; C
              </span>
              <span
                className="text-[10px] tracking-luxe uppercase"
                style={{ color: TINTA_SUAVE }}
              >
                15 · 05 · 2027
              </span>
            </div>
          </div>

          {/* Bolsillo delantero: dos solapas laterales y la inferior, en V */}
          <div
            className="absolute inset-0 rounded-b-md"
            style={{
              backgroundColor: PAPEL,
              clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.04)",
            }}
          />

          {/* Nombre del invitado, en el bolsillo delantero */}
          <div className="absolute inset-x-0 bottom-0 flex h-[46%] flex-col items-center justify-center px-6">
            <span className="text-[10px] tracking-luxe uppercase" style={{ color: TINTA_SUAVE }}>
              {t("Para", "For")}:
            </span>
            <span
              className="mt-1 line-clamp-2 font-serif text-xl leading-snug sm:text-2xl"
              style={{ color: TINTA }}
            >
              {nombre}
            </span>
          </div>

          {/* Solapa superior: gira hacia atrás en 3D desde el borde superior */}
          <div
            className="absolute inset-x-0 top-0 h-[55%] origin-top transition-transform ease-in-out"
            style={{
              backgroundColor: abriendo ? PAPEL_INTERIOR : PAPEL_SOMBRA,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transform: abriendo ? "rotateX(180deg)" : "rotateX(0deg)",
              transitionDuration: "800ms",
              transitionDelay: abriendo ? "200ms" : "0ms",
              transformStyle: "preserve-3d",
              zIndex: abriendo ? 0 : 2,
            }}
          />

          {/* Sello de lacre con las iniciales */}
          <div
            className="absolute left-1/2 top-[52%] z-[3] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-oro/60 bg-champagne font-serif text-base tracking-widest text-marfil shadow-[0_4px_14px_-4px_rgba(0,0,0,0.45)] transition-all ease-out group-hover:scale-105"
            style={{
              opacity: abriendo ? 0 : 1,
              transform: `translate(-50%, -50%) scale(${abriendo ? 0.7 : 1})`,
              transitionDuration: "350ms",
              boxShadow:
                "inset 0 0 0 3px rgba(253,251,246,0.35), 0 4px 14px -4px rgba(0,0,0,0.45)",
            }}
          >
            C &amp; R
          </div>
        </div>
      </button>

      <p
        className={`mt-10 text-xs tracking-luxe text-grafito uppercase transition-opacity duration-300 ${
          abriendo ? "opacity-0" : "animate-pulse opacity-100"
        }`}
      >
        {t("Toca el sobre para abrir", "Tap the envelope to open")}
      </p>
    </div>
  );
}
