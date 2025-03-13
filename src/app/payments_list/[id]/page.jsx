"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

const PaymentListById = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage] = useState(6); // Número de pagos por página
  const router = useRouter();
  const params = useParams(); // Obtener parámetros de la URL
  const eventId = params.id; // Extraer el ID del evento

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`/api/payments?eventId=${eventId}`);
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchPayments();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16 text-center">
        <p className="text-gray-600">Cargando pagos...</p>
      </div>
    );
  }

  if (!Array.isArray(payments) || payments.length === 0) {
    return (
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16 text-center">
        <p className="text-gray-600">No hay pagos disponibles para este evento.</p>
        <button
          onClick={() => router.push(`/payments/${eventId}`)}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Agregar Pago
        </button>
      </div>
    );
  }

  // Calcular los pagos a mostrar en la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = payments.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calcular el número total de páginas
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pagos del Evento</h2>

      {/* Lista de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((payment) => (
          <div key={payment.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Nombre del Pagador: {payment.payerName}</p>
            <p className="text-gray-600">Monto: ${payment.amount}</p>
            <p className="text-gray-600">Fecha: {payment.date}</p>
          </div>
        ))}
      </div>

      {/* Paginador */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Anterior
          </button>

          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => handlePageChange(page + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page + 1
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {page + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Botones adicionales */}
      <div className="mt-6 flex justify-between items-center">
        <Link href="/events" className="text-blue-500">
          Volver a Eventos
        </Link>
        <button
          onClick={() => router.push(`/payments/${eventId}`)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Agregar Pago
        </button>
      </div>
    </div>
  );
};

export default PaymentListById;