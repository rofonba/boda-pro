import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

// La página lee el parámetro ?id= con useSearchParams (cliente), por eso
// el componente cliente va envuelto en <Suspense> (requisito de Next.js).
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-marfil" />}>
      <HomeClient />
    </Suspense>
  );
}
