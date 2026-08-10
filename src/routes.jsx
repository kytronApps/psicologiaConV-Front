import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Auth2FA from "./components/login/Auth2FA";
import useAuth from "./context/useAuth";
import Patients from "./components/selectOptions/Patiens";
import Calendar from "./components/selectOptions/Calendar";
import Consents from "./components/selectOptions/Consents";
import AppLayout from "./components/layout/AppLayout";
import BookingPage from "./components/booking/BookingPage";
import ManageBookingPage from "./components/booking/ManageBookingPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Cargando sesión...</div>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/auth-2fa" element={<Auth2FA />} />
        <Route path="/reservar/:psychologistId" element={<BookingPage />} />
        <Route path="/cita/:token" element={<ManageBookingPage />} />
        {/* Protegidas */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/consents" element={<Consents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
