"use client";

import { useState } from "react";
import { Zap } from "lucide-react";

export const UpgradeButton = () => {
  const [loading, setLoading] = useState(false);

  const onUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to create checkout session");
      const data = await response.json();
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={onUpgrade} 
      disabled={loading}
      className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 shadow-md"
    >
      <Zap className="w-4 h-4" />
      <span>{loading ? "Procesando..." : "Mejorar a Pro"}</span>
    </button>
  );
};
