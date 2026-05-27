"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { 
  collection, 
  getDocs, 
  getDoc,
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
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
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
  userProfile: any | null;
  updateUserProfile: (name: string, lastname: string) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
      } else if (!ADMIN_EMAILS.includes(user.email || "")) {
        setAccessDenied(true);
        setLoading(false);
      } else {
        setCurrentUser(user);
        await loadUserProfile(user.uid, user.email || "");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [router]);

  const loadUserProfile = async (uid: string, email: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        setUserProfile({
          id: uid,
          name: "Usuario",
          lastname: "",
          email: email,
          userRole: "normal"
        });
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  };

  const updateUserProfile = async (name: string, lastname: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const docRef = doc(db, "users", currentUser.uid);
      await setDoc(docRef, {
        name,
        lastname
      }, { merge: true });

      setUserProfile((prev: any) => ({
        ...prev,
        name,
        lastname
      }));

      toast.success("¡Perfil actualizado con éxito!");
      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Error al actualizar el perfil.");
      return false;
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

    let placeObj = null;
    try {
      const placeDoc = await getDoc(doc(db, "contacts", form.selectedPlaceId));
      if (placeDoc.exists()) {
        placeObj = { id: placeDoc.id, ...placeDoc.data() } as any;
      }
    } catch (err) {
      console.error("Error fetching contact for campaign:", err);
    }

    if (!placeObj) {
      toast.error("Lugar no válido.");
      return false;
    }

    let scheduleObj = null;
    try {
      if (form.selectedScheduleId) {
        const scheduleDoc = await getDoc(doc(db, "schedules", form.selectedScheduleId));
        if (scheduleDoc.exists()) {
          scheduleObj = { id: scheduleDoc.id, ...scheduleDoc.data() } as any;
        }
      }
    } catch (err) {
      console.error("Error fetching schedule for campaign:", err);
    }

    const startInfo = parseDateFields(form.startDateStr);
    const endInfo = parseDateFields(form.endDateStr);

    let campaignStatus = "active";
    if (isEdit) {
      try {
        const campDoc = await getDoc(doc(db, "dayTrip", campaignId));
        if (campDoc.exists()) {
          campaignStatus = campDoc.data().status || "active";
        }
      } catch (err) {
        console.error("Error fetching campaign for status:", err);
      }
    }

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
      status: campaignStatus,
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
      triggerRefresh();
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
      triggerRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar estado.");
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await deleteDoc(doc(db, "dayTrip", campaignId));
      toast.success("Campaña eliminada.");
      triggerRefresh();
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
      triggerRefresh();
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar contacto.");
      return false;
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteDoc(doc(db, "contacts", id));
      toast.success("Contacto eliminado.");
      triggerRefresh();
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
      triggerRefresh();
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar estado.");
      return false;
    }
  };

  const handleDeleteState = async (id: string) => {
    try {
      await deleteDoc(doc(db, "states", id));
      toast.success("Estado eliminado.");
      triggerRefresh();
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
      triggerRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar folio.");
    }
  };

  const handleDeleteFolio = async (folioCode: string) => {
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
      triggerRefresh();
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
        selectedYear,
        setSelectedYear,
        refreshTrigger,
        triggerRefresh,
        handleLogout,
        handleCampaignSubmit,
        handleToggleCampaignStatus,
        handleDeleteCampaign,
        handleContactSubmit,
        handleDeleteContact,
        handleStateSubmit,
        handleDeleteState,
        handleToggleFolioActive,
        handleDeleteFolio,
        userProfile,
        updateUserProfile
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
