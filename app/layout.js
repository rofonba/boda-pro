import localFont from "next/font/local";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";

// Fuentes AUTO-ALOJADAS (next/font/local) en lugar de next/font/google.
// Motivo: next/font/google descarga las fuentes de Google EN TIEMPO DE BUILD,
// y en los servidores de compilación de Vercel esa descarga puede fallar
// ("Retrying 1/3…") y romper el build / generar un output corrupto (404).
// Con los .woff2 en app/fonts/ el build no depende de ninguna red.
const playfair = localFont({
  variable: "--font-playfair",
  display: "swap",
  src: [
    { path: "./fonts/PlayfairDisplay-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/PlayfairDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/PlayfairDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/PlayfairDisplay-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/PlayfairDisplay-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/PlayfairDisplay-600-italic.woff2", weight: "600", style: "italic" },
  ],
});

const montserrat = localFont({
  variable: "--font-montserrat",
  display: "swap",
  src: [
    { path: "./fonts/Montserrat-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Montserrat-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Montserrat-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Montserrat-600.woff2", weight: "600", style: "normal" },
  ],
});

// Fuente caligráfica barroca (estilo Regencia) para nombres / acentos.
const pinyon = localFont({
  variable: "--font-pinyon",
  display: "swap",
  src: [{ path: "./fonts/PinyonScript-400.woff2", weight: "400", style: "normal" }],
});

export const metadata = {
  title: "Roberto & Cristina · 15 · 05 · 2027",
  description:
    "Nos casamos. Tenemos el placer de invitaros a celebrar nuestro día.",
};

// ── Anti-parpadeo del modo noche ────────────────────────────────────────────
// Script SÍNCRONO e inline en el <head>. El navegador lo ejecuta mientras
// parsea el HTML, ANTES de pintar el primer píxel, así que el tema correcto ya
// está aplicado en el primer fotograma y no hay destello del tema contrario.
//
// Tiene que ser un <script> normal y no <Script> de next/script: las estrategias
// de next/script (incluida beforeInteractive) no bloquean el pintado, así que
// llegarían tarde y el parpadeo seguiría.
//
// A partir de aquí el tema vive en el atributo data-theme del <html> y todos los
// colores salen de las variables CSS de globals.css. React no participa en
// pintar el tema, que es justo lo que elimina el parpadeo.
const SCRIPT_TEMA = `
(function () {
  try {
    var t = localStorage.getItem("boda-tema");
    if (t !== "day" && t !== "night") {
      t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
    }
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = "day";
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: el script de arriba modifica data-theme antes de
    // que React hidrate, y sin esto React avisaría de la diferencia.
    <html
      lang="es"
      suppressHydrationWarning
      className={`${playfair.variable} ${montserrat.variable} ${pinyon.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
