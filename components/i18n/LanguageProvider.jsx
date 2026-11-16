"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CLAVE_IDIOMA = "boda-idioma";
const IDIOMAS = ["es", "en"];

/**
 * Estado global del idioma (ES / EN).
 *
 * El idioma arranca en español en el servidor y en el primer render del
 * navegador (así no hay desajuste de hidratación) y, al montar, se recupera
 * el que el visitante hubiera elegido. Se guarda en localStorage y se refleja
 * en el atributo lang del <html>.
 *
 * Los componentes lo usan con `useLanguage()`:
 *
 *   const { idioma, t } = useLanguage();
 *   <p>{t("Bienvenidos a nuestra boda", "Welcome to our wedding")}</p>
 */
const LanguageContext = createContext(null);

export function useLanguage() {
  const contexto = useContext(LanguageContext);
  if (!contexto) {
    throw new Error("useLanguage debe usarse dentro de <LanguageProvider>");
  }
  return contexto;
}

export default function LanguageProvider({ children }) {
  const [idioma, setIdioma] = useState("es");

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_IDIOMA);
      if (IDIOMAS.includes(guardado)) setIdioma(guardado);
    } catch {
      // Sin almacenamiento: se queda en español.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  const cambiar = useCallback((nuevo) => {
    if (!IDIOMAS.includes(nuevo)) return;
    setIdioma(nuevo);
    try {
      localStorage.setItem(CLAVE_IDIOMA, nuevo);
    } catch {
      // Navegación privada o almacenamiento bloqueado: el idioma funciona igual
      // durante la visita, simplemente no se recuerda para la próxima.
    }
  }, []);

  const valor = useMemo(
    () => ({
      idioma,
      idiomas: IDIOMAS,
      cambiar,
      /** Devuelve el texto del idioma activo: t("Hola", "Hello"). */
      t: (es, en) => (idioma === "en" ? en : es),
    }),
    [idioma, cambiar]
  );

  return <LanguageContext.Provider value={valor}>{children}</LanguageContext.Provider>;
}
