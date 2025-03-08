"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const PaymentListById = ({ params }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Desempaquetar el ID del evento usando React.use()
  const eventId = React.use(params).id;

  // Cargar los pagos del evento específico
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`/api/payments?eventId=${eventId}`);
        const data = await response.json();
        setPayments(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, [eventId]);
  // Mensaje de carga
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16 text-center">
        <p className="text-gray-600">Cargando pagos...</p>
      </div>
    );
  }

  // Si no hay pagos disponibles
  if (!Array.isArray(payments) || payments.length === 0) {
    return (
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16 text-center">
        <p className="text-gray-600">No hay pagos disponibles para este evento.</p>
        <Link href="/payments_list" className="text-blue-500 mt-4 inline-block">
          Volver a la lista de pagos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pagos del Evento</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Nombre del Pagador: {payment.payerName}</p>
            <p className="text-gray-600">Monto: ${payment.amount}</p>
            <p className="text-gray-600">Fecha: {new Date(payment.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      <Link href="/payments_list" className="text-blue-500 mt-4 inline-block">
        Volver a la lista de pagos
      </Link>
    </div>
  );
};

export default PaymentListById;