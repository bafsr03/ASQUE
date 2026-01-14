"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, Save, ArrowLeft, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  code: string;
}

interface QuoteItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Client {
    id: string;
    name: string;
    taxId: string;
}

export default function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Form State
  const [clientId, setClientId] = useState("");
  const [agentName, setAgentName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDays, setValidityDays] = useState(15);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (isLoaded && userId) {
      Promise.all([
        fetchProducts(),
        fetchClients(),
        fetchQuote()
      ]).finally(() => setLoading(false));
    }
  }, [isLoaded, userId, id]);

  const fetchQuote = async () => {
      try {
          const response = await fetch(`/api/quotes/${id}`);
          if (!response.ok) throw new Error("Failed to fetch quote");
          const data = await response.json();
          
          setClientId(data.clientId);
          setAgentName(data.agentName || "");
          setDate(new Date(data.date).toISOString().split('T')[0]);
          setValidityDays(data.validityDays);
          setNotes(data.notes || "");
          setPaymentTerms(data.paymentTerms || "");
          setDiscount(data.discount || 0);
          
          // Map items
          setItems(data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal
          })));

      } catch (error) {
          console.error("Error fetching quote:", error);
          alert("Error al cargar la cotización");
          router.push("/quotes");
      }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) setProducts(await response.json());
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        if (response.ok) setClients(await response.json());
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        item.unitPrice = product.price;
      }
    }

    item.subtotal = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = (subtotal - discount) * 0.18;
    const total = (subtotal - discount) + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
        alert("Por favor selecciona un cliente");
        return;
    }
    if (items.length === 0) {
        alert("Agrega al menos un producto");
        return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/quotes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          agentName,
          date,
          validityDays,
          items,
          notes,
          paymentTerms,
          discount
        }),
      });

      if (response.ok) {
        router.push("/quotes");
      } else {
        alert("Error al actualizar la cotización");
      }
    } catch (error) {
      console.error("Error updating quote:", error);
      alert("Error al actualizar la cotización");
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  if (loading) {
    return (
        <DashboardLayout>
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Cotización</h1>
                <p className="text-gray-600 mt-1">
                    Modificar detalles de la cotización existente
                </p>
            </div>
            <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Info */}
            <div className="bg-white rounded-lg shadow-md p-6 grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                    <select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                    >
                        <option value="">Seleccionar Cliente...</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.name} - {client.taxId}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Agente</label>
                    <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nombre del agente"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Validez (Días)</label>
                        <input
                            type="number"
                            value={validityDays}
                            onChange={(e) => setValidityDays(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            min="1"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Ítems</h2>
                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Agregar Ítem</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {items.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No hay ítems agregados</p>
                    )}
                    {items.map((item, index) => (
                        <div key={index} className="flex items-start space-x-2 bg-gray-50 p-3 rounded-lg">
                             <div className="flex-1">
                                <select
                                    value={item.productId}
                                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                                    required
                                >
                                    <option value="">Seleccionar Producto...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                    ))}
                                </select>
                             </div>
                             <div className="w-20">
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                                    min="1"
                                    placeholder="Cant"
                                />
                             </div>
                             <div className="w-28">
                                <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right"
                                    step="0.01"
                                    placeholder="Precio"
                                />
                             </div>
                             <div className="w-28 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-right font-medium">
                                {formatCurrency(item.subtotal)}
                             </div>
                             <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                        </div>
                    ))}
                </div>

                <div className="mt-8 border-t pt-4 flex flex-col items-end space-y-2">
                     <div className="w-64 flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                     </div>
                     <div className="w-64 flex justify-between text-sm items-center">
                        <span className="text-gray-600">Descuento:</span>
                        <input 
                            type="number" 
                            value={discount} 
                            onChange={(e) => setDiscount(parseFloat(e.target.value))}
                            className="w-24 px-2 py-1 text-right border border-gray-300 rounded text-sm"
                            min="0"
                            step="0.01"
                        />
                     </div>
                     <div className="w-64 flex justify-between text-sm">
                        <span className="text-gray-600">IGV (18%):</span>
                        <span className="font-medium">{formatCurrency(tax)}</span>
                     </div>
                     <div className="w-64 flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-indigo-600">{formatCurrency(total)}</span>
                     </div>
                </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Notas adicionales para el cliente..."
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Términos de Pago</label>
                    <textarea
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ej. 50% adelanto, 50% contra entrega..."
                    />
                 </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
            </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
