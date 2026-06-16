"use client";

import { useEffect, useState } from "react";
import { BODA } from "@/lib/event";

export default function Countdown() {
  const [time, setTime] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calcular = () => {
      const ahora = new Date().getTime();
      const boda = new Date(BODA.fecha.iso).getTime();
      const diferencia = boda - ahora;

      if (diferencia > 0) {
        setTime({
          dias: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
          horas: Math.floor(
            (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutos: Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60)),
          segundos: Math.floor((diferencia % (1000 * 60)) / 1000),
        });
      }
    };

    calcular();
    const intervalo = setInterval(calcular, 1000);
    return () => clearInterval(intervalo);
  }, []);

  if (!mounted) return null;

  const items = [
    { label: "Días", value: time.dias },
    { label: "Horas", value: time.horas },
    { label: "Minutos", value: time.minutos },
    { label: "Segundos", value: time.segundos },
  ];

  return (
    <section className="py-20">
      <h2 className="text-center text-[11px] tracking-luxe text-champagne uppercase">
        Cuenta atrás
      </h2>

      <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            {/* Números grandes y finos */}
            <div className="text-5xl font-light text-carbon sm:text-6xl">
              {String(item.value).padStart(2, "0")}
            </div>

            {/* Etiqueta elegante */}
            <p className="mt-2 text-[10px] tracking-widest text-grafito uppercase">
              {item.label}
            </p>

            {/* Separador decorativo sutil */}
            <div className="mt-3 h-px w-8 bg-linea" />
          </div>
        ))}
      </div>
    </section>
  );
}
