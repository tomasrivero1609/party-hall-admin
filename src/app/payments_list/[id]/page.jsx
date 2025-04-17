"use client";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

const PaymentListById = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`/api/payments?eventId=${eventId}`);
        const data = await response.json();

        if (!Array.isArray(data)) throw new Error("La respuesta no es un array válido");
        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments:", error.message);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchPayments();
  }, [eventId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16 text-center">
        <p className="text-gray-600">Cargando pagos...</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = payments.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(payments.length / itemsPerPage);

  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const totalPlatesCovered = payments.reduce((sum, payment) => {
    const price = parseFloat(payment.pricePerPlateAtPayment);
    const plates = price && !isNaN(price) ? Math.floor(payment.amount / price) : 0;
    return sum + plates;
  }, 0);

  const exportToExcel = (payments) => {
    const data = [
      ["Nombre del Pagador", "Monto", "Fecha", "Platos Cubiertos"],
      ...payments.map((payment) => {
        const price = parseFloat(payment.pricePerPlateAtPayment);
        const plates = price && !isNaN(price) ? Math.floor(payment.amount / price) : 0;
        return [
          payment.payerName,
          formatCurrency(payment.amount),
          payment.date,
          plates,
        ];
      }),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    applyStyles(worksheet, data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos");
    XLSX.writeFile(workbook, "pagos_evento.xlsx");
  };

  const applyStyles = (worksheet, data) => {
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F81BD" } },
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" },
      },
    };

    const rowStyle = (even) => ({
      fill: { fgColor: { rgb: even ? "DDEBF7" : "FFFFFF" } },
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" },
      },
    });

    for (let col = 0; col < data[0].length; col++) {
      const cell = XLSX.utils.encode_cell({ r: 0, c: col });
      worksheet[cell].s = headerStyle;
    }

    for (let row = 1; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        const cell = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cell]) worksheet[cell] = { v: "" };
        worksheet[cell].s = rowStyle(row % 2 === 0);
      }
    }

    worksheet["!cols"] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pagos del Evento</h2>

      {payments.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No hay pagos disponibles para este evento.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Nombre del Pagador</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Monto</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Platos cubiertos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((payment) => {
                  const price = parseFloat(payment.pricePerPlateAtPayment);
                  const platesCovered = price && !isNaN(price) ? Math.floor(payment.amount / price) : 0;

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition duration-300">
                      <td className="py-3 px-4 text-sm text-gray-800">{payment.payerName}</td>
                      <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{payment.date}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{platesCovered}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between">
            <p className="text-lg font-bold text-gray-800">
              Total pagado: {formatCurrency(totalAmount)}
            </p>
            <p className="text-lg font-bold text-gray-800">
              Total platos cubiertos: {totalPlatesCovered}
            </p>
          </div>

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
        </>
      )}

      <div className="mt-6 flex justify-between items-center">
        <Link href="/eventsdetails" className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
          Volver a Eventos
        </Link>
        <button
          onClick={() => router.push(`/payments/${eventId}`)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Agregar Pago
        </button>
        <button
          onClick={() => exportToExcel(payments)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Exportar a Excel
        </button>
      </div>
    </div>
  );
};

export default PaymentListById;
