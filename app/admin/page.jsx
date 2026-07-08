"use client";

import { useState } from "react";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("[Admin Login] Iniciando validación de contraseña...");
      console.log("[Admin Login] Contraseña: " + (password ? password.length + " caracteres" : "vacía"));

      // Enviar contraseña al servidor para validación
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      console.log("[Admin Login] Respuesta HTTP:", response.status, response.statusText);

      const data = await response.json();
      console.log("[Admin Login] Respuesta JSON:", data);

      if (data.authenticated) {
        console.log("[Admin Login] ✓ Autenticación exitosa - Acceso al dashboard");
        setIsAuthenticated(true);
      } else {
        console.error("[Admin Login] ✗ Autenticación fallida:", data.error);
        setError(data.error || "Credenciales inválidas");
        setPassword("");
      }
    } catch (err) {
      console.error("[Admin Login] ERROR de conexión:", err);
      setError("Error al verificar la contraseña. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si está autenticado, mostrar dashboard
  if (isAuthenticated) {
    return <AdminDashboard password={password} />;
  }

  // Si no, mostrar formulario de login
  return (
    <main className="flex min-h-screen items-center justify-center bg-marfil px-6">
      <div className="w-full max-w-sm rounded-lg border border-linea bg-white p-8 shadow-sm">
        <h1 className="text-center font-serif text-3xl text-carbon">
          Panel de Administración
        </h1>
        <p className="mt-2 text-center text-sm text-grafito">
          Acceso reservado
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-serif text-carbon"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña"
              disabled={isLoading}
              className="mt-2 w-full rounded-lg border border-linea bg-marfil/30 px-4 py-3 text-carbon placeholder-grafito/50 transition-colors focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne/30 disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-champagne/30 px-4 py-3 font-serif text-champagne transition-all hover:bg-champagne/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verificando..." : "Acceder"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-grafito underline hover:text-carbon"
          >
            Volver a la web
          </a>
        </div>
      </div>
    </main>
  );
}
