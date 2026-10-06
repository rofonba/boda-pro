import Image from "next/image";
import mapaBoda from "@/public/images/imagen-iglesia-banquete.jpeg";
import SectionTitle from "./SectionTitle";

// Mapa ilustrado de la iglesia y la finca. Se importa de forma estática para
// que Next lo sirva optimizado (el original pesa ~2,5 MB) con el tamaño exacto
// de cada pantalla. Al pulsarlo se abre a tamaño completo, útil en el móvil
// para hacer zoom y leer los textos pequeños.
export default function HowToGetThere() {
  return (
    <section className="py-20">
      <SectionTitle antetitulo="Iglesia y banquete" titulo="Cómo llegar" />

      <a
        href={mapaBoda.src}
        target="_blank"
        rel="noopener noreferrer"
        title="Ver el mapa a tamaño completo"
        className="mt-12 block overflow-hidden rounded-2xl border border-linea shadow-2xl transition-all duration-500 hover:border-champagne/50"
      >
        <Image
          src={mapaBoda}
          alt="Mapa de la boda: la ceremonia en la Iglesia de San Juan del Hospital, en Ciutat Vella, y el banquete en la Finca el Canónigo, en Benimàmet"
          placeholder="blur"
          sizes="(min-width: 896px) 848px, 100vw"
          className="h-auto w-full"
        />
      </a>

      <p className="mt-4 text-center text-[11px] italic text-grafito">
        Pulsa el mapa para verlo en grande
      </p>
    </section>
  );
}
