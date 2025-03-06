// src/app/(admin)/event-types/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import EventTypeList from "../components/EventTypeList";

const EventTypesPage = () => {
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    fetch("/api/event-types")
      .then((res) => res.json())
      .then((data) => setEventTypes(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tipos de Eventos</h2>
      <EventTypeList eventTypes={eventTypes} />
    </div>
  );
};

export default EventTypesPage;