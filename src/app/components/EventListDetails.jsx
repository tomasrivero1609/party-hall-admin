import Link from "next/link";
import React, { useState, useMemo } from "react";
import { TrashIcon } from "@heroicons/react/24/solid"; // Importamos el ícono de Heroicons

const EventList = ({ events: initialEvents }) => {
  const [filterEventType, setFilterEventType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false); // Estado para el loading
  const [events, setEvents] = useState(initialEvents); // Estado para los eventos originales
  const eventsPerPage = 10;

  // Validación de datos
  if (!Array.isArray(events)) {
    return <p className="text-red-500">Error: No se encontraron eventos.</p>;
  }

  // Obtener tipos de eventos únicos
  const allEventTypes = useMemo(() => {
    return [...new Set(events.map((event) => event.eventType?.name || "Sin tipo"))];
  }, [events]);

  // Filtrar eventos cuando cambian los filtros o la búsqueda
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesEventType = filterEventType
        ? event.eventType?.name === filterEventType
        : true;
      const matchesSearchTerm = searchTerm
        ? event.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesEventType && matchesSearchTerm;
    });
  }, [events, filterEventType, searchTerm]);

  // Paginación
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatNumber = (number) => number.toLocaleString("es-CL");

  // Función para eliminar un evento
  const deleteEvent = async (eventId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      return; // Si el usuario cancela, no hacemos nada
    }

    setLoading(true); // Activar el estado de carga

    try {
      const response = await fetch(`/api/abm-events?id=${eventId}`, {
        method: "DELETE",
      });

      const responseData = await response.json(); // Parsear la respuesta JSON

      if (response.ok) {
        // Actualizar tanto el estado original (events) como el filtrado (filteredEvents)
        setEvents(events.filter((e) => e.id !== eventId)); // Eliminar del estado original
        alert("Evento eliminado exitosamente");
      } else {
        console.error("Respuesta del servidor:", responseData); // Mostrar detalles del error
        alert(`Error al eliminar el evento: ${responseData.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
      alert("Ocurrió un error al intentar eliminar el evento.");
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  };

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <select
          value={filterEventType}
          onChange={(e) => {
            setFilterEventType(e.target.value);
            setCurrentPage(1);
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

        <input
          type="text"
          placeholder="Buscar por nombre del evento..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-auto"
        />

        <button
          onClick={() => {
            setFilterEventType("");
            setSearchTerm("");
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
        >
          Limpiar Filtros
        </button>
      </div>

      {/* Feedback visual */}
      <p className="text-sm text-gray-500 mt-2">
        Mostrando {filteredEvents.length} de {events.length} eventos.
      </p>

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <p className="text-center text-gray-600">No hay eventos disponibles.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Nombre</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tipo</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Invitados</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Total</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Saldo</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentEvents.map((event) => {
                const formattedDate = event.date && event.date.split("-").length === 3
                  ? `${event.date.split("-")[2]}/${event.date.split("-")[1]}/${event.date.split("-")[0]}`
                  : "Fecha no disponible";

                return (
                  <tr key={event.id} className="hover:bg-gray-50 transition duration-300">
                    <td className="py-3 px-4 text-sm text-gray-800">{event.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formattedDate}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{event.eventType?.name || "Sin tipo"}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{event.guests}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                      ${formatNumber(event.total)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                    ${formatNumber(event.remainingBalance)}
                    </td>

                    <td className="py-3 px-4 text-sm flex items-center space-x-4">
                      <Link
                        href={`/payments_list/${event.id}`}
                        className="text-blue-600 hover:text-blue-800 transition duration-300"
                      >
                        Ver pagos
                      </Link>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        disabled={loading}
                        className={`p-1 rounded-md transition duration-300 ${
                          loading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                        title="Eliminar Evento"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {filteredEvents.length > 0 && (
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:bg-gray-100 disabled:text-gray-400 transition duration-300"
          >
            Anterior
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastEvent >= filteredEvents.length}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:bg-gray-100 disabled:text-gray-400 transition duration-300"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default EventList;