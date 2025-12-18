import Link from "next/link";
import { Package, Users, FileText, LayoutDashboard } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to ASQUE
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Universal Quotation Management System - Create professional quotes
            with automatic product descriptions in minutes
          </p>
          <div className="flex justify-center space-x-4">
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-md">
                        Get Started
                    </button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <Link href="/dashboard" className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors text-lg font-semibold shadow-md">
                    Go to Dashboard
                </Link>
            </SignedIn>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Link
            href="/dashboard"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h2>
              <p className="text-gray-600">
                View analytics and recent activity
              </p>
            </div>
          </Link>

          <Link
            href="/products"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Products
              </h2>
              <p className="text-gray-600">
                Manage your product catalog
              </p>
            </div>
          </Link>

          <Link
            href="/clients"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Clients
              </h2>
              <p className="text-gray-600">
                Manage client information
              </p>
            </div>
          </Link>

          <Link
            href="/quotes"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Quotes
              </h2>
              <p className="text-gray-600">
                Create and manage quotations
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Key Features
            </h3>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Automatic product description integration in PDFs
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Quick quote creation with product search
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Professional PDF generation with technical specs and links
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Client database with RUC/Tax ID management
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Automatic IGV (tax) calculations
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                CSV product import for bulk uploads
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
