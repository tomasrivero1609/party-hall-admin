"use client";

import React from "react";
import Link from "next/link";
import DollarBlueQuote from "../app/components/DollarBlueQuote";
import { useSession, signIn } from "next-auth/react";
import { CalendarCheck, Layers, CreditCard, ArrowRight, Sparkles, Users, TrendingUp } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }) => (
  <div 
    className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 p-8 text-center group animate-slide-up transition-all duration-300`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
      <Icon className="h-8 w-8 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const HomePage = () => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Sistema de Gestión Profesional
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 font-display leading-tight">
              Bienvenido a{" "}
              <span className="text-gradient">
                Salón de Eventos
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Una herramienta moderna y elegante para gestionar tus eventos de manera eficiente y profesional.
            </p>
            
            <button
              onClick={() => signIn()}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 text-lg"
            >
              <span>Iniciar Sesión</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <FeatureCard
              icon={CalendarCheck}
              title="Gestión Inteligente"
              description="Organiza eventos con herramientas avanzadas y una interfaz intuitiva."
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              delay={100}
            />
            <FeatureCard
              icon={Users}
              title="Control Total"
              description="Administra clientes, pagos y reservas desde un solo lugar."
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              delay={200}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Análisis Avanzado"
              description="Obtén insights valiosos con reportes y métricas detalladas."
              gradient="bg-gradient-to-br from-green-500 to-green-600"
              delay={300}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            ¡Bienvenido de vuelta!
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-display">
            Panel de{" "}
            <span className="text-gradient">Control</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Organiza y administra tus eventos de forma sencilla. Desde la creación hasta el control de pagos, todo en un solo lugar.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link
              href="/eventsdetails"
              className="btn-primary inline-flex items-center"
            >
              <CalendarCheck className="h-5 w-5 mr-2" />
              Ver Eventos
            </Link>
            {["admin", "subadmin"].includes(session?.user?.role) && (
              <Link
                href="/create-event"
                className="btn-secondary inline-flex items-center"
              >
                <Layers className="h-5 w-5 mr-2" />
                Crear Evento
              </Link>
            )}
            <Link
              href="/calendar"
              className="btn-ghost inline-flex items-center"
            >
              <CalendarCheck className="h-5 w-5 mr-2" />
              Calendario
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeatureCard
                icon={CalendarCheck}
                title="Gestión de Eventos"
                description="Crea, edita y elimina eventos fácilmente. Lleva un registro completo y organizado con herramientas profesionales."
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                delay={100}
              />
              <FeatureCard
                icon={Layers}
                title="Tipos de Eventos"
                description="Clasifica tus eventos en categorías como bodas, cumpleaños, aniversarios y eventos corporativos."
                gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                delay={200}
              />
              <FeatureCard
                icon={CreditCard}
                title="Seguimiento de Pagos"
                description="Registra los pagos y controla los saldos de cada cliente en tiempo real con reportes detallados."
                gradient="bg-gradient-to-br from-green-500 to-green-600"
                delay={300}
              />
              <FeatureCard
                icon={TrendingUp}
                title="Reportes y Métricas"
                description="Analiza el rendimiento de tu negocio con estadísticas detalladas y reportes financieros."
                gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
                delay={400}
              />
            </div>
          </div>

          {/* Sidebar with Dollar Quote */}
          <div className="space-y-6">
            {/* Dollar Quote Widget */}
            <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
              <DollarBlueQuote />
            </div>

            {/* Additional Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-display flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                Sistema Profesional
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Interfaz moderna y fácil de usar</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Gestión completa de eventos y pagos</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Reportes y estadísticas en tiempo real</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Cotización del dólar actualizada</p>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-3 font-display">
                💡 Consejo del día
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Mantén siempre actualizada la información de contacto de tus clientes para una comunicación efectiva y profesional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
