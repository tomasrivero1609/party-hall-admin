"use client";

import React, { useState, useEffect } from "react";

const CurrencyQuote = () => {
  const [quotes, setQuotes] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      console.log("Actualizando cotización a las:", new Date().toLocaleTimeString());
      try {
        const response = await fetch("https://api.bluelytics.com.ar/v2/latest");
        if (!response.ok) {
          throw new Error("Error al cargar la cotización");
        }
        const data = await response.json();
        setQuotes({
          dolar: data.oficial,
          blue: data.blue,
          euro: data.oficial_euro,
          blueEuro: data.blue_euro,
        });
        setLastUpdate(data.last_update);
      } catch (err) {
        console.error("Error al obtener los datos:", err);
        setError("No se pudo cargar la cotización. Inténtalo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000); // Actualiza cada 60 segundos
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (error) return null;

  return (
    <div className="p-3 bg-white shadow-lg rounded-lg border border-gray-300 z-50 text-sm">
      <h2 className="text-md font-semibold text-center text-blue-600">Cotización</h2>
      <table className="w-full mt-2 border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="p-1 text-left text-xs">Moneda</th>
            <th className="p-1 text-center text-xs">Compra</th>
            <th className="p-1 text-center text-xs">Venta</th>
          </tr>
        </thead>
        <tbody>
          {quotes && (
            <>
              <tr className="border-t">
                <td className="p-1 text-xs">Dólar Oficial</td>
                <td className="p-1 text-center text-xs">{quotes.dolar.value_buy}</td>
                <td className="p-1 text-center text-xs">{quotes.dolar.value_sell}</td>
              </tr>
              <tr className="border-t">
                <td className="p-1 text-xs">Dólar Blue</td>
                <td className="p-1 text-center text-xs">{quotes.blue.value_buy}</td>
                <td className="p-1 text-center text-xs">{quotes.blue.value_sell}</td>
              </tr>
              <tr className="border-t">
                <td className="p-1 text-xs">Euro Oficial</td>
                <td className="p-1 text-center text-xs">{quotes.euro.value_buy}</td>
                <td className="p-1 text-center text-xs">{quotes.euro.value_sell}</td>
              </tr>
              <tr className="border-t">
                <td className="p-1 text-xs">Euro Blue</td>
                <td className="p-1 text-center text-xs">{quotes.blueEuro.value_buy}</td>
                <td className="p-1 text-center text-xs">{quotes.blueEuro.value_sell}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 mt-1 text-center">Actualizado: {new Date(lastUpdate).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</p>
    </div>
  );
};

export default CurrencyQuote;