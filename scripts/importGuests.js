/* ───────────────────────────────────────────────────────────────────────────
   Importación masiva de invitados a Firestore (colección `invitados`).

   • Genera el `id` (slug) único de la URL a partir del nombre.
       "Pablo y María"  →  pablo-y-maria
   • Mapea `esPareja` e inicializa asistencia / autobús / niños / alergias.
   • Es IDEMPOTENTE: si vuelves a ejecutarlo, actualiza nombre/esPareja pero
     NO pisa las respuestas (RSVP) que ya hayan enviado los invitados.

   ── Cómo ejecutarlo (terminal de Mac) ──────────────────────────────────────
   1. Añade a tu .env.local las credenciales del admin (las mismas del panel):
         ADMIN_EMAIL=roberto@tucorreo.com
         ADMIN_PASSWORD=tu-contraseña
   2. Edita el array INVITADOS de abajo con tu lista real.
   3. Lanza:
         node --env-file=.env.local scripts/importGuests.js

   (Se autentica como admin para que las reglas de Firestore permitan crear.)
   ─────────────────────────────────────────────────────────────────────────── */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} = require("firebase/firestore");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  EDITA AQUÍ TU LISTA. Solo necesitas `nombres` y `esPareja`.            ║
// ║  (Borra estos ejemplos y pega la tuya.)                                ║
// ╚═══════════════════════════════════════════════════════════════════════╝
const INVITADOS = [
  // ── Invitados confirmados en la lista ──
  { nombres: "Juanda y Acompañante", esPareja: true },
  { nombres: "Cristina Romero", esPareja: false },
  { nombres: "Blanca Fontan", esPareja: false },

  // ╭───────────────────────────────────────────────────────────────────╮
  // │  👇 PEGA AQUÍ EL RESTO DE TU LISTA (amigos y familiares).           │
  // │  Una línea por invitación. Reglas:                                  │
  // │   • Pareja  →  esPareja: true   (ej: { nombres: "Ana y Luis", ... }) │
  // │   • Una sola persona → esPareja: false                              │
  // │  El id (slug) de la URL se genera solo a partir de `nombres`.       │
  // ╰───────────────────────────────────────────────────────────────────╯
  // { nombres: "Ana y Luis", esPareja: true },
  // { nombres: "Marta García", esPareja: false },
];

// ── Configuración de Firebase (desde .env.local) ──────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Convierte un nombre en un slug limpio para la URL. */
function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos: María → Maria
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-") // todo lo que no sea letra/número → guion
    .replace(/^-+|-+$/g, ""); // sin guiones al principio/final
}

/** Garantiza ids únicos aunque dos invitados generen el mismo slug. */
function idUnico(base, usados) {
  let id = base || "invitado";
  let n = 2;
  while (usados.has(id)) id = `${base}-${n++}`;
  usados.add(id);
  return id;
}

async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!firebaseConfig.apiKey) {
    console.error(
      "✖ Faltan las variables NEXT_PUBLIC_FIREBASE_*. " +
        "Ejecuta con:  node --env-file=.env.local scripts/importGuests.js"
    );
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "✖ Faltan ADMIN_EMAIL y/o ADMIN_PASSWORD en .env.local " +
        "(deben ser las credenciales de un usuario admin de Firebase Auth)."
    );
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  console.log(`→ Autenticando como ${ADMIN_EMAIL}…`);
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log("✓ Autenticado.\n");

  const usados = new Set();
  let creados = 0;
  let actualizados = 0;

  for (const invitado of INVITADOS) {
    const nombres = String(invitado.nombres || "").trim();
    if (!nombres) continue;
    const esPareja = Boolean(invitado.esPareja);
    const id = invitado.id || idUnico(slugify(nombres), usados);

    const ref = doc(db, "invitados", id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      // Ya existe: actualizamos solo identidad, preservamos su RSVP.
      await updateDoc(ref, { nombres, esPareja, id });
      actualizados++;
      console.log(`↻ Actualizado  ${id}  (${nombres})`);
    } else {
      // Nuevo: estado por defecto sin responder.
      await setDoc(ref, {
        id,
        nombres,
        esPareja,
        confirmado: null, // aún no ha respondido
        asiste: false,
        autobus: false,
        alergias: "",
        ninos: 0,
      });
      creados++;
      console.log(`＋ Creado       ${id}  (${nombres})`);
    }
  }

  console.log(
    `\n✓ Listo. ${creados} creados, ${actualizados} actualizados, ` +
      `${creados + actualizados} en total.`
  );
  console.log("  Enlaces de ejemplo:");
  for (const id of usados) {
    console.log(`   https://TU-DOMINIO.vercel.app/?id=${id}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("\n✖ Error en la importación:", err.code || "", err.message);
  process.exit(1);
});
