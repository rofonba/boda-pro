"use client";

import { createContext, useContext, useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

// Estado global del tema (Día / Noche) compartido por toda la app.
const ThemeContext = createContext({
  isNight: false,
  setIsNight: () => {},
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const [isNight, setIsNight] = useState(false);

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

  const toggle = () => setIsNight((v) => !v);

  return (
    <ThemeContext.Provider value={{ isNight, setIsNight, toggle }}>
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

        <ThemeToggle />

        {/* Contenido por encima del fondo y las estrellas */}
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}
