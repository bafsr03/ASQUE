"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileDown, Edit } from "lucide-react";

interface QuoteDetails {
  id: string;
  quoteNumber: string;
  date: string;
  validityDays: number;
  status: string;
  agentName: string | null;
  notes: string | null;
  paymentTerms: string | null;
  discount: number;
  taxRate: number;
  client: {
    name: string;
    taxId: string;
    address: string | null;
    contact: string | null;
    email: string | null;
    phone: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
    product: {
      code: string;
      name: string;
      shortDesc: string | null;
      longDesc: string | null;
      specs: string | null;
      links: Array<{
        linkType: string;
        url: string;
        label: string | null;
      }>;
    };
  }>;
}

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, [params.id]);

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/quotes/${params.id}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setQuote(data);
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!quote) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Quote not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const subtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0);
  const afterDiscount = subtotal - quote.discount;
  const tax = afterDiscount * quote.taxRate;
  const total = afterDiscount + tax;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quote {quote.quoteNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              Created on {formatDate(quote.date)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={`/api/quotes/${quote.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FileDown className="w-5 h-5" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Company Name</p>
              <p className="font-medium text-gray-900">{quote.client.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">RUC</p>
              <p className="font-medium text-gray-900">{quote.client.taxId}</p>
            </div>
            {quote.client.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{quote.client.address}</p>
              </div>
            )}
            {quote.client.contact && (
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-medium text-gray-900">{quote.client.contact}</p>
              </div>
            )}
            {quote.client.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{quote.client.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quote Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quote Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                {quote.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Validity</p>
              <p className="font-medium text-gray-900">{quote.validityDays} days</p>
            </div>
            {quote.agentName && (
              <div>
                <p className="text-sm text-gray-600">Agent</p>
                <p className="font-medium text-gray-900">{quote.agentName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {item.product.code}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        {item.product.shortDesc && (
                          <p className="text-gray-600 text-xs mt-1">{item.product.shortDesc}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-gray-900">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t mt-4 pt-4">
            <div className="max-w-sm ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {quote.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-red-600">-{formatCurrency(quote.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IGV (18%):</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
          <div className="space-y-6">
            {quote.items.map((item) => (
              <div key={item.id} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.product.code} - {item.product.name}
                </h3>
                {item.product.longDesc && (
                  <p className="text-sm text-gray-700 mb-2">{item.product.longDesc}</p>
                )}
                {item.product.specs && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Technical Specifications:</p>
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {item.product.specs}
                    </div>
                  </div>
                )}
                {item.product.links.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Resources:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.product.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {link.label || link.linkType}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {(quote.notes || quote.paymentTerms) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
            {quote.paymentTerms && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Payment Terms:</p>
                <p className="text-sm text-gray-600">{quote.paymentTerms}</p>
              </div>
            )}
            {quote.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                <p className="text-sm text-gray-600">{quote.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
