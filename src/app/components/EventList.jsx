"use client";

import Link from "next/link";
import React, { useState } from "react";
import { saveAs } from "file-saver"; // Para exportar archivos CSV

const EventList = ({ events, onDelete, onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState(""); // Filtro por tipo de evento
  const [sortBy, setSortBy] = useState("date"); // Ordenamiento (por defecto: fecha)
  const [selectedEvent, setSelectedEvent] = useState(null); // Evento seleccionado para la vista detallada
  const eventsPerPage = 6; // Número de eventos por página

  if (!events || events.length === 0) {
    return <p className="text-center text-gray-600">No hay eventos disponibles.</p>;
  }

  // Filtrar eventos
  const filteredEvents = events.filter((event) => {
    const matchesFilter = filterType ? event.eventType?.name === filterType : true;
    return matchesFilter;
  });

  // Ordenar eventos
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "remainingBalance") {
      return a.remainingBalance - b.remainingBalance;
    }
    return 0;
  });

  // Paginación: Calcular eventos actuales
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Exportar a CSV
  const exportToCSV = () => {
    const csvRows = [
      ["ID", "Nombre", "Fecha", "Tipo", "Invitados", "Total", "Saldo Restante"], // Encabezados
      ...sortedEvents.map((event) => [
        event.id,
        event.name,
        new Date(event.date).toLocaleDateString(),
        event.eventType?.name || "Sin tipo",
        event.guests,
        `$${event.total}`,
        `$${event.remainingBalance}`,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "eventos.csv"); // Descargar el archivo
  };

  return (
    <div>
      {/* Filtros y ordenamiento */}
      <div className="flex flex-col md:flex-row justify-between mb-6">
        {/* Filtro por tipo de evento */}
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentPage(1); // Reiniciar a la primera página al filtrar
          }}
          className="px-4 py-2 border border-gray-300 rounded-md mb-4 md:mb-0"
        >
          <option value="">Todos los tipos</option>
          {[...new Set(events.map((event) => event.eventType?.name))].map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Ordenamiento */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md ml-0 md:ml-4"
        >
          <option value="date">Ordenar por fecha</option>
          <option value="name">Ordenar por nombre</option>
          <option value="remainingBalance">Ordenar por saldo restante</option>
        </select>

        {/* Botón de exportación */}
        <button
          onClick={exportToCSV}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 ml-0 md:ml-4 mt-4 md:mt-0"
        >
          Exportar a CSV
        </button>
      </div>

      {/* Lista de eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
            onClick={() => setSelectedEvent(event)} // Abrir vista detallada
          >
            <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
            <p className="text-gray-600 mt-2">
              Fecha: {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mt-1">
              Tipo: {event.eventType?.name || "Sin tipo"}
            </p>
            <p className="text-gray-600 mt-1">
              Invitados: {event.guests}
            </p>
            <p className="text-gray-600 mt-1">
              Total: ${event.total}
            </p>
            <p className="text-gray-600 mt-1">
              Precio por Plato: ${event.pricePerPlate}
            </p>
            <p className="text-gray-600 mt-1">
              Falta Pagar: ${event.remainingBalance}
            </p>
            <Link
              href="/payments_list"
              className="text-blue-800 mt-1"
            >
              Registro de pago
            </Link>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-8">
        <nav>
          <ul className="flex space-x-2">
            {Array.from({ length: Math.ceil(sortedEvents.length / eventsPerPage) }).map((_, index) => (
              <li key={index}>
                <button
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === index + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } transition duration-300`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

    </div>
  );
};

export default EventList;