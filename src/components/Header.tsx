"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/firebase/config";

const ADMIN_EMAILS = ["lx.garduno@gmail.com", "alosgar@gmail.com"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Signout error:", error);
    }
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Jornadas", href: "/jornadas" },
    { name: "Servicios", href: "/servicios" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Contacto", href: "/contacto" },
  ];

  // Dynamic Navigation depending on Auth Role
  if (isAdmin) {
    navItems.push({ name: "Panel Admin", href: "/admin" });
  } else if (user) {
    navItems.push({ name: "Mis Citas", href: "/paciente" });
  }

  return (
    <header className="w-full sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
      <div className="flex justify-between items-center px-4 md:px-12 py-3 md:py-4">
        {/* Brand Logo */}
        <Link href="/" className="flex flex-col select-none shrink-0">
          <div className="h-0.5 md:h-1 w-full bg-[#006828]" />
          <span className="text-base sm:text-xl md:text-2xl font-black tracking-wider my-0.5 text-white">DEFPOTEC MX</span>
          <div className="h-0.5 md:h-1 w-full bg-[#9B0000]" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`pb-1 transition-colors hover:text-white ${
                  isActive
                    ? "text-white border-b-2 border-[#006828] font-bold"
                    : "text-slate-400"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Auth Info (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={isAdmin ? "/admin/perfil" : "/paciente"}
                  className="text-xs text-slate-400 hover:text-white transition-colors font-medium truncate max-w-[150px]"
                >
                  {user.displayName || user.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs md:text-sm text-slate-300 hover:text-white font-semibold transition-colors"
              >
                Acceso
              </Link>
            )}
          </div>

          {/* CTA Button Agendar Cita */}
          <Link
            href={pathname === "/" ? "/#agendar-cita" : "/jornadas"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-[#006828] hover:bg-[#00501f] text-white rounded-xl font-extrabold transition-all text-xs sm:text-sm shadow-[0_0_15px_rgba(0,104,40,0.5)] border border-[#4ade80]/40 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <span>📅</span>
            <span className="whitespace-nowrap">Agendar Cita</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-300 hover:text-white focus:outline-none border border-white/10 rounded-lg bg-white/5"
            aria-label="Menú principal"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d0d] border-b border-white/10 px-6 py-4 flex flex-col gap-3 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-2 text-base font-medium transition-colors border-b border-white/5 ${
                  isActive ? "text-[#4ade80] font-bold" : "text-slate-300"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* User / Login link in mobile menu */}
          <div className="pt-2">
            {user ? (
              <div className="flex items-center justify-between py-2 text-sm text-slate-300 border-t border-white/10">
                <Link href={isAdmin ? "/admin/perfil" : "/paciente"} className="font-semibold text-white truncate max-w-[200px]">
                  👤 {user.displayName || user.email}
                </Link>
                <button onClick={handleLogout} className="text-red-400 font-bold text-xs">
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block text-center py-2.5 text-sm font-bold text-slate-200 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                🔑 Acceso a Sistema
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
