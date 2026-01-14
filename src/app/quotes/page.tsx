"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { Plus, FileText, Edit, Trash2, Lock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UpgradeButton } from "@/components/UpgradeButton";
import { MAX_FREE_QUOTES } from "@/lib/constants";

interface Quote {
  id: string;
  quoteNumber: string;
  date: string;
  status: string;
  client: {
    name: string;
  };
  items: Array<{
    subtotal: number;
  }>;
}

export default function QuotesPage() {
  const { userId, isLoaded } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (isLoaded) {
        if (userId) {
            Promise.all([fetchQuotes(), checkSubscription()]);
        } else {
            setLoading(false);
        }
    }
  }, [isLoaded, userId]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/quotes");
      if (!response.ok) {
        throw new Error("Failed to fetch quotes");
      }
      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
        const response = await fetch("/api/subscription/status");
        if (response.ok) {
            const data = await response.json();
            setIsPro(data.isPro);
        }
    } catch (error) {
        console.error("Error checking subscription:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta cotización?")) return;

    try {
      const response = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchQuotes();
      } else {
        alert("Error al eliminar la cotización");
      }
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert("Error al eliminar la cotización");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hasReachedLimit = !isPro && quotes.length >= MAX_FREE_QUOTES;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cotizaciones</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus cotizaciones y genera PDFs
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {!isPro && <UpgradeButton />}
            
            {hasReachedLimit ? (
                <button
                    disabled
                    className="flex items-center space-x-2 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                    title="Límite de cotizaciones alcanzado"
                >
                    <Lock className="w-5 h-5" />
                    <span>Límite Alcanzado</span>
                </button>
            ) : (
                <Link
                href="/quotes/new"
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                <Plus className="w-5 h-5" />
                <span>Nueva Cotización</span>
                </Link>
            )}
          </div>
        </div>

        {/* Limit Warning */}
        {hasReachedLimit && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-amber-900 font-medium">Has alcanzado el límite de {MAX_FREE_QUOTES} cotizaciones gratuitas</h3>
                        <p className="text-amber-700 text-sm">Actualiza a Pro para crear cotizaciones ilimitadas y desbloquear todas las funciones.</p>
                    </div>
                </div>
                <UpgradeButton />
            </div>
        )}

        {/* Quotes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aún no hay cotizaciones
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primera cotización profesional
            </p>
            <Link
              href="/quotes/new"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Cotización</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cotización #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {quotes.map((quote) => {
                    const subtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0);
                    return (
                        <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {quote.quoteNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {quote.client.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(quote.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(subtotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                quote.status
                            )}`}
                            >
                            {quote.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                            <Link
                                href={`/quotes/${quote.id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver PDF"
                            >
                                <FileText className="w-4 h-4" />
                            </Link>
                            <Link
                                href={`/quotes/${quote.id}/edit`}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => handleDelete(quote.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            </div>
                        </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {quotes.map((quote) => {
                    const subtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0);
                    return (
                        <div key={quote.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{quote.quoteNumber}</h3>
                                    <p className="text-sm text-gray-500">{quote.client.name}</p>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                                    {quote.status}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm text-gray-600 mb-4 border-t border-b border-gray-50 py-3">
                                <span>{formatDate(quote.date)}</span>
                                <span className="font-bold text-gray-900 text-lg">{formatCurrency(subtotal)}</span>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Link
                                    href={`/quotes/${quote.id}`}
                                    className="flex items-center text-sm text-blue-600 font-medium"
                                >
                                    <FileText className="w-4 h-4 mr-1" />
                                    PDF
                                </Link>
                                <Link
                                    href={`/quotes/${quote.id}/edit`}
                                    className="flex items-center text-sm text-indigo-600 font-medium"
                                >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Editar
                                </Link>
                                <button
                                    onClick={() => handleDelete(quote.id)}
                                    className="flex items-center text-sm text-red-600 font-medium"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
