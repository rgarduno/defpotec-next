"use client";

import { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const ADMIN_EMAILS = ["lx.garduno@gmail.com", "alosgar@gmail.com"];

type ViewState = "login" | "signup" | "reset";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Auth state
  const [view, setView] = useState<ViewState>("login");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  // Handle successful login routing
  const routeUser = (userEmail: string | null) => {
    if (ADMIN_EMAILS.includes(userEmail || "")) {
      toast.success("¡Bienvenido Administrador!");
      router.push("/admin");
    } else {
      toast.success("¡Bienvenido a DEFPOTEC!");
      router.push("/paciente");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      routeUser(result.user.email);
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Error al iniciar sesión con Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Ingresa correo y contraseña.");
    
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      routeUser(result.user.email);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        toast.error("Credenciales incorrectas.");
      } else {
        toast.error("Error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lastname || !email || !password) return toast.error("Ingresa nombre, apellidos, correo y contraseña.");
    if (password.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres.");

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Auth Profile with Full Name
      await updateProfile(result.user, {
        displayName: `${name} ${lastname}`.trim()
      });

      // Save user to Firestore with separate name and lastname fields
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        lastname,
        email,
        userRole: "normal"
      });

      routeUser(result.user.email);
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Este correo ya está registrado.");
      } else {
        toast.error("Error al crear cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Ingresa tu correo electrónico.");

    setLoading(true);
    try {
      auth.languageCode = "es"; // Establecer idioma a español para el correo
      await sendPasswordResetEmail(auth, email);
      toast.success("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
      setView("login");
    } catch (error: any) {
      console.error("Reset error:", error);
      toast.error("Error al enviar el correo. Verifica tu dirección.");
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

        <div className="text-center mb-8">
          <Link href="/" className="flex flex-col items-center select-none w-max mx-auto mb-6">
            <div className="h-1 w-24 bg-[#006828]" />
            <span className="text-xl font-black tracking-widest my-0.5 text-white">DEFPOTEC MX</span>
            <div className="h-1 w-24 bg-[#9B0000]" />
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">
            {view === "login" && "Iniciar Sesión"}
            {view === "signup" && "Crear Cuenta"}
            {view === "reset" && "Recuperar Contraseña"}
          </h2>
          <p className="text-slate-400 text-sm">
            {view === "login" && "Ingresa para acceder a las herramientas administrativas o tus citas."}
            {view === "signup" && "Regístrate con tu correo para acceder al sistema."}
            {view === "reset" && "Ingresa tu correo y te enviaremos un enlace para restablecerla."}
          </p>
        </div>

        {/* Form */}
        <form 
          className="flex flex-col gap-4 mb-6" 
          onSubmit={view === "login" ? handleEmailLogin : view === "signup" ? handleEmailSignUp : handlePasswordReset}
        >
          {view === "signup" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 ml-1">Nombre(s) <span className="text-[#9B0000]">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] transition-colors"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 ml-1">Apellidos <span className="text-[#9B0000]">*</span></label>
                <input
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Pérez"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 ml-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] transition-colors"
              required
            />
          </div>

          {view !== "reset" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 ml-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] transition-colors"
                required
                minLength={6}
              />
            </div>
          )}

          {view === "login" && (
            <div className="text-right">
              <button 
                type="button" 
                onClick={() => setView("reset")}
                className="text-xs text-[#006828] hover:text-[#4ade80] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#006828] hover:bg-[#00501f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-[0_0_15px_rgba(0,104,40,0.3)]"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              view === "login" ? "Entrar" : view === "signup" ? "Registrarse" : "Enviar Enlace"
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs text-slate-500 font-medium">O CONTINUAR CON</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 px-6 rounded-xl transition-all shadow-md"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.107.625 4.225 1.72l3.14-3.14A11.9 11.9 0 0 0 12.24 0C5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.82 0 12.24-5.42 12.24-12.24 0-.795-.085-1.56-.225-2.285H12.24z"/>
          </svg>
          Google
        </button>

        <div className="mt-8 text-center text-sm text-slate-400 flex flex-col gap-2">
          {view === "login" ? (
            <p>
              ¿No tienes cuenta?{" "}
              <button onClick={() => setView("signup")} className="text-white font-bold hover:underline cursor-pointer">
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{" "}
              <button onClick={() => setView("login")} className="text-white font-bold hover:underline cursor-pointer">
                Inicia sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
