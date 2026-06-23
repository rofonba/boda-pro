"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getGuestById } from "@/data/guests";

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
    // Capturar ID de la URL
    const id = searchParams.get("id");
    setGuestId(id);

    // Buscar datos del invitado
    if (id) {
      const guestData = getGuestById(id);
      setGuest(guestData);
    } else {
      setGuest(null);
    }

    setIsLoading(false);
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
