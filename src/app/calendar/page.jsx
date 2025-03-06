// src/app/calendar/page.jsx
"use client"; // Necesario porque usaremos componentes interactivos

import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);

  // Función para cargar los eventos desde la API
  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Error al cargar los eventos");
      
      const data = await response.json();

      // Formatear los eventos para FullCalendar
      const formattedEvents = data.map((event) => ({
        id: event.id.toString(),
        title: event.name,
        start: event.date, // FullCalendar espera fechas en formato ISO
        end: event.date,   // Puedes ajustar esto si los eventos tienen una duración
        extendedProps: {
          total: event.total,
          guests: event.guests,
        },
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error al cargar los eventos:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Calendario de Eventos
      </h1>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventContent={({ event }) => (
            <div className="text-xs text-gray-700">
              <strong>{event.title}</strong>
              <br />
              <span>Invitados: {event.extendedProps.guests}</span>
            </div>
          )}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          height="auto" // Altura automática para adaptarse al contenido
          contentHeight="auto" // Altura del contenido también automática
          themeSystem="standard" // Usar estilos estándar para personalización
          className="rounded-lg" // Clase de Tailwind para bordes redondeados
        />
      </div>
    </div>
  );
};

export default CalendarPage;
