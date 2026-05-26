"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  where
} from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAILS = ["lx.garduno@gmail.com", "alosgar@gmail.com"];

// Types matching Firestore database
type DayTrip = {
  uuid: string;
  title: string;
  state: string;
  municipality: string;
  place: string;
  address: string;
  maps: string;
  date: string;
  endDate: string;
  time: string;
  author: string;
  picture: string;
  status: string;
  day: number;
  month: number;
  year: number;
  endDay: number;
  endMonth: number;
  endYear: number;
  views?: number;
};

type Contact = {
  id: string;
  contactName: string;
  place: string;
  telephone: string;
  cellphone: string;
  schedule: string;
  maps: string;
  selectedState: string;
  selectedStateId: string;
  selectedMunicipality: string;
  selectedMunicipalityId: string;
  price: string;
  address: string;
  notes: string;
};

type DBUser = {
  id: string;
  uid?: string;
  name: string;
  lastname?: string;
  email: string;
};

type Schedule = {
  id: string;
  uuid?: string;
  name: string;
};

type State = {
  id: string;
  uuid?: string;
  name: string;
  capital: string;
};

type Folio = {
  id: string;
  code: string;
  name: string;
  cellphone: string;
  email: string;
  dayTrip: string;
  hour: string;
  day: string;
  active: boolean;
  numberOfPatients?: number;
  createdAt?: any;
};

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState<"panel" | "directorio" | "catalogos" | "citas">("panel");

  // Data States
  const [campaigns, setCampaigns] = useState<DayTrip[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dbUsers, setDbUsers] = useState<DBUser[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [statesList, setStatesList] = useState<State[]>([]);
  const [foliosList, setFoliosList] = useState<Folio[]>([]);
  const [subscribersList, setSubscribersList] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [editingContactId, setEditingContactId] = useState("");
  const [editingStateId, setEditingStateId] = useState("");
  const [selectedCampaignForPatients, setSelectedCampaignForPatients] = useState<DayTrip | null>(null);
  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);

  // Modals and Form States
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  
  // Create/Edit Campaign Form
  const [campaignForm, setCampaignForm] = useState({
    title: "Jornada por la Salud",
    author: "",
    selectedPlaceId: "",
    selectedScheduleId: "",
    picture: "",
    startDateStr: "",
    endDateStr: "",
  });

  // Create Contact Form
  const [contactForm, setContactForm] = useState({
    contactName: "",
    place: "",
    telephone: "",
    cellphone: "",
    schedule: "",
    maps: "",
    selectedState: "",
    selectedMunicipality: "",
    price: "",
    address: "",
    notes: "",
  });

  // Create State Form
  const [stateForm, setStateForm] = useState({
    name: "",
    capital: "",
  });

  // Search Filter for Folios
  const [folioSearch, setFolioSearch] = useState("");
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
      } else if (!ADMIN_EMAILS.includes(user.email || "")) {
        setAccessDenied(true);
        setLoading(false);
      } else {
        setCurrentUser(user);
        await loadAllData();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadAllData = async () => {
    try {
      // 1. Fetch campaigns (dayTrip)
      const campaignSnap = await getDocs(collection(db, "dayTrip"));
      const campaignData: DayTrip[] = [];
      campaignSnap.forEach((docSnap) => {
        campaignData.push({ uuid: docSnap.id, ...docSnap.data() } as DayTrip);
      });
      setCampaigns(campaignData);

      // 2. Fetch contacts
      const contactSnap = await getDocs(collection(db, "contacts"));
      const contactData: Contact[] = [];
      contactSnap.forEach((docSnap) => {
        contactData.push({ id: docSnap.id, ...docSnap.data() } as Contact);
      });
      setContacts(contactData);

      // 3. Fetch users from DB
      const userSnap = await getDocs(collection(db, "users"));
      const userData: DBUser[] = [];
      userSnap.forEach((docSnap) => {
        userData.push({ id: docSnap.id, ...docSnap.data() } as DBUser);
      });
      setDbUsers(userData);

      // 4. Fetch schedules
      const scheduleSnap = await getDocs(collection(db, "schedules"));
      const scheduleData: Schedule[] = [];
      scheduleSnap.forEach((docSnap) => {
        scheduleData.push({ id: docSnap.id, ...docSnap.data() } as Schedule);
      });
      setSchedules(scheduleData);

      // 5. Fetch states
      const stateSnap = await getDocs(collection(db, "states"));
      const stateData: State[] = [];
      stateSnap.forEach((docSnap) => {
        stateData.push({ id: docSnap.id, ...docSnap.data() } as State);
      });
      setStatesList(stateData);

      // 6. Fetch folios
      const folioSnap = await getDocs(collection(db, "folios"));
      const folioData: Folio[] = [];
      folioSnap.forEach((docSnap) => {
        folioData.push({ id: docSnap.id, ...docSnap.data() } as Folio);
      });
      setFoliosList(folioData);

      // 7. Fetch newsletters/subscribers
      const subsData: any[] = [];
      try {
        const newsSnap = await getDocs(collection(db, "newsletters"));
        newsSnap.forEach((docSnap) => {
          subsData.push({ id: docSnap.id, ...docSnap.data() });
        });
      } catch (e) {
        console.warn("newsletters collection not found, trying subscribers...", e);
        try {
          const subSnap = await getDocs(collection(db, "subscribers"));
          subSnap.forEach((docSnap) => {
            subsData.push({ id: docSnap.id, ...docSnap.data() });
          });
        } catch (e2) {
          console.warn("subscribers collection not found:", e2);
        }
      }
      setSubscribersList(subsData);
    } catch (err) {
      console.error("Error loading admin data:", err);
      toast.error("Error al cargar los datos del servidor.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Helper to parse dates
  const parseDateFields = (dateStr: string) => {
    if (!dateStr) return { day: 1, month: 1, year: 2026 };
    const date = new Date(dateStr + "T00:00:00");
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${date.getDate()} de ${months[date.getMonth()]} del ${date.getFullYear()}`;
  };

  // CAMPAIGNS HANDLERS
  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.author || !campaignForm.selectedPlaceId || !campaignForm.startDateStr || !campaignForm.endDateStr) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    const placeObj = contacts.find(c => c.id === campaignForm.selectedPlaceId);
    const scheduleObj = schedules.find(s => s.id === campaignForm.selectedScheduleId);
    
    if (!placeObj) {
      toast.error("Lugar no válido.");
      return;
    }

    const startInfo = parseDateFields(campaignForm.startDateStr);
    const endInfo = parseDateFields(campaignForm.endDateStr);

    const docData = {
      title: campaignForm.title,
      author: campaignForm.author,
      place: placeObj.place || placeObj.contactName || "",
      address: placeObj.address || "",
      maps: placeObj.maps || "",
      municipality: placeObj.selectedMunicipality || "",
      state: placeObj.selectedState || "",
      time: scheduleObj?.name || "10:00 Hrs. a 18:00 Hrs.",
      picture: campaignForm.picture || "https://images.unsplash.com/photo-1518206075495-4e901709d372?auto=format&fit=crop&w=1350&q=80",
      status: isEditMode ? campaigns.find(c => c.uuid === selectedCampaignId)?.status || "active" : "active",
      date: formatDateLabel(campaignForm.startDateStr),
      endDate: formatDateLabel(campaignForm.endDateStr),
      day: startInfo.day,
      month: startInfo.month,
      year: startInfo.year,
      endDay: endInfo.day,
      endMonth: endInfo.month,
      endYear: endInfo.year,
      allDays: [startInfo.day],
    };

    try {
      if (isEditMode) {
        await setDoc(doc(db, "dayTrip", selectedCampaignId), {
          ...docData,
          uuid: selectedCampaignId
        }, { merge: true });
        toast.success("¡Campaña actualizada!");
      } else {
        const newDocRef = doc(collection(db, "dayTrip"));
        await setDoc(newDocRef, {
          ...docData,
          uuid: newDocRef.id
        });
        toast.success("¡Campaña creada!");
      }
      setIsCampaignModalOpen(false);
      resetCampaignForm();
      await loadAllData();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar la campaña.");
    }
  };

  const handleToggleCampaignStatus = async (campaign: DayTrip) => {
    const newStatus = campaign.status === "active" ? "inactive" : "active";
    try {
      await updateDoc(doc(db, "dayTrip", campaign.uuid), {
        status: newStatus
      });
      toast.success(`Campaña marcada como ${newStatus === "active" ? "Activa" : "Inactiva"}`);
      await loadAllData();
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar estado.");
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta campaña permanentemente?")) return;
    try {
      await deleteDoc(doc(db, "dayTrip", campaignId));
      toast.success("Campaña eliminada.");
      await loadAllData();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar campaña.");
    }
  };

  const openEditCampaign = (campaign: DayTrip) => {
    setIsEditMode(true);
    setSelectedCampaignId(campaign.uuid);
    
    // Attempt to match place and schedule IDs
    const matchedPlace = contacts.find(c => c.place === campaign.place || c.contactName === campaign.place);
    const matchedSchedule = schedules.find(s => s.name === campaign.time);

    // Format ISO string dates for HTML inputs (YYYY-MM-DD)
    const startStr = `${campaign.year}-${String(campaign.month).padStart(2, "0")}-${String(campaign.day).padStart(2, "0")}`;
    const endStr = `${campaign.endYear || campaign.year}-${String(campaign.endMonth || campaign.month).padStart(2, "0")}-${String(campaign.endDay || campaign.day).padStart(2, "0")}`;

    setCampaignForm({
      title: campaign.title,
      author: campaign.author,
      selectedPlaceId: matchedPlace?.id || "",
      selectedScheduleId: matchedSchedule?.id || "",
      picture: campaign.picture,
      startDateStr: startStr,
      endDateStr: endStr,
    });
    setIsCampaignModalOpen(true);
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      title: "Jornada por la Salud",
      author: "",
      selectedPlaceId: "",
      selectedScheduleId: "",
      picture: "",
      startDateStr: "",
      endDateStr: "",
    });
    setIsEditMode(false);
    setSelectedCampaignId("");
  };

  // DIRECTORY / CONTACTS HANDLERS
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.contactName || !contactForm.place || !contactForm.address) {
      toast.error("Por favor completa los campos mínimos.");
      return;
    }

    try {
      if (editingContactId) {
        await updateDoc(doc(db, "contacts", editingContactId), {
          ...contactForm,
          price: contactForm.price || "249",
        });
        toast.success("¡Contacto actualizado!");
        setEditingContactId("");
      } else {
        const newDocRef = doc(collection(db, "contacts"));
        await setDoc(newDocRef, {
          ...contactForm,
          uuid: newDocRef.id,
          price: contactForm.price || "249",
          selectedStateId: "",
          selectedMunicipalityId: "",
          createdAt: serverTimestamp()
        });
        toast.success("¡Contacto guardado en el directorio!");
      }
      setContactForm({
        contactName: "",
        place: "",
        telephone: "",
        cellphone: "",
        schedule: "",
        maps: "",
        selectedState: "",
        selectedMunicipality: "",
        price: "",
        address: "",
        notes: "",
      });
      await loadAllData();
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar contacto.");
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("¿Deseas eliminar este contacto del directorio?")) return;
    try {
      await deleteDoc(doc(db, "contacts", id));
      toast.success("Contacto eliminado.");
      await loadAllData();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar contacto.");
    }
  };

  // STATES CATALOG HANDLERS
  const handleStateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateForm.name || !stateForm.capital) {
      toast.error("Completa Estado y Capital.");
      return;
    }
    try {
      if (editingStateId) {
        await updateDoc(doc(db, "states", editingStateId), {
          name: stateForm.name,
          capital: stateForm.capital,
        });
        toast.success("Estado actualizado.");
        setEditingStateId("");
      } else {
        const newDocRef = doc(collection(db, "states"));
        await setDoc(newDocRef, {
          name: stateForm.name,
          capital: stateForm.capital,
          uuid: newDocRef.id
        });
        toast.success("Estado registrado.");
      }
      setStateForm({ name: "", capital: "" });
      await loadAllData();
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar estado.");
    }
  };

  const handleDeleteState = async (id: string) => {
    if (!confirm("¿Deseas eliminar este estado del catálogo?")) return;
    try {
      await deleteDoc(doc(db, "states", id));
      toast.success("Estado eliminado.");
      await loadAllData();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar estado.");
    }
  };

  // FOLIOS HANDLERS
  const handleToggleFolioActive = async (folio: Folio) => {
    const newActive = !folio.active;
    try {
      await updateDoc(doc(db, "folios", folio.code), {
        active: newActive
      });
      toast.success(`Folio ${folio.code} marcado como ${newActive ? "Activo" : "Completado/Desactivado"}`);
      await loadAllData();
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar folio.");
    }
  };

  const openEditContact = (contact: Contact) => {
    setEditingContactId(contact.id);
    setContactForm({
      contactName: contact.contactName || "",
      place: contact.place || "",
      telephone: contact.telephone || "",
      cellphone: contact.cellphone || "",
      schedule: contact.schedule || "",
      maps: contact.maps || "",
      selectedState: contact.selectedState || "",
      selectedMunicipality: contact.selectedMunicipality || "",
      price: contact.price || "249",
      address: contact.address || "",
      notes: contact.notes || "",
    });
  };

  const cancelEditContact = () => {
    setEditingContactId("");
    setContactForm({
      contactName: "",
      place: "",
      telephone: "",
      cellphone: "",
      schedule: "",
      maps: "",
      selectedState: "",
      selectedMunicipality: "",
      price: "",
      address: "",
      notes: "",
    });
  };

  const openEditState = (state: State) => {
    setEditingStateId(state.id);
    setStateForm({
      name: state.name || "",
      capital: state.capital || "",
    });
  };

  const cancelEditState = () => {
    setEditingStateId("");
    setStateForm({
      name: "",
      capital: "",
    });
  };

  const handleDeleteFolio = async (folioCode: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la cita con folio ${folioCode} permanentemente?`)) return;
    try {
      // 1. Delete from folios collection
      await deleteDoc(doc(db, "folios", folioCode));

      // 2. Find and delete from appointments collection
      const q = query(collection(db, "appointments"), where("folioCode", "==", folioCode));
      const querySnapshot = await getDocs(q);
      const deletePromises: Promise<void>[] = [];
      querySnapshot.forEach((docSnap) => {
        deletePromises.push(deleteDoc(doc(db, "appointments", docSnap.id)));
      });
      await Promise.all(deletePromises);

      toast.success(`Cita con folio ${folioCode} eliminada correctamente.`);
      await loadAllData();
    } catch (err) {
      console.error("Error deleting folio/appointment:", err);
      toast.error("Error al eliminar la cita.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#006828] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-24 h-24 rounded-full bg-[#9B0000]/25 border-2 border-[#9B0000] flex items-center justify-center text-5xl">
          🚫
        </div>
        <h1 className="text-3xl font-extrabold">Acceso Denegado</h1>
        <p className="text-slate-400 max-w-sm">
          Este panel de control es de uso exclusivo para el CEO y directivos autorizados de DEFPOTEC MX.
        </p>
        <div className="flex gap-4">
          <Link href="/" className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold transition-all border border-white/10 text-sm">
            Volver al Inicio
          </Link>
          <button onClick={handleLogout} className="px-6 py-2 bg-[#9B0000] hover:bg-[#800000] text-white rounded-full font-bold transition-all text-sm shadow-[0_0_15px_rgba(155,0,0,0.4)]">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Filtered lists
  const availableYears = Array.from(new Set([
    new Date().getFullYear(),
    ...campaigns.map(c => c.year).filter(Boolean),
    ...campaigns.map(c => c.endYear).filter(Boolean)
  ])).sort((a, b) => b - a);

  const activeCampaigns = campaigns.filter(c => c.status === "active" && (c.year === selectedYear || c.endYear === selectedYear));
  const inactiveCampaigns = campaigns.filter(c => c.status === "inactive" && (c.year === selectedYear || c.endYear === selectedYear));

  // Folios linked to campaigns of selected year OR created in selected year
  const campaignsOfYear = campaigns.filter(c => c.year === selectedYear || c.endYear === selectedYear);
  const campaignIdsOfYear = new Set(campaignsOfYear.map(c => c.uuid));
  const foliosOfYear = foliosList.filter(f => {
    if (campaignIdsOfYear.has(f.dayTrip)) return true;
    if (f.createdAt) {
      const date = f.createdAt.toDate ? f.createdAt.toDate() : new Date(f.createdAt);
      return date.getFullYear() === selectedYear;
    }
    return false;
  });

  // Subscribers registered in selected year (or current year if no date)
  const subscribersOfYear = subscribersList.filter(sub => {
    if (sub.createdAt) {
      const date = sub.createdAt.toDate ? sub.createdAt.toDate() : new Date(sub.createdAt);
      return date.getFullYear() === selectedYear;
    }
    return selectedYear === new Date().getFullYear();
  });

  const filteredFolios = foliosOfYear.filter(f => 
    f.name?.toLowerCase().includes(folioSearch.toLowerCase()) || 
    f.code?.toLowerCase().includes(folioSearch.toLowerCase()) ||
    f.email?.toLowerCase().includes(folioSearch.toLowerCase())
  );

  // Chart 1: Monthly Folios count
  const monthlyData = Array(12).fill(0);
  foliosOfYear.forEach(f => {
    const camp = campaigns.find(c => c.uuid === f.dayTrip);
    if (camp && camp.month >= 1 && camp.month <= 12) {
      monthlyData[camp.month - 1] += 1;
    } else if (f.createdAt) {
      const date = f.createdAt.toDate ? f.createdAt.toDate() : new Date(f.createdAt);
      const m = date.getMonth();
      if (m >= 0 && m < 12) {
        monthlyData[m] += 1;
      }
    }
  });

  // Chart 2: Top States activity
  const stateCounts: { [key: string]: number } = {};
  campaignsOfYear.forEach(c => {
    if (c.state) {
      stateCounts[c.state] = (stateCounts[c.state] || 0) + 1;
    }
  });
  const topStates = Object.entries(stateCounts)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <Toaster position="top-right" />
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-64 bg-[#111] border-b lg:border-b-0 lg:border-r border-white/10 p-6 flex flex-col gap-6 shrink-0">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">DEFPOTEC MX</p>
            <h2 className="text-lg font-black text-white mt-1">Panel de Control</h2>
          </div>

          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0">
            <button
              onClick={() => setActiveTab("panel")}
              className={`w-max lg:w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "panel" 
                  ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>📊</span> Panel de Control
            </button>
            <button
              onClick={() => setActiveTab("directorio")}
              className={`w-max lg:w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "directorio" 
                  ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>📖</span> Directorio
            </button>
            <button
              onClick={() => setActiveTab("catalogos")}
              className={`w-max lg:w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "catalogos" 
                  ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>🏥</span> Servicios y Estados
            </button>
            <button
              onClick={() => setActiveTab("citas")}
              className={`w-max lg:w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "citas" 
                  ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>🎟️</span> Control de Citas
            </button>
          </nav>

          <div className="mt-auto hidden lg:flex flex-col gap-4 border-t border-white/5 pt-6 text-xs text-slate-500">
            <p>Conectado como:</p>
            <p className="font-semibold text-slate-300 truncate">{currentUser?.email}</p>
            <button onClick={handleLogout} className="text-[#9B0000] hover:underline font-bold text-left">
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-grow p-6 md:p-10 relative overflow-x-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#006828]/5 blur-[120px] pointer-events-none rounded-full" />

          {/* TOP BAR / YEAR SELECTOR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl mb-8 relative z-10">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">DEFPOTEC MX</p>
              <h1 className="text-2xl font-black text-white mt-1">Dashboard CEO</h1>
              <p className="text-xs text-slate-400 mt-1">Análisis de rendimiento y métricas para el año {selectedYear}.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-400">Año de Consulta:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#006828] cursor-pointer"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TAB 1: PANEL DE CONTROL (CAMPAÑAS) */}
          {activeTab === "panel" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              
              {/* METRIC CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Jornadas Activas</p>
                  <p className="text-3xl font-black text-[#4ade80]">{activeCampaigns.length}</p>
                  <div className="absolute bottom-2 right-4 text-3xl opacity-10">👁️</div>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Jornadas Inactivas</p>
                  <p className="text-3xl font-black text-slate-400">{inactiveCampaigns.length}</p>
                  <div className="absolute bottom-2 right-4 text-3xl opacity-10">💬</div>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Folios</p>
                  <p className="text-3xl font-black text-[#60a5fa]">{foliosOfYear.length}</p>
                  <div className="absolute bottom-2 right-4 text-3xl opacity-10">🛍️</div>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Usuarios</p>
                  <p className="text-3xl font-black text-[#f43f5e]">{dbUsers.length}</p>
                  <div className="absolute bottom-2 right-4 text-3xl opacity-10">❤️</div>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Suscriptores</p>
                  <p className="text-3xl font-black text-[#10b981]">{subscribersOfYear.length}</p>
                  <div className="absolute bottom-2 right-4 text-3xl opacity-10">😊</div>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Servicios</p>
                  <p className="text-3xl font-black text-[#f59e0b]">3</p>
                  <div className="absolute bottom-2 right-4 text-3xl opacity-10">🚚</div>
                </div>
              </div>

              {/* CHARTS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart 1: Monthly Folios count */}
                <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Citas Agendadas por Mes</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Volumen mensual de folios registrados en el año {selectedYear}.</p>
                  </div>
                  
                  <div className="relative w-full h-[220px] bg-[#0a0a0a] rounded-xl p-4 border border-white/5 flex flex-col justify-between">
                    {/* Grid Lines & Bars */}
                    <div className="relative flex-grow flex items-end justify-between h-[160px] px-2 pt-4">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                        <div className="w-full border-t border-dashed border-white" />
                        <div className="w-full border-t border-dashed border-white" />
                        <div className="w-full border-t border-dashed border-white" />
                        <div className="w-full border-t border-dashed border-white" />
                      </div>
                      
                      {monthlyData.map((val, idx) => {
                        const maxMonthlyVal = Math.max(...monthlyData, 5);
                        const pctHeight = (val / maxMonthlyVal) * 100;
                        return (
                          <div 
                            key={idx} 
                            className="flex flex-col items-center gap-1 group relative flex-1"
                            onMouseEnter={() => setHoveredMonth(idx)}
                            onMouseLeave={() => setHoveredMonth(null)}
                          >
                            {/* Hover Tooltip */}
                            <AnimatePresence>
                              {hoveredMonth === idx && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                  className="absolute bottom-[calc(100%+8px)] bg-[#1c1c1c] border border-[#006828]/50 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-xl z-20 whitespace-nowrap"
                                >
                                  {val} {val === 1 ? "cita" : "citas"}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Bar */}
                            <div className="w-6 sm:w-8 bg-white/5 rounded-t-lg overflow-hidden h-[120px] flex items-end">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${pctHeight}%` }}
                                transition={{ type: "spring", stiffness: 60, delay: idx * 0.02 }}
                                className="w-full rounded-t-lg bg-gradient-to-t from-[#006828] to-[#4ade80] group-hover:brightness-110 shadow-[0_0_10px_rgba(74,222,128,0.1)] transition-all duration-300"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between px-2 pt-2 border-t border-white/5 text-[9px] sm:text-[10px] text-slate-500 font-semibold select-none">
                      {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((lbl, idx) => (
                        <span key={idx} className="flex-1 text-center truncate">{lbl}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chart 2: Top States activity */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Actividad por Estado</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Distribución de campañas por región en el año {selectedYear}.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4 flex-grow justify-center">
                    {topStates.slice(0, 4).map(({ state, count }) => {
                      const totalCamps = campaignsOfYear.length || 1;
                      const percentage = Math.round((count / totalCamps) * 100);
                      return (
                        <div key={state} className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-300 truncate max-w-[120px]" title={state}>{state}</span>
                            <span className="text-slate-400 font-mono font-bold">{count} {count === 1 ? "campaña" : "campañas"} ({percentage}%)</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-[#006828] to-[#4ade80] rounded-full shadow-[0_0_8px_rgba(74,222,128,0.15)]"
                            />
                          </div>
                        </div>
                      );
                    })}

                    {topStates.length === 0 && (
                      <div className="h-[180px] border border-dashed border-white/5 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                        Sin datos geográficos en este año.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* ACTION HEADER */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold">Administración de Jornadas</h2>
                <button
                  onClick={() => {
                    resetCampaignForm();
                    setIsCampaignModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-[#006828] hover:bg-[#00501f] text-white rounded-full font-bold text-sm shadow-[0_0_15px_rgba(0,104,40,0.3)] transition-colors"
                >
                  Crear Jornada
                </button>
              </div>

              {/* ACTIVE CAMPAIGNS TABLE */}
              <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-white/5 bg-white/5">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Jornadas Activas</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                        <th className="p-4">Municipio / Estado</th>
                        <th className="p-4">Establecimiento</th>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Responsable</th>
                        <th className="p-4">Horario</th>
                        <th className="p-4 text-center">Pacientes</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCampaigns.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                            No hay campañas activas registradas.
                          </td>
                        </tr>
                      ) : (
                        activeCampaigns.map((camp) => (
                          <tr key={camp.uuid} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                            <td className="p-4 font-semibold text-white">
                              {camp.municipality || "N/A"}, {camp.state}
                            </td>
                            <td className="p-4">{camp.place || "N/A"}</td>
                            <td className="p-4 text-xs">{camp.date}</td>
                            <td className="p-4 text-xs text-slate-400">{camp.author}</td>
                            <td className="p-4 text-xs text-slate-400">{camp.time}</td>
                            <td className="p-4 text-center text-xs font-bold text-[#4ade80]">
                              👥 {foliosList.filter(f => f.dayTrip === camp.uuid).reduce((sum, f) => sum + (f.numberOfPatients || 1), 0)}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => {
                                    setSelectedCampaignForPatients(camp);
                                    setIsPatientsModalOpen(true);
                                  }}
                                  className="p-1.5 bg-white/5 hover:bg-[#006828] rounded-lg text-slate-400 hover:text-white transition-colors"
                                  title="Ver pacientes"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => openEditCampaign(camp)}
                                  className="p-1.5 bg-white/5 hover:bg-[#006828] rounded-lg text-slate-400 hover:text-white transition-colors"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleToggleCampaignStatus(camp)}
                                  className="p-1.5 bg-[#9B0000]/10 hover:bg-[#9B0000] rounded-lg text-[#9B0000] hover:text-white transition-colors text-xs font-semibold px-2.5 py-1"
                                >
                                  Desactivar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INACTIVE CAMPAIGNS TABLE */}
              <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-white/5 bg-white/5">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Historial de Jornadas Inactivas</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                        <th className="p-4">Municipio / Estado</th>
                        <th className="p-4">Establecimiento</th>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Responsable</th>
                        <th className="p-4 text-center">Pacientes</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inactiveCampaigns.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                            No hay campañas inactivas en el historial.
                          </td>
                        </tr>
                      ) : (
                        inactiveCampaigns.map((camp) => (
                          <tr key={camp.uuid} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-400">
                            <td className="p-4">
                              {camp.municipality || "N/A"}, {camp.state}
                            </td>
                            <td className="p-4">{camp.place || "N/A"}</td>
                            <td className="p-4 text-xs">{camp.date}</td>
                            <td className="p-4 text-xs">{camp.author}</td>
                            <td className="p-4 text-center text-xs font-bold text-slate-400">
                              👥 {foliosList.filter(f => f.dayTrip === camp.uuid).reduce((sum, f) => sum + (f.numberOfPatients || 1), 0)}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => {
                                    setSelectedCampaignForPatients(camp);
                                    setIsPatientsModalOpen(true);
                                  }}
                                  className="p-1.5 bg-white/5 hover:bg-[#006828] rounded-lg text-slate-400 hover:text-white transition-colors"
                                  title="Ver pacientes"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => openEditCampaign(camp)}
                                  className="p-1.5 bg-white/5 hover:bg-[#006828] rounded-lg text-slate-400 hover:text-white transition-colors"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleToggleCampaignStatus(camp)}
                                  className="p-1.5 bg-[#006828]/20 hover:bg-[#006828] rounded-lg text-[#4ade80] hover:text-white transition-colors text-xs font-semibold px-2.5 py-1"
                                >
                                  Activar
                                </button>
                                <button
                                  onClick={() => handleDeleteCampaign(camp.uuid)}
                                  className="p-1.5 bg-white/5 hover:bg-[#9B0000] rounded-lg text-slate-400 hover:text-white transition-colors"
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DIRECTORIO (CONTACTOS) */}
          {activeTab === "directorio" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* CREATE CONTACT FORM */}
              <div className="lg:col-span-1 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl h-max">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-2">
                  {editingContactId ? "Editar Sucursal / Lugar" : "Crear Sucursal / Lugar"}
                </h3>
                
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Nombre del Contacto <span className="text-[#9B0000]">*</span></label>
                    <input
                      type="text"
                      placeholder="Nombre responsable"
                      value={contactForm.contactName}
                      onChange={e => setContactForm({ ...contactForm, contactName: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Nombre del Establecimiento <span className="text-[#9B0000]">*</span></label>
                    <input
                      type="text"
                      placeholder="Ej. Hotel Jardín, Plaza Central"
                      value={contactForm.place}
                      onChange={e => setContactForm({ ...contactForm, place: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Teléfono</label>
                      <input
                        type="text"
                        placeholder="Oficina"
                        value={contactForm.telephone}
                        onChange={e => setContactForm({ ...contactForm, telephone: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Celular</label>
                      <input
                        type="text"
                        placeholder="WhatsApp"
                        value={contactForm.cellphone}
                        onChange={e => setContactForm({ ...contactForm, cellphone: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Estado <span className="text-[#9B0000]">*</span></label>
                      <input
                        type="text"
                        placeholder="Ej. Puebla, Hidalgo"
                        value={contactForm.selectedState}
                        onChange={e => setContactForm({ ...contactForm, selectedState: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Municipio <span className="text-[#9B0000]">*</span></label>
                      <input
                        type="text"
                        placeholder="Ej. Huasca, Pahuatlán"
                        value={contactForm.selectedMunicipality}
                        onChange={e => setContactForm({ ...contactForm, selectedMunicipality: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Dirección Física <span className="text-[#9B0000]">*</span></label>
                    <input
                      type="text"
                      placeholder="Calle, Número, Colonia, CP"
                      value={contactForm.address}
                      onChange={e => setContactForm({ ...contactForm, address: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Link de Google Maps</label>
                    <input
                      type="text"
                      placeholder="https://maps.google.com/..."
                      value={contactForm.maps}
                      onChange={e => setContactForm({ ...contactForm, maps: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Horario de Atención</label>
                      <input
                        type="text"
                        placeholder="Ej. 10AM a 6PM"
                        value={contactForm.schedule}
                        onChange={e => setContactForm({ ...contactForm, schedule: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Precio Base ($)</label>
                      <input
                        type="text"
                        placeholder="Ej. 249"
                        value={contactForm.price}
                        onChange={e => setContactForm({ ...contactForm, price: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Notas Adicionales</label>
                    <textarea
                      rows={2}
                      placeholder="Observaciones..."
                      value={contactForm.notes}
                      onChange={e => setContactForm({ ...contactForm, notes: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828] resize-none"
                    />
                  </div>

                  <div className="flex gap-3 mt-2">
                    {editingContactId && (
                      <button
                        type="button"
                        onClick={cancelEditContact}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-colors text-sm cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-grow bg-[#006828] hover:bg-[#00501f] text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(0,104,40,0.3)] cursor-pointer"
                    >
                      {editingContactId ? "Guardar Cambios" : "Crear Contacto"}
                    </button>
                  </div>
                </form>
              </div>

              {/* LIST OF CONTACTS */}
              <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-white/5 bg-white/5">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Lugares Registrados (Directorio)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                        <th className="p-4">Establecimiento / Contacto</th>
                        <th className="p-4">Ubicación</th>
                        <th className="p-4">Contacto / Tel</th>
                        <th className="p-4">Dirección</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                            No hay contactos en el directorio aún.
                          </td>
                        </tr>
                      ) : (
                        contacts.map((contact) => (
                          <tr key={contact.id} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                            <td className="p-4">
                              <p className="font-semibold text-white">{contact.place}</p>
                              <p className="text-xs text-slate-500">{contact.contactName}</p>
                            </td>
                            <td className="p-4 text-xs">
                              {contact.selectedMunicipality}, {contact.selectedState}
                            </td>
                            <td className="p-4 text-xs">
                              <p>{contact.cellphone || contact.telephone || "S/T"}</p>
                              <p className="text-[10px] text-slate-500">{contact.schedule}</p>
                            </td>
                            <td className="p-4 text-xs text-slate-400 max-w-xs truncate" title={contact.address}>
                              {contact.address}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => openEditContact(contact)}
                                  className="p-1.5 bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteContact(contact.id)}
                                  className="p-1.5 bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SERVICIOS Y ESTADOS */}
          {activeTab === "catalogos" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* STATES MANAGEMENT */}
              <div className="flex flex-col gap-6">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-2">
                    {editingStateId ? "Editar Estado de la República" : "Registrar Estado de la República"}
                  </h3>
                  
                  <form onSubmit={handleStateSubmit} className="flex gap-4 items-end">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Nombre del Estado</label>
                      <input
                        type="text"
                        placeholder="Ej. Puebla"
                        value={stateForm.name}
                        onChange={e => setStateForm({ ...stateForm, name: e.target.value })}
                        className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                        required
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Capital</label>
                      <input
                        type="text"
                        placeholder="Ej. Puebla de Zaragoza"
                        value={stateForm.capital}
                        onChange={e => setStateForm({ ...stateForm, capital: e.target.value })}
                        className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      {editingStateId && (
                        <button
                          type="button"
                          onClick={cancelEditState}
                          className="bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-2 rounded-xl border border-white/10 transition-colors text-sm cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-[#006828] hover:bg-[#00501f] text-white font-bold px-6 py-2 rounded-xl transition-colors text-sm cursor-pointer"
                      >
                        {editingStateId ? "Guardar" : "Registrar"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-white/5 bg-white/5">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Catálogo de Estados</h3>
                  </div>
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                          <th className="p-4">UID</th>
                          <th className="p-4">Nombre</th>
                          <th className="p-4">Capital</th>
                          <th className="p-4 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statesList.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                              No hay estados registrados.
                            </td>
                          </tr>
                        ) : (
                          statesList.map((state) => (
                            <tr key={state.id} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                              <td className="p-4 text-xs font-mono text-slate-500 max-w-[120px] truncate">{state.id}</td>
                              <td className="p-4 font-semibold text-white">{state.name}</td>
                              <td className="p-4 text-slate-400">{state.capital}</td>
                              <td className="p-4 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => openEditState(state)}
                                    className="p-1.5 bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteState(state.id)}
                                    className="p-1.5 bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title="Eliminar"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SCHEDULES, SERVICES AND SUBSCRIBERS INFO */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
                <h3 className="text-lg font-bold text-white mb-2 border-b border-white/5 pb-2">Catálogos Auxiliares</h3>
                
                <div className="p-4 rounded-xl border border-white/10 bg-white/2">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">🕐 Plantillas de Horarios</h4>
                  <ul className="flex flex-col gap-2 text-xs text-slate-400">
                    {schedules.map(sch => (
                      <li key={sch.id} className="flex justify-between border-b border-white/5 pb-1">
                        <span>{sch.name}</span>
                        <span className="text-[#4ade80]">Activa</span>
                      </li>
                    ))}
                    {schedules.length === 0 && <li>Predeterminado: 10:00 Hrs. a 18:00 Hrs.</li>}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/2">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">😊 Suscriptores Boletín ({subscribersList.length})</h4>
                  <div className="overflow-y-auto max-h-[150px] flex flex-col gap-1.5 mt-2">
                    {subscribersList.map((sub, idx) => (
                      <div key={sub.id || idx} className="flex items-center justify-between border-b border-white/5 pb-1 text-xs text-slate-400">
                        <span className="truncate max-w-[200px]" title={sub.newsLetterEmail || sub.email}>{sub.newsLetterEmail || sub.email || "Sin correo"}</span>
                        <span className="text-[10px] text-slate-500 font-mono select-all truncate max-w-[80px]">{sub.id}</span>
                      </div>
                    ))}
                    {subscribersList.length === 0 && <p className="text-xs text-slate-500">No hay suscriptores registrados.</p>}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/2">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">❓ FAQs del Sistema</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Las preguntas frecuentes mostradas en la landing page y en los formularios están ligadas a la colección <code className="bg-[#0a0a0a] px-1 py-0.5 rounded text-white font-mono">faqs</code> en Firestore. Se administran mediante la base de datos central.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: CONTROL DE CITAS (FOLIOS) */}
          {activeTab === "citas" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              
              {/* SEARCH BAR */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div>
                  <h3 className="font-bold text-white">Buscador y Conciliador de Citas</h3>
                  <p className="text-xs text-slate-400 mt-1">Busca por código de folio, nombre del paciente o correo electrónico.</p>
                </div>
                <input
                  type="text"
                  placeholder="Buscar folio (ej. DF98X o Laura)..."
                  value={folioSearch}
                  onChange={e => setFolioSearch(e.target.value)}
                  className="w-full sm:w-80 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                />
              </div>

              {/* APPOINTMENTS FOLIO LIST TABLE */}
              <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-white/5 bg-white/5">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Listado General de Pacientes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                        <th className="p-4">Folio / Status</th>
                        <th className="p-4">Paciente</th>
                        <th className="p-4">Correo</th>
                        <th className="p-4">Celular</th>
                        <th className="p-4">ID Campaña</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFolios.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                            No se encontraron citas o folios registrados.
                          </td>
                        </tr>
                      ) : (
                        filteredFolios.map((folio) => (
                          <tr key={folio.id} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                            <td className="p-4">
                              <span className="font-mono text-base font-black text-[#4ade80] tracking-wider select-all">
                                {folio.code || folio.id}
                              </span>
                              <span className={`ml-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                folio.active 
                                  ? "bg-[#006828]/20 text-[#4ade80]" 
                                  : "bg-white/5 text-slate-500"
                              }`}>
                                {folio.active ? "Activo" : "Completado"}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-white">{folio.name}</td>
                            <td className="p-4 text-xs text-slate-400">{folio.email}</td>
                            <td className="p-4 text-xs text-slate-400">{folio.cellphone}</td>
                            <td className="p-4 text-xs font-mono text-slate-500 max-w-[150px] truncate" title={folio.dayTrip}>
                              {folio.dayTrip}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-center items-center">
                                <button
                                  onClick={() => handleToggleFolioActive(folio)}
                                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                    folio.active 
                                      ? "bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white" 
                                      : "bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {folio.active ? "Completar Cita" : "Reactivar Folio"}
                                </button>
                                <button
                                  onClick={() => handleDeleteFolio(folio.code || folio.id)}
                                  className="p-1.5 bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar cita permanentemente"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* CREATE / EDIT CAMPAIGN MODAL */}
      <AnimatePresence>
        {isCampaignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161616] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#006828]" />
              
              <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5">
                <h3 className="text-xl font-bold text-white">
                  {isEditMode ? "Editar Jornada" : "Crear Nueva Jornada"}
                </h3>
                <button
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCampaignSubmit} className="p-6 md:p-8 flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Título de la Campaña</label>
                  <input
                    type="text"
                    value={campaignForm.title}
                    onChange={e => setCampaignForm({ ...campaignForm, title: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Responsable (Encargado) <span className="text-[#9B0000]">*</span></label>
                    <select
                      value={campaignForm.author}
                      onChange={e => setCampaignForm({ ...campaignForm, author: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828] appearance-none"
                      required
                    >
                      <option value="">Selecciona encargado</option>
                      {dbUsers.map(usr => (
                        <option key={usr.id} value={`${usr.name} ${usr.lastname || ""}`.trim()}>
                          {usr.name} {usr.lastname || ""} ({usr.email})
                        </option>
                      ))}
                      {dbUsers.length === 0 && <option value="Guillermo Alfredo Osornio García">Guillermo Alfredo Osornio García (Predeterminado)</option>}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Establecimiento (Directorio) <span className="text-[#9B0000]">*</span></label>
                    <select
                      value={campaignForm.selectedPlaceId}
                      onChange={e => setCampaignForm({ ...campaignForm, selectedPlaceId: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828] appearance-none"
                      required
                    >
                      <option value="">Selecciona lugar del directorio</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.place} ({c.selectedMunicipality}, {c.selectedState})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Horario de Atención</label>
                    <select
                      value={campaignForm.selectedScheduleId}
                      onChange={e => setCampaignForm({ ...campaignForm, selectedScheduleId: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828] appearance-none"
                    >
                      <option value="">Selecciona plantilla horario</option>
                      {schedules.map(sch => (
                        <option key={sch.id} value={sch.id}>{sch.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">URL Imagen Banner</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={campaignForm.picture}
                      onChange={e => setCampaignForm({ ...campaignForm, picture: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Fecha de Inicio <span className="text-[#9B0000]">*</span></label>
                    <input
                      type="date"
                      value={campaignForm.startDateStr}
                      onChange={e => setCampaignForm({ ...campaignForm, startDateStr: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828]"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400">Fecha de Cierre <span className="text-[#9B0000]">*</span></label>
                    <input
                      type="date"
                      value={campaignForm.endDateStr}
                      onChange={e => setCampaignForm({ ...campaignForm, endDateStr: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828]"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setIsCampaignModalOpen(false)}
                    className="px-6 py-2.5 border border-white/10 hover:border-white/20 rounded-full text-sm font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#006828] hover:bg-[#00501f] text-white rounded-full font-bold text-sm shadow-[0_0_15px_rgba(0,104,40,0.3)] transition-colors"
                  >
                    {isEditMode ? "Guardar Cambios" : "Crear Jornada"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW CAMPAIGN PATIENTS MODAL */}
      <AnimatePresence>
        {isPatientsModalOpen && selectedCampaignForPatients && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161616] border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#006828]" />
              
              <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5 shrink-0">
                <div>
                  <span className="text-[10px] bg-[#006828]/25 text-[#4ade80] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Pacientes Registrados
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {selectedCampaignForPatients.place} ({selectedCampaignForPatients.municipality}, {selectedCampaignForPatients.state})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedCampaignForPatients.title} | {selectedCampaignForPatients.date}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsPatientsModalOpen(false);
                    setSelectedCampaignForPatients(null);
                  }}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex-1">
                {(() => {
                  const patients = foliosList.filter(f => f.dayTrip === selectedCampaignForPatients.uuid);
                  if (patients.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-white/10 rounded-2xl">
                        No hay pacientes registrados para esta jornada aún.
                      </div>
                    );
                  }
                  return (
                    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                              <th className="p-4">Folio</th>
                              <th className="p-4">Paciente</th>
                              <th className="p-4">Correo</th>
                              <th className="p-4">Celular</th>
                              <th className="p-4 text-center">Pacientes</th>
                              <th className="p-4 text-center">Estado</th>
                              <th className="p-4 text-center">Eliminar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patients.map((folio) => (
                              <tr key={folio.id} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                                <td className="p-4">
                                  <span className="font-mono text-base font-black text-[#4ade80] tracking-wider select-all">
                                    {folio.code || folio.id}
                                  </span>
                                </td>
                                <td className="p-4 font-semibold text-white">{folio.name}</td>
                                <td className="p-4 text-xs text-slate-400">{folio.email}</td>
                                <td className="p-4 text-xs text-slate-400">{folio.cellphone}</td>
                                <td className="p-4 text-center text-xs text-slate-400 font-bold">{folio.numberOfPatients || 1}</td>
                                <td className="p-4 text-center">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    folio.active 
                                      ? "bg-[#006828]/20 text-[#4ade80]" 
                                      : "bg-white/5 text-slate-500"
                                  }`}>
                                    {folio.active ? "Activo" : "Completado"}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => handleDeleteFolio(folio.code || folio.id)}
                                    className="p-1.5 bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title="Eliminar cita permanentemente"
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="p-6 md:p-8 bg-white/2 border-t border-white/5 shrink-0 flex justify-between items-center text-xs font-semibold text-slate-400">
                <div>
                  Total Pases / Registros: <span className="text-white font-bold">{foliosList.filter(f => f.dayTrip === selectedCampaignForPatients.uuid).length}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPatientsModalOpen(false);
                    setSelectedCampaignForPatients(null);
                  }}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold transition-all border border-white/10 text-sm"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
