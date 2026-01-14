"use client";

import { useState } from "react";
import { Loader2, CreditCard, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { MAX_FREE_QUOTES } from "@/lib/constants";

interface SubscriptionPlanProps {
    subscriptionStatus: string; // 'FREE' | 'PRO'
    quoteCount: number;
    subscriptionEnds: string | null;
}

export const SubscriptionPlan = ({ subscriptionStatus, quoteCount, subscriptionEnds }: SubscriptionPlanProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const isPro = subscriptionStatus === "PRO";
    const usagePercent = Math.min((quoteCount / MAX_FREE_QUOTES) * 100, 100);

    const handleManageSubscription = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/stripe/portal", {
                method: "POST",
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.url;
            } else {
                console.error("Failed to create portal session");
                alert("Error al cargar el portal de facturación");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar el portal de facturación");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            const response = await fetch("/api/subscription/sync", {
                method: "POST",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.isPro) {
                    alert("¡Suscripción sincronizada correctamente! Eres PRO.");
                    window.location.reload();
                } else {
                     alert("Sincronización completada. Estado actual: " + data.subscriptionStatus);
                     window.location.reload();
                }
            } else {
                alert("No se pudo sincronizar la suscripción.");
            }
        } catch (error) {
            console.error("Error syncing:", error);
            alert("Error al sincronizar");
        } finally {
            setSyncing(false);
        }
    }

    const handleUpgrade = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.url;
            } else {
                alert("Error al iniciar checkout");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al iniciar checkout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Tu Plan y Facturación</h2>
                    <p className="text-sm text-gray-500">Gestiona tu suscripción y método de pago</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handleSync}
                        disabled={syncing}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Sincronizar estado de suscripción"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    </button>
                    {isPro ? (
                        <div className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            <span>PRO ACTIVO</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                            <span>PLAN GRATUITO</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Usage Stats (Only relevant for Free plan usually, but good to show) */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Uso de Cotizaciones</span>
                    <span className="text-gray-500">
                        {isPro ? "Ilimitado" : `${quoteCount} / ${MAX_FREE_QUOTES}`}
                    </span>
                </div>
                {!isPro ? (
                     <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`h-2.5 rounded-full ${usagePercent >= 100 ? 'bg-red-500' : 'bg-indigo-600'}`} 
                            style={{ width: `${usagePercent}%` }}
                        ></div>
                    </div>
                ) : (
                    <div className="w-full bg-indigo-100 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full w-full"></div>
                    </div>
                )}
               
                {!isPro && usagePercent >= 100 && (
                    <div className="flex items-center space-x-2 mt-2 text-xs text-red-600 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>Has alcanzado el límite de cotizaciones gratuitas.</span>
                    </div>
                )}
            </div>
            
            {/* Features */}
            <div className="space-y-3 mb-6">
                 {isPro ? (
                    <>
                        <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Cotizaciones Ilimitadas
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Soporte Prioritario
                        </div>
                         {subscriptionEnds && (
                            <p className="text-xs text-gray-400 mt-2">
                                Tu próxima facturación es el {new Date(subscriptionEnds).toLocaleDateString()}
                            </p>
                        )}
                    </>
                 ) : (
                    <>
                         <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {MAX_FREE_QUOTES} Cotizaciones Gratuitas
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-gray-300 mr-2" />
                            Cotizaciones Ilimitadas (Solo PRO)
                        </div>
                    </>
                 )}
            </div>

            {/* Actions */}
            {isPro ? (
                 <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                >
                    {loading ? (
                         <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <CreditCard className="w-5 h-5" />
                    )}
                    <span>Gestionar Suscripción / Cancelar</span>
                </button>
            ) : (
                <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                >
                     {loading ? (
                         <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <CreditCard className="w-5 h-5" />
                    )}
                    <span>Actualizar a PRO</span>
                </button>
            )}
        </div>
    );
};
