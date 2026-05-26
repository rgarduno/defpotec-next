"use client";

import { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const ADMIN_EMAILS = ["lx.garduno@gmail.com", "alosgar@gmail.com"];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (ADMIN_EMAILS.includes(user.email || "")) {
          router.replace("/admin");
        } else {
          router.replace("/paciente");
        }
      } else {
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (ADMIN_EMAILS.includes(user.email || "")) {
        toast.success("¡Bienvenido Administrador!");
        router.push("/admin");
      } else {
        toast.success("¡Bienvenido a DEFPOTEC!");
        router.push("/paciente");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Error al iniciar sesión. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#006828] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center px-6 relative overflow-hidden font-sans">
      <Toaster position="top-right" />
      
      {/* Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#006828]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#9B0000]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Cartulina Snellen de fondo sutil */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.02] select-none pointer-events-none scale-75">
        <span className="text-[200px] font-black font-serif">E</span>
        <span className="text-[120px] font-black font-serif tracking-[0.2em]">F P</span>
        <span className="text-[80px] font-black font-serif tracking-[0.3em]">T O Z</span>
      </div>

      <div className="w-full max-w-md bg-[#161616]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
        {/* Brand bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#006828] via-[#eab308] to-[#9B0000] rounded-t-3xl" />

        <div className="text-center mb-10">
          <Link href="/" className="flex flex-col items-center select-none w-max mx-auto mb-6">
            <div className="h-1 w-24 bg-[#006828]" />
            <span className="text-xl font-black tracking-widest my-0.5 text-white">DEFPOTEC MX</span>
            <div className="h-1 w-24 bg-[#9B0000]" />
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
          <p className="text-slate-400 text-sm">
            Ingresa para ver tus citas agendadas o acceder a las herramientas administrativas.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:scale-[1.01]"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              {/* Google SVG Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.107.625 4.225 1.72l3.14-3.14A11.9 11.9 0 0 0 12.24 0C5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.82 0 12.24-5.42 12.24-12.24 0-.795-.085-1.56-.225-2.285H12.24z"
                />
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        <div className="mt-8 text-center text-xs text-slate-500">
          Al iniciar sesión, aceptas nuestros <br />
          <Link href="/contacto" className="underline hover:text-slate-400">Términos y Condiciones</Link> y <Link href="/contacto" className="underline hover:text-slate-400">Aviso de Privacidad</Link>.
        </div>
      </div>
    </div>
  );
}
