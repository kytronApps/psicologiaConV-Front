import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const validateSession = useCallback(async (jwt) => {
    if (!jwt) {
      setUser(null);
      setLoading(false);
      return false;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo validar la sesión");
      }

      setUser(data.user);
      return true;
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (jwt) => {
    setLoading(true);
    localStorage.setItem("token", jwt);
    setToken(jwt);

    const isValid = await validateSession(jwt);
    if (!isValid) {
      throw new Error("No se pudo iniciar la sesión");
    }
  };

  useEffect(() => {
    validateSession(localStorage.getItem("token"));
  }, [validateSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
