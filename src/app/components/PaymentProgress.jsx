"use client";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#00C49F", "#f5f5f5"]; // pagado / restante

export default function PaymentProgress({ eventId }) {
  const [totalPaid, setTotalPaid] = useState(0);
  const [eventTotal, setEventTotal] = useState(1); // evitar división por 0
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/event-payment-progress?id=${eventId}`);
        const data = await res.json();
        setTotalPaid(data.totalPaid);
        setEventTotal(data.eventTotal);
      } catch (err) {
        console.error("Error al cargar el progreso de pago:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchProgress();
  }, [eventId]);

  const percentage = Math.min((totalPaid / eventTotal) * 100, 100).toFixed(0);

  const chartData = [
    { name: "Pagado", value: totalPaid },
    { name: "Restante", value: Math.max(eventTotal - totalPaid, 0) },
  ];

  if (loading) return <p className="text-center mt-4 text-gray-500">Cargando progreso...</p>;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Progreso del Pago</h3>
      <PieChart width={200} height={200}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} stroke="none" />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${value.toLocaleString("es-AR")}`} />
      </PieChart>
      <p className="text-xl font-bold text-gray-800 mt-2">{percentage}%</p>
    </div>
  );
}
