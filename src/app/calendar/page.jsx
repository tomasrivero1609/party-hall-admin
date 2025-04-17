'use client'
import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Paper,
  Typography,
  TextField,
  Modal,
  Box,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#1a73e8" },
    secondary: { main: "#34a853" },
  },
});

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [calendarApi, setCalendarApi] = useState(null);

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
          guests: event.guests,
          total: event.total,
          remainingBalance: event.remainingBalance,
          address: event.address,
          phone: event.phone,
          observations: event.observations,
          seller: event.seller ? event.seller.name : "No asignado",
          eventType: event.eventType ? event.eventType.name : "Sin tipo",
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

  const handleMonthYearChange = (e) => {
    const date = e.target.value;
    setSelectedMonthYear(date);
    if (calendarApi) {
      const [year, month] = date.split("-");
      calendarApi.gotoDate(new Date(year, month - 1));
    }
  };

  useEffect(() => {
    if (calendarApi && selectedMonthYear) {
      const [year, month] = selectedMonthYear.split("-");
      calendarApi.gotoDate(new Date(year, month - 1));
    }
  }, [selectedMonthYear, calendarApi]);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setOpenModal(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-100 pt-20 px-4 flex flex-col items-center">
        <Typography variant="h5" color="primary" className="mb-6 font-bold text-center">
          Calendario de Eventos
        </Typography>

        <div className="flex items-center mb-4 w-full max-w-xs">
          <TextField
            type="month"
            value={selectedMonthYear || ""}
            onChange={handleMonthYearChange}
            fullWidth
            variant="outlined"
            label="Mes"
          />
        </div>

        <Paper elevation={3} className="w-full max-w-5xl p-4 rounded-lg overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events.filter(event =>
              selectedMonthYear ? event.start.substring(0, 7) === selectedMonthYear : true
            )}
            eventClick={handleEventClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth",
            }}
            locale="es"
            datesSet={(info) => {
              if (!calendarApi) setCalendarApi(info.view.calendar);
            }}
            height="auto"
            contentHeight="auto"
          />
        </Paper>

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={{ 
            position: "absolute", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)", 
            width: "90%", 
            maxWidth: 400, 
            bgcolor: "background.paper", 
            boxShadow: 24, 
            p: 3, 
            borderRadius: 2, 
            maxHeight: "80vh", 
            overflowY: "auto" 
          }}>
            {selectedEvent && (
              <>
                <Typography variant="h6" gutterBottom>{selectedEvent.title}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Fecha:</strong> {selectedEvent.start.toISOString().substring(0, 10)}
                </Typography>
                <Chip label={selectedEvent.extendedProps.eventType} size="small" color="primary" className="mb-2" />
                <Typography variant="body1"><strong>Vendedor:</strong> {selectedEvent.extendedProps.seller}</Typography>
                <Typography variant="body1"><strong>Invitados:</strong> {selectedEvent.extendedProps.guests}</Typography>
                <Typography variant="body1"><strong>Total:</strong> ${selectedEvent.extendedProps.total}</Typography>
                <Typography variant="body1"><strong>Saldo restante:</strong> ${selectedEvent.extendedProps.remainingBalance}</Typography>
                <Typography variant="body1"><strong>Dirección:</strong> {selectedEvent.extendedProps.address}</Typography>
                <Typography variant="body1"><strong>Teléfono:</strong> {selectedEvent.extendedProps.phone}</Typography>
                {selectedEvent.extendedProps.observations && (
                  <Tooltip title={selectedEvent.extendedProps.observations} placement="top">
                    <Typography variant="body2" color="textSecondary">
                      <strong>Observaciones:</strong> {selectedEvent.extendedProps.observations}
                    </Typography>
                  </Tooltip>
                )}
                <Button variant="contained" color="primary" onClick={() => setOpenModal(false)} sx={{ mt: 2, width: "100%" }}>
                  Cerrar
                </Button>
              </>
            )}
          </Box>
        </Modal>
      </div>
    </ThemeProvider>
  );
};

export default CalendarPage;
