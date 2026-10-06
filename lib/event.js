// Datos del evento centralizados — edita aquí cualquier dato y se actualiza
// en toda la web. Pensado para que sea cómodo de tocar sin buscar por el código.

/**
 * Construye un enlace de Google Maps que abre la ficha del lugar.
 *
 * Se usa el formato universal `api=1`, que en el móvil abre directamente la app
 * de Google Maps con la navegación a un toque.
 *
 * Si se le pasa un `placeId`, el sitio queda identificado de forma inequívoca
 * (buscar solo por nombre podría llevar a otra finca parecida). Sin `placeId`
 * se cae a la búsqueda por nombre, que es menos preciso.
 *
 * @param {{ nombre: string, ciudad?: string, placeId?: string }} lugar
 */
export function urlMapas({ nombre, ciudad, placeId }) {
  const params = new URLSearchParams({
    api: "1",
    query: [nombre, ciudad].filter(Boolean).join(", "),
  });
  if (placeId) params.set("query_place_id", placeId);

  return `https://www.google.com/maps/search/?${params}`;
}

// Ceremonia: todavía sin Place ID. Para fijarla igual que la finca, busca el
// sitio en Google Maps, copia su Place ID y añádelo aquí.
const CEREMONIA = {
  nombre: "Parroquia de San Juan del Hospital",
  ciudad: "Valencia",
};

const CONVITE = {
  nombre: "Finca el Canónigo",
  placeId: "ChIJM33kEABFYA0RaanG9zTFTgY",
};

export const BODA = {
  novios: {
    nombres: "Roberto & Cristina",
    monograma: "R&C",
  },
  fecha: {
    iso: "2027-05-15",
    largo: "15 de Mayo de 2027",
    dia: "Sábado",
    destacado: "15 de mayo de 2027",
  },
  ceremonia: {
    titulo: "Ceremonia",
    lugar: CEREMONIA.nombre,
    ciudad: "Valencia",
    direccion: "C/ Trinquete de Caballeros, 5 · 46003 Valencia",
    hora: "12:00h",
    mapsUrl: urlMapas(CEREMONIA),
  },
  convite: {
    titulo: "Banquete",
    lugar: CONVITE.nombre,
    ciudad: "",
    direccion: "Plaza del Canónigo, 3 · 46035 Benimàmet (Valencia)",
    hora: "14:00h",
    mapsUrl: urlMapas(CONVITE),
  },
  // ── Regalo ──────────────────────────────────────────────
  regalo: {
    titular: "Roberto y Cristina",
    iban: "ES49 1583 0001 1491 1872 2332",
  },
};
