"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MetricCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="text-4xl text-blue-500 mb-2">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <p className="text-2xl text-gray-600">{value}</p>
    </div>
  );
};

const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/metrics");
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        } else {
          console.error("Error fetching metrics");
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, []);

  if (!metrics) {
    return <p className="text-center">Cargando métricas...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Métricas</h2>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total de Eventos"
          value={metrics.totalEvents}
          icon="🎉"
        />
        <MetricCard
          title="Saldo Pendiente"
          value={`$${metrics.totalPendingBalance}`}
          icon="💰"
        />
        <MetricCard
          title="Invitados Totales"
          value={metrics.totalGuests}
          icon="👥"
        />
        <MetricCard
          title="Pagos Totales"
          value={`$${metrics.totalPayments}`}
          icon="💳"
        />
      </div>
    </div>
  );
};

export default MetricsDashboard;