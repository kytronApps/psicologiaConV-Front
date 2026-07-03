import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { useEffect } from "react";

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);



const login = async (jwt) => {
  setLoading(true);
  localStorage.setItem("token", jwt);
  setToken(jwt);
  await validateSession(jwt);
};

 const logout = () => {
  localStorage.removeItem("token");
  setToken(null);
  setUser(null);
  setLoading(false);
};

  const validateSession = async (jwt = token) => {
    console.log("validateSession token:", jwt); // Muestra el token en la consola para depuración
    if (!jwt) {
      setLoading(false);
      return;
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
      console.log("validateSession data:", data); // Muestra la respuesta en la consola para depuración
      if (!response.ok) {
        throw new Error(data.error);
      }
      setUser(data);
    } catch (error) {
      console.error("validateSession error:", error.message); // Muestra el error en la consola para depuración
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateSession();
  }, []);

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
