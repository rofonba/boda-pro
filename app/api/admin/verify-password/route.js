// API Route para verificar contraseña de admin
// Logs detallados para debugging

export async function POST(request) {
  const timestamp = new Date().toISOString();
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[ADMIN AUTH] ${timestamp} - Nueva solicitud de autenticación`);
  console.log(`${'='.repeat(70)}`);

  try {
    // 1. Obtener método y URL
    console.log(`[ADMIN AUTH] Método: ${request.method}`);
    console.log(`[ADMIN AUTH] URL: ${request.url}`);

    // 2. Parsear JSON del cuerpo
    console.log(`[ADMIN AUTH] Leyendo body de la solicitud...`);
    let password;
    try {
      const body = await request.json();
      password = body.password;
      console.log(`[ADMIN AUTH] ✓ Body parseado correctamente`);
      console.log(`[ADMIN AUTH] Password recibida: ${password ? '"' + password.substring(0, 3) + '..."' + ' (' + password.length + ' chars)' : 'VACÍA'}`);
    } catch (parseError) {
      console.error(`[ADMIN AUTH] ✗ ERROR parseando JSON: ${parseError.message}`);
      console.error(`[ADMIN AUTH] Stack: ${parseError.stack}`);
      return Response.json(
        { success: false, error: "JSON inválido en el cuerpo de la solicitud" },
        { status: 400 }
      );
    }

    // 3. Validar que se recibió contraseña
    if (!password) {
      console.warn(`[ADMIN AUTH] ⚠ Contraseña vacía o nula`);
      return Response.json(
        { success: false, error: "Contraseña requerida" },
        { status: 400 }
      );
    }

    // 4. Verificar que es string
    if (typeof password !== 'string') {
      console.warn(`[ADMIN AUTH] ⚠ Contraseña no es string, es: ${typeof password}`);
      return Response.json(
        { success: false, error: "Contraseña debe ser texto" },
        { status: 400 }
      );
    }

    // 5. Obtener contraseña correcta del entorno
    console.log(`[ADMIN AUTH] Leyendo process.env.ADMIN_PASSWORD...`);
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      console.error(`[ADMIN AUTH] ✗ ERROR: ADMIN_PASSWORD no está configurado en servidor`);
      console.error(`[ADMIN AUTH] Variables disponibles: ${Object.keys(process.env).filter(k => k.includes('ADMIN')).join(', ') || 'NINGUNA'}`);
      return Response.json(
        { success: false, error: "Error de configuración del servidor (ADMIN_PASSWORD no configurada)" },
        { status: 500 }
      );
    }

    console.log(`[ADMIN AUTH] ✓ ADMIN_PASSWORD en servidor: "${correctPassword.substring(0, 3)}..." (${correctPassword.length} chars)`);

    // 6. Comparar contraseñas
    console.log(`[ADMIN AUTH] Comparando contraseñas...`);
    console.log(`[ADMIN AUTH]   Recibida:  "${password.substring(0, 3)}..." (${password.length} chars)`);
    console.log(`[ADMIN AUTH]   Esperada:  "${correctPassword.substring(0, 3)}..." (${correctPassword.length} chars)`);

    const isCorrect = password === correctPassword;

    if (isCorrect) {
      console.log(`[ADMIN AUTH] ✓✓✓ CREDENCIALES VÁLIDAS - ACCESO CONCEDIDO ✓✓✓`);
      console.log(`${'='.repeat(70)}\n`);
      return Response.json(
        {
          success: true,
          authenticated: true,
        },
        { status: 200 }
      );
    } else {
      console.error(`[ADMIN AUTH] ✗✗✗ CREDENCIALES INVÁLIDAS - ACCESO DENEGADO ✗✗✗`);
      console.error(`[ADMIN AUTH] Las contraseñas NO coinciden`);
      console.error(`[ADMIN AUTH] Valores completos para debug:`);
      console.error(`[ADMIN AUTH]   Recibida:  [${[...password].map((c, i) => `${i}:'${c}'`).join(', ')}]`);
      console.error(`[ADMIN AUTH]   Esperada:  [${[...correctPassword].map((c, i) => `${i}:'${c}'`).join(', ')}]`);
      console.log(`${'='.repeat(70)}\n`);
      return Response.json(
        { success: false, authenticated: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error(`[ADMIN AUTH] ✗ ERROR NO CAPTURADO:`);
    console.error(`[ADMIN AUTH] Mensaje: ${error.message}`);
    console.error(`[ADMIN AUTH] Stack: ${error.stack}`);
    console.log(`${'='.repeat(70)}\n`);
    return Response.json(
      { success: false, error: "Error al procesar la solicitud: " + error.message },
      { status: 500 }
    );
  }
}
