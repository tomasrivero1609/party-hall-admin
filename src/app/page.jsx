"use client";

import React from "react";
import Link from "next/link";
import DollarBlueQuote from "../app/components/DollarBlueQuote";
import { useSession, signIn } from "next-auth/react";
import { CalendarCheck, Layers, CreditCard } from "lucide-react";

const HomePage = () => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6 pt-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4">
          Bienvenido a <span className="text-blue-600">Salón de Eventos</span>
        </h1>
        <p className="text-gray-700 text-lg md:text-xl max-w-xl text-center mb-6">
          Una herramienta moderna para gestionar tus eventos de manera eficiente.
        </p>
        <button
          onClick={() => signIn()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-105"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center px-4 py-12 pt-20">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4">
        Bienvenido a <span className="text-blue-600">Salón de Eventos</span>
      </h1>

      <p className="text-gray-700 text-lg md:text-xl max-w-2xl text-center mb-12">
        Organiza y administra tus eventos de forma sencilla. Desde la creación hasta el control de pagos, todo en un solo lugar.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-center mb-4">
            <CalendarCheck className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Gestión de Eventos</h3>
          <p className="text-gray-600 text-sm">
            Crea, edita y elimina eventos fácilmente. Lleva un registro completo y organizado.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-center mb-4">
            <Layers className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Tipos de Eventos</h3>
          <p className="text-gray-600 text-sm">
            Clasifica tus eventos en categorías como bodas, cumpleaños o aniversarios.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-center mb-4">
            <CreditCard className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Seguimiento de Pagos</h3>
          <p className="text-gray-600 text-sm">
            Registra los pagos y controla los saldos de cada cliente en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
