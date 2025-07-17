import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Solo aplicar middleware a rutas específicas
  const pathname = req.nextUrl.pathname;
  
  // Si no es una ruta protegida, continuar sin verificar
  if (!pathname.startsWith('/dashboard') && 
      !pathname.startsWith('/estadisticas') && 
      !pathname.startsWith('/configuracion')) {
    return NextResponse.next();
  }

  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Si no hay sesión y está intentando acceder a ruta protegida
  if (!session) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  // Temporalmente desactivado para debug
  matcher: [],
}
