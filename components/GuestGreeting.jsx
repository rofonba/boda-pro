"use client";

import { useGuest } from "./GuestProvider";

export default function GuestGreeting() {
  const { guest, isLoading } = useGuest();

  if (isLoading) {
    return (
      <section className="py-16 text-center">
        <div className="animate-pulse">
          <div className="mx-auto h-6 max-w-2xl rounded bg-linea/30" />
        </div>
      </section>
    );
  }

  // Generar saludo basado en los datos del guest
  let saludo = "Bienvenidos a nuestra boda. Nos hace mucha ilusión que forméis parte de este día tan especial.";

  if (guest) {
    const nombre = guest.nombres || "Invitado";
    if (guest.esPareja) {
      saludo = `Hola ${nombre}, nos hace mucha ilusión que forméis parte de nuestro día especial.`;
    } else {
      saludo = `Hola ${nombre}, nos hace mucha ilusión que formes parte de nuestro día especial.`;
    }
  }

  return (
    <section className="py-16 text-center">
      <p className="mx-auto max-w-2xl font-serif text-lg italic leading-relaxed text-carbon">
        {saludo}
      </p>
    </section>
  );
}
