"use client";

import { useGuest } from "./GuestProvider";

/**
 * Saludo de bienvenida.
 *
 * El invitado llega resuelto desde el servidor, así que aquí no hay estado de
 * carga: el nombre ya está en el HTML de la primera respuesta.
 */
export default function GuestGreeting() {
  const { invitado, invitacionNoEncontrada } = useGuest();

  return (
    <section className="py-16 text-center">
      {invitado ? (
        <>
          <h2 className="font-script text-5xl text-carbon sm:text-6xl">
            ¡Hola, {invitado.nombre}!
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-carbon">
            Nos hace muchísima ilusión que formes parte de este día. Hemos
            preparado esta invitación solo para ti.
          </p>
        </>
      ) : (
        <>
          <p className="mx-auto max-w-2xl font-serif text-lg italic leading-relaxed text-carbon">
            Bienvenidos a nuestra boda. Nos hace mucha ilusión que forméis parte
            de este día tan especial.
          </p>
          {invitacionNoEncontrada && (
            <p className="mx-auto mt-6 max-w-xl text-sm text-grafito">
              No hemos localizado tu invitación con ese enlace. Revisa el enlace
              que te enviamos o escríbenos y te lo reenviamos encantados.
            </p>
          )}
        </>
      )}
    </section>
  );
}
