"use client";

import { useState } from "react";
import { BODA } from "@/lib/event";

export default function GiftSection() {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const iban = BODA.regalo.iban.replace(/\s+/g, "");
    try {
      await navigator.clipboard.writeText(iban);
    } catch {
      // Fallback para navegadores antiguos / móviles sin permiso de portapapeles
      const ta = document.createElement("textarea");
      ta.value = iban;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2200);
  }

  return (
    <section className="py-16 text-center">
      <span className="text-[11px] tracking-luxe text-champagne uppercase">
        Nuestro regalo
      </span>

      <p className="mx-auto mt-6 max-w-lg font-serif text-xl italic leading-relaxed text-carbon">
        Vuestra presencia es nuestro mayor regalo. Pero si deseáis contribuir a
        cumplir nuestros sueños y a llenar de momentos nuestra luna de miel,
        podéis hacerlo con un detalle.
      </p>

      <div className="mx-auto mt-10 max-w-sm">
        <div className="border border-linea bg-crema px-6 py-7">
          <p className="text-[11px] tracking-luxe text-grafito uppercase">
            {BODA.regalo.titular}
          </p>
          <p className="mt-3 font-mono text-base tracking-wide text-carbon">
            {BODA.regalo.iban}
          </p>
          <button
            onClick={copiar}
            className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-luxe text-grafito uppercase transition-colors hover:text-carbon"
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${
                copiado ? "bg-champagne" : "bg-linea"
              }`}
            />
            {copiado ? "Copiado" : "Copiar IBAN"}
          </button>
        </div>
      </div>
    </section>
  );
}
