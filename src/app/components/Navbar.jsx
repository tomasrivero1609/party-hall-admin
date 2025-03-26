"use client";

import React from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "user"; // Rol del usuario (default: "user")

  return (
    <nav className="bg-white">
      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-4 sm:flex-row sm:justify-between">
          {/* Logo o Nombre de la Aplicación */}
          <div className="w-full sm:w-auto text-center sm:text-left mb-4 sm:mb-0">
            <Link href="/" className="text-xl font-bold text-blue-800 hover:text-blue-600 transition duration-300">
              Salón de Eventos
            </Link>
          </div>

          {/* Enlaces de Navegación */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 items-center justify-center sm:justify-start">
            {/* Mostrar enlaces según el estado de autenticación y el rol */}
            {session ? (
              <>
                {/* Admin y Subadmin pueden ver "Eventos" y "Crear Evento" */}
                {["admin", "subadmin"].includes(userRole) && (
                  <>
                    <Link
                      href="/eventsdetails"
                      className="text-gray-600 hover:text-blue-600 transition duration-300"
                    >
                      Eventos
                    </Link>
                    <Link
                      href="/create-event"
                      className="text-gray-600 hover:text-blue-600 transition duration-300"
                    >
                      Crear Evento
                    </Link>
                  </>
                )}
                {/* User puede ver "Eventos" pero no "Crear Evento" */}
                {userRole === "user" && (
                  <Link
                    href="/eventsdetails"
                    className="text-gray-600 hover:text-blue-600 transition duration-300"
                  >
                    Eventos
                  </Link>
                )}
                {/* Calendario visible para todos los roles */}
                <Link
                  href="/calendar"
                  className="text-gray-600 hover:text-blue-600 transition duration-300"
                >
                  Calendario
                </Link>
                {/* Botón de Cerrar Sesión */}
                <button
                  onClick={() => signOut()}
                  className="text-red-600 hover:text-red-800 transition duration-300"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              // Si no hay sesión activa, solo mostrar el botón "Iniciar Sesión"
              <button
                onClick={() => signIn()}
                className="text-green-600 hover:text-green-800 transition duration-300"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;