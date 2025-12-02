import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { TrendingUp, FileText, Package, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your quotation system
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value="0"
            icon={<Package className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Total Clients"
            value="0"
            icon={<Users className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Total Quotes"
            value="0"
            icon={<FileText className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Accepted Quotes"
            value="0"
            icon={<TrendingUp className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/quotes/new"
              className="btn btn-primary text-center py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create New Quote
            </Link>
            <Link
              href="/products/new"
              className="btn btn-secondary text-center py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Add Product
            </Link>
            <Link
              href="/clients/new"
              className="btn btn-secondary text-center py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Add Client
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Getting Started
          </h2>
          <ol className="space-y-3 text-blue-900">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>
                Add products to your catalog (manually or via CSV import)
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Create client records with RUC and contact information</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>
                Build quotes by selecting products and automatically generate
                professional PDFs
              </span>
            </li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const bgColors = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
  };

  const textColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColors[color]} rounded-lg flex items-center justify-center`}>
          <span className={textColors[color]}>{icon}</span>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
