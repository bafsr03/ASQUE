"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import Papa from "papaparse";

export default function ProductImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5)); // Preview first 5 rows
        setStatus(null);
      },
      error: (error) => {
        setStatus({ type: "error", message: `Error al analizar el archivo: ${error.message}` });
      },
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setStatus(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const products = results.data.map((row: any) => ({
            code: row.code || row.sku,
            name: row.name,
            price: parseFloat(row.price) || 0,
            shortDesc: row.short_description || row.description,
            longDesc: row.long_description || row.details,
            category: row.category,
            stockStatus: "available",
          })).filter((p: any) => p.code && p.name); // Basic validation

          let successCount = 0;
          let errorCount = 0;

          // Process in batches or one by one
          for (const product of products) {
            try {
              const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
              });
              if (response.ok) successCount++;
              else errorCount++;
            } catch (e) {
              errorCount++;
            }
          }

          setStatus({
            type: "success",
            message: `Importación completada: ${successCount} productos agregados, ${errorCount} fallidos.`,
          });
          
          if (successCount > 0) {
            setTimeout(() => router.push("/products"), 2000);
          }
        } catch (error) {
          setStatus({ type: "error", message: "Error al importar productos" });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Importar Productos</h1>
          <p className="text-gray-600 mt-1">
            Carga masiva de productos usando CSV
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Subir Archivo CSV
            </h3>
            <p className="text-gray-600 mb-6">
              Arrastra y suelta tu archivo CSV aquí, o haz clic para buscar
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              <span>Seleccionar Archivo</span>
            </label>
            <p className="text-xs text-gray-500 mt-4">
              Columnas requeridas: code, name, price. Opcional: category, description
            </p>
          </div>

          {file && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">
                  Archivo Seleccionado: {file.name}
                </h4>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                    setStatus(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>

              {preview.length > 0 && (
                <div className="border rounded-lg overflow-hidden mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0]).map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((cell: any, j) => (
                            <td
                              key={j}
                              className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 p-2 bg-gray-50 border-t">
                    Mostrando vista previa de las primeras 5 filas
                  </p>
                </div>
              )}

              {status && (
                <div
                  className={`p-4 rounded-lg mb-6 flex items-start space-x-3 ${
                    status.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={loading || !!status?.message?.includes("completada")}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Importando..." : "Iniciar Importación"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
