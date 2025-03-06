// src/components/PaymentList.jsx
"use client";

import React, { useState, useEffect } from "react";

const PaymentList = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch("/api/payments");
        if (response.ok) {
          const data = await response.json();
          setPayments(data);
        } else {
          console.error("Error fetching payments");
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Lista de Pagos</h3>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border">ID</th>
            <th className="py-2 px-4 border">Evento</th>
            <th className="py-2 px-4 border">Monto</th>
            <th className="py-2 px-4 border">Pagador</th>
            <th className="py-2 px-4 border">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border">{payment.id}</td>
              <td className="py-2 px-4 border">{payment.event?.name || "Sin evento"}</td>
              <td className="py-2 px-4 border">${payment.amount.toFixed(2)}</td>
              <td className="py-2 px-4 border">{payment.payerName}</td>
              <td className="py-2 px-4 border">{payment.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentList;