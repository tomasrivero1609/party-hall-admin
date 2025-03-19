import Link from "next/link";
import React, { useState, useMemo } from "react";
import {
  TrashIcon,
  EnvelopeIcon,
  CreditCardIcon,
  EyeIcon, // Nuevo ícono para "Ver detalles"
} from "@heroicons/react/24/solid";

const EventList = ({ events: initialEvents }) => {
  const [filterEventType, setFilterEventType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(null); // Estado para almacenar el evento seleccionado
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const eventsPerPage = 10;

  // Función para formatear una hora UTC al huso horario de Argentina
  const formatToLocalTimeOnly = (utcDate) => {
    if (!utcDate) return "N/A";

    // Crear un objeto Date a partir de la fecha UTC
    const date = new Date(utcDate);

    // Opciones para formatear solo la hora en el huso horario de Argentina
    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true, // Usa formato AM/PM
      timeZone: "America/Argentina/Buenos_Aires", // Huso horario de Argentina
    };

    // Formatear la hora usando Intl.DateTimeFormat
    return new Intl.DateTimeFormat("es-AR", options).format(date);
  };

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
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/abm-events?id=${eventId}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      if (response.ok) {
        setEvents(events.filter((e) => e.id !== eventId));
        alert("Evento eliminado exitosamente");
      } else {
        console.error("Respuesta del servidor:", responseData);
        alert(`Error al eliminar el evento: ${responseData.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
      alert("Ocurrió un error al intentar eliminar el evento.");
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el modal y cargar los detalles del evento
  const openDetailsModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeDetailsModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
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
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                  Nombre
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                  Fecha
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                  Tipo
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                  Invitados
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                  Total
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                  Saldo
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                  Acciones
                </th>
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
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {event.eventType?.name || "Sin tipo"}
                    </td>
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
                        className={`p-1 rounded-md transition duration-300 flex items-center justify-center ${
                          loading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                        title="Ver pagos"
                      >
                        <CreditCardIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href="/avisos"
                        className={`p-1 rounded-md transition duration-300 ${
                          loading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        title="Enviar Aviso"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
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
                      {/* Botón para ver detalles */}
                      <button
                        onClick={() => openDetailsModal(event)}
                        className="p-1 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition duration-300"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-5 w-5" />
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

      {/* Modal de Detalles */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo desenfocado */}
            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm" onClick={closeDetailsModal}></div>

            {/* Contenido del modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">
                      Detalles del Evento
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <strong>Nombre:</strong> {selectedEvent.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Fecha:</strong>{" "}
                        {selectedEvent.date &&
                        selectedEvent.date.split("-").length === 3
                          ? `${selectedEvent.date.split("-")[2]}/${selectedEvent.date.split("-")[1]}/${selectedEvent.date.split("-")[0]}`
                          : "Fecha no disponible"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Tipo:</strong> {selectedEvent.eventType?.name || "Sin tipo"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Invitados:</strong> {selectedEvent.guests}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Total:</strong> ${formatNumber(selectedEvent.total)}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Saldo Restante:</strong> ${formatNumber(selectedEvent.remainingBalance)}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Hora de Inicio:</strong> {formatToLocalTimeOnly(selectedEvent.startTime)}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Hora de Finalización:</strong> {formatToLocalTimeOnly(selectedEvent.endTime)}
                      </p>
                      <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Datos del Cliente</h2>
                      <p className="text-sm text-gray-500">
                        <strong>Teléfono:</strong> {selectedEvent.phone || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Email:</strong> {selectedEvent.email || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Dirección:</strong> {selectedEvent.address || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Observaciones:</strong> {selectedEvent.observations || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Menú:</strong> {selectedEvent.menu || "Sin menú asignado"}
                      </p>
                      <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Vendedor</h2>
                      <p className="text-sm text-gray-500">
                        <strong>Vendedor:</strong> {selectedEvent.seller?.name || "Sin vendedor asignado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={closeDetailsModal}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cerrar
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;