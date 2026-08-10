import { useEffect, useState } from "react";
import ClinicalDataContext from "./ClinicalDataContext";
import useAuth from "./useAuth";

const STORAGE_KEY = "psicologia_con_v_clinical_v2";
const DEFAULT_AVAILABILITY = { days: [1, 2, 3, 4, 5], start: "09:00", end: "17:00" };

function getInitialData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, availability: parsed.availability || DEFAULT_AVAILABILITY };
    }
  } catch {
    // Si los datos locales no son válidos, comenzamos con una ficha limpia.
  }

  return {
    patients: [],
    files: {},
    appointments: [],
    availability: DEFAULT_AVAILABILITY,
  };
}

export default function ClinicalDataProvider({ children }) {
  const { token, user } = useAuth();
  const [data, setData] = useState(getInitialData);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token || !user) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${apiUrl}/api/appointments`, { headers }),
      fetch(`${apiUrl}/api/availability`, { headers }),
    ])
      .then(async ([appointmentsResponse, availabilityResponse]) => {
        if (!appointmentsResponse.ok || !availabilityResponse.ok) return;
        const appointments = await appointmentsResponse.json();
        const { availability } = await availabilityResponse.json();
        setData((current) => ({ ...current, appointments, availability }));
      })
      .catch(() => {});
  }, [apiUrl, token, user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addPatient = (patient) => {
    setData((current) => ({
      ...current,
      patients: [...current.patients, patient],
      files: { ...current.files, [patient.id]: [] },
    }));
  };

  const addFile = (patientId, file) => {
    setData((current) => ({
      ...current,
      files: {
        ...current.files,
        [patientId]: [...(current.files[patientId] || []), file],
      },
    }));
  };

  const updateFile = (patientId, fileId, changes) => {
    setData((current) => ({
      ...current,
      files: {
        ...current.files,
        [patientId]: (current.files[patientId] || []).map((file) =>
          file.id === fileId ? { ...file, ...changes } : file,
        ),
      },
    }));
  };

  const deleteFile = (patientId, fileId) => {
    setData((current) => ({
      ...current,
      files: {
        ...current.files,
        [patientId]: (current.files[patientId] || []).filter(
          (file) => file.id !== fileId,
        ),
      },
    }));
  };

  const addAppointment = async (appointment) => {
    if (token) {
      const response = await fetch(`${apiUrl}/api/appointments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });
      if (!response.ok) throw new Error((await response.json()).error || "No se pudo crear la cita");
      appointment = await response.json();
    }
    setData((current) => ({
      ...current,
      appointments: [...current.appointments, appointment],
    }));
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    if (token) {
      const response = await fetch(`${apiUrl}/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("No se pudo actualizar la cita");
    }
    setData((current) => ({
      ...current,
      appointments: current.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status,
              archivedAt:
                status === "completed" ? new Date().toISOString() : null,
            }
          : appointment,
      ),
    }));
  };

  const updateAppointment = async (appointmentId, changes) => {
    if (token) {
      const response = await fetch(`${apiUrl}/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!response.ok) throw new Error((await response.json()).error || "No se pudo actualizar la cita");
    }
    setData((current) => ({
      ...current,
      appointments: current.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, ...changes }
          : appointment,
      ),
    }));
  };

  const deleteAppointment = async (appointmentId) => {
    if (token) {
      const response = await fetch(`${apiUrl}/api/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("No se pudo eliminar la cita");
    }
    setData((current) => ({
      ...current,
      appointments: current.appointments.filter(
        (appointment) => appointment.id !== appointmentId,
      ),
    }));
  };

  const updateAvailability = async (availability) => {
    setData((current) => ({ ...current, availability }));
    if (token) {
      await fetch(`${apiUrl}/api/availability`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(availability),
      });
    }
  };

  const getSharePath = async (appointmentId) => {
    const response = await fetch(`${apiUrl}/api/appointments/${appointmentId}/share`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("No se pudo crear el enlace");
    return (await response.json()).path;
  };

  return (
    <ClinicalDataContext.Provider
      value={{
        ...data,
        addPatient,
        addFile,
        updateFile,
        deleteFile,
        addAppointment,
        updateAppointmentStatus,
        updateAppointment,
        deleteAppointment,
        updateAvailability,
        getSharePath,
      }}
    >
      {children}
    </ClinicalDataContext.Provider>
  );
}
