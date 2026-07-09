/**
 * Middleware de Routing y Logging
 *
 * POLÍTICA DE ACCESO:
 * ════════════════════════════════════════════════════════════════
 * ✓ PÚBLICO (sin autenticación):
 *   - GET /api/guests          → Lista de invitados (solo lectura)
 *   - GET /api/guests?id=...   → Búsqueda de invitado individual
 *   - GET / (página principal)
 *
 * 🔒 RESTRINGIDO (requiere password boda2027):
 *   - /admin                   → Login y dashboard admin
 *   - /api/admin/stats         → Estadísticas (requiere password)
 *   - /api/admin/guests        → Lista de invitados admin (requiere password)
 *   - /api/admin/verify-password → Verificación de contraseña
 *
 * COMPORTAMIENTO:
 * - La autenticación se maneja POR API, no por middleware
 * - El middleware solo registra accesos para debugging
 * - Todas las rutas están permitidas (NextResponse.next())
 * ════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const timestamp = new Date().toISOString();

  // Log para rutas de administración (debug)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    console.log(`\n[MIDDLEWARE] ${timestamp}`);
    console.log(`[MIDDLEWARE] Ruta: ${pathname}`);
    console.log(`[MIDDLEWARE] Método: ${method}`);
    console.log(`[MIDDLEWARE] Estado: ✓ PERMITIDO (autenticación manejada por API)`);
    console.log(`[MIDDLEWARE]\n`);
  }

  // Log para rutas públicas críticas (debug)
  if (pathname === "/api/guests" || pathname.startsWith("/api/guests?")) {
    console.log(`[MIDDLEWARE] ${timestamp} - Acceso PÚBLICO a /api/guests`);
  }

  // IMPORTANTE: Permitir TODO - la autenticación se maneja en cada API
  return NextResponse.next();
}

// Configuración del middleware - qué rutas lo usan
export const config = {
  matcher: [
    // Páginas admin
    "/admin/:path*",
    // APIs admin
    "/api/admin/:path*",
    // APIs públicas (para logging)
    "/api/guests",
    "/api/guests/:path*",
  ],
};
