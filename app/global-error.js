"use client";

// global-error captura errores que ocurren en el propio layout raíz
// (fuentes, providers…), que el error.js de ruta no alcanza. Debe renderizar
// sus propias etiquetas <html> y <body>.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="es">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8f4ec",
          color: "#2a2722",
        }}
      >
        <h1 style={{ fontSize: "1.5rem" }}>Algo no se ha cargado bien</h1>
        <p style={{ maxWidth: "28rem", fontSize: "0.875rem", color: "#6d685d" }}>
          {error?.message || "Error desconocido."}
          {error?.digest ? ` (ref: ${error.digest})` : ""}
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: "#2a2722",
            color: "#f8f4ec",
            border: "none",
            padding: "0.75rem 2rem",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            fontSize: "0.7rem",
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
