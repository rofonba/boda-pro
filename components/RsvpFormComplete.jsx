"use client";

import { useState } from "react";
import { useGuest } from "./GuestProvider";
import { saveRsvpToFirestore } from "@/lib/firebase";

export default function RsvpFormComplete() {
  const { guestId, guest } = useGuest();
  const [formData, setFormData] = useState({
    asistencia: null,
    bus: null,
    alergias: "",
    canciones: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validación
    if (formData.asistencia === null) {
      setError("Por favor, confirma tu asistencia.");
      setIsSubmitting(false);
      return;
    }

    // Validar que el invitado existe en Google Sheets
    if (!guestId) {
      setError("No se pudo identificar tu invitación. Por favor, verifica el enlace que recibiste.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Validar contra Google Sheets
      const validateResponse = await fetch("/api/guests");
      if (!validateResponse.ok) {
        throw new Error("No se pudo validar la invitación");
      }

      const { data: guests } = await validateResponse.json();
      if (!guests[guestId]) {
        setError("Tu invitación no se encuentra en nuestros registros. Por favor, contacta con los novios.");
        setIsSubmitting(false);
        return;
      }

      // Preparar datos para Firestore
      const rsvpData = {
        id_invitado: guestId,
        nombre_invitado: guest?.nombres || "Invitado",
        asistencia: formData.asistencia,
        bus: formData.bus || null,
        alergias: formData.alergias || "",
        canciones: formData.canciones || "",
        timestamp: new Date().toISOString(),
        fechaEnvio: new Date(),
      };

      // Guardar en Firestore
      await saveRsvpToFirestore(rsvpData);

      console.log("RSVP guardado correctamente:", rsvpData);
      setSubmitted(true);
    } catch (err) {
      console.error("Error al guardar RSVP:", err);
      setError(
        "Hubo un error al guardar tu confirmación. Por favor, intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl rounded-lg border border-champagne/50 bg-marfil/30 px-6 py-12 backdrop-blur-sm">
          <h3 className="font-serif text-2xl text-carbon">¡Gracias por confirmar!</h3>
          <p className="mt-4 text-grafito">
            Hemos recibido tu confirmación. Te esperamos el 15 de mayo de 2027.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                asistencia: null,
                bus: null,
                alergias: "",
                canciones: "",
              });
            }}
            className="mt-6 text-champagne underline hover:text-carbon"
          >
            Editar respuesta
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center font-serif text-3xl text-carbon">Confirmación de Asistencia</h2>

        <form onSubmit={handleSubmit} className="mt-12 space-y-8">
          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ASISTENCIA */}
          <fieldset className="space-y-4">
            <legend className="font-serif text-lg text-carbon">
              ¿Asistirás a la boda?
            </legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="asistencia"
                  value="si"
                  checked={formData.asistencia === "si"}
                  onChange={(e) => handleChange("asistencia", e.target.value)}
                  className="h-5 w-5 cursor-pointer"
                />
                <span className="text-carbon">Sí, ¡por supuesto!</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="asistencia"
                  value="no"
                  checked={formData.asistencia === "no"}
                  onChange={(e) => handleChange("asistencia", e.target.value)}
                  className="h-5 w-5 cursor-pointer"
                />
                <span className="text-carbon">No puedo asistir</span>
              </label>
            </div>
          </fieldset>

          {/* BUS */}
          <fieldset className="space-y-4">
            <legend className="font-serif text-lg text-carbon">
              ¿Necesitas servicio de autobús?
            </legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="bus"
                  value="si"
                  checked={formData.bus === "si"}
                  onChange={(e) => handleChange("bus", e.target.value)}
                  className="h-5 w-5 cursor-pointer"
                />
                <span className="text-carbon">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="bus"
                  value="no"
                  checked={formData.bus === "no"}
                  onChange={(e) => handleChange("bus", e.target.value)}
                  className="h-5 w-5 cursor-pointer"
                />
                <span className="text-carbon">No</span>
              </label>
            </div>
          </fieldset>

          {/* ALERGIAS */}
          <div>
            <label htmlFor="alergias" className="block font-serif text-lg text-carbon">
              Alergias o restricciones dietéticas
            </label>
            <textarea
              id="alergias"
              value={formData.alergias}
              onChange={(e) => handleChange("alergias", e.target.value)}
              placeholder="Cuéntanos si tienes alguna alergia o restricción"
              className="mt-3 w-full rounded-lg border border-linea bg-white px-4 py-3 text-carbon placeholder-grafito/50 transition-all duration-300 focus:border-champagne focus:outline-none focus:ring-2 focus:ring-champagne/20"
              rows="3"
            />
          </div>

          {/* CANCIONES */}
          <div>
            <label htmlFor="canciones" className="block font-serif text-lg text-carbon">
              Canciones imprescindibles
            </label>
            <textarea
              id="canciones"
              value={formData.canciones}
              onChange={(e) => handleChange("canciones", e.target.value)}
              placeholder="¿Hay alguna canción que no puede faltar en la boda?"
              className="mt-3 w-full rounded-lg border border-linea bg-white px-4 py-3 text-carbon placeholder-grafito/50 transition-all duration-300 focus:border-champagne focus:outline-none focus:ring-2 focus:ring-champagne/20"
              rows="3"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex gap-4 pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-champagne/20 px-6 py-4 font-serif text-lg text-champagne transition-all duration-300 hover:bg-champagne/30 hover:shadow-lg active:scale-95 border border-champagne disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Confirmar asistencia"}
            </button>
          </div>

          <p className="text-center text-xs text-grafito">
            Tus datos se guardarán de forma segura. Podrás editar tu respuesta en cualquier momento.
          </p>
        </form>
      </div>
    </section>
  );
}
