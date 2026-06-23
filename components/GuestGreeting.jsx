"use client";

import { useGuest } from "./GuestProvider";
import { getGuestGreeting } from "@/data/guests";

export default function GuestGreeting() {
  const { guestId, guest, isLoading } = useGuest();

  if (isLoading) {
    return (
      <section className="py-16 text-center">
        <div className="animate-pulse">
          <div className="mx-auto h-6 max-w-2xl rounded bg-linea/30" />
        </div>
      </section>
    );
  }

  const saludo = getGuestGreeting(guestId);

  return (
    <section className="py-16 text-center">
      <p className="mx-auto max-w-2xl font-serif text-lg italic leading-relaxed text-carbon">
        {saludo}
      </p>
    </section>
  );
}
