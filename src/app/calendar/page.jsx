'use client'
import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Card from "../components/Card";
import Button from "../components/Button";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  RefreshCw,
  Eye,
  Users,
  DollarSign,
  MapPin,
  Phone,
  Clock,
  User,
  Tag,
  X,
  Plus
} from "lucide-react";
import Link from "next/link";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [calendarApi, setCalendarApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/event-list");
      if (!response.ok) throw new Error("Error al cargar los eventos");

      const data = await response.json();
      const formattedEvents = data.map((event) => {
        const isPaid = event.remainingBalance <= 0;
        return {
          id: event.id.toString(),
          title: event.name,
          start: event.date,
          end: event.date,
          backgroundColor: isPaid ? "#10b981" : "#f59e0b",
          borderColor: isPaid ? "#059669" : "#d97706",
          textColor: "#fff",
          extendedProps: {
            guests: event.guests,
            total: event.total,
            remainingBalance: event.remainingBalance,
            address: event.address,
            phone: event.phone,
            observations: event.observations,
            seller: event.seller ? event.seller.name : "No asignado",
            eventType: event.eventType ? event.eventType.name : "Sin tipo",
            isPaid: isPaid,
          },
        };
      });

      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);
    } catch (error) {
      console.error("Error al cargar los eventos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter events by type
  useEffect(() => {
    let filtered = [...events];
    
    if (filterType === "paid") {
      filtered = filtered.filter(event => event.extendedProps.isPaid);
    } else if (filterType === "pending") {
      filtered = filtered.filter(event => !event.extendedProps.isPaid);
    }

    if (selectedMonthYear) {
      filtered = filtered.filter(event =>
        event.start.substring(0, 7) === selectedMonthYear
      );
    }

    setFilteredEvents(filtered);
  }, [events, filterType, selectedMonthYear]);

  const handleMonthYearChange = (e) => {
    const date = e.target.value;
    setSelectedMonthYear(date);
    if (calendarApi) {
      const [year, month] = date.split("-");
      calendarApi.gotoDate(new Date(year, month - 1));
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setOpenModal(true);
  };

  const handlePrevMonth = () => {
    if (calendarApi) {
      calendarApi.prev();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleNextMonth = () => {
    if (calendarApi) {
      calendarApi.next();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleToday = () => {
    if (calendarApi) {
      calendarApi.today();
      setCurrentDate(new Date());
    }
  };

  const getEventStats = () => {
    const total = filteredEvents.length;
    const paid = filteredEvents.filter(event => event.extendedProps.isPaid).length;
    const pending = total - paid;
    
    return { total, paid, pending };
  };

  const stats = getEventStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Vista de Calendario
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-display">
            Calendario de{" "}
            <span className="text-gradient">Eventos</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Visualiza y gestiona todos tus eventos en una vista de calendario intuitiva y moderna.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="elevated" padding="md" className="animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Eventos</p>
                <p className="text-3xl font-bold text-gray-900 font-display">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pagados</p>
                <p className="text-3xl font-bold text-green-600 font-display">{stats.paid}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 font-display">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <Card variant="elevated" padding="lg" className="mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Month/Year Selector */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <input
                  type="month"
                  value={selectedMonthYear || ""}
                  onChange={handleMonthYearChange}
                  className="form-input min-w-[150px]"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="form-input min-w-[150px]"
                >
                  <option value="all">Todos los eventos</option>
                  <option value="paid">Solo pagados</option>
                  <option value="pending">Solo pendientes</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={fetchEvents} variant="secondary" size="md" loading={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              
              <Link href="/create-event">
                <Button variant="primary" size="md">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Evento
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Calendar */}
        <Card variant="elevated" padding="lg" className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          {/* Custom Calendar Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900 font-display">
                {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Pagado</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pendiente</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={handlePrevMonth} variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button onClick={handleToday} variant="secondary" size="sm">
                Hoy
              </Button>
              <Button onClick={handleNextMonth} variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-gray-600">Cargando calendario...</p>
              </div>
            </div>
          ) : (
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={filteredEvents}
                eventClick={handleEventClick}
                headerToolbar={false}
                locale="es"
                datesSet={(info) => {
                  if (!calendarApi) setCalendarApi(info.view.calendar);
                  setCurrentDate(info.view.currentStart);
                }}
                height="auto"
                contentHeight="auto"
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventDisplay="block"
                dayHeaderFormat={{ weekday: 'long' }}
              />
            </div>
          )}
        </Card>

        {/* Event Details Modal */}
        {openModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card variant="elevated" padding="none" className="w-full max-w-md max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 font-display">
                    {selectedEvent.title}
                  </h3>
                  <button
                    onClick={() => setOpenModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      selectedEvent.extendedProps.isPaid ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  ></div>
                  <span className={`text-sm font-medium ${
                    selectedEvent.extendedProps.isPaid ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {selectedEvent.extendedProps.isPaid ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedEvent.start).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Tag className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Tipo de evento</p>
                      <p className="font-medium text-gray-900">{selectedEvent.extendedProps.eventType}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Vendedor</p>
                      <p className="font-medium text-gray-900">{selectedEvent.extendedProps.seller}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Invitados</p>
                      <p className="font-medium text-gray-900">{selectedEvent.extendedProps.guests}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-medium text-gray-900">${selectedEvent.extendedProps.total?.toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedEvent.extendedProps.remainingBalance > 0 && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-500">Saldo pendiente</p>
                        <p className="font-medium text-yellow-600">${selectedEvent.extendedProps.remainingBalance?.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium text-gray-900">{selectedEvent.extendedProps.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium text-gray-900">{selectedEvent.extendedProps.phone}</p>
                    </div>
                  </div>

                  {selectedEvent.extendedProps.observations && (
                    <div className="flex items-start space-x-3">
                      <Eye className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Observaciones</p>
                        <p className="font-medium text-gray-900">{selectedEvent.extendedProps.observations}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100">
                <Button 
                  onClick={() => setOpenModal(false)} 
                  variant="primary" 
                  className="w-full"
                >
                  Cerrar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
