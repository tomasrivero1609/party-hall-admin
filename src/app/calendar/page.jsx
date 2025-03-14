"use client";

import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Paper, Typography, TextField } from "@mui/material";

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
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [calendarApi, setCalendarApi] = useState(null);

  // Obtener los eventos
  const fetchEvents = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Función para manejar el cambio de mes y año
  const handleMonthYearChange = (e) => {
    const date = e.target.value;
    setSelectedMonthYear(date);
  };

  // Filtrar los eventos por el mes y año seleccionados
  const filteredEvents = selectedMonthYear
    ? events.filter((event) => {
        const eventMonthYear = event.start.substring(0, 7); // El formato es YYYY-MM
        return eventMonthYear === selectedMonthYear;
      })
    : events;

  // Función para actualizar la vista de FullCalendar según la fecha seleccionada
  useEffect(() => {
    if (calendarApi && selectedMonthYear) {
      const [year, month] = selectedMonthYear.split("-");
      const targetDate = new Date(year, month - 1); // El mes en FullCalendar es 0-indexed
      requestAnimationFrame(() => {
        calendarApi.gotoDate(targetDate); // Cambiar la fecha al mes/año seleccionado
      });
    }
  }, [selectedMonthYear, calendarApi]);

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
        {/* Título minimalista */}
        <Typography
          variant="h5"  // Cambié el tamaño del título a h5 para hacerlo más pequeño
          color="primary"
          className="mb-8 font-bold text-center"
        >
          Calendario de Eventos
        </Typography>

        {/* Input de búsqueda para seleccionar mes y año */}
        <div className="flex items-center mb-6 mt-6 w-full max-w-xs">  {/* Ajusté el margen inferior */}
          <TextField
            type="month"
            value={selectedMonthYear || ""}
            onChange={handleMonthYearChange}
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            label="Seleccionar mes y año"
            className="mr-4"
          />
        </div>

        <Paper elevation={3} className="w-full max-w-5xl p-6 rounded-lg">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={filteredEvents} // Usar los eventos filtrados por mes y año
            eventContent={({ event }) => (
              <div className="text-xs text-white font-medium">
                <strong>{event.title}</strong>
                <br />
                <span>Invitados: {event.extendedProps.guests}</span>
              </div>
            )}
            headerToolbar={{
              left: "prev,next",
              center: "title", // El título se actualizará automáticamente
              right: "dayGridMonth",
            }}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            height="auto"
            contentHeight="auto"
            themeSystem="standard"
            aspectRatio={1.5}
            className="rounded-lg"
            eventClassNames="custom-event"
            locale="es" // Establecer el idioma a español
            datesSet={(info) => {
              // Guardamos la referencia de la API de FullCalendar
              if (!calendarApi) setCalendarApi(info.view.calendar);
            }}
          />
        </Paper>
      </div>
    </ThemeProvider>
  );
};

export default CalendarPage;
