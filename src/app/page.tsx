import Link from "next/link";
import { Package, Users, FileText, LayoutDashboard } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="container mx-auto px-4 py-16">
        
        {/* Navigation / Header */}
        <div className="flex justify-between items-center mb-20 max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">ASQUE</span>
          </div>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Log in</Link>
             <SignedOut>
                <SignInButton mode="modal">
                     <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors font-semibold shadow-lg shadow-indigo-200">
                        Get Started
                    </button>
                </SignInButton>
             </SignedOut>
             <SignedIn>
                <Link href="/dashboard" className="bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors font-semibold shadow-lg shadow-indigo-200">
                    Go to Dashboard
                </Link>
             </SignedIn>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-block bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-indigo-100">
            New: AI-Powered Quotations 🚀
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Supercharge your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
               Sales Workflow
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create professional quotes with automatic product descriptions in seconds. 
            The universal quotation management system designed for modern businesses.
          </p>
          
           <div className="flex justify-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-indigo-600 text-white px-8 py-4 rounded-full hover:bg-indigo-700 transition-all hover:scale-105 font-bold shadow-xl shadow-indigo-200 text-lg flex items-center">
                  Start Free Trial <span className="ml-2">→</span>
                </button>
              </SignInButton>
            </SignedOut>
             <SignedIn>
                <Link href="/dashboard" className="bg-indigo-600 text-white px-8 py-4 rounded-full hover:bg-indigo-700 transition-all hover:scale-105 font-bold shadow-xl shadow-indigo-200 text-lg flex items-center">
                    Enter Workspace <span className="ml-2">→</span>
                </Link>
             </SignedIn>
             <button className="bg-white text-gray-700 px-8 py-4 rounded-full hover:bg-gray-50 border border-gray-200 transition-all font-bold text-lg hover:border-gray-300">
                View Demo
             </button>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="max-w-6xl mx-auto mb-24">
           <div className="aspect-video bg-gray-200 rounded-3xl border-4 border-white shadow-2xl flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-200 opacity-50"></div>
              {/* Abstract UI Elements Placeholders */}
              <div className="w-3/4 h-3/4 bg-white rounded-2xl shadow-lg relative top-8 transition-transform group-hover:-translate-y-2 duration-500">
                 <div className="h-8 border-b border-gray-100 flex items-center px-4 space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                 </div>
                 <div className="p-8 flex items-center justify-center h-full text-gray-300 font-medium text-lg">
                    App Dashboard Interface Placeholder
                 </div>
              </div>
              <span className="absolute bottom-4 text-sm font-medium">Hero Image: Dashboard Preview</span>
           </div>
        </div>

        {/* Features Grid with Placeholders */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-24">
           {/* Feature 1 */}
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                 <Package className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Catalog</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                 Manage products with automatic description integration and technical specs linking.
              </p>
              <div className="aspect-video bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-xs text-gray-400">
                 Product Card UI
              </div>
           </div>

            {/* Feature 2 */}
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                 <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Quotes</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                 Generate PDF quotations in seconds. Choose from multiple professional templates.
              </p>
              <div className="aspect-video bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-xs text-gray-400">
                 PDF Preview UI
              </div>
           </div>

            {/* Feature 3 */}
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                 <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">CRM Included</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                 Keep track of your clients, their tax IDs, and history in one unified CRM.
              </p>
              <div className="aspect-video bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-xs text-gray-400">
                 Client List UI
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
