// src/app/(admin)/create-event/page.jsx
"use client";

import React from "react";
import CreateEventForm from "../components/CreateEventForm";

const CreateEventPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full bg-white p-10 rounded-2xl shadow-xl">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Crear Nuevo Evento</h2>
        <CreateEventForm />
      </div>
    </div>
  );
};

export default CreateEventPage;