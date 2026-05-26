"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ADMIN_EMAILS = ["lx.garduno@gmail.com", "alosgar@gmail.com"];

// Types matching Firestore database
export type DayTrip = {
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

export type Contact = {
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

export type DBUser = {
  id: string;
  uid?: string;
  name: string;
  lastname?: string;
  email: string;
};

export type Schedule = {
  id: string;
  uuid?: string;
  name: string;
};

export type State = {
  id: string;
  uuid?: string;
  name: string;
  capital: string;
};

export type Folio = {
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

interface AdminContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  accessDenied: boolean;
  campaigns: DayTrip[];
  contacts: Contact[];
  dbUsers: DBUser[];
  schedules: Schedule[];
  statesList: State[];
  foliosList: Folio[];
  subscribersList: any[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  loadAllData: () => Promise<void>;
  handleLogout: () => Promise<void>;
  handleCampaignSubmit: (
    form: {
      title: string;
      author: string;
      selectedPlaceId: string;
      selectedScheduleId: string;
      picture: string;
      startDateStr: string;
      endDateStr: string;
    },
    isEdit: boolean,
    campaignId: string
  ) => Promise<boolean>;
  handleToggleCampaignStatus: (campaign: DayTrip) => Promise<void>;
  handleDeleteCampaign: (campaignId: string) => Promise<void>;
  handleContactSubmit: (
    form: {
      contactName: string;
      place: string;
      telephone: string;
      cellphone: string;
      schedule: string;
      maps: string;
      selectedState: string;
      selectedMunicipality: string;
      price: string;
      address: string;
      notes: string;
    },
    editingId: string
  ) => Promise<boolean>;
  handleDeleteContact: (id: string) => Promise<void>;
  handleStateSubmit: (
    form: {
      name: string;
      capital: string;
    },
    editingId: string
  ) => Promise<boolean>;
  handleDeleteState: (id: string) => Promise<void>;
  handleToggleFolioActive: (folio: Folio) => Promise<void>;
  handleDeleteFolio: (folioCode: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Data States
  const [campaigns, setCampaigns] = useState<DayTrip[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dbUsers, setDbUsers] = useState<DBUser[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [statesList, setStatesList] = useState<State[]>([]);
  const [foliosList, setFoliosList] = useState<Folio[]>([]);
  const [subscribersList, setSubscribersList] = useState<any[]>([]);

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
  const handleCampaignSubmit = async (
    form: {
      title: string;
      author: string;
      selectedPlaceId: string;
      selectedScheduleId: string;
      picture: string;
      startDateStr: string;
      endDateStr: string;
    },
    isEdit: boolean,
    campaignId: string
  ): Promise<boolean> => {
    if (!form.author || !form.selectedPlaceId || !form.startDateStr || !form.endDateStr) {
      toast.error("Por favor completa los campos requeridos.");
      return false;
    }

    const placeObj = contacts.find(c => c.id === form.selectedPlaceId);
    const scheduleObj = schedules.find(s => s.id === form.selectedScheduleId);
    
    if (!placeObj) {
      toast.error("Lugar no válido.");
      return false;
    }

    const startInfo = parseDateFields(form.startDateStr);
    const endInfo = parseDateFields(form.endDateStr);

    const docData = {
      title: form.title,
      author: form.author,
      place: placeObj.place || placeObj.contactName || "",
      address: placeObj.address || "",
      maps: placeObj.maps || "",
      municipality: placeObj.selectedMunicipality || "",
      state: placeObj.selectedState || "",
      time: scheduleObj?.name || "10:00 Hrs. a 18:00 Hrs.",
      picture: form.picture || "https://images.unsplash.com/photo-1518206075495-4e901709d372?auto=format&fit=crop&w=1350&q=80",
      status: isEdit ? campaigns.find(c => c.uuid === campaignId)?.status || "active" : "active",
      date: formatDateLabel(form.startDateStr),
      endDate: formatDateLabel(form.endDateStr),
      day: startInfo.day,
      month: startInfo.month,
      year: startInfo.year,
      endDay: endInfo.day,
      endMonth: endInfo.month,
      endYear: endInfo.year,
      allDays: [startInfo.day],
    };

    try {
      if (isEdit) {
        await setDoc(doc(db, "dayTrip", campaignId), {
          ...docData,
          uuid: campaignId
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
      await loadAllData();
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar la campaña.");
      return false;
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

  // DIRECTORY / CONTACTS HANDLERS
  const handleContactSubmit = async (
    form: {
      contactName: string;
      place: string;
      telephone: string;
      cellphone: string;
      schedule: string;
      maps: string;
      selectedState: string;
      selectedMunicipality: string;
      price: string;
      address: string;
      notes: string;
    },
    editingId: string
  ): Promise<boolean> => {
    if (!form.contactName || !form.place || !form.address) {
      toast.error("Por favor completa los campos mínimos.");
      return false;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, "contacts", editingId), {
          ...form,
          price: form.price || "249",
        });
        toast.success("¡Contacto actualizado!");
      } else {
        const newDocRef = doc(collection(db, "contacts"));
        await setDoc(newDocRef, {
          ...form,
          uuid: newDocRef.id,
          price: form.price || "249",
          selectedStateId: "",
          selectedMunicipalityId: "",
          createdAt: serverTimestamp()
        });
        toast.success("¡Contacto guardado en el directorio!");
      }
      await loadAllData();
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar contacto.");
      return false;
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
  const handleStateSubmit = async (
    form: {
      name: string;
      capital: string;
    },
    editingId: string
  ): Promise<boolean> => {
    if (!form.name || !form.capital) {
      toast.error("Completa Estado y Capital.");
      return false;
    }
    try {
      if (editingId) {
        await updateDoc(doc(db, "states", editingId), {
          name: form.name,
          capital: form.capital,
        });
        toast.success("Estado actualizado.");
      } else {
        const newDocRef = doc(collection(db, "states"));
        await setDoc(newDocRef, {
          name: form.name,
          capital: form.capital,
          uuid: newDocRef.id
        });
        toast.success("Estado registrado.");
      }
      await loadAllData();
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar estado.");
      return false;
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

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        loading,
        accessDenied,
        campaigns,
        contacts,
        dbUsers,
        schedules,
        statesList,
        foliosList,
        subscribersList,
        selectedYear,
        setSelectedYear,
        loadAllData,
        handleLogout,
        handleCampaignSubmit,
        handleToggleCampaignStatus,
        handleDeleteCampaign,
        handleContactSubmit,
        handleDeleteContact,
        handleStateSubmit,
        handleDeleteState,
        handleToggleFolioActive,
        handleDeleteFolio
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
