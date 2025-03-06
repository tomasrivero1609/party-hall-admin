"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md">
      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo o Nombre de la Aplicación */}
          <div className="flex justify-start">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition duration-300">
              Salón de Eventos
            </Link>
          </div>

          {/* Enlaces de Navegación */}
          <div className="flex space-x-6">
            <Link
              href="/events"
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
            <Link
              href="/payments"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Pagos
            </Link>
          </div>

          {/* Botón de Iniciar Sesión / Cerrar Sesión */}
          {session ? (
            <div className="flex items-center ml-6">
              <button
                className="text-sm text-gray-600 hover:text-purple-400 flex items-center"
                onClick={() => signOut()}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center ml-6">
              <p className="text-sm text-gray-600 hover:text-purple-400 flex items-center">
                    No estas logueado
                      </p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;