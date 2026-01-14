"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function SubscriptionSyncWrapper({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const success = searchParams.get("success");
        if (success === "true") {
            const syncSubscription = async () => {
                try {
                    setIsSyncing(true);
                    // Add a small delay to ensure Stripe has processed the webhook/event if possible,
                    // though usually we just hit the API which checks Stripe directly.
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const response = await fetch("/api/subscription/sync", {
                        method: "POST",
                    });

                    if (response.ok) {
                        // Remove the query param to prevent loop/re-sync
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

    if (isSyncing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Finalizando tu actualización...</h2>
                <p className="text-gray-500">Estamos sincronizando tu suscripción con Stripe.</p>
            </div>
        );
    }

    return <>{children}</>;
}
