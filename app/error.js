"use client";

// Error boundary de ruta: captura errores de render/cliente dentro de la app
// y muestra el mensaje real (en vez de una pantalla en blanco o genérica).
export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-3xl text-carbon">
        Algo no se ha cargado bien
      </h1>
      <p className="max-w-md text-sm text-grafito">
        {error?.message || "Error desconocido."}
        {error?.digest ? ` (ref: ${error.digest})` : ""}
      </p>
      <button
        onClick={() => reset()}
        className="mt-2 bg-carbon px-8 py-3 text-[11px] tracking-luxe text-marfil uppercase transition-opacity hover:opacity-90"
      >
        Reintentar
      </button>
    </div>
  );
}
