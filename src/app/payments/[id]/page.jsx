"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { jsPDF } from "jspdf";
import getAmountInWords from "../../convertidor";

// Esquema de validación con Zod
const paymentSchema = z.object({
  eventId: z.string().min(1, "El evento es obligatorio"),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Debe ser un número")
    .refine((val) => parseFloat(val) > 0, "El monto debe ser mayor a cero"),
  payerName: z.string().min(1, "El nombre del pagador es obligatorio"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe estar en formato YYYY-MM-DD"),
});

export default function PaymentForm() {
  const { id } = useParams(); // Obtiene el ID del evento desde la URL
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    eventId: id, // Se asigna automáticamente el ID del evento
    amount: "",
    payerName: "",
    date: "",
  });

  const [lastPaymentData, setLastPaymentData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "amount") {
      // Mantener el valor sin formato en el estado
      const numericValue = value.replace(/\D/g, ""); // Solo números
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
  
      // Mostrar el valor formateado en el input
      e.target.value = formatAmount(numericValue);
    } else {
      // Para otros campos, actualizar normalmente
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      paymentSchema.parse(formData); // Validar datos con Zod

      // Enviar los datos al backend
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setLastPaymentData({ ...formData, eventName: `Evento ${id}` }); // Simula el nombre del evento
        setShowSuccessMessage(true);
        setFormData({ eventId: id, amount: "", payerName: "", date: "" }); // Resetear formulario
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


  const handleSuccessClose = () => {
    setShowSuccessMessage(false);
    router.push(`/payments_list/${id}`); // Redirige a la lista de pagos del evento específico
  };

  const formatAmount = (value) => {
    if (!value) return ""; // Manejar valores vacíos
    const numericValue = value.replace(/\D/g, ""); // Eliminar caracteres no numéricos
    return new Intl.NumberFormat("es-AR").format(numericValue); // Formatear con separadores
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-16">
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
            <h3 className="text-xl font-bold text-green-600 mb-4">¡Pago registrado!</h3>
            <button onClick={generateReceipt} className="px-6 py-2 bg-blue-500 text-white rounded-lg mr-4">
              Descargar Recibo
            </button>
            <button onClick={handleSuccessClose} className="px-6 py-2 bg-gray-500 text-white rounded-lg">
              Continuar
            </button>
          </div>
        </div>
      )}

      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Registrar Pago</h3>

      <form onSubmit={handleSubmit}>
        {/* Monto */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Monto del Pago</label>
          <input
              type="text" // Cambiamos de "number" a "text" para permitir el formato
              name="amount"
              placeholder="Monto del pago"
              value={formatAmount(formData.amount)} // Mostrar el valor formateado
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
        </div>

        {/* Nombre del Pagador */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Nombre del Pagador</label>
          <input
            type="text"
            name="payerName"
            placeholder="Nombre del pagador"
            value={formData.payerName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.payerName && <p className="text-red-500 text-sm">{errors.payerName}</p>}
        </div>

        {/* Fecha del Pago */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Fecha del Pago</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md ${isSubmitting ? "bg-gray-400" : "bg-green-500 text-white"}`}
        >
          {isSubmitting ? "Registrando pago..." : "Registrar Pago"}
        </button>
      </form>
    </div>
  );
}
