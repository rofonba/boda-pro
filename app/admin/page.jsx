"use client";

import { useState } from "react";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Validar contraseña
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Contraseña incorrecta");
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return <AdminDashboard password={password} />;
  }

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
              className="mt-2 w-full rounded-lg border border-linea bg-marfil/30 px-4 py-3 text-carbon placeholder-grafito/50 transition-colors focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne/30"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-champagne/30 px-4 py-3 font-serif text-champagne transition-all hover:bg-champagne/50"
          >
            Acceder
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
