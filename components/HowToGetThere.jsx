"use client";

import Image from "next/image";
import mapaBoda from "@/public/images/imagen-iglesia-banquete.jpeg";
import SectionTitle from "./SectionTitle";
import { useLanguage } from "./i18n/LanguageProvider";

// Mapa ilustrado de la iglesia y la finca. Se importa de forma estática para
// que Next lo sirva optimizado (el original pesa ~2,5 MB) con el tamaño exacto
// de cada pantalla. Al pulsarlo se abre a tamaño completo, útil en el móvil
// para hacer zoom y leer los textos pequeños.
export default function HowToGetThere() {
  const { t } = useLanguage();
  return (
    <section className="py-20">
      <SectionTitle antetitulo={t("Iglesia y banquete", "Church and reception")} titulo={t("Cómo llegar", "How to get there")} />

      <a
        href={mapaBoda.src}
        target="_blank"
        rel="noopener noreferrer"
        title={t("Ver el mapa a tamaño completo", "View the map at full size")}
        className="mt-12 block overflow-hidden rounded-2xl border border-linea shadow-2xl transition-all duration-500 hover:border-champagne/50"
      >
        <Image
          src={mapaBoda}
          alt={t(
            "Mapa de la boda: la ceremonia en la Iglesia de San Juan del Hospital, en Ciutat Vella, y el banquete en la Finca el Canónigo, en Benimàmet",
            "Wedding map: the ceremony at San Juan del Hospital Church, in Ciutat Vella, and the reception at Finca el Canónigo, in Benimàmet"
          )}
          placeholder="blur"
          sizes="(min-width: 896px) 848px, 100vw"
          className="h-auto w-full"
        />
      </a>

      <p className="mt-4 text-center text-xs italic text-grafito">
        {t("Pulsa el mapa para verlo en grande", "Tap the map to enlarge it")}
      </p>
    </section>
  );
}
