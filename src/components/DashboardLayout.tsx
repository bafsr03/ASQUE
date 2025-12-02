import { ReactNode } from "react";
import Link from "next/link";
import { Package, Users, FileText, LayoutDashboard, Home } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900">ASQUE</span>
              </Link>

              <div className="hidden md:flex space-x-1">
                <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>
                  Dashboard
                </NavLink>
                <NavLink href="/products" icon={<Package className="w-4 h-4" />}>
                  Products
                </NavLink>
                <NavLink href="/clients" icon={<Users className="w-4 h-4" />}>
                  Clients
                </NavLink>
                <NavLink href="/quotes" icon={<FileText className="w-4 h-4" />}>
                  Quotes
                </NavLink>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600 text-sm">
            ASQUE - Universal Quotation Management System © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}

function NavLink({ href, icon, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
