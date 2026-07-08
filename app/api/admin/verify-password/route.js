// API Route para verificar contraseña de admin
// NO devuelve la contraseña, solo confirma si es correcta

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return Response.json(
        { success: false, error: "Contraseña requerida" },
        { status: 400 }
      );
    }

    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      console.error("[Admin Auth] ERROR: ADMIN_PASSWORD no está configurado en variables de entorno");
      return Response.json(
        { success: false, error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    // Comparar contraseña (timing-safe sería mejor en producción)
    const isCorrect = password === correctPassword;

    if (isCorrect) {
      console.log("[Admin Auth] ✓ Acceso concedido al panel admin");
      return Response.json({
        success: true,
        authenticated: true,
      });
    } else {
      console.warn("[Admin Auth] ⚠ Intento de acceso con contraseña incorrecta");
      return Response.json(
        { success: false, authenticated: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("[Admin Auth] ERROR:", error.message);
    return Response.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
