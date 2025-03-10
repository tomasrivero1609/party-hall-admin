"use client";

import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Paper, Typography } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1a73e8",
    },
    secondary: {
      main: "#34a853",
    },
  },
});

const CalendarPage = () => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/event-list");
      if (!response.ok) throw new Error("Error al cargar los eventos");
      
      const data = await response.json();

      const formattedEvents = data.map((event) => ({
        id: event.id.toString(),
        title: event.name,
        start: event.date,
        end: event.date,
        backgroundColor: "#1a73e8",
        borderColor: "#1a73e8",
        textColor: "#fff",
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
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
        <Typography variant="h4" color="primary" className="mb-4 font-bold">
          Calendario de Eventos
        </Typography>
        <Paper elevation={3} className="w-full max-w-5xl p-6 rounded-lg">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventContent={({ event }) => (
              <div className="text-xs text-white font-medium">
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
            height="auto"
            contentHeight="auto"
            themeSystem="standard"
            className="rounded-lg"
          />
        </Paper>
      </div>
    </ThemeProvider>
  );
};

export default CalendarPage;
