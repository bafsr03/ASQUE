import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { UpgradeButton } from "@/components/UpgradeButton"; // Make sure to export this properly
import { FileText, Package, Users, Zap } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        {!isPro && (
             <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-orange-500" />
                            Free Plan Usage
                        </h2>
                        <p className="text-gray-600 mt-1">
                            You have used {usage} of {limit} free quotes.
                        </p>
                    </div>
                    {usage >= limit && (
                        <div className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded">
                            Limit Reached
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full ${usage >= limit ? 'bg-red-600' : 'bg-orange-500'}`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <UpgradeButton />
                </div>
            </div>
        )}

        {isPro && (
             <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-lg">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Pro Plan Active</h2>
                        <p className="text-indigo-100">You have unlimited access to all features.</p>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Quotes"
            value={stats.quotes}
            icon={<FileText className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Clients"
            value={stats.clients}
            icon={<Users className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Products"
            value={stats.products}
            icon={<Package className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Recent Activity or other sections can go here */}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}
