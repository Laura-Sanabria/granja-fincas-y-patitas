import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Actualizamos la request
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          // Actualizamos la response para que el navegador guarde las cookies refrescadas
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Obtener el usuario actual (refrésca el token bajo el capó si es necesario)
  // Siempre usar getUser() y no getSession() para mayor seguridad en SSR
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isAuthPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/auth');

  // Lógica global de protección de rutas (Autorización):
  
  // 1. Si NO hay usuario y NO está en una ruta pública (como login), bloquear y llevar a login
  if (!user && !isAuthPage) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Si SÍ hay usuario y trata de ir a /login, llevarlo al root/dashboard
  if (user && isAuthPage) {
    url.pathname = '/'; 
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
