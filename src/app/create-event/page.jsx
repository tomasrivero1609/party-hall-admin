// src/app/(admin)/create-event/page.jsx
"use client";

import React from "react";
import CreateEventForm from "../components/CreateEventForm";
import DolarBlue from "../components/DollarBlueQuote";

const CreateEventPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center py-12 px-6 pt-24">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 md:p-12">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-10">Crear Nuevo Evento</h2>
        <div className="mb-8">
          <DolarBlue />
        </div>
        <CreateEventForm />
      </div>
    </div>
  );
};

export default CreateEventPage;
