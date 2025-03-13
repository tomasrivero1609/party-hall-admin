"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Para redirigir al usuario
import { z } from "zod"; // Importa Zod
import { jsPDF } from "jspdf"; // Para generar PDFs
import getAmountInWords from "../convertidor";


// Esquema de validación
const paymentSchema = z.object({
  eventId: z.string().min(1, "El evento es obligatorio"),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Debe ser un número")
    .refine((val) => parseFloat(val) > 0, "El monto debe ser mayor a cero"),
  payerName: z.string().min(1, "El nombre del pagador es obligatorio"), // Validación para payerName
  date: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "La fecha debe estar en formato DD/MM/YYYY") // Validación de formato
    .min(1, "La fecha es obligatoria"), // Validación para la fecha
});

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    eventId: "",
    amount: "0",
    payerName: "", // Inicializa el campo payerName
    date: "",
  });
  const [lastPaymentData, setLastPaymentData] = useState(null); // Almacena los datos del último pago
  const [errors, setErrors] = useState({});
  const [events, setEvents] = useState([]); // Lista de eventos disponibles
  const [isLoadingEvents, setIsLoadingEvents] = useState(true); // Estado para la carga de eventos
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para la carga del formulario
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Estado para el mensaje de éxito
  const router = useRouter(); // Para redirigir al usuario

  // Cargar los eventos desde la API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/event-list");
        if (response.ok) {
          const data = await response.json();
          console.log("Eventos cargados:", data); // Depuración: Imprime los eventos
          setEvents(data);
        } else {
          console.error("Error fetching events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoadingEvents(false);
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
    setIsSubmitting(true);
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
        // Buscar el nombre del evento en la lista de eventos
        const selectedEvent = events.find(
          (event) => String(event.id) === String(formData.eventId)
        ); // Normaliza los IDs a strings
        console.log("Evento seleccionado:", selectedEvent); // Depuración: Imprime el evento encontrado
        // Guardar los datos del último pago, incluyendo el nombre del evento
        setLastPaymentData({
          ...formData,
          eventName: selectedEvent?.name || "Evento desconocido",
        });
        // Muestra el mensaje de éxito
        setShowSuccessMessage(true);
        // Limpia el formulario
        setFormData({ eventId: "", amount: "0", payerName: "", date: "" });
        setErrors({});
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para generar y descargar el recibo
  const generateReceipt = () => {
    if (!lastPaymentData) return;
    const doc = new jsPDF();
    // Configuración inicial
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20; // Márgenes generales
    let yPos = margin; // Posición vertical inicial

    // Encabezado
    doc.setFontSize(24);
    doc.setTextColor("#2d3748"); // Color gris oscuro
    doc.text("Recibo de Pago", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor("#718096"); // Color gris claro
    doc.text("Eventos Quilmes", pageWidth / 2, yPos, { align: "center" });
    yPos += 20;

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Datos del recibo
    const data = [
      ["Evento:", lastPaymentData.eventName],
      ["Monto:", `$${lastPaymentData.amount}`],
      ["Monto en letras:", getAmountInWords(lastPaymentData.amount)], // Monto en letras
      ["Pagador:", lastPaymentData.payerName],
      ["Fecha:", lastPaymentData.date],
    ];

    // Estilo de la tabla
    doc.setFontSize(14);
    doc.setTextColor("#2d3748"); // Color gris oscuro
    data.forEach(([label, value]) => {
      doc.text(label, margin, yPos);
      doc.text(value, pageWidth - margin, yPos, { align: "right" });
      yPos += 10;
    });

    // Línea divisoria
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor("#718096"); // Color gris claro
    doc.text("Gracias por su pago. Este recibo es válido como comprobante.", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 20;

    // Firmas (alineadas horizontalmente)
    doc.setFontSize(12);
    doc.setTextColor("#2d3748"); // Color gris oscuro
    // Firma del pagador
    doc.text("Firma del Pagador:", margin, yPos);
    doc.line(margin, yPos + 5, pageWidth / 2 - margin, yPos + 5); // Línea para la firma
    // Firma del salón
    doc.text("Firma del Salón:", pageWidth / 2 + margin, yPos);
    doc.line(pageWidth / 2 + margin, yPos + 5, pageWidth - margin, yPos + 5); // Línea para la firma

    // Guardar el archivo PDF
    doc.save("recibo_pago.pdf");
  };

  // Redirige al usuario después de cerrar el mensaje de éxito
  const handleSuccessClose = () => {
    setShowSuccessMessage(false);
    router.push("/payments_list"); // Redirige a la página de pagos
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-16">
      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
            <h3 className="text-xl font-bold text-green-600 mb-4">¡Felicitaciones!</h3>
            <p className="text-gray-700 mb-6">El pago ha sido registrado correctamente.</p>
            <button
              onClick={generateReceipt}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 mr-4"
            >
              Descargar Recibo
            </button>
            <button
              onClick={handleSuccessClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
      {/* Spinner mientras se cargan los eventos */}
      {isLoadingEvents ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Cargando eventos...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Registrar Pago</h3>

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
                  {event.name} ({event.date})
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
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md transition duration-300 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Registrando pago...
              </div>
            ) : (
              "Registrar Pago"
            )}
          </button>
        </form>
      )}
    </div>
  );
}