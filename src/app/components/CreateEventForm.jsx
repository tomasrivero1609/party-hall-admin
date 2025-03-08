"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Para redirigir al usuario
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
  const [dateError, setDateError] = useState(""); // Estado para errores de fecha
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar la carga
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Estado para el mensaje de éxito
  const router = useRouter(); // Para redirigir al usuario

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
    if (name === "date") {
      setDateError(""); // Limpia el error de fecha al cambiar la fecha
    }
  };

  const checkDateAvailability = async (date) => {
    try {
      setDateError(""); // Limpia el error de fecha antes de realizar la verificación
      const response = await fetch(`/api/events?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setDateError(`Fecha ocupada por "${data[0].name}"`);
        } else {
          setDateError(""); // Asegúrate de limpiar el error si no hay coincidencias
        }
      } else {
        console.error("Error checking date availability");
      }
    } catch (error) {
      console.error("Error checking date availability:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Valida los datos usando el esquema de Zod
      eventSchema.parse(formData);

      // Verifica nuevamente la disponibilidad de la fecha antes de enviar
      if (dateError) {
        alert("No se puede crear el evento porque la fecha ya está ocupada.");
        return;
      }

      // Si pasa la validación, envía los datos al backend
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Muestra el mensaje de éxito
        setShowSuccessMessage(true);

        // Limpia el formulario
        setFormData({
          name: "",
          date: "",
          guests: "0",
          pricePerPlate: "0",
          eventTypeId: "",
        });
        setDateError("");
        setErrors({});
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
    } finally {
      setIsLoading(false);
    }
  };

  // Determina si el botón debe estar deshabilitado
  const isSubmitDisabled = () => {
    return (
      isLoading || // Si está cargando
      !!dateError || // Si hay un error de fecha
      Object.keys(errors).length > 0 || // Si hay errores de validación
      !formData.name || // Si falta algún campo obligatorio
      !formData.date ||
      !formData.guests ||
      !formData.pricePerPlate ||
      !formData.eventTypeId
    );
  };

  // Redirige al usuario después de cerrar el mensaje de éxito
  const handleSuccessClose = () => {
    setShowSuccessMessage(false);
    router.push("/events"); // Redirige a la página de eventos
  };

  return (
    <div>
      {/* Fondo desenfocado cuando el mensaje de éxito está visible */}
      {showSuccessMessage && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}

      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
            <h3 className="text-xl font-bold text-green-600 mb-4">¡Felicitaciones!</h3>
            <p className="text-gray-700 mb-6">Tu evento ha sido registrado correctamente.</p>
            <button
              onClick={handleSuccessClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Formulario */}
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
            onChange={(e) => {
              handleChange(e);
              checkDateAvailability(e.target.value); // Verifica disponibilidad de la fecha
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
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
          disabled={isSubmitDisabled()}
          className={`w-full py-3 px-6 rounded-lg shadow-md transition duration-300 ${
            isSubmitDisabled()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
          }`}
        >
          {isLoading ? "Creando evento..." : "Crear Evento"}
        </button>
      </form>
    </div>
  );
};

export default CreateEventForm;