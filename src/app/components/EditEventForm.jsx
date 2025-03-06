"use client";

import React, { useState } from "react";
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
});

const EditEventForm = ({ event, onClose }) => {
    const [formData, setFormData] = useState({
        id: event.id,
        name: event.name,
        date: new Date(event.date).toISOString().split("T")[0], // Convierte la fecha a YYYY-MM-DD
        guests: event.guests.toString(),
        pricePerPlate: event.pricePerPlate.toString(),
        eventTypeId: event.eventTypeId.toString(),
      });

  const [errors, setErrors] = useState({}); // Estado para almacenar errores

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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Evento actualizado exitosamente");
        onClose(); // Cierra el formulario de edición
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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Editar Evento</h3>

      {/* Nombre del Evento */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Nombre del Evento</label>
        <input
          type="text"
          name="name"
          placeholder="Nombre del evento"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* Fecha del Evento */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Fecha del Evento</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
      </div>

      {/* Número de Invitados */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Número de Invitados</label>
        <input
          type="number"
          name="guests"
          placeholder="Número de invitados"
          value={formData.guests}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
        {errors.guests && <p className="text-red-500 text-sm">{errors.guests}</p>}
      </div>

      {/* Precio por Plato */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Precio por Plato</label>
        <input
          type="number"
          name="pricePerPlate"
          placeholder="Precio por plato"
          value={formData.pricePerPlate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
        {errors.pricePerPlate && <p className="text-red-500 text-sm">{errors.pricePerPlate}</p>}
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
      >
        Guardar Cambios
      </button>
    </form>
  );
};

export default EditEventForm;