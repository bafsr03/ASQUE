"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Package, Users, FileText, LayoutDashboard, Settings, Video, Menu, X } from "lucide-react";
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F3F5F7]">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside 
        className={`
          w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
               <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              ASQUE
            </span>
          </div>
          {/* Close Menu Button (Mobile Only) */}
          <button 
            className="md:hidden text-gray-500 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
          <SignedIn>
             <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu</div>
            <NavLink 
              href="/dashboard" 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              active={pathname === "/dashboard"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink 
              href="/quotes" 
              icon={<FileText className="w-5 h-5" />} 
              active={pathname?.startsWith("/quotes")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Invoices
            </NavLink>
             <NavLink 
              href="/products" 
              icon={<Package className="w-5 h-5" />} 
              active={pathname?.startsWith("/products")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </NavLink>
            <NavLink 
              href="/clients" 
              icon={<Users className="w-5 h-5" />} 
              active={pathname?.startsWith("/clients")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Clients
            </NavLink>

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-4">System</div>
             <NavLink 
              href="/settings" 
              icon={<Settings className="w-5 h-5" />} 
              active={pathname === "/settings"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </NavLink>
             <NavLink 
              href="/tutorial" 
              icon={<Video className="w-5 h-5" />} 
              active={pathname === "/tutorial"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tutorial
            </NavLink>
          </SignedIn>
        </nav>

        {/* User Profile (Bottom) */}
        <div className="p-4 border-t border-gray-100">
          <SignedIn>
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9",
                    userButtonTrigger: "focus:shadow-none"
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName || user?.firstName || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </SignedIn>
          <SignedOut>
             <SignInButton mode="modal">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
          </SignedOut>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header (Mobile/Utility) */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:hidden sticky top-0 z-30">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                 <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-lg text-gray-900">ASQUE</span>
            </div>
             <SignedIn>
                <UserButton />
             </SignedIn>
        </header>

        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function NavLink({ href, icon, children, active, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
        active 
          ? "bg-blue-50 text-blue-600 shadow-sm font-medium" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span className={`transition-colors ${active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}>
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
}
