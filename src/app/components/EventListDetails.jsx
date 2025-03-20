import Link from "next/link";
import toast from "react-hot-toast";
import { Menu } from "@headlessui/react";
import React, { useState, useMemo, useEffect } from "react";
import {
  TrashIcon,
  EnvelopeIcon,
  BellIcon,
  CreditCardIcon,
  DotsVerticalIcon,
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

  const getDaysSince = (date) => {
    const today = new Date();
    const targetDate = new Date(date);
    const timeDifference = today - targetDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Diferencia en días
    return daysDifference;
  };

  const formatNumber = (number) => number.toLocaleString("es-CL");

  const pendingEvents = useMemo(() => {
    return currentEvents.filter((event) => {
      const referenceDate = event.lastPaymentDate || event.date;
      if (!referenceDate) return false;
      const daysSinceLastActivity = getDaysSince(referenceDate);
      return daysSinceLastActivity >= 50;
    });
  }, [currentEvents]);


  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);

  const toggleNotificationsPanel = () => {
    setIsNotificationsPanelOpen(!isNotificationsPanelOpen);
  };

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
        toast.success("Evento eliminado exitosamente"); // Notificación de éxito
      } else {
        console.error("Respuesta del servidor:", responseData);
        toast.error(`Error al eliminar el evento: ${responseData.error || "Error desconocido"}`); // Notificación de error
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
      toast.error("Ocurrió un error al intentar eliminar el evento."); // Notificación de error
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
        {/* Botón de Notificaciones */}
        <button
          onClick={toggleNotificationsPanel}
          className="relative w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 flex items-center justify-center"
          title="Ver notificaciones"
        >
          <BellIcon className="h-6 w-6" />

          {pendingEvents.length > 0 && (
            <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingEvents.length}
            </span>
          )}
        </button>
      </div>

{/* Panel de Notificaciones */}
{isNotificationsPanelOpen && (
  <div 
    className="fixed top-20 right-10 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 animate-slide-in"
    style={{ animationDuration: '0.3s' }}
  >
    {/* Título con ícono */}
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-gray-900 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-blue-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 110-6 3 3 0 010 6z" />
        </svg>
        Notificaciones
      </h3>
      <button
        onClick={() => setIsNotificationsPanelOpen(false)}
        className="text-gray-500 hover:text-gray-700 transition duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>

    {/* Contenido de las notificaciones */}
    {pendingEvents.length > 0 ? (
      pendingEvents.map((event) => {
        const daysSinceLastActivity = getDaysSince(event.lastPaymentDate || event.date);
        return (
          <div key={event.id} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.774-1.029 2.034-1.029 2.808 0l1.584 2.112a.75.75 0 00.652.236h3.586a.75.75 0 010 1.5H11.94a.75.75 0 00-.652.236l-1.584 2.112a.75.75 0 00.652 1.264h3.586a.75.75 0 010 1.5H10.06a.75.75 0 00-.652 1.264l1.584 2.112a.75.75 0 00.652.236h3.586a.75.75 0 010 1.5H8.257a.75.75 0 00-.652-1.264l-1.584-2.112a.75.75 0 00-.652-1.264H4.414a.75.75 0 010-1.5h3.586a.75.75 0 00.652-1.264l-1.584-2.112a.75.75 0 00-.652-1.264H4.414a.75.75 0 010-1.5h3.586a.75.75 0 00.652-1.264z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-800">{event.name}</p>
                <p className="text-xs text-red-600">
                  ¡Atención! Han pasado {daysSinceLastActivity} días desde el último pago.
                </p>
                <p className="text-xs text-red-600">
                  Su teléfono: {event.phone}.
                </p>
                <p className="text-xs text-red-600">
                   Su correo: {event.email}
                </p>
              </div>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-sm text-gray-500 text-center py-6">No hay eventos pendientes de pago.</p>
    )}
  </div>
)}
      
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
                  Último pago
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

                // Determinar la fecha de referencia (último pago o fecha de creación)
                const referenceDate = event.lastPaymentDate || event.date;

                // Calcular los días transcurridos desde la fecha de referencia
                const daysSinceLastActivity = referenceDate ? getDaysSince(referenceDate) : null;

                // Formatear la fecha del último pago
                const lastPaymentFormatted = event.lastPaymentDate
                  ? new Date(event.lastPaymentDate).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "N/A";

                return (
                  <tr key={event.id} className="hover:bg-gray-50 transition duration-300">
                    {/* Columnas existentes */}
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
                    {/* Nueva columna para recordatorios */}
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {daysSinceLastActivity >= 50 ? (
                        <span className="text-yellow-600 font-semibold">
                          {lastPaymentFormatted}. ¡Recuerda pagar pronto!
                        </span>
                      ) : (
                        <span className="text-green-600">Al día: {lastPaymentFormatted} Último pago.</span>
                      )}
                    </td>
                    {/* Acciones */}
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
                        href={`/avisos?id=${event.id}&email=${encodeURIComponent(event.email || "")}`}
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
                      <button
                        onClick={() => openDetailsModal(event)}
                        className="p-1 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition duration-300"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {event.phone && (
                        <a
                          href={`https://wa.me/${"+549" + event.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, quería consultar sobre el evento.")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md bg-green-500 text-white hover:bg-green-600 transition duration-300"
                          title="Enviar mensaje por WhatsApp"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9a1 1 0 10-2 0v3H7a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </a>
                      )}
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

                    {/* Sección de Observaciones */}
                    <div className="flex items-center mt-6 mb-4">
                      <span className="text-lg text-gray-500 mr-2">•</span> {/* Punto de lista */}
                      <h2 className="text-lg font-semibold text-gray-800">Observaciones</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                      <strong>Observaciones:</strong> {selectedEvent.observations || "N/A"}
                      <br />
                      <strong>Archivo Adjunto:</strong>{" "}
                      {selectedEvent.fileUrl ? (
                        <a
                          href={selectedEvent.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Ver Archivo
                        </a>
                      ) : (
                        "No tiene archivos subidos"
                      )}
                    </p>

                    {/* Sección de Menú */}
                    <div className="flex items-center mt-6 mb-4">
                      <span className="text-lg text-gray-500 mr-2">•</span> {/* Punto de lista */}
                      <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                      <strong></strong> {selectedEvent.menu || "N/A"}
                    </p>

                    {/* Datos del Cliente */}
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

                    {/* Sección de Vendedor */}
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