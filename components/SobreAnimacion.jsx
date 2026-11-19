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
 * La coreografía de apertura es una sola clase (.sobre-abriendo) que dispara
 * @keyframes sincronizados en globals.css: el compositor del navegador mueve
 * todas las piezas a la vez, sin pasos encadenados. Aquí solo queda un
 * setTimeout final para desmontar y liberar el scroll.
 * Con prefers-reduced-motion se salta la apertura y va directo a un fundido.
 *
 * Construcción (de atrás hacia delante): forro interior → tarjeta → tres
 * pliegues del bolsillo delantero (izquierdo, derecho, inferior) → sombra de
 * la solapa → solapa (con cara trasera propia para el giro 3D) → lacre.
 * El papel es crema fijo (día y noche): una carta de papel sobre el fondo
 * nocturno azul queda elegante y la tinta siempre se lee.
 */

// ── Paleta del papel (fija, independiente del tema) ────────────────────────
const PAPEL = "#fdfbf6";
const PAPEL_SOMBRA = "#f3ecdd";
const PAPEL_PLIEGUE = "#efe6d3";
const TINTA = "#221f1a";
const TINTA_SUAVE = "#6d685d";
const ORO = "#c8aa6e";
const ORO_OSCURO = "#9c7d45";

// ── Tiempos (ms). La duración total debe coincidir con --sobre-duracion ──
const DURACION = 2300; // coreografía completa (globals.css)
const DESMONTAR = 2350; // único setTimeout: desmonta y libera el scroll
const FUNDIDO_REDUCIDO = 400; // con movimiento reducido

// Geometría: la solapa ocupa el 55 % de la altura y su vértice está en el
// centro horizontal. El lacre se centra exactamente en ese punto.
const ALTURA_SOLAPA = 55;

const claveSesion = (id) => `sobre_abierto_${id}`;

// ── Textura de papel de algodón (SVG inline, sin imágenes externas) ─────────
// Ruido fractal iluminado en diagonal: grano fino y verjurado muy sutil. Se
// pinta por encima de cada capa de papel con mezcla "multiply" y poca opacidad.
const TEXTURA_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
    <filter id="p" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" stitchTiles="stitch"/>
      <feDiffuseLighting lighting-color="#ffffff" surfaceScale="1.4" diffuseConstant="1.1">
        <feDistantLight azimuth="45" elevation="62"/>
      </feDiffuseLighting>
    </filter>
    <rect width="100%" height="100%" filter="url(#p)"/>
  </svg>`
);

function Textura({ opacidad = 0.28, className = "" }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 mix-blend-multiply ${className}`}
      style={{
        opacity: opacidad,
        backgroundImage: `url("data:image/svg+xml,${TEXTURA_SVG}")`,
        backgroundSize: "220px 220px",
      }}
    />
  );
}

// ── Sello de lacre 3D (SVG con borde orgánico) ───────────────────────────────
function SelloLacre() {
  return (
    <div
      className="sobre-sello sobre-pieza relative h-[76px] w-[76px]"
      style={{
        filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35)) drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
      }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <defs>
          {/* Oro metálico: luz arriba a la izquierda, sombra abajo a la derecha */}
          <radialGradient id="lacre-oro" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#f1e2bd" />
            <stop offset="35%" stopColor="#d6b97c" />
            <stop offset="75%" stopColor="#b08d52" />
            <stop offset="100%" stopColor="#8a6d3a" />
          </radialGradient>
          <linearGradient id="lacre-aro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7d6134" />
            <stop offset="50%" stopColor="#e8d4a4" />
            <stop offset="100%" stopColor="#7d6134" />
          </linearGradient>
          <clipPath id="lacre-clip">
            <path d="M50 4c9-2 17 2 24 7 7 6 15 11 19 20 3 9-1 18-2 27s3 18-3 25-16 9-25 11-18 5-27 1-13-13-19-21S3 56 4 47s7-17 13-24S41 6 50 4z" />
          </clipPath>
        </defs>

        {/* Cuerpo del lacre: borde irregular, como cera vertida */}
        <path
          d="M50 4c9-2 17 2 24 7 7 6 15 11 19 20 3 9-1 18-2 27s3 18-3 25-16 9-25 11-18 5-27 1-13-13-19-21S3 56 4 47s7-17 13-24S41 6 50 4z"
          fill="url(#lacre-oro)"
        />
        {/* Reborde exterior ligeramente levantado */}
        <path
          d="M50 4c9-2 17 2 24 7 7 6 15 11 19 20 3 9-1 18-2 27s3 18-3 25-16 9-25 11-18 5-27 1-13-13-19-21S3 56 4 47s7-17 13-24S41 6 50 4z"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.2"
        />
        {/* Aro interior en bajorrelieve */}
        <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(70,50,20,0.45)" strokeWidth="2.2" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="url(#lacre-aro)" strokeWidth="1" />
        <circle cx="49.3" cy="49.3" r="30.5" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />

        {/* Iniciales en relieve: sombra, luz y cuerpo */}
        <g fontFamily="var(--font-playfair), serif" fontSize="22" textAnchor="middle" letterSpacing="1">
          <text x="50" y="58.6" fill="rgba(60,42,15,0.55)">C &amp; R</text>
          <text x="49.4" y="57.2" fill="rgba(255,250,235,0.75)">C &amp; R</text>
          <text x="50" y="58" fill="#6f5630">C &amp; R</text>
        </g>

        {/* Brillo especular que recorre el sello en reposo */}
        <g clipPath="url(#lacre-clip)">
          <rect
            className="sello-brillo"
            x="-20"
            y="-10"
            width="34"
            height="120"
            fill="url(#lacre-brillo)"
          />
          <linearGradient id="lacre-brillo" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </g>
      </svg>
    </div>
  );
}

