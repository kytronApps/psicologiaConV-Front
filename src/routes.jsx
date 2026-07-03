import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Auth2FA from "./components/login/Auth2FA";
import useAuth from "./context/useAuth";
import Patients from "./components/selectOptions/Patiens";
import Calendar from "./components/selectOptions/Calendar";
import Consents from "./components/selectOptions/Consents";

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
        {/* Protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <Patients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/consents"
          element={
            <ProtectedRoute>
              <Consents />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
