import { HeartHandshake, Key } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Login = () => {
  const [searchParams] = useSearchParams();
  const loginError = searchParams.get("error");

  const errorMessages = {
    unauthorized: "Esta cuenta no está autorizada para acceder.",
    oauth_failed: "No se pudo completar el acceso con Google.",
    server_error: "Se produjo un error. Inténtalo de nuevo.",
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <div
      id="login_container"
      className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Cabecera */}
      <div className="sm:mx-auto w-full max-w-md">
        <div className="flex justify-center">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-md flex items-center justify-center text-white">
            <HeartHandshake className="h-10 w-10" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-800">
          Psicologia Con V
        </h2>

        <p className="mt-2 text-center text-sm text-slate-500">
          Portal Clínico de Alta Seguridad para Psicólogos
        </p>
      </div>

      {/* Tarjeta */}
      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-2xl sm:px-10">
          {errorMessages[loginError] && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessages[loginError]}
            </div>
          )}

          {/* botón de Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            Continuar con Google
          </button>
        </div>
      </div>

      {/* Aviso de seguridad */}
      <div className="sm:mx-auto w-full max-w-md mt-6 px-4">
        <div className="bg-slate-100/60 p-4 rounded-xl border border-slate-200/50 flex gap-3 text-[11px] text-slate-500">
          <Key className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />

          <div>
            <span className="font-semibold text-slate-700">
              Canal Seguro Local:
            </span>{" "}
            Para garantizar la privacidad (HIPAA / Ley de Derechos del
            Paciente), todos tus archivos cargados se encriptan con algoritmos
            locales en el navegador utilizando la clave que configures por
            archivo. Ningún tercero ni servidor central puede visualizar el
            contenido sin dicha contraseña de desbloqueo.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