// ── Micro-partículas doradas al romper el lacre ─────────────────────────────
const PARTICULAS = [
  { dx: "-46px", dy: "-38px", delay: 0, size: 4 },
  { dx: "40px", dy: "-44px", delay: 40, size: 3 },
  { dx: "-58px", dy: "6px", delay: 20, size: 3 },
  { dx: "56px", dy: "2px", delay: 60, size: 4 },
  { dx: "-30px", dy: "44px", delay: 30, size: 3 },
  { dx: "28px", dy: "48px", delay: 70, size: 3 },
  { dx: "4px", dy: "-60px", delay: 10, size: 2 },
  { dx: "-8px", dy: "56px", delay: 50, size: 2 },
];

function Particulas() {
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {PARTICULAS.map((p, i) => (
        <span
          key={i}
          className="particula absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            "--dx": p.dx,
            "--dy": p.dy,
            animationDelay: `${p.delay}ms`,
            background: "radial-gradient(circle, #f3e4c0 0%, #c8aa6e 60%, transparent 100%)",
            boxShadow: "0 0 6px rgba(200,170,110,0.9)",
          }}
        />
      ))}
    </span>
  );
}

// ── Componente ──────────────────────────────────────────────────────────────
export default function SobreAnimacion({ id, nombre }) {
  const { t } = useLanguage();
  // "cerrado" → "abriendo" (o "cerrando" con movimiento reducido) → "fuera"
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
      setFase("cerrando");
      setTimeout(() => setFase("fuera"), FUNDIDO_REDUCIDO);
      return;
    }

    // Una sola clase arranca toda la coreografía; un solo temporizador la cierra.
    setFase("abriendo");
    setTimeout(() => setFase("fuera"), DESMONTAR);
  };

  if (fase === "fuera") return null;

  const abriendo = fase === "abriendo";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("Invitación", "Invitation")}
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center px-6 ${
        abriendo ? "sobre-abriendo" : ""
      } ${fase === "cerrando" ? "sobre-cerrando" : ""}`}
    >
      {/* Fondo y viñeta: se funden al final de la coreografía. El sobre y el
          texto van fuera de esta capa para que la tarjeta no herede el fundido. */}
      <div aria-hidden className="sobre-fondo sobre-pieza absolute inset-0 bg-marfil">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.18) 100%)",
          }}
        />
      </div>

      {/* El sobre entero es el botón: vale tocar el papel o el lacre */}
      <button
        type="button"
        onClick={abrir}
        disabled={abriendo}
        aria-label={t("Abrir el sobre", "Open the envelope")}
        className="group relative w-full max-w-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-champagne/60 disabled:cursor-default"
      >
        {/* Escena: da la perspectiva al giro de la solapa. No lleva transform
            propio, así cada pieza (forro, tarjeta, bolsillo, solapa, lacre) es
            hermana de las demás y su z-index decide el orden: la tarjeta puede
            salir de DENTRO del bolsillo y luego pasar por delante. */}
        <div className="relative aspect-[4/3] w-full" style={{ perspective: "1200px" }}>
          {/* a) Forro interior: champán oscuro con textura */}
          <div
            className="sobre-cuerpo sobre-pieza absolute inset-0 overflow-hidden rounded-md"
            style={{
              zIndex: 0,
              background:
                "linear-gradient(160deg, #cdb582 0%, #b89a5e 45%, #a98a4f 100%)",
              boxShadow: "0 30px 50px -22px rgba(0,0,0,0.55), 0 10px 18px -12px rgba(0,0,0,0.35)",
            }}
          >
            <Textura opacidad={0.4} />
            {/* Sombra interior en el fondo del sobre */}
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ boxShadow: "inset 0 14px 24px -12px rgba(0,0,0,0.45)" }}
            />
          </div>

          {/* b) Tarjeta interior: doble filete dorado, monograma y fecha */}
          <div
            className="sobre-tarjeta sobre-pieza absolute inset-x-7 top-5 bottom-5 rounded-[3px]"
            style={{
              backgroundColor: PAPEL,
              zIndex: 1,
              boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.9)",
            }}
          >
            <Textura opacidad={0.22} className="rounded-[inherit]" />
            {/* Doble borde fino dorado */}
            <span
              aria-hidden
              className="absolute inset-2 rounded-[2px]"
              style={{ boxShadow: `0 0 0 1px ${ORO}, inset 0 0 0 1px rgba(200,170,110,0.55)` }}
            />
            <span aria-hidden className="absolute inset-[13px] rounded-[1px]" style={{ boxShadow: `0 0 0 0.5px ${ORO_OSCURO}` }} />
            <div className="relative flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <span
                className="font-serif text-3xl tracking-wide"
                style={{ color: TINTA, textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}
              >
                C &amp; R
              </span>
              <span className="h-px w-10" style={{ backgroundColor: ORO }} />
              <span className="text-[10px] tracking-luxe uppercase" style={{ color: TINTA_SUAVE }}>
                15 · 05 · 2027
              </span>
            </div>
          </div>

          {/* c) Bolsillo delantero: pliegues izquierdo, derecho e inferior */}
          <div className="sobre-cuerpo sobre-pieza absolute inset-0" style={{ zIndex: 2 }}>
            {/* Pliegue izquierdo */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: `polygon(0 0, 50% ${ALTURA_SOLAPA - 3}%, 0 100%)`,
                background: `linear-gradient(100deg, ${PAPEL} 0%, ${PAPEL_SOMBRA} 100%)`,
                filter: "drop-shadow(1px 0 1px rgba(0,0,0,0.06))",
              }}
            >
              <Textura />
            </div>
            {/* Pliegue derecho */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: `polygon(100% 0, 50% ${ALTURA_SOLAPA - 3}%, 100% 100%)`,
                background: `linear-gradient(260deg, ${PAPEL} 0%, ${PAPEL_PLIEGUE} 100%)`,
                filter: "drop-shadow(-1px 0 1px rgba(0,0,0,0.06))",
              }}
            >
              <Textura />
            </div>
            {/* Pliegue inferior (en V), por encima de los laterales */}
            <div
              className="absolute inset-0 overflow-hidden rounded-b-md"
              style={{
                clipPath: `polygon(0 100%, 50% ${ALTURA_SOLAPA - 3}%, 100% 100%)`,
                background: `linear-gradient(180deg, ${PAPEL_SOMBRA} 0%, ${PAPEL} 55%)`,
                filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.10))",
              }}
            >
              <Textura />
              {/* Canto superior claro: grosor del papel */}
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.9) 0, rgba(255,255,255,0) 2px)`,
                }}
              />
            </div>

            {/* Nombre del invitado, sobre el pliegue inferior */}
            <div className="absolute inset-x-0 bottom-0 flex h-[42%] flex-col items-center justify-center px-8 pt-6">
              <span className="text-[10px] tracking-luxe uppercase" style={{ color: TINTA_SUAVE }}>
                {t("Para", "For")}:
              </span>
              <span
                className="mt-1 line-clamp-2 font-serif text-xl leading-snug sm:text-2xl"
                style={{ color: TINTA, textShadow: "0 1px 0 rgba(255,255,255,0.7)" }}
              >
                {nombre}
              </span>
            </div>
          </div>

          {/* d) Sombra que la solapa proyecta sobre el bolsillo */}
          <div
            aria-hidden
            className="sobre-solapa-sombra sobre-pieza absolute inset-x-0 top-0"
            style={{
              height: `${ALTURA_SOLAPA + 4}%`,
              zIndex: 2,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "linear-gradient(180deg, rgba(0,0,0,0.0) 60%, rgba(0,0,0,0.22) 100%)",
              filter: "blur(3px)",
              transform: "translateY(6px)",
            }}
          />

          {/* d) Solapa superior: gira hacia atrás en 3D; cara frontal y trasera
              separadas para que Safari iOS no muestre la cara equivocada. */}
          <div
            className="sobre-solapa sobre-pieza absolute inset-x-0 top-0 origin-top"
            style={{
              height: `${ALTURA_SOLAPA}%`,
              zIndex: 4,
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
            }}
          >
            {/* Cara frontal (papel) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background: `linear-gradient(180deg, ${PAPEL} 0%, ${PAPEL_SOMBRA} 70%, ${PAPEL_PLIEGUE} 100%)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <Textura />
              {/* Canto superior claro: grosor del papel */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: "rgba(255,255,255,0.95)" }}
              />
            </div>
            {/* Cara trasera (forro), ya girada 180º */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background: "linear-gradient(0deg, #b89a5e 0%, #cdb582 100%)",
                transform: "rotateX(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <Textura opacidad={0.4} />
            </div>
          </div>

          {/* Lacre: centrado exactamente en el vértice de la solapa */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ top: `${ALTURA_SOLAPA}%`, zIndex: 5 }}
          >
            <SelloLacre />
            {abriendo && <Particulas />}
          </div>
        </div>
      </button>

      <p className="sobre-texto relative mt-10 animate-pulse text-xs tracking-luxe text-grafito uppercase">
        {t("Toca el sobre para abrir", "Tap the envelope to open")}
      </p>
    </div>
  );
}
