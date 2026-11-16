"use client";

import { useGuest } from "./GuestProvider";
import { useLanguage } from "./i18n/LanguageProvider";

/**
 * Saludo de bienvenida.
 *
 * El invitado llega resuelto desde el servidor, así que aquí no hay estado de
 * carga: el nombre ya está en el HTML de la primera respuesta.
 */
export default function GuestGreeting() {
  const { invitado, invitacionNoEncontrada } = useGuest();
  const { t } = useLanguage();

  return (
    <section className="py-16 text-center">
      {invitado ? (
        <>
          <h2 className="font-script text-5xl text-carbon sm:text-6xl">
            {t("¡Hola", "Hello")}, {invitado.nombre}!
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-2xl italic leading-relaxed text-carbon">
            {invitado.miembros.length > 1
              ? t(
                  "Nos hace muchísima ilusión que forméis parte de este día.",
                  "It would mean the world to us to have you with us on this day."
                )
              : t(
                  "Nos hace muchísima ilusión que formes parte de este día.",
                  "It would mean the world to us to have you with us on this day."
                )}
          </p>
        </>
      ) : (
        <>
          <p className="mx-auto max-w-2xl font-serif text-2xl italic leading-relaxed text-carbon">
            {t(
              "Bienvenidos a nuestra boda. Nos hace mucha ilusión que forméis parte de este día tan especial.",
              "Welcome to our wedding. We are delighted to have you share this very special day with us."
            )}
          </p>
          {invitacionNoEncontrada && (
            <p className="mx-auto mt-6 max-w-xl text-base text-grafito">
              {t(
                "No hemos localizado tu invitación con ese enlace. Revisa el enlace que te enviamos o escríbenos y te lo reenviamos encantados.",
                "We could not find your invitation with this link. Please check the link we sent you, or write to us and we will gladly send it again."
              )}
            </p>
          )}
        </>
      )}
    </section>
  );
}
