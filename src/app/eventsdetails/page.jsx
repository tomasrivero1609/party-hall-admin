"use client";

import React, { useEffect, useState } from "react";
import EventList from "../components/EventListDetails";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  // Cargar los eventos desde el endpoint /api/event-list
  useEffect(() => {
    fetch("/api/event-list")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data); // Guarda los eventos en el estado
        setLoading(false); // Finaliza la carga
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false); // Finaliza la carga incluso si hay un error
      });
  }, []);

  // Mensaje de carga
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full text-blue-500" role="status" aria-label="loading">
          <span className="sr-only">Cargando...</span>
        </div>
        <p className="text-gray-600 mt-2">Cargando eventos...</p>
      </div>
    );
  }

  // Si no hay eventos disponibles
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16 text-center">
        <p className="text-gray-600">No hay eventos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lista de Eventos</h2>
      <EventList events={events} />
    </div>
  );
};

export default EventsPage;