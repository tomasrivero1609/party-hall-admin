// src/app/(admin)/create-event/page.jsx
"use client";

import React, { useState } from "react";
import CreateEventForm from "../components/CreateEventForm";
import DollarBlueQuote from "../components/DollarBlueQuote";
import Card from "../components/Card";
import { Calendar, Plus, Sparkles, Clock, Users, MapPin } from "lucide-react";

const CreateEventPage = () => {
  const [showQuote, setShowQuote] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: "Gestión Completa",
      description: "Administra todos los aspectos de tu evento desde un solo lugar"
    },
    {
      icon: Users,
      title: "Control de Invitados",
      description: "Lleva un registro detallado de la cantidad de asistentes"
    },
    {
      icon: MapPin,
      title: "Ubicación Flexible",
      description: "Registra eventos en cualquier ubicación con detalles precisos"
    },
    {
      icon: Clock,
      title: "Programación Eficiente",
      description: "Organiza fechas y horarios de manera profesional"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-display">
            Crear{" "}
            <span className="text-gradient">Evento</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Organiza tu próximo evento de manera profesional. Completa todos los detalles y gestiona cada aspecto desde el inicio.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setShowQuote(!showQuote)}
              className="btn-secondary inline-flex items-center"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {showQuote ? 'Ocultar' : 'Ver'} Cotización
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2">
            <Card variant="elevated" padding="lg" className="animate-slide-up">
              <Card.Header>
                <Card.Title className="flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-blue-600" />
                  Detalles del Evento
                </Card.Title>
                <Card.Description>
                  Completa la información necesaria para crear tu evento
                </Card.Description>
              </Card.Header>
              
              <Card.Content>
                <CreateEventForm />
              </Card.Content>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dollar Quote */}
            {showQuote && (
              <div className="animate-slide-in">
                <DollarBlueQuote />
              </div>
            )}

            {/* Features */}
            <Card variant="gradient" padding="lg" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Card.Header>
                <Card.Title className="text-lg">
                  ¿Por qué elegir nuestro sistema?
                </Card.Title>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3 group">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Content>
            </Card>

            {/* Tips Card */}
            <Card variant="outlined" padding="md" className="animate-slide-up" style={{ animationDelay: '400ms' }}>
              <Card.Header>
                <Card.Title className="text-lg flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                  Consejos Útiles
                </Card.Title>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Asegúrate de confirmar la fecha y hora con el cliente</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Verifica la disponibilidad del salón antes de confirmar</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Incluye todos los detalles especiales en las observaciones</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Revisa los datos de contacto para futuras comunicaciones</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
