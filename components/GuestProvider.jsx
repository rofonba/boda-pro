"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Contexto global para datos del invitado
const GuestContext = createContext({
  guestId: null,
  guest: null,
  isLoading: true,
});

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuest debe ser usado dentro de GuestProvider");
  }
  return context;
};

export default function GuestProvider({ children }) {
  const searchParams = useSearchParams();
  const [guestId, setGuestId] = useState(null);
  const [guest, setGuest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get("id");
    setGuestId(id);

    const fetchGuest = async () => {
      if (!id) {
        setGuest(null);
        setIsLoading(false);
        return;
      }

      try {
        // Obtener lista de invitados desde la API
        const response = await fetch("/api/guests");
        if (!response.ok) {
          throw new Error("No se pudo obtener lista de invitados");
        }

        const { data: guests } = await response.json();
        const guestData = guests[id.toLowerCase()];

        if (guestData) {
          setGuest(guestData);
        } else {
          setGuest(null);
          console.warn(`Invitado no encontrado: ${id}`);
        }
      } catch (error) {
        console.error("Error cargando datos del invitado:", error);
        setGuest(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuest();
  }, [searchParams]);

  const value = {
    guestId,
    guest,
    isLoading,
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
}
