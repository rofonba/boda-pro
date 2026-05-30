import localFont from "next/font/local";
import "./globals.css";
import { paperTextureStyle } from "@/lib/paperTexture";

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

export const metadata = {
  title: "Roberto & Cristina · 15 · 05 · 2027",
  description:
    "Nos casamos. Tenemos el placer de invitaros a celebrar nuestro día.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body
        className="paper-texture min-h-full flex flex-col"
        style={paperTextureStyle}
      >
        {children}
      </body>
    </html>
  );
}
