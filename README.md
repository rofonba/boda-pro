# boda-pro · Invitación de boda de Roberto & Cristina

Web-app de invitación de boda con **efecto sobre**, confirmación de asistencia (RSVP)
en tiempo real y panel de administración privado para los novios.

**Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · Firebase (Firestore + Auth) · Vercel.

---

## Estructura del proyecto

```
boda-pro/
├─ app/
│  ├─ layout.js              # fuentes (Playfair Display + Montserrat) y metadatos
│  ├─ page.js                # home: <Suspense> → HomeClient (lee ?id= de la URL)
│  ├─ globals.css            # paleta y tema de Tailwind v4 (@theme)
│  └─ backstage/
│     └─ page.js             # ruta oculta de administración (no indexable)
├─ components/
│  ├─ HomeClient.jsx         # lee ?id=, consulta Firestore, monta el sobre
│  ├─ EnvelopeGate.jsx       # "efecto sobre" con animación 3D de apertura
│  ├─ Invitation.jsx         # contenido de la invitación (portada, evento…)
│  ├─ RsvpForm.jsx           # formulario de confirmación → Firestore
│  ├─ GiftSection.jsx        # regalo: IBAN + botón "Copiar"
│  └─ backstage/
│     ├─ Backstage.jsx       # gestiona la sesión (login vs dashboard)
│     ├─ LoginForm.jsx       # acceso con Firebase Auth
│     └─ Dashboard.jsx       # contadores en tiempo real, tabla y export Excel
├─ lib/
│  ├─ firebase.js            # inicialización de Firebase (variables de entorno)
│  ├─ guests.js              # acceso a la colección `invitados` + ESQUEMA
│  └─ event.js               # datos del evento (fecha, lugares, IBAN, monograma)
├─ firestore.rules           # reglas de seguridad de Firestore
└─ .env.example              # plantilla de variables de entorno
```

---

## Puesta en marcha

### 1. Variables de entorno

Copia la plantilla y rellena con los datos de tu proyecto Firebase
(consola → ⚙️ Configuración del proyecto → "Tus apps"):

```bash
cp .env.example .env.local
```

> El repo incluye un `.env.local` con valores **de prueba** para que arranque.
> Sustitúyelos por los reales antes de usar Firebase de verdad.

### 2. Desarrollo

```bash
npm run dev      # http://localhost:3000
```

Para ver la invitación personalizada: `http://localhost:3000/?id=pareja-01`

---

## Configuración de Firebase

1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com).
2. **Firestore Database** → crear base de datos (modo producción).
3. **Authentication** → habilita el proveedor **Correo electrónico/contraseña**.
4. Crea los usuarios de los novios (Roberto y Cristina) en
   *Authentication → Users → Add user*.
5. Sube las reglas de seguridad:

   ```bash
   firebase deploy --only firestore:rules
   ```

### Esquema de la colección `invitados`

El **ID del documento es el `id` de la URL** (ej. `invitados/pareja-01` → `?id=pareja-01`).

| Campo        | Tipo               | Descripción                              |
| ------------ | ------------------ | ---------------------------------------- |
| `id`         | string             | mismo valor que el ID del documento      |
| `nombres`    | string             | "Pablo y María" / "Carlos"               |
| `esPareja`   | boolean            | invitación para dos personas             |
| `confirmado` | boolean \| null    | `null` = aún no ha respondido            |
| `asiste`     | boolean            | asistirá o no                            |
| `autobus`    | boolean            | necesita autobús                         |
| `alergias`   | string             | alergias / intolerancias (texto libre)   |
| `ninos`      | number             | nº de niños menores de 13 años           |

Ejemplo de documento inicial (crea uno por invitado):

```json
{
  "id": "pareja-01",
  "nombres": "Pablo y María",
  "esPareja": true,
  "confirmado": null,
  "asiste": false,
  "autobus": false,
  "alergias": "",
  "ninos": 0
}
```

---

## Panel de administración

Ruta privada: **`/backstage`** (no enlazada ni indexable). Acceso con email y
contraseña de Firebase Auth. Muestra:

- Contadores en tiempo real: adultos confirmados, niños, personas en autobús,
  respondidos y pendientes.
- Tabla con todas las respuestas.
- Botón **Exportar a Excel** (`.xlsx`) listo para enviar al catering.

---

## Despliegue en Vercel

1. Sube el repo a GitHub (ya configurado: `rofonba/boda-pro`).
2. En [vercel.com](https://vercel.com) → *New Project* → importa el repo.
3. Añade las mismas variables de entorno (`NEXT_PUBLIC_FIREBASE_*`) en
   *Settings → Environment Variables*.
4. Deploy. Cada `git push` redepliega automáticamente.

---

## Personalización rápida

- **Datos del evento / IBAN / monograma:** `lib/event.js`
- **Colores y fuentes:** `app/globals.css` (bloque `@theme`)
- **Velocidad de la animación del sobre:** constante `TIEMPOS` en `components/EnvelopeGate.jsx`
