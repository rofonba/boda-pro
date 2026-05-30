// Textura de "papel de algodón de alto gramaje" como ESTILO INLINE.
// Al ir inline (no como clase de Tailwind/CSS), es inmune a cualquier
// purga o detalle de la compilación de producción: viaja siempre en el HTML.
//
// Es un SVG de ruido (fractalNoise) en escala de grises a muy baja opacidad,
// sobre el color marfil de fondo.

const NOISE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.05'/%3E%3C/svg%3E";

// Fondo marfil + textura. Úsalo en contenedores a pantalla completa.
export const paperTextureStyle = {
  backgroundColor: "#f8f4ec",
  backgroundImage: `url("${NOISE_SVG}")`,
  backgroundRepeat: "repeat",
};

// Solo la textura (sin color), para superponer sobre superficies que ya
// tienen su propio color (forro/bolsillo del sobre).
export const paperTextureOverlay = {
  backgroundImage: `url("${NOISE_SVG}")`,
  backgroundRepeat: "repeat",
};
