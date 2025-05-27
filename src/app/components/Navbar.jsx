"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X, Calendar, Plus, Home, LogOut, LogIn, User } from "lucide-react";

const Navbar = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "user";
  const userEmail = session?.user?.email;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Usuario específico que puede ver métricas
  const canViewMetrics = ["admin", "subadmin"].includes(userRole) || 
                        userEmail === "vaniestilo@gmail.com";

  const navItems = [
    ...(session && ["admin", "subadmin"].includes(userRole) ? [
      { href: "/eventsdetails", label: "Eventos", icon: Calendar },
      { href: "/create-event", label: "Crear Evento", icon: Plus },
      { href: "/dashboard", label: "Métricas", icon: Menu },
    ] : []),
    ...(session && userRole === "user" ? [
      { href: "/eventsdetails", label: "Eventos", icon: Calendar },
      ...(userEmail === "vaniestilo@gmail.com" ? [
        { href: "/dashboard", label: "Métricas", icon: Menu },
      ] : []),
    ] : []),
    ...(session ? [
      { href: "/calendar", label: "Calendario", icon: Calendar },
    ] : []),
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100/50' 
        : 'bg-white/60 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="flex items-center space-x-2 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-display">
                EQ System
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:flex items-center space-x-1">
            {session ? (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 font-medium group"
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                {/* User menu */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">
                      {session.user?.name || session.user?.email}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 font-medium group"
                  >
                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium group"
              >
                <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden transition-all duration-300 ease-in-out ${
        menuOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 space-y-2">
          {session ? (
            <>
              {/* User info */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {session.user?.name || session.user?.email}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{userRole}</p>
                </div>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="flex items-center space-x-3 p-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                signIn();
                setMenuOpen(false);
              }}
              className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 w-full justify-center"
            >
              <LogIn className="h-5 w-5" />
              <span className="font-medium">Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
