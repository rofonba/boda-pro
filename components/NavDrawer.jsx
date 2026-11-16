"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./i18n/LanguageProvider";

// Destinos del menú. Los id están en KeyInfo.jsx (fecha, ceremonia, banquete)
// y en WhatsAppContact.jsx (contacto).
const enlaces = (t) => [
  { href: "#fecha", texto: t("¿Cuándo es la boda?", "When is the wedding?") },
  { href: "#ceremonia", texto: t("¿Dónde es la boda? ¿Hora?", "Where is the ceremony? What time?") },
  { href: "#banquete", texto: t("¿Dónde es el banquete? ¿Hora?", "Where is the reception? What time?") },
  { href: "#contacto", texto: t("Contacto con los novios", "Contact the couple") },
];

/** Icono de hamburguesa, en el mismo trazo fino que el botón de tema. */
function IconoMenu() {
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
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconoCerrar() {
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
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/**
 * Menú lateral (drawer) con los accesos directos de la invitación.
 *
 * El botón va fijo arriba a la izquierda, simétrico al botón de tema de la
 * derecha. Al pulsar un enlace el panel se cierra y el navegador hace el
 * scroll suave al ancla (scroll-behavior: smooth en globals.css).
 */
export default function NavDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const ENLACES = enlaces(t);

  // Escape cierra el menú y, mientras está abierto, la página no hace scroll.
  useEffect(() => {
    if (!isOpen) return;
    const alPulsarTecla = (e) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", alPulsarTecla);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alPulsarTecla);
      document.body.style.overflow = overflowPrevio;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("Abrir menú", "Open menu")}
        aria-expanded={isOpen}
        aria-controls="menu-lateral"
        className="fixed left-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-champagne/60 bg-white/[0.06] text-champagne shadow-[0_0_18px_-2px_rgba(200,170,110,0.55)] backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
      >
        {/* Realce discreto: un anillo dorado que late despacio para invitar a
            abrir el menú. Es solo decorativo y no bloquea el clic. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-pulse rounded-full border border-champagne/70 [animation-duration:2.6s]"
        />
        <IconoMenu />
      </button>

      {/* Fondo oscurecido: cierra el menú al pulsarlo */}
      <div
        onClick={() => setIsOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-[70] bg-carbon/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel que se desliza desde la izquierda */}
      <nav
        id="menu-lateral"
        role="dialog"
        aria-modal="true"
        aria-label={t("Menú de la invitación", "Invitation menu")}
        className={`fixed inset-y-0 left-0 z-[80] flex w-80 max-w-[85vw] flex-col border-r border-linea bg-marfil px-8 pb-10 pt-6 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-script text-3xl text-carbon">R&amp;C</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={t("Cerrar menú", "Close menu")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne/45 text-champagne transition-transform hover:scale-105 active:scale-95"
          >
            <IconoCerrar />
          </button>
        </div>

        <span className="mt-10 h-px w-16 bg-champagne/50" />

        <ul className="mt-8 flex flex-col gap-2">
          {ENLACES.map(({ href, texto }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-4 font-serif text-xl leading-snug text-carbon transition-colors hover:bg-champagne/10 hover:text-champagne"
              >
                {texto}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
