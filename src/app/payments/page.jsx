// src/app/payments/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";

// Esquema de validación
const paymentSchema = z.object({
  eventId: z.string().min(1, "El evento es obligatorio"),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Debe ser un número")
    .refine((val) => parseFloat(val) > 0, "El monto debe ser mayor a cero"),
  payerName: z.string().min(1, "El nombre del pagador es obligatorio"), // Validación para payerName
  date: z.string().min(1, "La fecha es obligatoria"), // Validación para la fecha
});

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    eventId: "",
    amount: "0",
    payerName: "", // Inicializa el campo payerName
    date: "",
  });
  const [errors, setErrors] = useState({});
  const [events, setEvents] = useState([]); // Lista de eventos disponibles
  const [loading, setLoading] = useState(true);

  // Cargar los eventos desde la API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error("Error fetching events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validar los datos usando Zod
      paymentSchema.parse(formData);

      // Enviar los datos al backend
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Pago registrado exitosamente");
        setFormData({ eventId: "", amount: "0", payerName: "", date: "" }); // Limpiar el formulario
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        console.error("Error inesperado:", error);
        alert("Ocurrió un error inesperado");
      }
    }
  };

  if (loading) return <p>Cargando eventos...</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-16">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Registrar Pago</h3>

      <form onSubmit={handleSubmit}>
        {/* Evento */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Evento</label>
          <select
            name="eventId"
            value={formData.eventId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          >
            <option value="">Selecciona un evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} (Saldo restante: ${event.remainingBalance})
              </option>
            ))}
          </select>
          {errors.eventId && <p className="text-red-500 text-sm">{errors.eventId}</p>}
        </div>

        {/* Monto del Pago */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Monto del Pago</label>
          <input
            type="number"
            name="amount"
            placeholder="Monto del pago"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
        </div>

        {/* Nombre del Pagador */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Nombre del Pagador</label>
          <input
            type="text"
            name="payerName"
            placeholder="Nombre de la persona que realizó el pago"
            value={formData.payerName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          {errors.payerName && <p className="text-red-500 text-sm">{errors.payerName}</p>}
        </div>

        {/* Fecha del Pago */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Fecha del Pago</label>
          <input
            type="text"
            name="date"
            placeholder="DD/MM/YYYY"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300"
        >
          Registrar Pago
        </button>
      </form>
    </div>
  );
}