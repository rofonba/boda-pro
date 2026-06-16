"use client";

import { useTheme } from "./ThemeProvider";

/* Iconos finos con acabado dorado (stroke = currentColor del champagne) */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
      className="h-5 w-5" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
      className="h-5 w-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z" />
    </svg>
  );
}

export default function ThemeToggle({ isLoading = false }) {
  const { isNight, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isLoading}
      aria-label={isNight ? "Cambiar a modo día" : "Cambiar a modo noche"}
      title={isNight ? "Modo día" : "Modo noche"}
      className="fixed right-5 top-5 z-[60] flex h-11 w-11 items-center justify-center rounded-full text-champagne backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        border: "1px solid rgba(200,170,110,0.45)",
        background: "rgba(255,255,255,0.06)",
        boxShadow: "0 2px 14px -6px rgba(0,0,0,0.35)",
      }}
    >
      <span className={isLoading ? "animate-spin" : ""}>
        {isNight ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
