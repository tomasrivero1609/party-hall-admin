"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Euro, TrendingUp, Clock, RefreshCw, AlertCircle } from "lucide-react";
import Card from "./Card";

const CurrencyQuote = () => {
  const [quotes, setQuotes] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuotes = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      const response = await fetch("https://api.bluelytics.com.ar/v2/latest");
      if (!response.ok) throw new Error("Error al cargar la cotización");

      const data = await response.json();
      setQuotes({
        dolar: data.oficial,
        blue: data.blue,
        euro: data.oficial_euro,
        blueEuro: data.blue_euro,
      });
      setLastUpdate(data.last_update);
      setError(null);
    } catch (err) {
      setError("No se pudo cargar la cotización.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(() => fetchQuotes(), 300000); // 5 minutos
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchQuotes(true);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Error de Conexión</h3>
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 font-display">Cotización del Día</h3>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="Actualizar cotización"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Currency Grid */}
      <div className="space-y-3">
        {quotes && (
          <>
            <CurrencyRow 
              name="Dólar Oficial" 
              quote={quotes.dolar} 
              icon={DollarSign}
              color="primary"
            />
            <CurrencyRow 
              name="Dólar Blue" 
              quote={quotes.blue} 
              icon={DollarSign}
              color="success"
              highlight
            />
            <CurrencyRow 
              name="Euro Oficial" 
              quote={quotes.euro} 
              icon={Euro}
              color="warning"
            />
            <CurrencyRow 
              name="Euro Blue" 
              quote={quotes.blueEuro} 
              icon={Euro}
              color="accent"
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>
            Actualizado: {new Date(lastUpdate).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/20 to-green-100/20 rounded-full blur-3xl -z-10"></div>
    </Card>
  );
};

const CurrencyRow = ({ name, quote, icon: Icon, color = "primary", highlight = false }) => {
  const colorClasses = {
    primary: "text-blue-600 bg-blue-50",
    success: "text-green-600 bg-green-50",
    warning: "text-yellow-600 bg-yellow-50",
    accent: "text-purple-600 bg-purple-50",
  };

  const colorClass = colorClasses[color];

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:shadow-lg ${
      highlight ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-medium text-gray-900 text-sm">{name}</span>
      </div>
      
      <div className="flex space-x-4 text-sm">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Compra</div>
          <div className="font-semibold text-gray-900">
            ${parseFloat(quote.value_buy).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Venta</div>
          <div className="font-semibold text-gray-900">
            ${parseFloat(quote.value_sell).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyQuote;
