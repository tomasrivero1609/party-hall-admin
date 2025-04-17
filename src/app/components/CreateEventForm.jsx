"use client";
import supabase from "../../lib/supabaseClient"; 
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Para redirigir al usuario
import { z } from "zod"; // Importa Zod

// Define el esquema de validación actualizado
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
  eventTypeId: z.string().min(1, "El tipo de evento es obligatorio"),
  menu: z.string().optional(), // Menú (opcional)
  observations: z.string().optional(), // Observaciones (opcional)
  fileUrl: z.string().optional(), // Nuevo campo para la URL del archivo
  startTime: z.string().min(1, "La hora de inicio es obligatoria"), // Hora de inicio
  endTime: z.string().min(1, "La hora de finalización es obligatoria"), // Hora de finalización
  phone: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email("Debe ser un correo válido"),
  address: z.string().min(1, "La dirección es obligatoria"),
  familyNames: z.string().optional(), // Nombre de familiares (opcional)
  sellerId: z.string().min(1, "El vendedor es obligatorio"), // Añade esta línea
});

const CreateEventForm = () => {

  const handleFileUpload = async (files) => {
    try {
      const uploadedFileUrls = []; // Array para almacenar las URLs de los archivos subidos
  
      for (const file of files) {
        // Genera un nombre único para evitar conflictos
        const uniqueFileName = `${Date.now()}-${file.name}`;
  
        // Sube el archivo al bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('eventos')
          .upload(`public/${uniqueFileName}`, file);
  
        if (uploadError) {
          console.error("Error subiendo el archivo:", uploadError.message);
          alert(`Error subiendo el archivo: ${file.name}`);
          continue; // Continúa con el siguiente archivo si hay un error
        }
  
        console.log("Archivo subido exitosamente:", uploadData);
  
        // Obtiene la URL pública del archivo
        const { data: publicUrlData, error: publicUrlError } = await supabase.storage
          .from('eventos')
          .getPublicUrl(`public/${uniqueFileName}`);
  
        if (publicUrlError) {
          console.error("Error obteniendo la URL pública:", publicUrlError.message);
          alert(`Error obteniendo la URL pública: ${file.name}`);
          continue; // Continúa con el siguiente archivo si hay un error
        }
  
        const fileUrl = publicUrlData.publicUrl;
  
        console.log("URL pública del archivo:", fileUrl);
  
        // Agrega la URL al array de URLs
        uploadedFileUrls.push(fileUrl);
      }
  
      // Actualiza el estado formData con las nuevas URLs
      setFormData((prevData) => ({
        ...prevData,
        fileUrls: [...(prevData.fileUrls || []), ...uploadedFileUrls], // Combina las URLs existentes con las nuevas
      }));
  
      alert("Archivos subidos y URLs guardadas correctamente.");
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado: " + err.message);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    guests: "0",
    pricePerPlate: "0",
    eventTypeId: "",
    sellerId: "", // Inicialmente vacío
    menu: "",
    observations: "",
    fileUrl: "", // Nuevo estado para la URL del archivo
    startTime: "",
    endTime: "",
    phone: "",
    email: "",
    address: "",
    familyNames: "",
  });
  const [errors, setErrors] = useState({});
  const [eventTypes, setEventTypes] = useState([]); // Estado para almacenar los tipos de eventos
  const [dateError, setDateError] = useState(""); // Estado para errores de fecha
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar la carga
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Estado para el mensaje de éxito
  const router = useRouter(); // Para redirigir al usuario

  const [sellers, setSellers] = useState([]); // Estado para almacenar los vendedores

useEffect(() => {
  const fetchSellers = async () => {
    try {
      const response = await fetch("/api/sellers");
      if (response.ok) {
        const data = await response.json();
        setSellers(data); // Guarda los vendedores en el estado
      } else {
        console.error("Error fetching sellers");
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };
  fetchSellers();
}, []);

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
          menu: "",
          observations: "",
          fileUrl: "",  // Reinicia la URL del archivo
          startTime: "",
          endTime: "",
          phone: "",
          email: "",
          address: "",
          familyNames: "",
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
      !formData.eventTypeId ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.phone ||
      !formData.email ||
      !formData.address
    );
  };


  
  
  // Redirige al usuario después de cerrar el mensaje de éxito
  const handleSuccessClose = () => {
    setShowSuccessMessage(false);
    router.push("/eventsdetails"); // Redirige a la página de eventos
  };

  return (
    <div>
      {/* Fondo desenfocado cuando el mensaje de éxito está visible */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-40"></div>
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

        {/* Hora de Inicio y Finalización */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Hora de Inicio</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Hora de Finalización</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
        </div>
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

        {/* Menú, Observaciones y Archivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Menú */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Menú (Opcional)</label>
            <textarea
              name="menu"
              placeholder="Escribe el menú aquí..."
              value={formData.menu}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            ></textarea>
            {errors.menu && <p className="text-red-500 text-sm mt-1">{errors.menu}</p>}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Observaciones (Opcional)</label>
            <textarea
              name="observations"
              placeholder="Escribe observaciones aquí..."
              value={formData.observations}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            ></textarea>
            {errors.observations && <p className="text-red-500 text-sm mt-1">{errors.observations}</p>}
          </div>

          {/* Archivos */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">Cargar Archivos (Opcional)</label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700 transition">
                Seleccionar Archivos
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>
              <span className="text-sm text-gray-500">Puedes subir varios archivos (PDF, imágenes, etc).</span>
            </div>

            {/* Vista previa */}
            {formData.fileUrls?.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm text-gray-700">
                {formData.fileUrls.map((url, index) => {
                  const fileName = url.split("/").pop();
                  return (
                    <li key={index} className="flex items-center space-x-2">
                      <svg
                        className="h-4 w-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M15 10l4.553 4.553a1 1 0 010 1.414l-4.553 4.553M4 6h16M4 12h8m-8 6h8" />
                      </svg>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {fileName}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>


        {/* Datos del Cliente */}
        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Datos del Cliente</h2>

        {/* Teléfono */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Teléfono</label>
          <input
            type="text"
            name="phone"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        {/* Mail */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Mail</label>
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Dirección</label>
          <input
            type="text"
            name="address"
            placeholder="Dirección"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        {/* Nombre de Familiares */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nombre de Familiares (Opcional)</label>
          <input
            type="text"
            name="familyNames"
            placeholder="Nombres de familiares"
            value={formData.familyNames}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.familyNames && <p className="text-red-500 text-sm">{errors.familyNames}</p>}
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Vendedor</label>
          <select
            name="sellerId"
            value={formData.sellerId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Selecciona un vendedor</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
              </option>
            ))}
          </select>
          {errors.sellerId && <p className="text-red-500 text-sm">{errors.sellerId}</p>}
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