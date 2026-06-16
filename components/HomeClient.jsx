"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getGuest } from "@/lib/guests";
import Invitation from "./Invitation";

export default function HomeClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [guest, setGuest] = useState(null);

  useEffect(() => {
    let activo = true;
    if (!id) {
      setGuest(null);
      return;
    }
    getGuest(id)
      .then((g) => {
        if (activo) setGuest(g);
      })
      .catch((err) => {
        console.error("No se pudo cargar el invitado:", err);
      });
    return () => {
      activo = false;
    };
  }, [id]);

  return <Invitation guest={guest} />;
}
