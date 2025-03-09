"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <>
      {/* Navbar */}
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
            <div className="flex items-center ml-6">
              {session ? (
                <button
                  className="text-sm text-gray-600 hover:text-purple-400 flex items-center"
                  onClick={() => signOut()}
                >
                  Cerrar sesión
                </button>
              ) : (
                <p className="text-sm text-gray-600 hover:text-purple-400 flex items-center">
                  No estás logueado
                </p>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Botones flotantes */}
      <div className="fixed bottom-6 left-6">
        {/* Dashboard (esquina inferior izquierda) */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full shadow-lg text-white hover:bg-blue-600 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1H9a1 1 0 01-1-1V7a1 1 0 011-1h2a1 1 0 011 1v2M15 9a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </Link>
      </div>

      <div className="fixed bottom-6 right-6">
        {/* Avisos (esquina inferior derecha) */}
        <Link
          href="/avisos"
          className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-lg text-white hover:bg-green-600 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </Link>
      </div>
    </>
  );
};

export default Navbar;