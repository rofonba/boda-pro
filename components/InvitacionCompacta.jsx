"use client";

import { BODA } from "@/lib/event";
import GuestGreeting from "./GuestGreeting";
import RsvpFormComplete from "./RsvpFormComplete";
import KeyInfo from "./KeyInfo";

// Separador elegante (el mismo que en la web completa)
function Separator() {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <span className="h-px w-12 bg-linea" />
      <span className="rotate-45 text-sm text-champagne">◆</span>
      <span className="h-px w-12 bg-linea" />
    </div>
  );
}

/**
 * "Modo invitación": lo que ve un invitado al entrar por su enlace personal.
 *
 * Vista limpia y enfocada, sin menú ni monograma: saludo, formulario de
 * confirmación, resumen de fecha y lugares, y un botón para pasar a la web
 * completa. El cambio de vista lo gestiona HomeClient (estado `modo`).
 *
 * @param {{ onVerTodo: () => void }} props
 */
export default function InvitacionCompacta({ onVerTodo }) {
  return (
    <main className="mx-auto w-full max-w-4xl px-3 pb-24 pt-10 sm:px-6 sm:pt-16">
      {/* Cabecera breve: monograma y fecha, para situar al invitado */}
      <header className="text-center">
        <div className="font-script text-5xl text-carbon">{BODA.novios.monograma}</div>
        <p className="mt-3 text-xs tracking-luxe text-grafito uppercase">
          {BODA.fecha.dia} · {BODA.fecha.largo}
        </p>
      </header>

      {/* 1. Bienvenida (saludo dinámico con los nombres del grupo) */}
      <GuestGreeting />

      <Separator />

      {/* 2. Formulario de confirmación */}
      <RsvpFormComplete />

      <Separator />

      {/* 3. Fecha, calendario y lugares */}
      <KeyInfo />

      {/* 4. Pasar a la web completa */}
      <div className="mt-12 flex flex-col items-center gap-6 text-center">
        <button
          type="button"
          onClick={onVerTodo}
          className="w-full max-w-md rounded-full border border-champagne bg-champagne px-6 py-5 text-sm font-semibold tracking-luxe text-marfil uppercase shadow-lg transition-all hover:bg-oro hover:shadow-xl active:scale-[0.99]"
        >
          Ver todos los detalles de la boda
        </button>
        <p className="max-w-md text-base text-grafito">
          Cronograma del día, cómo llegar, parkings, código de vestimenta, regalo y
          preguntas frecuentes.
        </p>
      </div>

      <footer className="mt-20 text-center">
        <div className="font-script text-4xl text-carbon">{BODA.novios.monograma}</div>
        <p className="mt-3 text-xs tracking-luxe text-grafito uppercase">{BODA.fecha.largo}</p>
      </footer>
    </main>
  );
}
