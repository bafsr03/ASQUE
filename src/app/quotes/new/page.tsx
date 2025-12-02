"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, X, Search } from "lucide-react";
import { calculateQuoteTotals, formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
}

interface Client {
  id: string;
  name: string;
  taxId: string;
}

interface QuoteItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export default function NewQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("client");

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);

  const [formData, setFormData] = useState({
    clientId: preselectedClientId || "",
    agentName: "",
    validityDays: "15",
    notes: "",
    paymentTerms: "",
    discount: "0",
  });

  const [items, setItems] = useState<QuoteItem[]>([]);

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProduct = (product: Product) => {
    const existing = items.find((item) => item.productId === product.id);
    if (existing) {
      setItems(
        items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          discount: 0,
        },
      ]);
    }
    setSearchTerm("");
    setShowProductSearch(false);
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totals = calculateQuoteTotals(items, parseFloat(formData.discount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      alert("Please select a client");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one product");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: formData.clientId,
          agentName: formData.agentName,
          validityDays: parseInt(formData.validityDays),
          notes: formData.notes,
          paymentTerms: formData.paymentTerms,
          discount: parseFloat(formData.discount) || 0,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
          })),
        }),
      });

      if (response.ok) {
        const quote = await response.json();
        router.push(`/quotes/${quote.id}`);
      } else {
        alert("Failed to create quote");
      }
    } catch (error) {
      console.error("Error creating quote:", error);
      alert("Failed to create quote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
          <p className="text-gray-600 mt-1">
            Build a professional quotation with automatic product descriptions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quote Details */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Quote Details</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.taxId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) =>
                    setFormData({ ...formData, agentName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Sales agent name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity (days)
                </label>
                <input
                  type="number"
                  value={formData.validityDays}
                  onChange={(e) =>
                    setFormData({ ...formData, validityDays: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Global Discount (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <textarea
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentTerms: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Payment terms and conditions..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Internal notes..."
                />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Products</h2>
              <button
                type="button"
                onClick={() => setShowProductSearch(!showProductSearch)}
                className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Product Search */}
            {showProductSearch && (
              <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products by code or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                    autoFocus
                  />
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <span className="font-medium">{product.code}</span> -{" "}
                      {product.name} - {formatCurrency(product.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items Table */}
            {items.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600">No products added yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Code
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Product
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Price
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Discount
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Subtotal
                      </th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.productCode}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", parseInt(e.target.value) || 1)
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) =>
                              updateItem(index, "discount", parseFloat(e.target.value) || 0)
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(
                            (item.quantity * item.unitPrice) - item.discount
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            {items.length > 0 && (
              <div className="border-t pt-4">
                <div className="max-w-sm ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-red-600">-{formatCurrency(totals.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IGV (18%):</span>
                    <span className="font-medium">{formatCurrency(totals.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Quote"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
