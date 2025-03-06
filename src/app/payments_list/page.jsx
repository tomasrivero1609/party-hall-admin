// src/app/payments_list/page.jsx
"use client";

import React, { useState, useEffect } from "react";

const PaymentList = () => {
  const [payments, setPayments] = useState([]); // Lista de pagos
  const [eventNames, setEventNames] = useState([]); // Nombres de eventos disponibles
  const [selectedEventName, setSelectedEventName] = useState(""); // Nombre del evento seleccionado
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar los pagos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/payments");
        if (response.ok) {
          const data = await response.json();
          setPayments(data);

          // Extraer los nombres de eventos únicos
          const uniqueEventNames = [
            ...new Set(data.map((payment) => payment.event?.name).filter(Boolean)),
          ];
          setEventNames(uniqueEventNames);
        } else {
          setError("Error al cargar los pagos");
        }
      } catch (err) {
        setError("Error inesperado al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar pagos por nombre de evento
  const filteredPayments = selectedEventName
    ? payments.filter((payment) => payment.event?.name === selectedEventName)
    : payments;

  if (loading) return <p>Cargando pagos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Lista de Pagos</h3>

      {/* Selector de nombre de evento */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Filtrar por nombre de evento:</label>
        <select
          value={selectedEventName}
          onChange={(e) => setSelectedEventName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos los eventos</option>
          {eventNames.map((eventName, index) => (
            <option key={index} value={eventName}>
              {eventName}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border">ID</th>
            <th className="py-2 px-4 border">Evento</th>
            <th className="py-2 px-4 border">Monto</th>
            <th className="py-2 px-4 border">Pagador</th>
            <th className="py-2 px-4 border">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border">{payment.id}</td>
              <td className="py-2 px-4 border">
                {payment.event?.name || "Sin evento"}
              </td>
              <td className="py-2 px-4 border">${payment.amount.toFixed(2)}</td>
              <td className="py-2 px-4 border">{payment.payerName}</td>
              <td className="py-2 px-4 border">{payment.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentList;