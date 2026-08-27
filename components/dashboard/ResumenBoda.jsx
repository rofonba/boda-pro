// Resumen de la boda: asistencia, autobús, canciones y alergias.
//
// Componente puramente presentacional (sin estado y sin acceso a datos), para
// que lo puedan usar tanto /dashboard (que lee en el servidor) como /backstage
// (que lee en tiempo real desde el navegador). Un solo sitio que mantener y las
// dos vistas cuentan siempre lo mismo.

import { calcularResumen } from "@/lib/stats";

/** Bloque de cuatro cifras (Asistencia / Autobús). */
function Contador({ titulo, datos }) {
  const filas = [
    { etiqueta: "Confirmados", valor: datos.confirmados },
    { etiqueta: "Pendientes", valor: datos.pendientes },
    { etiqueta: "Rechazados", valor: datos.rechazados },
    { etiqueta: "Total", valor: datos.total, destacado: true },
  ];

  return (
    <section>
      <h2 className="text-[11px] tracking-luxe text-grafito uppercase">{titulo}</h2>
      <dl className="mt-4 divide-y divide-linea border-y border-linea">
        {filas.map(({ etiqueta, valor, destacado }) => (
          <div key={etiqueta} className="flex items-baseline justify-between py-3">
            <dt className={destacado ? "text-carbon" : "text-grafito"}>{etiqueta}</dt>
            <dd
              className={`font-serif text-2xl ${
                destacado ? "text-champagne" : "text-carbon"
              }`}
            >
              {valor}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Bloque de listado (Canciones / Alergias). */
function Listado({ titulo, elementos, campo, vacio }) {
  return (
    <section>
      <h2 className="text-[11px] tracking-luxe text-grafito uppercase">
        {titulo}
        {elementos.length > 0 && (
          <span className="ml-2 text-champagne">({elementos.length})</span>
        )}
      </h2>

      {elementos.length === 0 ? (
        <p className="mt-4 text-sm italic text-grafito">{vacio}</p>
      ) : (
        <ul className="mt-4 divide-y divide-linea border-y border-linea">
          {elementos.map((el) => (
            <li key={el.id} className="py-3">
              <p className="text-carbon">{el[campo]}</p>
              <p className="mt-1 text-xs tracking-wide text-grafito">{el.nombre}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ResumenBoda({ invitados }) {
  const { asistencia, autobus, canciones, alergias } = calcularResumen(invitados);

  return (
    <>
      <div className="grid gap-12 sm:grid-cols-2">
        <Contador titulo="Asistencia" datos={asistencia} />
        <Contador titulo="Autobús" datos={autobus} />
      </div>

      <div className="mt-16 grid gap-12">
        <Listado
          titulo="Canciones"
          elementos={canciones}
          campo="cancion"
          vacio="Todavía no hay peticiones musicales."
        />
        <Listado
          titulo="Alergias"
          elementos={alergias}
          campo="alergia"
          vacio="Ningún invitado ha indicado alergias."
        />
      </div>
    </>
  );
}
