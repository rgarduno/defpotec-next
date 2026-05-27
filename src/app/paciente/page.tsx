"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User, updateProfile } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import Header from "@/components/Header";

type PatientAppointment = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  numberOfPatients: number;
  jornadaId: string;
  jornadaTitle: string;
  jornadaDate: string;
  jornadaState: string;
  folioCode: string;
  status: string;
  createdAt: any;
};

export default function PacientePage() {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Link folio state
  const [folioCodeToLink, setFolioCodeToLink] = useState("");
  const [linking, setLinking] = useState(false);

  // Profile state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileLastname, setProfileLastname] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
      } else {
        setUser(currentUser);
        await fetchAppointments(currentUser.email || "");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchAppointments = async (email: string) => {
    try {
      // Query from appointments collection matching current user email
      const q = query(
        collection(db, "appointments"),
        where("email", "==", email)
      );
      
      const snapshot = await getDocs(q);
      const data: PatientAppointment[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as PatientAppointment);
      });

      // Sort by createdAt locally if not ordered
      data.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error al cargar tus citas.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Signout error:", error);
    }
  };

  const handleLinkFolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folioCodeToLink) return toast.error("Ingresa el código de tu folio.");
    setLinking(true);
    try {
      // Buscar en folios
      const folioRef = doc(db, "folios", folioCodeToLink);
      const folioSnap = await getDoc(folioRef);
      if (!folioSnap.exists()) {
        toast.error("Folio no encontrado. Verifica el código.");
        setLinking(false);
        return;
      }
      
      // Actualizar folio con el nuevo email
      await updateDoc(folioRef, {
        email: user?.email
      });

      // Actualizar appointments con el nuevo email
      const q = query(collection(db, "appointments"), where("folioCode", "==", folioCodeToLink));
      const querySnapshot = await getDocs(q);
      const updatePromises: Promise<void>[] = [];
      querySnapshot.forEach((docSnap) => {
        updatePromises.push(updateDoc(doc(db, "appointments", docSnap.id), {
          email: user?.email
        }));
      });
      await Promise.all(updatePromises);

      toast.success("¡Folio vinculado con éxito!");
      setFolioCodeToLink("");
      await fetchAppointments(user?.email || "");
    } catch (err) {
      console.error(err);
      toast.error("Error al vincular el folio.");
    } finally {
      setLinking(false);
    }
  };

  const openProfile = async () => {
    setIsProfileOpen(true);
    setProfileName(user?.displayName || "");
    if (user?.uid) {
      try {
        const uSnap = await getDoc(doc(db, "users", user.uid));
        if (uSnap.exists()) {
          setProfileName(uSnap.data().name || user?.displayName || "");
          setProfileLastname(uSnap.data().lastname || "");
        }
      } catch (err) {
        console.error("Error loading profile data", err);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName) return toast.error("El nombre es requerido.");
    setSavingProfile(true);
    try {
      if (user) {
        await updateProfile(user, { displayName: profileName });
        await setDoc(doc(db, "users", user.uid), {
          name: profileName,
          lastname: profileLastname,
          email: user.email,
        }, { merge: true });
        
        // Update local user state
        setUser({ ...user, displayName: profileName } as User);
        toast.success("Perfil actualizado exitosamente.");
        setIsProfileOpen(false);
      }
    } catch (err) {
      console.error("Error saving profile", err);
      toast.error("Error al actualizar el perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#006828] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <Toaster position="top-right" />
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        {/* User Greeting Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <p className="text-[#4ade80] text-xs font-bold uppercase tracking-wider mb-2">Panel del Paciente</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Hola, {user.displayName || "Paciente"} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Aquí puedes ver los pases digitales de tus citas visuales registradas con tu cuenta <strong className="text-white">{user.email}</strong>.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={openProfile}
              className="px-6 py-2.5 border border-white/10 hover:border-[#006828] hover:bg-[#006828]/10 rounded-full text-sm font-semibold text-white transition-all"
            >
              👤 Mi Perfil
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 border border-white/10 hover:border-[#9B0000] hover:bg-[#9B0000]/10 rounded-full text-sm font-semibold text-slate-300 hover:text-white transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Citas List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎟️</span> Mis Pases de Citas
          </h2>

          {appointments.length === 0 ? (
            <div className="bg-[#161616]/60 border border-dashed border-white/10 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
              <span className="text-5xl">👁️</span>
              <h3 className="text-xl font-bold text-slate-300">No tienes citas agendadas</h3>
              <p className="text-slate-500 text-sm max-w-sm mb-2">
                No encontramos registros de citas asociados a tu correo electrónico en este momento. Si ya tienes un código de folio físico, vincúlalo a continuación:
              </p>
              
              <form onSubmit={handleLinkFolio} className="flex flex-col md:flex-row gap-2 w-full max-w-md">
                <input 
                  type="text" 
                  placeholder="Ej. DEF-1234" 
                  value={folioCodeToLink}
                  onChange={(e) => setFolioCodeToLink(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] transition-colors font-mono uppercase"
                  required
                />
                <button 
                  type="submit"
                  disabled={linking}
                  className="px-6 py-3 bg-[#0a0a0a] border border-white/10 hover:border-[#006828] hover:bg-[#006828]/20 disabled:opacity-50 text-white rounded-xl font-bold transition-all text-sm shrink-0 whitespace-nowrap"
                >
                  {linking ? "Vinculando..." : "Vincular Folio"}
                </button>
              </form>

              <div className="flex items-center gap-4 w-full max-w-md my-2">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs text-slate-500 font-medium">O</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <Link
                href="/jornadas"
                className="px-8 py-3 bg-[#006828] hover:bg-[#00501f] text-white rounded-full font-bold transition-all text-sm shadow-md"
              >
                Agendar Nueva Cita
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-[#161616] border border-white/10 rounded-2xl overflow-hidden relative shadow-lg group hover:border-[#006828]/50 transition-colors"
                >
                  {/* Left edge colored visual notch */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#006828] to-[#9B0000]" />

                  {/* Circular cutouts for ticket look */}
                  <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0a0a] border-r border-white/10" />
                  <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0a0a] border-l border-white/10" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    {/* Column 1: Campaign details */}
                    <div className="md:col-span-2 flex flex-col justify-between gap-4">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#006828]/25 text-[#4ade80] uppercase tracking-wider mb-2">
                          {appointment.jornadaState || "Campaña"}
                        </span>
                        <h3 className="text-lg font-bold text-white leading-tight">
                          {appointment.jornadaTitle || "Jornada por la Salud"}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                          <span>📅 Fecha:</span>
                          <strong className="text-white">{appointment.jornadaDate}</strong>
                        </p>
                      </div>

                      <div className="text-xs text-slate-500">
                        <p>Registrado a nombre de: <strong className="text-slate-300">{appointment.name}</strong></p>
                        <p className="mt-0.5">Personas registradas: <strong className="text-slate-300">{appointment.numberOfPatients} {appointment.numberOfPatients === 1 ? "paciente" : "pacientes"}</strong></p>
                      </div>
                    </div>

                    {/* Column 2: Folio code / actions */}
                    <div className="flex flex-col items-center justify-center bg-[#0a0a0a]/50 rounded-xl p-4 border border-white/5 relative">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">CÓDIGO DE FOLIO</p>
                      <span className="text-2xl font-black font-mono text-[#4ade80] tracking-widest select-all mb-3">
                        {appointment.folioCode || "S/N"}
                      </span>
                      <button
                        onClick={() => {
                          if (appointment.folioCode) {
                            navigator.clipboard.writeText(appointment.folioCode);
                            toast.success("¡Código de folio copiado!");
                          }
                        }}
                        className="px-4 py-1.5 bg-white/5 hover:bg-[#006828]/20 border border-white/10 hover:border-[#006828] text-xs font-semibold text-slate-300 hover:text-[#4ade80] rounded-lg flex items-center gap-1 transition-all"
                      >
                        📋 Copiar Folio
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm font-sans">
          <div className="bg-[#161616] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#006828]" />
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6">Mi Perfil</h3>
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 ml-1">Nombre</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#006828] transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 ml-1">Apellidos (Opcional)</label>
                  <input
                    type="text"
                    value={profileLastname}
                    onChange={(e) => setProfileLastname(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#006828] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 ml-1">Correo Electrónico (No modificable)</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white rounded-xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex-1 py-3 bg-[#006828] hover:bg-[#00501f] disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md"
                  >
                    {savingProfile ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
