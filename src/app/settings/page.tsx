"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Save, Loader2, Check, Upload, Sparkles } from "lucide-react";
import Image from "next/image";

interface Settings {
  id: string;
  companyName: string;
  companyAddress: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  companyTaxId: string | null;
  logoUrl: string | null;
  font: string;
  primaryColor: string;
  secondaryColor: string;
  template: string;
}

const TEMPLATES = [
  {
    id: "modern",
    name: "Moderno",
    description: "Un diseño limpio y profesional con encabezados llamativos y tipografía clara.",
    image: "/templates/modern.png",
  },
  {
    id: "classic",
    name: "Clásico",
    description: "Diseño tradicional con fuentes serif y estilo formal.",
    image: "/templates/classic.png",
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Simple y espacioso, enfocado en el contenido con mínimas distracciones.",
    image: "/templates/minimal.png",
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Optional: Show a toast notification
      } else {
        alert("Error al guardar la configuración");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    if (!settings) return;
    setSettings({ ...settings, template: templateId });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, logoUrl: data.url });
      } else {
        alert("Error al subir el logo");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateWithAI = () => {
    alert("¡Generación con IA próximamente!");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!settings) return null;

  const currentTemplate = TEMPLATES.find((t) => t.id === settings.template) || TEMPLATES[0];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">Configuración de Factura</h1>
             <p className="text-gray-500 mt-1">Administra los detalles de tu negocio y plantillas de facturas</p>
          </div>
          <button
            onClick={() => handleSubmit()}
            disabled={saving}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-medium shadow-sm hover:shadow-md"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>Guardar Cambios</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Column (Templates) */}
          <div className="xl:col-span-5 space-y-6">
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Explorar Plantillas</h2>
                    <button
                        onClick={handleGenerateWithAI}
                        className="flex items-center space-x-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-1.5 rounded-full hover:shadow-md transition-all"
                    >
                        <Sparkles className="w-3 h-3" />
                        <span>Generar con IA</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {TEMPLATES.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`group cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden relative ${
                        settings.template === template.id
                            ? "border-indigo-600 ring-4 ring-indigo-50 shadow-md"
                            : "border-gray-100 hover:border-indigo-200 hover:shadow-md"
                        }`}
                    >
                        <div className="flex">
                            <div className="w-1/3 min-h-[120px] bg-gray-50 relative">
                                <Image
                                src={template.image}
                                alt={template.name}
                                fill
                                className="object-cover"
                                />
                            </div>
                            <div className="flex-1 p-4 bg-white flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-gray-900">{template.name}</h3>
                                    {settings.template === template.id && (
                                        <div className="bg-indigo-600 text-white p-1 rounded-full">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{template.description}</p>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
             </div>
          </div>

          {/* Right Column (Form) */}
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Información del Negocio</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Logo Upload Section */}
                 <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                    <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {settings.logoUrl ? (
                             <div className="relative w-32 h-32 mb-4 bg-white rounded-lg shadow-sm p-2">
                                <Image
                                    src={settings.logoUrl}
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-indigo-500">
                                <Upload className="w-8 h-8" />
                            </div>
                        )}
                        <p className="text-sm font-medium text-gray-900">
                            {settings.logoUrl ? "Clic para cambiar logo" : "Sube tu logo"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 2MB</p>
                    </div>
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                    />
                 </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nombre de la Empresa</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      placeholder="ej. Empresa S.A.C."
                      required
                    />
                  </div>

                   <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Color Primario</label>
                    <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                        <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="text-sm font-medium text-gray-700">{settings.primaryColor}</span>
                    </div>
                  </div>

                   <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Color Secundario</label>
                    <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                        <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="text-sm font-medium text-gray-700">{settings.secondaryColor}</span>
                    </div>
                  </div>

                   <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dirección del Negocio</label>
                    <textarea
                      rows={3}
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 resize-none"
                      value={settings.companyAddress || ""}
                      onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                      placeholder="Calle, Ciudad, País..."
                    />
                  </div>
                
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Correo de Contacto</label>
                    <input
                      type="email"
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                      value={settings.companyEmail || ""}
                      onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                      placeholder="info@ejemplo.com"
                    />
                  </div>

                  <div>
                     <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">RUC / ID Fiscal</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                      value={settings.companyTaxId || ""}
                      onChange={(e) => setSettings({ ...settings, companyTaxId: e.target.value })}
                       placeholder="ej. 20123456789"
                    />
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
