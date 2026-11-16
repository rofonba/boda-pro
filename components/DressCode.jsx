"use client";

import SectionTitle from "./SectionTitle";
import { useLanguage } from "./i18n/LanguageProvider";

// Código de vestimenta. Ceremonia a mediodía en mayo y banquete en finca con
// jardines: etiqueta, formal de día.
const VESTIMENTA = [
  {
    titulo: { es: "Ellas", en: "Ladies" },
    texto: {
      es: "Vestido de cóctel, midi o largo. Colores alegres y de primavera.",
      en: "Cocktail, midi or long dress. Cheerful spring colours.",
    },
  },
  {
    titulo: { es: "Ellos", en: "Gentlemen" },
    texto: { es: "Traje y corbata.", en: "Suit and tie." },
  },
];

const CONSEJOS = [
  {
    es: "El blanco y sus tonos cercanos (marfil, crudo) los reservamos para la novia.",
    en: "White and its close shades (ivory, cream) are reserved for the bride.",
  },
  {
    es: "Parte de la celebración es en jardín: un tacón ancho o una cuña te harán el día más cómodo.",
    en: "Part of the celebration takes place in the garden: a block heel or wedge will make your day more comfortable.",
  },
  {
    es: "En mayo las noches pueden refrescar; un chal o una chaqueta ligera nunca sobran.",
    en: "May evenings can turn cool; a shawl or a light jacket is always a good idea.",
  },
];

export default function DressCode() {
  const { idioma, t } = useLanguage();

  return (
    <section className="py-20">
      <SectionTitle
        antetitulo={t("Código de vestimenta", "Dress code")}
        titulo={t("Etiqueta · Formal de día", "Formal daytime attire")}
      />

      <div className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-2">
        {VESTIMENTA.map(({ titulo, texto }) => (
          <div
            key={titulo.es}
            className="rounded-lg border border-linea bg-crema/10 px-6 py-7 text-center backdrop-blur-sm transition-all duration-500 hover:border-champagne/50"
          >
            <h3 className="font-script text-4xl text-carbon">{titulo[idioma]}</h3>
            <p className="mt-3 text-base leading-relaxed text-grafito">{texto[idioma]}</p>
          </div>
        ))}
      </div>

      <ul className="mx-auto mt-10 max-w-xl space-y-3">
        {CONSEJOS.map((consejo) => (
          <li key={consejo.es} className="flex gap-3 text-base leading-relaxed text-grafito">
            <span className="mt-1.5 rotate-45 text-[8px] text-champagne">◆</span>
            {consejo[idioma]}
          </li>
        ))}
      </ul>
    </section>
  );
}
