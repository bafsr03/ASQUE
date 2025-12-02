"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, X } from "lucide-react";

interface ProductLink {
  linkType: string;
  url: string;
  label: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<ProductLink[]>([]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    shortDesc: "",
    longDesc: "",
    price: "",
    category: "",
    specs: "",
    stockStatus: "available",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          links: links.length > 0 ? links : undefined,
        }),
      });

      if (response.ok) {
        router.push("/products");
      } else {
        alert("Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    setLinks([
      ...links,
      { linkType: "product_page", url: "", label: "" },
    ]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof ProductLink, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">
            Create a new product in your catalog
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SKU-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (S/) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Electronics, Solar, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Status
                </label>
                <select
                  value={formData.stockStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, stockStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Descriptions
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Brief description for quote line items
                </p>
                <textarea
                  value={formData.shortDesc}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDesc: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long Description
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Detailed description for PDF appendix
                </p>
                <textarea
                  value={formData.longDesc}
                  onChange={(e) =>
                    setFormData({ ...formData, longDesc: e.target.value })
                  }
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed product description, features, specifications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technical Specifications
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  One specification per line (e.g., "Power: 100W")
                </p>
                <textarea
                  value={formData.specs}
                  onChange={(e) =>
                    setFormData({ ...formData, specs: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Power: 100W&#10;Voltage: 220V&#10;Dimensions: 30x20x15cm"
                />
              </div>
            </div>
          </div>

          {/* Resource Links */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Resource Links
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add links to datasheets, videos, FAQs, etc.
                </p>
              </div>
              <button
                type="button"
                onClick={addLink}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Link</span>
              </button>
            </div>

            {links.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600">
                  No links added yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 grid md:grid-cols-3 gap-2">
                      <select
                        value={link.linkType}
                        onChange={(e) =>
                          updateLink(index, "linkType", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="product_page">Product Page</option>
                        <option value="datasheet">Datasheet</option>
                        <option value="faq">FAQ</option>
                        <option value="video">Video</option>
                      </select>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          updateLink(index, "url", e.target.value)
                        }
                        placeholder="https://example.com"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          updateLink(index, "label", e.target.value)
                        }
                        placeholder="Link label"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
