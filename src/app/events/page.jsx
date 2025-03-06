// src/app/(admin)/events/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import EventList from "../components/EventList";

const EventsPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        alert("Evento eliminado exitosamente");
        setEvents(events.filter((event) => event.id !== id));
      } else {
        alert("Error al eliminar el evento");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (event) => {
    // Redirige a la página de edición
    window.location.href = `/edit-event/${event.id}`;
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lista de Eventos</h2>
      <EventList events={events} onDelete={handleDelete} onEdit={handleEdit} />
    </div>
  );
};

export default EventsPage;