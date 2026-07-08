// Middleware permisivo - permite todo, registra accesos sospechosos
// Este middleware NO debería bloquear nada, es principalmente para logging

import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Log de todas las solicitudes a rutas /admin y /api/admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    console.log(`[MIDDLEWARE] ${new Date().toISOString()} - Acceso a: ${pathname}`);
    console.log(`[MIDDLEWARE] Método: ${request.method}`);
    console.log(`[MIDDLEWARE] ✓ PERMITIDO (middleware permisivo)`);
  }

  // IMPORTANTE: Permitir TODO - no bloquear nada
  return NextResponse.next();
}

// Configuración del middleware - qué rutas lo usan
export const config = {
  matcher: [
    // Admin pages
    "/admin/:path*",
    // Admin API routes
    "/api/admin/:path*",
  ],
};
