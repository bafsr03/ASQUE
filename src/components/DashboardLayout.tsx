"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { Package, Users, FileText, LayoutDashboard, Settings, Video, Menu, X, Zap } from "lucide-react";
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { UpgradeButton } from "./UpgradeButton";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
        const response = await fetch("/api/subscription/status", { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            setIsPro(data.isPro);
        }
    } catch (error) {
        console.error("Error checking subscription:", error);
    } finally {
        setLoading(false);
    }
  };

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
          w-64 bg-[#F9FAFB] border-r border-gray-100 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo Area */}
        <div className="px-6 py-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
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
        <nav className="flex-1 px-4 space-y-1 py-2 overflow-y-auto">
          <div className="px-4 mb-2 pb-2">
             <button className="w-full text-left px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium shadow-sm hover:bg-gray-50 flex items-center justify-between transition-all group">
                <span className="group-hover:text-indigo-600 transition-colors">Bandeja</span>
                <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-md font-semibold">4</span>
             </button>
          </div>

           <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3 px-6">Gestionar</div>
            <NavLink 
              href="/dashboard" 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              active={pathname === "/dashboard"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Resumen
            </NavLink>
            <NavLink 
              href="/quotes" 
              icon={<FileText className="w-5 h-5" />} 
              active={pathname?.startsWith("/quotes")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cotizaciones
            </NavLink>
             <NavLink 
              href="/products" 
              icon={<Package className="w-5 h-5" />} 
              active={pathname?.startsWith("/products")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Productos
            </NavLink>
            <NavLink 
              href="/clients" 
              icon={<Users className="w-5 h-5" />} 
              active={pathname?.startsWith("/clients")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Clientes
            </NavLink>

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-3 px-6">Sistema</div>
             <NavLink 
              href="/settings" 
              icon={<Settings className="w-5 h-5" />} 
              active={pathname === "/settings"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Configuración
            </NavLink>
             <NavLink 
              href="/tutorial" 
              icon={<Video className="w-5 h-5" />} 
              active={pathname === "/tutorial"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tutorial
            </NavLink>
        </nav>

        {/* Promo / Upgrade Card */}
        {!loading && !isPro && (
            <div className="p-6">
               <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 relative overflow-hidden">
                 {/* Abstract blob for visual interest */}
                 <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full blur-2xl -mr-8 -mt-8 opacity-60"></div>
                 
                 <h4 className="font-bold text-indigo-900 mb-1 relative z-10">Obtén 40% de descuento</h4>
                 <p className="text-xs text-indigo-600/80 mb-4 relative z-10 leading-relaxed font-medium">
                    ¡Mejora tu prueba gratuita hoy!
                 </p>
                 <UpgradeButton />
               </div>
            </div>
        )}

        {/* User Profile (Bottom) */}
        <div className="p-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <SignedIn>
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 ring-2 ring-white shadow-sm",
                    userButtonTrigger: "focus:shadow-none",
                    userButtonPopoverCard: "shadow-xl"
                  }
                }}
                afterSignOutUrl="/"
              />
              <div className="flex-1 min-w-0 pointer-events-none">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.fullName || user?.firstName || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </SignedIn>
          <SignedOut>
             <SignInButton mode="modal">
                <button className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md">
                  Iniciar Sesión
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
