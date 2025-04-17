"use client";

import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import EventList from "../components/EventListDetails";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"

  const fetchEvents = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/event-list");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div role="status" className="flex flex-col items-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="mt-4 text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center px-4">
        <div className="max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-red-500 mb-4">No se pudieron cargar los eventos.</p>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4">
        <div className="max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No hay eventos disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-12 pt-20">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Eventos Disponibles</h1>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Actualizar
          </button>
        </header>
        <EventList events={events} />
        <footer className="mt-4 text-sm text-gray-500 text-center">
          Total de eventos: {events.length}
        </footer>
      </div>
    </main>
  );
}
