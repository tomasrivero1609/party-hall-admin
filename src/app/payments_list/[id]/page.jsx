"use client";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

const PaymentListById = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage] = useState(10); // Número de pagos por página
  const router = useRouter();
  const params = useParams(); // Obtener parámetros de la URL
  const eventId = params.id; // Extraer el ID del evento

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`/api/payments?eventId=${eventId}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("La respuesta no es un array válido");
        }

        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments:", error.message);
        setPayments([]); // Establecer un estado vacío en caso de error
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

  // Función para formatear montos
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

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

  // Calcular el total acumulado de los pagos
  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const exportToExcel = (payments) => {
    // Crear un array con los encabezados y los datos
    const data = [
      ["Nombre del Pagador", "Monto", "Fecha"], // Encabezados
      ...payments.map((payment) => [
        payment.payerName,
        formatCurrency(payment.amount), // Formatear monto
        payment.date,
      ]),
    ];

    // Crear una hoja de cálculo
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Aplicar estilos a la hoja de cálculo
    applyStyles(worksheet, data);

    // Crear un libro de Excel
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos");

    // Generar el archivo Excel
    XLSX.writeFile(workbook, "pagos_evento.xlsx");
  };

  const applyStyles = (worksheet, data) => {
    // Estilo para los encabezados
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } }, // Texto blanco
      fill: { fgColor: { rgb: "4F81BD" } }, // Fondo azul
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { auto: 1 } },
        bottom: { style: "thin", color: { auto: 1 } },
        left: { style: "thin", color: { auto: 1 } },
        right: { style: "thin", color: { auto: 1 } },
      },
    };

    // Estilo para las filas pares
    const evenRowStyle = {
      fill: { fgColor: { rgb: "DDEBF7" } }, // Fondo azul claro
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { auto: 1 } },
        bottom: { style: "thin", color: { auto: 1 } },
        left: { style: "thin", color: { auto: 1 } },
        right: { style: "thin", color: { auto: 1 } },
      },
    };

    // Estilo para las filas impares
    const oddRowStyle = {
      fill: { fgColor: { rgb: "FFFFFF" } }, // Fondo blanco
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { auto: 1 } },
        bottom: { style: "thin", color: { auto: 1 } },
        left: { style: "thin", color: { auto: 1 } },
        right: { style: "thin", color: { auto: 1 } },
      },
    };

    // Aplicar estilo a los encabezados
    for (let col = 0; col < data[0].length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col }); // Fila 0, columna col
      worksheet[cellAddress].s = headerStyle;
    }

    // Aplicar estilo a las filas de datos
    for (let row = 1; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { v: "" }; // Crear la celda si no existe
        }
        worksheet[cellAddress].s = row % 2 === 0 ? evenRowStyle : oddRowStyle; // Alternar estilos
      }
    }

    // Ajustar el ancho de las columnas
    worksheet["!cols"] = [
      { wch: 30 }, // Ancho para "Nombre del Pagador"
      { wch: 15 }, // Ancho para "Monto"
      { wch: 15 }, // Ancho para "Fecha"
    ];
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pagos del Evento</h2>

      {/* Verificar si hay pagos disponibles */}
      {payments.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No hay pagos disponibles para este evento.</p>
        </div>
      ) : (
        <>
          {/* Tabla de pagos */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    Nombre del Pagador
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Monto</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition duration-300">
                    <td className="py-3 px-4 text-sm text-gray-800">{payment.payerName}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{payment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total de pagos */}
          <div className="mt-6 flex justify-end">
            <p className="text-lg font-bold text-gray-800">
              Total: {formatCurrency(totalAmount)}
            </p>
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
        </>
      )}

      {/* Botones adicionales */}
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
          onClick={() => exportToExcel(payments)} // Llama a la función para exportar
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Exportar a Excel
        </button>
      </div>
    </div>
  );
};

export default PaymentListById;