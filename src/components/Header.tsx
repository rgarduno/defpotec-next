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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
    <header className="w-full sticky top-0 z-50 bg-[#0a0a0a]/85 backdrop-blur-md flex justify-between items-center px-6 md:px-12 py-4 border-b border-white/10">
      <Link href="/" className="flex flex-col select-none">
        <div className="h-1 w-full bg-[#006828]" />
        <span className="text-xl md:text-2xl font-black tracking-widest my-0.5 text-white">DEFPOTEC MX</span>
        <div className="h-1 w-full bg-[#9B0000]" />
      </Link>
      
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

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-xs text-slate-400">
              {user.displayName || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-white transition-colors"
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

        <Link
          href="/jornadas"
          className="px-5 py-2 bg-[#006828] hover:bg-[#00501f] text-white rounded-full font-bold transition-colors text-xs md:text-sm shadow-[0_0_15px_rgba(0,104,40,0.3)]"
        >
          Agendar Cita
        </Link>
      </div>
    </header>
  );
}
