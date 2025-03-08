// src/app/components/DollarBlueQuote.jsx
"use client";

import React, { useState, useEffect } from "react";

const DollarBlueQuote = () => {
  const [quote, setQuote] = useState(null); // Estado para almacenar la cotización
  const [lastUpdate, setLastUpdate] = useState(null); // Estado para almacenar la fecha de actualización
  const [loading, setLoading] = useState(true); // Estado para la carga
  const [error, setError] = useState(null); // Estado para manejar errores

  // Función para cargar los datos de la API
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch("https://api.bluelytics.com.ar/v2/latest");
        if (!response.ok) {
          throw new Error("Error al cargar la cotización");
        }
        const data = await response.json();
        setQuote(data.blue); // Guardamos solo la cotización del dólar blue
        setLastUpdate(data.last_update); // Guardamos la fecha de actualización
      } catch (err) {
        setError("No se pudo cargar la cotización. Inténtalo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  // Spinner de carga
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Cargando cotización...</p>
      </div>
    );
  }

  // Mensaje de error
  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  // Tarjeta con la cotización
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6 mt-8">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Cotización del Dólar Blue</h3>
      <div className="flex flex-col items-center justify-center">
        <p className="text-4xl font-bold text-blue-600 mb-2">${quote.value_sell}</p>
        <p className="text-gray-600 text-sm">Venta</p>
      </div>
      <div className="mt-4 text-center">
        <p className="text-gray-700">
          Última actualización:{" "}
          {new Date(lastUpdate).toLocaleString("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default DollarBlueQuote;