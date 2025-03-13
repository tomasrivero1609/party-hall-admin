import Link from "next/link";
import React, { useState } from "react";

const EventList = ({ events }) => {
  const [filterEventType, setFilterEventType] = useState(""); // Filtro por tipo de evento
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda por nombre
  const [currentPage, setCurrentPage] = useState(1); // Estado para la paginación
  const eventsPerPage = 6; // Número de eventos por página

  // Obtener la lista de tipos de eventos únicos (incluyendo aquellos sin eventos)
  const allEventTypes = [...new Set(events.map((event) => event.eventType?.name || "Sin tipo"))];

  // Filtrar eventos según el tipo seleccionado y el término de búsqueda
  const filteredEvents = events.filter((event) => {
    const matchesEventType = filterEventType
      ? event.eventType?.name === filterEventType
      : true;
    const matchesSearchTerm = searchTerm
      ? event.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesEventType && matchesSearchTerm;
  });

  // Paginación: Calcular eventos actuales
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para formatear números con separadores de miles
  const formatNumber = (number) => {
    return number.toLocaleString("es-CL"); // Formato para Chile (usar "." como separador de miles)
  };

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        {/* Filtro por tipo de evento */}
        <select
          value={filterEventType}
          onChange={(e) => {
            setFilterEventType(e.target.value);
            setCurrentPage(1); // Reiniciar a la primera página al filtrar
          }}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-auto"
        >
          <option value="">Todos los tipos</option>
          {allEventTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Campo de búsqueda por nombre */}
        <input
          type="text"
          placeholder="Buscar por nombre del evento..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reiniciar a la primera página al buscar
          }}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-auto"
        />
      </div>

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <p className="text-center text-gray-600">No hay eventos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.map((event) => {
            const [year, month, day] = event.date.split("-");
            const formattedDate = `${day}/${month}/${year}`;

            return (
              <div key={event.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer">
                <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                <p className="text-gray-600 mt-2">Fecha: {formattedDate}</p>
                <p className="text-gray-600 mt-1">
                  Tipo: {event.eventType?.name || "Sin tipo"}
                </p>
                <p className="text-gray-600 mt-1">Invitados: {event.guests}</p>
                <p className="text-gray-600 mt-1">
                  Total: ${formatNumber(event.total)} {/* Formateado */}
                </p>
                <p className="text-gray-600 mt-1">
                  Precio por Plato: ${formatNumber(event.pricePerPlate)} {/* Formateado */}
                </p>
                <p className="text-gray-600 mt-1">
                  Saldo Restante: ${formatNumber(event.remainingBalance)} {/* Formateado */}
                </p>
                <Link
                  href={`/payments_list/${event.id}`}
                  className="text-blue-800 mt-1 block"
                >
                  Ver registros de pago
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {filteredEvents.length > 0 && (
        <div className="flex justify-center mt-8">
          <nav>
            <ul className="flex space-x-2">
              {Array.from({ length: Math.ceil(filteredEvents.length / eventsPerPage) }).map((_, index) => (
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
      )}
    </div>
  );
};

export default EventList;