"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { jsPDF } from "jspdf";
import getAmountInWords from "../../convertidor";

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
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    eventId: id,
    amount: "",
    payerName: "",
    date: "",
  });

  const [lastPaymentData, setLastPaymentData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [pricePerPlate, setPricePerPlate] = useState(null);
  const [currency, setCurrency] = useState("ARS");
  const [eventName, setEventName] = useState("");
  const [platesCovered, setPlatesCovered] = useState(0);

  useEffect(() => {
    const fetchEventPrice = async () => {
      try {
        const res = await fetch(`/api/payments?eventId=${id}`);
        const data = await res.json();

        if (Array.isArray(data.payments) && data.payments.length > 0) {
          const event = data.payments[0].event;
          if (event?.pricePerPlate) setPricePerPlate(event.pricePerPlate);
          if (event?.currency) setCurrency(event.currency);
          if (event?.name) setEventName(event.name);
        } else {
          const res2 = await fetch(`/api/events/${id}`);
          const eventData = await res2.json();
          if (eventData?.pricePerPlate) setPricePerPlate(eventData.pricePerPlate);
          if (eventData?.currency) setCurrency(eventData.currency);
          if (eventData?.name) setEventName(eventData.name);
        }
      } catch (error) {
        console.error("Error al obtener el precio del evento:", error);
      }
    };

    if (id) fetchEventPrice();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      e.target.value = formatAmount(numericValue);

      if (pricePerPlate && !isNaN(pricePerPlate)) {
        const amount = parseFloat(numericValue);
        const plates = Math.floor(amount / pricePerPlate);
        setPlatesCovered(plates);
      } else {
        setPlatesCovered(0);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      paymentSchema.parse(formData);

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setLastPaymentData({ ...formData, eventName });
        setShowSuccessMessage(true);
        setFormData({ eventId: id, amount: "", payerName: "", date: "" });
        setErrors({});
        setPlatesCovered(0);
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

  const formatAmount = (value) => {
    if (!value) return "";
    const numericValue = value.replace(/\D/g, "");
    const symbols = { ARS: "$", USD: "U$S" };
    const symbol = symbols[currency] || "$";
    return `${symbol}${new Intl.NumberFormat("es-AR").format(numericValue)}`;
  };

  const generateReceipt = () => {
    if (!lastPaymentData) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPos = margin;

    doc.setFontSize(24);
    doc.setTextColor("#2d3748");
    doc.text("Recibo de Pago", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor("#718096");
    doc.text("Eventos Quilmes", pageWidth / 2, yPos, { align: "center" });
    yPos += 20;

    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    const amountText = getAmountInWords(lastPaymentData.amount);
    const currencyText = currency === "USD" ? "dólares" : "pesos";
    const symbol = currency === "USD" ? "U$S" : "$";

    const data = [
      ["Evento:", lastPaymentData.eventName],
      ["Monto:", `${symbol}${lastPaymentData.amount}`],
      ["Monto en letras:", `${amountText} ${currencyText}`],
      ["Pagador:", lastPaymentData.payerName],
      ["Fecha:", lastPaymentData.date],
    ];

    doc.setFontSize(14);
    doc.setTextColor("#2d3748");
    data.forEach(([label, value]) => {
      doc.text(label, margin, yPos);
      doc.text(value, pageWidth - margin, yPos, { align: "right" });
      yPos += 10;
    });

    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor("#718096");
    doc.text("Gracias por su pago. Este recibo es válido como comprobante.", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 20;

    doc.setFontSize(12);
    doc.setTextColor("#2d3748");
    doc.text("Firma del Pagador:", margin, yPos);
    doc.line(margin, yPos + 5, pageWidth / 2 - margin, yPos + 5);
    doc.text("Firma del Salón:", pageWidth / 2 + margin, yPos);
    doc.line(pageWidth / 2 + margin, yPos + 5, pageWidth - margin, yPos + 5);

    doc.save("recibo_pago.pdf");
  };

  const handleSuccessClose = () => {
    setShowSuccessMessage(false);
    router.push(`/payments_list/${id}`);
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
            <button onClick={handleSuccessClose} className="px-6 py-2 bg-green-500 text-white rounded-lg">
              Continuar
            </button>
          </div>
        </div>
      )}

      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Registrar Pago</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Monto del Pago</label>
          <input
            type="text"
            name="amount"
            placeholder="Monto del pago"
            value={formatAmount(formData.amount)}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
          />
          {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
          {!isNaN(platesCovered) && platesCovered > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Este monto cubre aproximadamente <strong>{platesCovered}</strong> plato(s)
            </p>
          )}
        </div>

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

        <div className="flex justify-between mt-4">
          <Link href={`/eventsdetails`}>
            <button className="w-auto py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300">
              Volver
            </button>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-auto py-2 px-4 rounded-md ${
              isSubmitting ? "bg-gray-400" : "bg-green-500 text-white"
            }`}
          >
            {isSubmitting ? "Registrando pago..." : "Registrar Pago"}
          </button>
        </div>
      </form>
    </div>
  );
}
