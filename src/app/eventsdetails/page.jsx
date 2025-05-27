"use client";

import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import EventList from "../components/EventListDetails";
import Card from "../components/Card";
import Button from "../components/Button";
import { 
  Calendar, 
  RefreshCw, 
  Plus, 
  AlertCircle,
  Eye
} from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");

  const fetchEvents = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/event-list");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const eventsArray = Array.isArray(data) ? data : [];
      setEvents(eventsArray);
      setStatus("success");
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error("Error al cargar eventos");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (status === "loading") {
    return (
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8">
        <Card padding="lg" className="text-center max-w-md">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando eventos</h3>
              <p className="text-gray-600">Obteniendo la información más reciente...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8 px-4">
        <Card padding="lg" className="text-center max-w-md">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error de conexión</h3>
              <p className="text-gray-600 mb-4">No se pudieron cargar los eventos.</p>
              <Button onClick={fetchEvents} variant="primary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8 px-4">
        <Card padding="lg" className="text-center max-w-md">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos</h3>
              <p className="text-gray-600 mb-4">Aún no se han creado eventos en el sistema.</p>
              <Link href="/create-event">
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Evento
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
            <Eye className="h-4 w-4 mr-2" />
            Gestión de Eventos
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-display">
            Eventos{" "}
            <span className="text-gradient">Disponibles</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Administra y supervisa todos tus eventos desde un panel centralizado con herramientas avanzadas de filtrado y búsqueda.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex justify-center mb-8 animate-slide-up">
          <div className="flex gap-3">
            <Button onClick={fetchEvents} variant="secondary" size="md">
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

        {/* Events List with integrated filters */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <EventList events={events} />
        </div>
      </div>
    </div>
  );
}
