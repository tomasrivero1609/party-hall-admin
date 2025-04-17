"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "user";
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-blue-800 hover:text-blue-600">
              Salón de Eventos
            </Link>
          </div>

          <div className="sm:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          <div className="hidden sm:flex space-x-6 items-center">
            {session ? (
              <>
                {["admin", "subadmin"].includes(userRole) && (
                  <>
                    <Link href="/eventsdetails" className="nav-link">Eventos</Link>
                    <Link href="/create-event" className="nav-link">Crear Evento</Link>
                  </>
                )}
                {userRole === "user" && (
                  <Link href="/eventsdetails" className="nav-link">Eventos</Link>
                )}
                <Link href="/calendar" className="nav-link">Calendario</Link>
                <button
                  onClick={() => signOut()}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 py-4 px-6 space-y-3">
          {session ? (
            <>
              {["admin", "subadmin"].includes(userRole) && (
                <>
                  <Link href="/eventsdetails" className="block text-gray-700 hover:text-blue-600">Eventos</Link>
                  <Link href="/create-event" className="block text-gray-700 hover:text-blue-600">Crear Evento</Link>
                </>
              )}
              {userRole === "user" && (
                <Link href="/eventsdetails" className="block text-gray-700 hover:text-blue-600">Eventos</Link>
              )}
              <Link href="/calendar" className="block text-gray-700 hover:text-blue-600">Calendario</Link>
              <button
                onClick={() => signOut()}
                className="text-red-600 hover:text-red-800"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="text-green-600 hover:text-green-800"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
