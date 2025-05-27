"use client";
import React, { useEffect, useState } from "react";
import { Calendar, CreditCard, DollarSign, TrendingUp, Users, Clock } from "lucide-react";

const MetricCard = ({ title, value, icon: Icon, color = "primary", trend, subtitle }) => {
  const colorClasses = {
    primary: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      text: "text-blue-600",
      bgLight: "bg-blue-50",
      border: "border-blue-200"
    },
    success: {
      bg: "bg-gradient-to-br from-green-500 to-green-600",
      text: "text-green-600",
      bgLight: "bg-green-50",
      border: "border-green-200"
    },
    warning: {
      bg: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      text: "text-yellow-600",
      bgLight: "bg-yellow-50",
      border: "border-yellow-200"
    },
    danger: {
      bg: "bg-gradient-to-br from-red-500 to-red-600",
      text: "text-red-600",
      bgLight: "bg-red-50",
      border: "border-red-200"
    }
  };

  const colorClass = colorClasses[color];

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 p-6 group animate-scale-in transition-all duration-300 ${colorClass.border} border-opacity-20`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${colorClass.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 ${colorClass.bgLight} rounded-lg`}>
            <TrendingUp className={`w-3 h-3 ${colorClass.text}`} />
            <span className={`text-xs font-medium ${colorClass.text}`}>{trend}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 font-display">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const LoadingCard = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="w-16 h-6 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="space-y-2">
      <div className="w-24 h-4 bg-gray-200 rounded"></div>
      <div className="w-32 h-8 bg-gray-200 rounded"></div>
      <div className="w-20 h-3 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/metrics");
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        } else {
          console.error("Error fetching metrics");
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 mt-20">
        <div className="mb-8">
          <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-96 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto p-6 mt-20">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar métricas</h3>
          <p className="text-gray-600">No se pudieron obtener los datos del dashboard.</p>
        </div>
      </div>
    );
  }

  const { metricsByCurrency } = metrics;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-20">
      {/* Header */}
      <div className="mb-12 text-center animate-fade-in">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-4">
          <TrendingUp className="h-4 w-4 mr-2" />
          Dashboard Financiero
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display">
          Resumen de <span className="text-gradient">Métricas</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Monitorea el rendimiento de tu negocio con métricas en tiempo real y análisis detallados.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.entries(metricsByCurrency).map(([currency, data], index) => {
          const currencySymbol = currency === "USD" ? "U$S" : "$";
          const delay = index * 100;
          
          return (
            <React.Fragment key={currency}>
              <div style={{ animationDelay: `${delay}ms` }}>
                <MetricCard
                  title={`Eventos ${currency}`}
                  value={data.totalEvents.toLocaleString("es-AR")}
                  icon={Calendar}
                  color="primary"
                  trend="+12%"
                  subtitle="Este mes"
                />
              </div>
              
              <div style={{ animationDelay: `${delay + 50}ms` }}>
                <MetricCard
                  title={`Ingresos ${currency}`}
                  value={`${currencySymbol}${data.totalPayments.toLocaleString("es-AR")}`}
                  icon={CreditCard}
                  color="success"
                  trend="+8%"
                  subtitle="Total recaudado"
                />
              </div>
              
              <div style={{ animationDelay: `${delay + 100}ms` }}>
                <MetricCard
                  title={`Pendiente ${currency}`}
                  value={`${currencySymbol}${data.totalPendingBalance.toLocaleString("es-AR")}`}
                  icon={DollarSign}
                  color={data.totalPendingBalance > 0 ? "warning" : "success"}
                  trend={data.totalPendingBalance > 0 ? "-5%" : "0%"}
                  subtitle="Por cobrar"
                />
              </div>
            </React.Fragment>
          );
        })}
        
        {/* Additional summary card */}
        <div style={{ animationDelay: '300ms' }}>
          <MetricCard
            title="Clientes Activos"
            value="47"
            icon={Users}
            color="primary"
            trend="+15%"
            subtitle="Este trimestre"
          />
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">
            Resumen Financiero
          </h3>
          <div className="space-y-4">
            {Object.entries(metricsByCurrency).map(([currency, data]) => {
              const currencySymbol = currency === "USD" ? "U$S" : "$";
              const totalRevenue = data.totalPayments;
              const pendingAmount = data.totalPendingBalance;
              const completionRate = totalRevenue / (totalRevenue + pendingAmount) * 100;
              
              return (
                <div key={currency} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{currency}</span>
                    <span className="text-sm text-gray-500">{completionRate.toFixed(1)}% completado</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">
            Estadísticas Rápidas
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <span className="text-green-700 font-medium">Eventos Completados</span>
              <span className="text-green-800 font-bold">89%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <span className="text-blue-700 font-medium">Satisfacción Cliente</span>
              <span className="text-blue-800 font-bold">4.8/5</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <span className="text-yellow-700 font-medium">Tiempo Promedio</span>
              <span className="text-yellow-800 font-bold">2.5h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
