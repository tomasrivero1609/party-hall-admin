"use client";

import React from "react";
import Link from "next/link";
import DollarBlueQuote from "../app/components/DollarBlueQuote";
import { useSession, signIn } from "next-auth/react";

const HomePage = () => {
  const { data: session } = useSession();

  // Si no hay sesión, muestra la pantalla de inicio de sesión
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
        <h1 className="text-5xl font-bold text-gray-800 mb-6 text-center">
          Bienvenido a <span className="text-blue-600">Salón de Eventos</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-md text-center mb-8">
          Una herramienta moderna para gestionar tus eventos de manera eficiente.
        </p>
        <button
          onClick={() => signIn()}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-8 rounded-full shadow-md hover:from-blue-600 hover:to-blue-800 transition duration-300"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-8">
      {/* Encabezado */}
      <h1 className="text-5xl font-bold text-gray-800 mb-8 text-center">
        Bienvenido a <span className="text-blue-600">Salón de Eventos</span>
      </h1>

      {/* Descripción */}
      <p className="text-gray-600 text-lg max-w-2xl text-center mb-12">
        Organiza y administra tus eventos de manera sencilla. Desde la creación de eventos hasta el seguimiento de pagos,
        todo en un solo lugar.
      </p>

      {/* Características */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Característica 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Eventos</h3>
          <p className="text-gray-600">
            Crea, edita y elimina eventos fácilmente. Mantén un registro claro de todos tus eventos.
          </p>
        </div>

        {/* Característica 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Tipos de Eventos</h3>
          <p className="text-gray-600">
            Clasifica tus eventos por categorías como bodas, cumpleaños o aniversarios.
          </p>
        </div>

        {/* Característica 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Seguimiento de Pagos</h3>
          <p className="text-gray-600">
            Registra los pagos de tus clientes y lleva un control del saldo restante.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
