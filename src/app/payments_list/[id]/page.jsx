"use client";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  CreditCardIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const PaymentListById = () => {
  const [payments, setPayments] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [currency, setCurrency] = useState("ARS");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payments
        const paymentsResponse = await fetch(`/api/payments?eventId=${eventId}`);
        const paymentsData = await paymentsResponse.json();

        if (!Array.isArray(paymentsData.payments)) throw new Error("La respuesta no es un array válido");
        setPayments(paymentsData.payments);
        setCurrency(paymentsData.currency || "ARS");

        // Fetch event info
        const eventsResponse = await fetch(`/api/event-list`);
        if (eventsResponse.ok) {
          const events = await eventsResponse.json();
          const event = events.find(e => e.id === parseInt(eventId));
          setEventInfo(event);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchData();
  }, [eventId]);

  const formatCurrency = (amount) => {
    const symbols = { ARS: "$", USD: "U$S" };
    const symbol = symbols[currency] || "$";
    return `${symbol}${amount.toLocaleString("es-AR")}`;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = payments.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const averagePayment = payments.length > 0 ? totalAmount / payments.length : 0;

  // Calculate statistics
  const stats = {
    totalPayments: payments.length,
    totalAmount: totalAmount,
    averagePayment: averagePayment,
    remainingBalance: eventInfo ? eventInfo.remainingBalance : 0,
    totalPlatesCovered: payments.reduce((sum, payment) => {
      const price = parseFloat(payment.pricePerPlateAtPayment);
      return sum + (price && !isNaN(price) ? Math.floor(payment.amount / price) : 0);
    }, 0)
  };

  const exportToExcel = (data) => {
    if (!data || data.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const eventName = eventInfo?.name || "Evento";
    const worksheetData = [
      [`Pagos del Evento: ${eventName}`],
      [`Fecha de exportación: ${new Date().toLocaleDateString("es-AR")}`],
      [],
      ["Nombre del Pagador", "Monto", "Fecha", "Platos Cubiertos"],
      ...data.map((payment) => {
        const price = parseFloat(payment.pricePerPlateAtPayment);
        const platesCovered = price && !isNaN(price) ? Math.floor(payment.amount / price) : 0;
        return [
          payment.payerName,
          payment.amount,
          payment.date,
          platesCovered,
        ];
      }),
      [],
      ["Resumen"],
      ["Total de pagos:", data.length],
      ["Monto total:", formatCurrency(totalAmount)],
      ["Promedio por pago:", formatCurrency(averagePayment)],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos");

    // Styling
    const headerStyle = (isBold = false) => ({
      font: { bold: isBold, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center" },
    });

    const rowStyle = (isEven) => ({
      fill: { fgColor: { rgb: isEven ? "F8FAFC" : "FFFFFF" } },
    });

    // Apply styles
    for (let row = 1; row < worksheetData.length; row++) {
      for (let col = 0; col < worksheetData[row].length; col++) {
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

    XLSX.writeFile(workbook, `pagos-${eventName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
            <CreditCardIcon className="h-4 w-4 mr-2" />
            Gestión de Pagos
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
            Pagos del{" "}
            <span className="text-gradient">Evento</span>
          </h1>
          
          {eventInfo && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{eventInfo.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-gray-600">{eventInfo.date}</span>
                </div>
                <div className="flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-600">{eventInfo.guests} invitados</span>
                </div>
                <div className="flex items-center justify-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-gray-600">Total: {formatCurrency(eventInfo.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pagos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio por Pago</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averagePayment)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Restante</p>
                <p className={`text-2xl font-bold ${stats.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(stats.remainingBalance)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stats.remainingBalance > 0 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {stats.remainingBalance > 0 ? (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/eventsdetails" className="flex-1">
            <button className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver a Eventos
            </button>
          </Link>
          
          <button
            onClick={() => router.push(`/payments/${eventId}`)}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar Pago
          </button>
          
          <button
            onClick={() => exportToExcel(payments)}
            disabled={payments.length === 0}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Exportar Excel
          </button>
        </div>

        {/* Payments Table */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <CreditCardIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay pagos registrados</h3>
                <p className="text-gray-600 mb-4">
                  Aún no se han registrado pagos para este evento.
                </p>
                <button
                  onClick={() => router.push(`/payments/${eventId}`)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Registrar Primer Pago
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pagador
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Monto ({currency})
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Platos Cubiertos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((payment) => {
                    const price = parseFloat(payment.pricePerPlateAtPayment);
                    const platesCovered = price && !isNaN(price) ? Math.floor(payment.amount / price) : 0;

                    return (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6 text-sm">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <UserIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{payment.payerName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{payment.date}</td>
                        <td className="py-4 px-6 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {platesCovered} platos
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, payments.length)}
                    </span>{" "}
                    de <span className="font-medium">{payments.length}</span> pagos
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Anterior
                  </button>
                  
                  <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-blue-50 border border-blue-200 rounded-lg">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentListById;
