// Base de datos centralizada de invitados
// Estructura fácil de editar: id → { nombres, esPareja }

export const GUESTS_DB = {
  // Parejas
  "juan-maria": {
    nombres: "Juan & María",
    esPareja: true,
    email: "juan@example.com", // Opcional: para seguimiento
  },
  "pedro-lucia": {
    nombres: "Pedro & Lucía",
    esPareja: true,
    email: "pedro@example.com",
  },
  "carlos-elena": {
    nombres: "Carlos & Elena",
    esPareja: true,
  },

  // Individuales
  "ana": {
    nombres: "Ana",
    esPareja: false,
    email: "ana@example.com",
  },
  "carlos": {
    nombres: "Carlos",
    esPareja: false,
  },
  "sofia": {
    nombres: "Sofía",
    esPareja: false,
  },
  "david": {
    nombres: "David",
    esPareja: false,
  },
  "maria": {
    nombres: "María",
    esPareja: false,
  },

  // Añade más invitados aquí siguiendo el patrón
};

/**
 * Obtener invitado por ID
 * @param {string} guestId - ID del invitado desde URL
 * @returns {object|null} Datos del invitado o null si no existe
 */
export function getGuestById(guestId) {
  if (!guestId) return null;
  return GUESTS_DB[guestId] || null;
}

/**
 * Obtener saludo personalizado
 * @param {string} guestId - ID del invitado
 * @returns {string} Saludo personalizado
 */
export function getGuestGreeting(guestId) {
  const guest = getGuestById(guestId);

  if (!guest) {
    return "Bienvenidos a nuestra boda. Nos hace mucha ilusión que forméis parte de este día tan especial.";
  }

  if (guest.esPareja) {
    return `Hola ${guest.nombres}, nos hace mucha ilusión que forméis parte de nuestro día especial.`;
  }

  return `Hola ${guest.nombres}, nos hace mucha ilusión que formes parte de nuestro día especial.`;
}
