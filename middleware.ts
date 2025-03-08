// middleware.ts (en la raíz del proyecto)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas protegidas
const protectedRoutes = ["/events", "/payments_list", "/payments", "/create_event", "/calendar"];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Verificar si la ruta actual está protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Si la ruta está protegida y no hay token, redirigir al login
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login"; // Redirige al usuario a la página de inicio de sesión
    return NextResponse.redirect(url);
  }

  // Si todo está bien, permite el acceso
  return NextResponse.next();
}

// Configuración para especificar qué rutas deben ser protegidas
export const config = {
  matcher: ["/events/:path*", "/payments_list/:path*", "/payments/:path*", "/create_event/:path*", "/calendar/:path*"],
};