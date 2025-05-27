import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import EditEventModal from "./EditEventModal";
import React, { useState, useMemo, useEffect } from "react";
import {
  TrashIcon,
  EnvelopeIcon,
  BellIcon,
  CreditCardIcon,
  PencilIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
} from "@heroicons/react/24/solid";

const EventList = ({ events: initialEvents }) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "user";
  const [filterEventType, setFilterEventType] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [readNotifications, setReadNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'total', 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' o 'desc'
  
  const eventsPerPage = 6; // Óptimo para el diseño de cards

  const openEditModal = (event) => {
    setSelectedEvent({
      ...event,
      eventTypeId: event.eventType?.id || "",
    });
    setIsEditModalOpen(true);
  };
  
  const closeEditModal = () => {
    setSelectedEvent(null);
    setIsEditModalOpen(false);
  };
  
  const handleUpdateEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

  const currencySymbolMap = {
    ARS: "$",
    USD: "U$S",
  };

  const formatToLocalTimeOnly = (utcDate) => {
    if (!utcDate) return "N/A";
    const date = new Date(utcDate);
    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "America/Argentina/Buenos_Aires",
    };
    return new Intl.DateTimeFormat("es-AR", options).format(date);
  };

  if (!Array.isArray(events)) {
    return <p className="text-red-500">Error: No se encontraron eventos.</p>;
  }

  const allEventTypes = useMemo(() => {
    return [...new Set(events.map((event) => event.eventType?.name || "Sin tipo"))];
  }, [events]);

  const getDaysSince = (date) => {
    const today = new Date();
    const targetDate = new Date(date);
    const timeDifference = today - targetDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  };

  // Filtrar y ordenar eventos
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter((event) => {
      const matchesEventType = filterEventType
        ? event.eventType?.name === filterEventType
        : true;
      const matchesSearchTerm = searchTerm
        ? event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.phone?.includes(searchTerm)
        : true;
      return matchesEventType && matchesSearchTerm;
    });

    // Ordenar eventos
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          const getDaysA = getDaysSince(a.lastPaymentDate || a.date);
          const getDaysB = getDaysSince(b.lastPaymentDate || b.date);
          aValue = getDaysA >= 50 ? 1 : 0; // 1 para pendiente, 0 para al día
          bValue = getDaysB >= 50 ? 1 : 0;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [events, filterEventType, searchTerm, sortBy, sortOrder]);

  // Paginación
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredAndSortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredAndSortedEvents.length / eventsPerPage);

  const formatNumber = (number) => number.toLocaleString("es-CL");

  const pendingEvents = useMemo(() => {
    return currentEvents.filter((event) => {
      const referenceDate = event.lastPaymentDate || event.date;
      if (!referenceDate) return false;
      const daysSinceLastActivity = getDaysSince(referenceDate);
      return daysSinceLastActivity >= 50;
    });
  }, [currentEvents]);

  const toggleNotificationsPanel = () => {
    setIsNotificationsPanelOpen(!isNotificationsPanelOpen);
  };

  const openDetailsModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
  };

  const closeDetailsModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
    // Restaurar scroll del body
    document.body.style.overflow = 'unset';
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
        toast.success("Evento eliminado exitosamente");
      } else {
        console.error("Respuesta del servidor:", responseData);
        toast.error(`Error al eliminar el evento: ${responseData.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
      toast.error("Ocurrió un error al intentar eliminar el evento.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (eventId) => {
    if (!readNotifications.includes(eventId)) {
      setReadNotifications([...readNotifications, eventId]);
    }
  };

  const markAsUnread = (eventId) => {
    setReadNotifications(readNotifications.filter((id) => id !== eventId));
  };

  useEffect(() => {
    localStorage.setItem("readNotifications", JSON.stringify(readNotifications));
  }, [readNotifications]);

  useEffect(() => {
    const savedReadNotifications = JSON.parse(localStorage.getItem("readNotifications")) || [];
    setReadNotifications(savedReadNotifications);
  }, []);

  // Cleanup effect para restaurar scroll del body
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Componente para las acciones de cada evento
  const EventActions = ({ event }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <button
                onClick={() => {
                  openDetailsModal(event);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <EyeIcon className="h-4 w-4" />
                Ver Detalles
              </button>

              {["admin", "subadmin"].includes(userRole) && (
                <Link
                  href={`/payments_list/${event.id}`}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <CreditCardIcon className="h-4 w-4" />
                  Ver Pagos
                </Link>
              )}

              {userRole === "admin" && (
                <>
                  <button
                    onClick={() => {
                      openEditModal(event);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Editar Evento
                  </button>

                  <Link
                    href={`/avisos?id=${event.id}&email=${encodeURIComponent(event.email || "")}`}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    Enviar Aviso
                  </Link>

                  {event.phone && (
                    <a
                      href={`https://wa.me/${"+549" + event.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, quería consultar sobre el evento: " + event.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      onClick={() => setIsOpen(false)}
                    >
                      <PhoneIcon className="h-4 w-4" />
                      WhatsApp
                    </a>
                  )}

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={() => {
                      deleteEvent(event.id);
                      setIsOpen(false);
                    }}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Eliminar Evento
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Componente para cada card de evento
  const EventCard = ({ event }) => {
    const formattedDate = event.date && event.date.split("-").length === 3
      ? `${event.date.split("-")[2]}/${event.date.split("-")[1]}/${event.date.split("-")[0]}`
      : "Fecha no disponible";

    const referenceDate = event.lastPaymentDate || event.date;
    const daysSinceLastActivity = referenceDate ? getDaysSince(referenceDate) : null;
    const isPending = daysSinceLastActivity >= 50;

    const lastPaymentFormatted = event.lastPaymentDate
      ? new Date(event.lastPaymentDate).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "N/A";

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
        {/* Header del card */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {event.name}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {event.eventType?.name || "Sin tipo"}
                </span>
                {isPending ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <ExclamationTriangleIconSolid className="h-3 w-3 mr-1" />
                    Pendiente
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIconSolid className="h-3 w-3 mr-1" />
                    Al día
                  </span>
                )}
              </div>
            </div>
            <EventActions event={event} />
          </div>

          {/* Información principal */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span>{formattedDate}</span>
              <ClockIcon className="h-4 w-4 text-gray-400 ml-2" />
              <span>{formatToLocalTimeOnly(event.startTime)}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <UserGroupIcon className="h-4 w-4 text-gray-400" />
              <span>{event.guests} invitados</span>
              {event.phone && (
                <>
                  <PhoneIcon className="h-4 w-4 text-gray-400 ml-2" />
                  <span>{event.phone}</span>
                </>
              )}
            </div>

            {event.address && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                <span className="line-clamp-1">{event.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer del card */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-sm font-semibold text-gray-900">
                  {currencySymbolMap[event.currency]}{formatNumber(event.total)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Saldo</p>
                <p className={`text-sm font-semibold ${event.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {currencySymbolMap[event.currency]}{formatNumber(event.remainingBalance)}
                </p>
              </div>
            </div>

            <button
              onClick={() => openDetailsModal(event)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              Ver Detalles
            </button>
          </div>

          {isPending && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-yellow-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-3 w-3" />
                {daysSinceLastActivity} días sin pago
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Barra superior con búsqueda y filtros */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar eventos, email o teléfono..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Filtro por tipo */}
            <div className="relative min-w-[180px]">
              <select
                value={filterEventType}
                onChange={(e) => {
                  setFilterEventType(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
              >
                <option value="">Todos los tipos</option>
                {allEventTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Limpiar filtros */}
            {(searchTerm || filterEventType) && (
              <button
                onClick={() => {
                  setFilterEventType("");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Limpiar
              </button>
            )}

            {/* Botón de notificaciones */}
            <button
              onClick={toggleNotificationsPanel}
              className="relative p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              title="Ver notificaciones"
            >
              <BellIcon className="h-5 w-5" />
              {pendingEvents.filter((event) => !readNotifications.includes(event.id)).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
                  {pendingEvents.filter((event) => !readNotifications.includes(event.id)).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Controles de vista y ordenamiento */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Selector de ordenamiento */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Fecha</option>
                <option value="name">Nombre</option>
                <option value="total">Total</option>
                <option value="status">Estado</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                title={`Ordenar ${sortOrder === 'desc' ? 'descendente' : 'ascendente'}`}
              >
                <svg className={`h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{filteredAndSortedEvents.length}</span> de{" "}
            <span className="font-semibold text-gray-900">{events.length}</span> eventos
            {searchTerm && (
              <span> para "<span className="font-semibold text-blue-600">{searchTerm}</span>"</span>
            )}
            {filterEventType && (
              <span> • <span className="font-semibold text-blue-600">{filterEventType}</span></span>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {isEditModalOpen && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onClose={closeEditModal}
          onUpdate={handleUpdateEvent}
          allEventTypes={allEventTypes}
        />
      )}

      {/* Panel de notificaciones */}
      {isNotificationsPanelOpen && (
        <div className="fixed top-20 right-10 z-[55] w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 animate-slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-blue-500" />
              Notificaciones
            </h3>
            <button
              onClick={() => setIsNotificationsPanelOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition duration-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {pendingEvents.length > 0 ? (
            <div className="space-y-4">
              {pendingEvents.map((event) => {
                const daysSinceLastActivity = getDaysSince(event.lastPaymentDate || event.date);
                return (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${
                      readNotifications.includes(event.id)
                        ? "bg-gray-100 border-gray-300"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{event.name}</p>
                        <p className="text-xs text-yellow-600 mt-1">
                          {daysSinceLastActivity} días sin pago
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {event.phone} • {event.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => markAsRead(event.id)}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition duration-300"
                      >
                        Marcar leída
                      </button>
                      <button
                        onClick={() => markAsUnread(event.id)}
                        className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600 transition duration-300"
                      >
                        Marcar no leída
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No hay eventos pendientes</p>
            </div>
          )}
        </div>
      )}

      {/* Grid de eventos */}
      {filteredAndSortedEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron eventos</h3>
              <p className="text-gray-600">
                {searchTerm || filterEventType 
                  ? "Intenta ajustar los filtros o términos de búsqueda."
                  : "Aún no hay eventos registrados en el sistema."
                }
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-4">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Mostrando <span className="font-medium">{indexOfFirstEvent + 1}</span> a{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastEvent, filteredAndSortedEvents.length)}
                  </span>{" "}
                  de <span className="font-medium">{filteredAndSortedEvents.length}</span> eventos
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                  Anterior
                </button>
                
                <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-blue-50 border border-blue-200 rounded-lg">
                  Página {currentPage} de {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Siguiente
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

             {/* Modal de detalles mejorado */}
       {isModalOpen && selectedEvent && (
         <div className="fixed inset-0 z-[60] overflow-y-auto">
           <div className="flex items-center justify-center min-h-screen px-4 py-8">
             <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-all duration-300" onClick={closeDetailsModal}></div>

             <div className="relative bg-white rounded-2xl shadow-2xl transform transition-all max-w-4xl w-full max-h-[85vh] overflow-hidden z-10 animate-scale-in my-8">
                                {/* Header del modal */}
                 <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
                   <div className="flex items-start justify-between">
                     <div className="flex items-start space-x-4 flex-1 min-w-0">
                       <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                         <CalendarIcon className="h-6 w-6" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <h3 className="text-xl font-bold text-white mb-1 break-words">{selectedEvent.name}</h3>
                         <p className="text-blue-100 text-sm">
                           {selectedEvent.date && selectedEvent.date.split("-").length === 3
                             ? `${selectedEvent.date.split("-")[2]}/${selectedEvent.date.split("-")[1]}/${selectedEvent.date.split("-")[0]}`
                             : "Fecha no disponible"}
                         </p>
                       </div>
                     </div>
                     <button
                       onClick={closeDetailsModal}
                       className="modal-close-button w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-4"
                       title="Cerrar modal"
                     >
                       <XMarkIcon className="h-6 w-6" />
                     </button>
                   </div>

                   {/* Estado y tipo */}
                   <div className="flex flex-wrap items-center gap-3 mt-4">
                     <span className="modal-event-type inline-flex items-center px-4 py-2 rounded-full text-sm">
                       {selectedEvent.eventType?.name || "Sin tipo"}
                     </span>
                     {(() => {
                       const referenceDate = selectedEvent.lastPaymentDate || selectedEvent.date;
                       const daysSinceLastActivity = referenceDate ? getDaysSince(referenceDate) : null;
                       const isPending = daysSinceLastActivity >= 50;
                       
                       return isPending ? (
                         <span className="modal-status-badge inline-flex items-center px-4 py-2 rounded-full text-sm bg-yellow-100 text-yellow-800 border-yellow-200">
                           <ExclamationTriangleIconSolid className="h-4 w-4 mr-2" />
                           Pendiente ({daysSinceLastActivity} días)
                         </span>
                       ) : (
                         <span className="modal-status-badge inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-100 text-green-800 border-green-200">
                           <CheckCircleIconSolid className="h-4 w-4 mr-2" />
                           Al día
                         </span>
                       );
                     })()}
                   </div>
                 </div>

               {/* Contenido del modal */}
               <div className="overflow-y-auto max-h-[calc(85vh-180px)]">
                 <div className="p-8">
                   {/* Información principal en cards */}
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                     {/* Card de información básica */}
                     <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                       <div className="flex items-center mb-4">
                         <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                         <h4 className="font-semibold text-blue-900">Información del Evento</h4>
                       </div>
                       <div className="space-y-3">
                         <div className="flex items-center">
                           <UserGroupIcon className="h-4 w-4 text-blue-500 mr-2" />
                           <span className="text-sm text-blue-700">{selectedEvent.guests} invitados</span>
                         </div>
                         <div className="flex items-center">
                           <ClockIcon className="h-4 w-4 text-blue-500 mr-2" />
                           <span className="text-sm text-blue-700">
                             {formatToLocalTimeOnly(selectedEvent.startTime)} - {formatToLocalTimeOnly(selectedEvent.endTime)}
                           </span>
                         </div>
                         {selectedEvent.address && (
                           <div className="flex items-start">
                             <MapPinIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-blue-700 break-words min-w-0 flex-1">{selectedEvent.address}</span>
                           </div>
                         )}
                       </div>
                     </div>

                     {/* Card financiera */}
                     <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                       <div className="flex items-center mb-4">
                         <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                         <h4 className="font-semibold text-green-900">Información Financiera</h4>
                       </div>
                       <div className="space-y-4">
                         <div>
                           <p className="text-xs text-green-600 uppercase tracking-wide">Total del Evento</p>
                           <p className="text-2xl font-bold text-green-900">
                             {currencySymbolMap[selectedEvent.currency]}{formatNumber(selectedEvent.total)}
                           </p>
                         </div>
                         <div>
                           <p className="text-xs text-green-600 uppercase tracking-wide">Saldo Restante</p>
                           <p className={`text-xl font-bold ${selectedEvent.remainingBalance > 0 ? 'text-red-600' : 'text-green-700'}`}>
                             {currencySymbolMap[selectedEvent.currency]}{formatNumber(selectedEvent.remainingBalance)}
                           </p>
                         </div>
                         <div>
                           <p className="text-xs text-green-600 uppercase tracking-wide">Precio por Plato</p>
                           <p className="text-lg font-semibold text-green-800">
                             {currencySymbolMap[selectedEvent.currency]}{formatNumber(selectedEvent.pricePerPlate)}
                           </p>
                         </div>
                       </div>
                     </div>

                                            {/* Card de contacto */}
                       <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                         <div className="flex items-center mb-4">
                           <PhoneIcon className="h-5 w-5 text-purple-600 mr-2" />
                           <h4 className="font-semibold text-purple-900">Datos de Contacto</h4>
                         </div>
                         <div className="space-y-3">
                           {selectedEvent.phone && (
                             <div className="flex items-start">
                               <PhoneIcon className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                               <a href={`tel:${selectedEvent.phone}`} className="text-sm text-purple-700 hover:text-purple-900 hover:underline break-all">
                                 {selectedEvent.phone}
                               </a>
                             </div>
                           )}
                           {selectedEvent.email && (
                             <div className="flex items-start">
                               <EnvelopeIcon className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                               <a href={`mailto:${selectedEvent.email}`} className="text-sm text-purple-700 hover:text-purple-900 hover:underline break-all min-w-0 flex-1">
                                 {selectedEvent.email}
                               </a>
                             </div>
                           )}
                           {selectedEvent.seller?.name && (
                             <div className="mt-4 pt-3 border-t border-purple-200">
                               <p className="text-xs text-purple-600 uppercase tracking-wide">Vendedor Asignado</p>
                               <p className="text-sm font-medium text-purple-800 break-words">{selectedEvent.seller.name}</p>
                             </div>
                           )}
                         </div>
                       </div>
                   </div>

                   {/* Secciones adicionales */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Menú y observaciones */}
                       <div className="space-y-6">
                         {selectedEvent.menu && (
                           <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                             <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                               <svg className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                               </svg>
                               Menú del Evento
                             </h4>
                             <div className="bg-white rounded-lg p-4 border border-gray-200">
                               <p className="text-gray-700 whitespace-pre-wrap break-words">{selectedEvent.menu}</p>
                             </div>
                           </div>
                         )}

                         {selectedEvent.observations && (
                           <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                             <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                               <svg className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                               </svg>
                               Observaciones
                             </h4>
                             <div className="bg-white rounded-lg p-4 border border-gray-200">
                               <p className="text-gray-700 whitespace-pre-wrap break-words">{selectedEvent.observations}</p>
                             </div>
                           </div>
                         )}
                       </div>

                     {/* Archivos adjuntos */}
                     {selectedEvent.fileUrls && selectedEvent.fileUrls.length > 0 && (
                       <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                         <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                           <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                           </svg>
                           Archivos Adjuntos
                         </h4>
                         <div className="space-y-3">
                           {selectedEvent.fileUrls.map((url, index) => {
                             const fileName = url.split("/").pop();
                             const fileType = fileName.split(".").pop().toUpperCase();
                             return (
                               <a
                                 key={index}
                                 href={url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                               >
                                 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                                   <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                   </svg>
                                 </div>
                                 <div className="flex-1">
                                   <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">{fileName}</p>
                                   <p className="text-xs text-gray-500">{fileType}</p>
                                 </div>
                                 <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                 </svg>
                               </a>
                             );
                           })}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               {/* Footer del modal */}
               <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                 <div className="text-sm text-gray-500 order-2 sm:order-1">
                   Evento creado el {new Date(selectedEvent.createdAt || selectedEvent.date).toLocaleDateString("es-AR")}
                 </div>
                 <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                   <button
                     onClick={closeDetailsModal}
                     className="px-6 py-2.5 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center justify-center"
                   >
                     Cerrar
                   </button>
                   {userRole === "admin" && (
                     <button
                       onClick={() => {
                         openEditModal(selectedEvent);
                         closeDetailsModal();
                       }}
                       className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
                     >
                       <PencilIcon className="h-4 w-4 mr-2" />
                       Editar Evento
                     </button>
                   )}
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default EventList;