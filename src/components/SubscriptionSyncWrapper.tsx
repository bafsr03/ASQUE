"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function SubscriptionSyncWrapper({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    useEffect(() => {
        const success = searchParams.get("success");
        const portalReturn = searchParams.get("portal_return");

        if (success === "true" || portalReturn === "true") {
            const syncSubscription = async () => {
                try {
                    setIsSyncing(true);
                    // Add a small delay to ensure Stripe has processed the webhook/event
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    const response = await fetch("/api/subscription/sync", {
                        method: "POST",
                    });

                    if (response.ok) {
                        const data = await response.json();
                        
                        if (success === "true") {
                           setModalMessage("¡Tu suscripción se ha activado correctamente!");
                        } else if (portalReturn === "true") {
                            // If user came from portal, message depends on status
                           setModalMessage(data.isPro ? "Tu suscripción está activa." : "Tu suscripción ha sido cancelada.");
                        }

                        setShowSuccessModal(true);
                        
                        // Clean URL without refresh yet
                        router.replace("/dashboard");
                        router.refresh();
                    }
                } catch (error) {
                    console.error("Auto-sync error:", error);
                } finally {
                    setIsSyncing(false);
                }
            };

            syncSubscription();
        }
    }, [searchParams, router]);

    const handleCloseModal = () => {
        setShowSuccessModal(false);
    };

    if (isSyncing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Sincronizando...</h2>
                <p className="text-gray-500">Estamos actualizando el estado de tu suscripción.</p>
            </div>
        );
    }

    return (
        <>
            {children}

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¡Todo listo!</h3>
                        <p className="text-gray-600 mb-6">{modalMessage}</p>
                        <button 
                            onClick={handleCloseModal}
                            className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
