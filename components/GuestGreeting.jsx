"use client";

// Base de invitados (puedes reemplazar con Firestore)
const GUESTS_DB = {
  "juan-maria": {
    nombres: "Juan & María",
    esPareja: true,
  },
  "ana": {
    nombres: "Ana",
    esPareja: false,
  },
  "pedro-lucia": {
    nombres: "Pedro & Lucía",
    esPareja: true,
  },
  "carlos": {
    nombres: "Carlos",
    esPareja: false,
  },
  // Añade más invitados aquí
};

export default function GuestGreeting({ guestId }) {
  const guest = guestId ? GUESTS_DB[guestId] : null;

  let saludo = "";
  if (guest) {
    if (guest.esPareja) {
      saludo = `Hola ${guest.nombres}, nos hace mucha ilusión que forméis parte de nuestro día especial.`;
    } else {
      saludo = `Hola ${guest.nombres}, nos hace mucha ilusión que formes parte de nuestro día especial.`;
    }
  } else {
    saludo = "Bienvenidos a nuestra boda. Nos hace mucha ilusión que forméis parte de este día tan especial.";
  }

  return (
    <section className="py-16 text-center">
      <p className="mx-auto max-w-2xl font-serif text-lg italic leading-relaxed text-carbon">
        {saludo}
      </p>
    </section>
  );
}
