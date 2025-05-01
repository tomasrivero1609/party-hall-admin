"use client";
import React, { useEffect, useState } from "react";
import { Calendar, CreditCard, DollarSign } from "lucide-react";

const MetricCard = ({ title, value, icon: Icon, color = "blue" }) => {
  const colors = {
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md text-center flex flex-col items-center space-y-2 border border-gray-100">
      <Icon className={`w-8 h-8 ${colors[color]}`} />
      <h3 className="text-lg font-semibold text-gray-800 uppercase tracking-wide">{title}</h3>
      <p className="text-2xl font-bold text-gray-700">{value}</p>
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
    return <p className="text-center text-gray-500 mt-10">Cargando métricas...</p>;
  }

  const { metricsByCurrency } = metrics;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Financiero</h2>

      {/* Totales por moneda */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(metricsByCurrency).map(([currency, data]) => (
          <React.Fragment key={currency}>
            <MetricCard
              title={`Eventos en ${currency}`}
              value={data.totalEvents}
              icon={Calendar}
              color="blue"
            />
            <MetricCard
              title={`Pagos en ${currency}`}
              value={`${currency === "USD" ? "U$S" : "$"}${data.totalPayments.toLocaleString("es-AR")}`}
              icon={CreditCard}
              color="green"
            />
            <MetricCard
              title={`Saldo pendiente en ${currency}`}
              value={`${currency === "USD" ? "U$S" : "$"}${data.totalPendingBalance.toLocaleString("es-AR")}`}
              icon={DollarSign}
              color="red"
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MetricsDashboard;
