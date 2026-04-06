import { type NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

export async function proxy(request: NextRequest) {
  // Llama a la función de Supabase que refresca la sesión y protege las rutas
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Configuración estándar de Next.js para ejecutar el proxy
     * en todas las rutas EXCEPTUANDO:
     * - Rutas estáticas internas (_next/static, _next/image)
     * - Íconos, imágenes públicas y otros estáticos (favicon.ico, .svg, .png, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
