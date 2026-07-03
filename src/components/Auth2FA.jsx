import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../context/useAuth";

const Auth2FA = () => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const mode = searchParams.get("mode");

  const isSetup = mode === "setup";

  const navigate = useNavigate();
  const { login } = useAuth();

  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!isSetup || !token) return;

    const loadQr = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/setup-totp?token=${token}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setQrCode(data.qr_code);
      } catch (error) {
        console.error(error);
      }
    };

    loadQr();
  }, [isSetup, token]);

  const verifyCode = async (value) => {
    try {
      setLoading(true);

      const endpoint = isSetup
        ? "/api/auth/verify-totp-setup"
        : "/api/auth/verify-2fa";

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            code: value,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      await login(data.token);

      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    setCode(value);

    if (value.length === 6) {
      verifyCode(value);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-10">
      <h1 className="text-2xl font-bold">
        {isSetup
          ? "Configurar doble factor"
          : "Verificación en dos pasos"}
      </h1>

      {isSetup && qrCode && (
        <img
          src={qrCode}
          alt="Código QR"
          className="w-64 h-64"
        />
      )}

      <p className="text-center text-gray-500 max-w-md">
        {isSetup
          ? "Escanea el código QR con Google Authenticator y escribe el código de 6 dígitos para finalizar la configuración."
          : "Introduce el código de 6 dígitos generado por Google Authenticator para acceder a tu cuenta."}
      </p>

      <input
        type="text"
        value={code}
        onChange={handleCodeChange}
        maxLength={6}
        disabled={loading}
        placeholder="000000"
        className="border rounded-lg px-4 py-2 w-64 text-center tracking-[0.5em] text-lg"
      />
    </div>
  );
};

export default Auth2FA;