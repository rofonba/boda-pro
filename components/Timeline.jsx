"use client";

import { useEffect, useState, useRef } from "react";

const TIMELINE_EVENTS = [
  { id: 1, time: "12:30h", label: "Aparcamiento", icon: "🚗" },
  { id: 2, time: "12:40h", label: "Bares (cervecita)", icon: "🍺" },
  { id: 3, time: "12:50h", label: "Llegada a Iglesia", icon: "⛪" },
  { id: 4, time: "13:00h", label: "Inicio de la boda", icon: "💍" },
  { id: 5, time: "13:45h", label: "Fin de la boda", icon: "✨" },
  { id: 6, time: "14:00h", label: "Salida novios", icon: "🚗✨" },
  { id: 7, time: "14:30h", label: "Inicio cóctel", icon: "🥂" },
];

export default function Timeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  // Scroll-spy: detecta posición del scroll del usuario
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      // Obtener posición del viewport
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;

      // Detectar qué sección está en el centro
      const sections = document.querySelectorAll("[data-timeline-section]");
      let closestIndex = 0;
      let closestDistance = Infinity;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-8 pr-8">
      {/* Línea vertical conectora */}
      <div className="absolute right-[35px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-champagne/50 to-transparent" />

      {/* Puntos de cronología */}
      {TIMELINE_EVENTS.map((event, index) => (
        <div
          key={event.id}
          className="flex flex-col items-center gap-2"
          data-timeline-section
        >
          {/* Punto animado */}
          <div
            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "scale-125 bg-champagne shadow-lg ring-2 ring-champagne/50"
                : "scale-100 bg-carbon/20 ring-1 ring-champagne/30"
            }`}
          >
            <span className="text-lg">{event.icon}</span>

            {/* Etiqueta: aparece cuando está activo */}
            {activeIndex === index && (
              <div className="absolute right-16 whitespace-nowrap rounded-lg bg-carbon/90 px-3 py-2 text-xs text-champagne shadow-lg">
                <p className="font-semibold">{event.time}</p>
                <p className="text-champagne/70">{event.label}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
