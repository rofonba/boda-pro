"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthClient } from "@/lib/firebase";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

export default function Backstage() {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuthClient(), (u) => {
      setUser(u);
      setCargando(false);
    });
    return () => unsub();
  }, []);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-[11px] tracking-luxe text-grafito uppercase">
          Cargando…
        </span>
      </div>
    );
  }

  return user ? <Dashboard user={user} /> : <LoginForm />;
}
