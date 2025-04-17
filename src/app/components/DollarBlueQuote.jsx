"use client";

import React, { useState, useEffect } from "react";

const CurrencyQuote = () => {
  const [quotes, setQuotes] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch("https://api.bluelytics.com.ar/v2/latest");
        if (!response.ok) throw new Error("Error al cargar la cotización");

        const data = await response.json();
        setQuotes({
          dolar: data.oficial,
          blue: data.blue,
          euro: data.oficial_euro,
          blueEuro: data.blue_euro,
        });
        setLastUpdate(data.last_update);
      } catch (err) {
        setError("No se pudo cargar la cotización.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || error) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 text-sm w-full mb-6">
      <h3 className="text-blue-600 font-semibold text-center text-base mb-2">Cotización del Día</h3>
      <table className="w-full text-center text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-600">
            <th className="py-1">Moneda</th>
            <th className="py-1">Compra</th>
            <th className="py-1">Venta</th>
          </tr>
        </thead>
        <tbody>
          {quotes && (
            <>
              <CurrencyRow name="Dólar Oficial" quote={quotes.dolar} />
              <CurrencyRow name="Dólar Blue" quote={quotes.blue} />
              <CurrencyRow name="Euro Oficial" quote={quotes.euro} />
              <CurrencyRow name="Euro Blue" quote={quotes.blueEuro} />
            </>
          )}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 text-center mt-2">
        Actualizado:{" "}
        {new Date(lastUpdate).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
};

const CurrencyRow = ({ name, quote }) => (
  <tr className="border-t">
    <td className="py-1">{name}</td>
    <td className="py-1">{quote.value_buy}</td>
    <td className="py-1">{quote.value_sell}</td>
  </tr>
);

export default CurrencyQuote;
