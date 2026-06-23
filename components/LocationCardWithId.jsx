"use client";

import { useGuest } from "./GuestProvider";
import LocationCard from "./LocationCard";

/**
 * Componente LocationCard que preserva el ID del invitado en los links
 */
export default function LocationCardWithId({ data }) {
  const { guestId } = useGuest();

  // Añadir parámetro ?id= al URL si existe guestId
  const enhancedMapsUrl = guestId
    ? `${data.mapsUrl}${data.mapsUrl.includes("?") ? "&" : "?"}utm_source=wedding&utm_content=${guestId}`
    : data.mapsUrl;

  const enhancedData = {
    ...data,
    mapsUrl: enhancedMapsUrl,
  };

  return <LocationCard data={enhancedData} />;
}
