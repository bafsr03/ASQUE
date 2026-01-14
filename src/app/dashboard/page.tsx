import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { UpgradeButton } from "@/components/UpgradeButton"; // Make sure to export this properly
import { FileText, Package, Users, Zap } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  // Ensure user exists in database (important for Google OAuth users)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: email,
      subscriptionStatus: "FREE",
      quoteCount: 0,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        _count: {
            select: { clients: true, products: true, quotations: true }
        }
    }
  });

  // Default values if user matches but data missing (unlikely with upsert but safe)
  const stats = {
    quotes: user?._count.quotations ?? 0,
    clients: user?._count.clients ?? 0,
    products: user?._count.products ?? 0,
  };

  const isPro = user?.subscriptionStatus === "PRO";
  const limit = 10;
  const usage = user?.quoteCount ?? 0;
  const percentage = Math.min((usage / limit) * 100, 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        
        {!isPro && (
             <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow p-8 border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center mb-2">
                            <Zap className="w-5 h-5 mr-3 text-orange-500" />
                            Uso del Plan Gratuito
                        </h2>
                        <p className="text-gray-500">
                            Has utilizado <span className="font-semibold text-gray-900">{usage}</span> de <span className="font-semibold text-gray-900">{limit}</span> cotizaciones gratuitas.
                        </p>
                    </div>
                    {usage >= limit && (
                        <div className="text-red-600 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                            Límite Alcanzado
                        </div>
                    )}
                </div>
                <div className="mt-6 mb-6">
                    <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                            className={`h-3 rounded-full transition-all duration-500 ${usage >= limit ? 'bg-red-500' : 'bg-orange-500'}`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <UpgradeButton />
                </div>
            </div>
        )}

        {isPro && (
             <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl shadow-lg p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="flex items-center space-x-5 relative z-10">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Plan Pro Activo</h2>
                        <p className="text-indigo-100 font-medium opacity-90">Tienes acceso ilimitado a todas las funciones.</p>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Cotizaciones"
            value={stats.quotes}
            icon={<FileText className="w-6 h-6 text-indigo-600" />}
          />
          <StatCard
            title="Clientes"
            value={stats.clients}
            icon={<Users className="w-6 h-6 text-indigo-600" />}
          />
          <StatCard
            title="Productos"
            value={stats.products}
            icon={<Package className="w-6 h-6 text-indigo-600" />}
          />
        </div>

        {/* Recent Activity or other sections can go here */}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 font-medium mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight">{value}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
      </div>
    </div>
  );
}
