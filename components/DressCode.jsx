import SectionTitle from "./SectionTitle";

// Código de vestimenta. Ceremonia a mediodía en mayo y banquete en finca con
// jardines: etiqueta, formal de día.
const VESTIMENTA = [
  {
    titulo: "Ellas",
    texto: "Vestido de cóctel, midi o largo. Colores alegres y de primavera.",
  },
  {
    titulo: "Ellos",
    texto: "Traje y corbata.",
  },
];

const CONSEJOS = [
  "El blanco y sus tonos cercanos (marfil, crudo) los reservamos para la novia.",
  "Parte de la celebración es en jardín: un tacón ancho o una cuña te harán el día más cómodo.",
  "En mayo las noches pueden refrescar; un chal o una chaqueta ligera nunca sobran.",
];

export default function DressCode() {
  return (
    <section className="py-20">
      <SectionTitle antetitulo="Código de vestimenta" titulo="Etiqueta · Formal de día" />

      <div className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-2">
        {VESTIMENTA.map(({ titulo, texto }) => (
          <div
            key={titulo}
            className="rounded-lg border border-linea bg-crema/10 px-6 py-7 text-center backdrop-blur-sm transition-all duration-500 hover:border-champagne/50"
          >
            <h3 className="font-script text-4xl text-carbon">{titulo}</h3>
            <p className="mt-3 text-sm leading-relaxed text-grafito">{texto}</p>
          </div>
        ))}
      </div>

      <ul className="mx-auto mt-10 max-w-xl space-y-3">
        {CONSEJOS.map((consejo) => (
          <li key={consejo} className="flex gap-3 text-sm leading-relaxed text-grafito">
            <span className="mt-1.5 rotate-45 text-[8px] text-champagne">◆</span>
            {consejo}
          </li>
        ))}
      </ul>
    </section>
  );
}
