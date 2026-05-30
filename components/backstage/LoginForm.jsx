"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { BODA } from "@/lib/event";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged (en Backstage) se encarga del resto.
    } catch (err) {
      setError("Email o contraseña incorrectos.");
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <div className="text-center">
          <div className="font-serif text-3xl text-carbon">
            {BODA.novios.monograma}
          </div>
          <p className="mt-3 text-[11px] tracking-luxe text-grafito uppercase">
            Panel de los novios
          </p>
        </div>

        <div className="mt-10 space-y-5">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-sm border border-linea bg-crema px-4 py-3 text-sm text-carbon outline-none transition-colors placeholder:text-grafito/60 focus:border-champagne"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm border border-linea bg-crema px-4 py-3 text-sm text-carbon outline-none transition-colors placeholder:text-grafito/60 focus:border-champagne"
          />
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="mt-8 w-full bg-carbon px-10 py-4 text-[11px] tracking-luxe text-marfil uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {cargando ? "Accediendo…" : "Acceder"}
        </button>
      </form>
    </div>
  );
}
