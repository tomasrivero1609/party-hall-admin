// src/components/CreateEventForm.jsx
"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod"; // Importa Zod

// Define el esquema de validación
const eventSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  date: z.string().min(1, "La fecha es obligatoria"),
  guests: z
    .string()
    .refine((val) => !isNaN(parseInt(val)), "Debe ser un número")
    .refine((val) => parseInt(val) > 0, "Debe haber al menos un invitado"),
  pricePerPlate: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Debe ser un número")
    .refine((val) => parseFloat(val) > 0, "El precio debe ser mayor a cero"),
  eventTypeId: z.string().min(1, "El tipo de evento es obligatorio"), // Añadimos validación para eventTypeId
});

const CreateEventForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    guests: "0",
    pricePerPlate: "0",
    eventTypeId: "", // Inicialmente vacío
  });

  const [errors, setErrors] = useState({});
  const [eventTypes, setEventTypes] = useState([]); // Estado para almacenar los tipos de eventos

  // Cargar los tipos de eventos desde la API
  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await fetch("/api/event-types");
        if (response.ok) {
          const data = await response.json();
          setEventTypes(data); // Guarda los tipos de eventos en el estado
        } else {
          console.error("Error fetching event types");
        }
      } catch (error) {
        console.error("Error fetching event types:", error);
      }
    };

    fetchEventTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Valida los datos usando el esquema de Zod
      eventSchema.parse(formData);

      // Si pasa la validación, envía los datos al backend
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Evento creado exitosamente");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      // Captura los errores de validación y muéstralos al usuario
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre del Evento */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Nombre del Evento</label>
        <input
          type="text"
          name="name"
          placeholder="Nombre del evento"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* Fecha del Evento */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Fecha del Evento</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
      </div>

      {/* Número de Invitados */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Número de Invitados</label>
        <input
          type="number"
          name="guests"
          placeholder="Número de invitados"
          value={formData.guests}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.guests && <p className="text-red-500 text-sm">{errors.guests}</p>}
      </div>

      {/* Precio por Plato */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Precio por Plato</label>
        <input
          type="number"
          name="pricePerPlate"
          placeholder="Precio por plato"
          value={formData.pricePerPlate}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.pricePerPlate && <p className="text-red-500 text-sm">{errors.pricePerPlate}</p>}
      </div>

      {/* Tipo de Evento */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Tipo de Evento</label>
        <select
          name="eventTypeId"
          value={formData.eventTypeId}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Selecciona un tipo de evento</option>
          {eventTypes.map((eventType) => (
            <option key={eventType.id} value={eventType.id}>
              {eventType.name}
            </option>
          ))}
        </select>
        {errors.eventTypeId && <p className="text-red-500 text-sm">{errors.eventTypeId}</p>}
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-6 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transition duration-300"
      >
        Crear Evento
      </button>
    </form>
  );
};

export default CreateEventForm;