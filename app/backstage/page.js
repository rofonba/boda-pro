import Backstage from "@/components/backstage/Backstage";

// Ruta de administración (no enlazada desde ningún sitio público).
// Acceso restringido con Firebase Authentication (email / contraseña).
export const metadata = {
  title: "Panel · R&C",
  robots: { index: false, follow: false }, // que no la indexen los buscadores
};

export default function BackstagePage() {
  return <Backstage />;
}
