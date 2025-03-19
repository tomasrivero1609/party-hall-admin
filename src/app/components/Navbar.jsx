"use client";

import React from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

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
            <Link
              href="/eventsdetails"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Eventos
            </Link>
            <Link
              href="/calendar"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Calendario
            </Link>
            <Link
              href="/create-event"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Crear Evento
            </Link>
            {/* Botón de Inicio/Cierre de Sesión */}
            {session ? (
              <button
                onClick={() => signOut()}
                className="text-red-600 hover:text-red-800 transition duration-300"
              >
                Cerrar Sesión
              </button>
            ) : (
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