"use client";
import * as XLSX from "xlsx";
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

      {/* Lista de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((payment) => (
          <div key={payment.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Nombre del Pagador: {payment.payerName}</p>
            <p className="text-gray-600">Monto: {formatCurrency(payment.amount)}</p> {/* Formatear monto */}
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