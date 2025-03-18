import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Clave secreta para decodificar el token (asegúrate de tenerla en `.env`)
const secret = process.env.NEXTAUTH_SECRET

export async function middleware(request) {
  // Obtener el token de sesión del usuario
  const token = await getToken({ req: request, secret })

  // Si el usuario NO tiene token, redirigir a /login
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Permitir acceso si hay una sesión válida
  return NextResponse.next()
}

// Aplicar middleware solo a rutas protegidas
export const config = {
  matcher: ['/events','/eventsdetails', '/calendar', '/create-event', '/payments', '/dashboard'],
}
