import { useState, FormEvent } from 'react';
import { Lock, Mail, ShieldAlert, Key, Clipboard, HeartHandshake } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (email: string, name: string) => void;
}

export default function Login(props: LoginProps) {
  const [email, setEmail] = useState('psicologo.clinico@mentesana.cl');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor complete todos los datos requeridos');
      return;
    }

    setLoading(true);
    
    // Simulate minor delay for authentic auth look
    setTimeout(() => {
      setLoading(false);
      if (email.trim() === 'psicologo.clinico@mentesana.cl' && password === 'password123') {
        props.onLoginSuccess(email, 'Dr. Alejandro Ruiz S.');
      } else if (password === 'demo' || email === 'demo') {
        props.onLoginSuccess('demo@mentesana.cl', 'Dr. Alejandro Ruiz S. (Demo Mode)');
      } else {
        setError('Credenciales incorrectas. Pruebe "psicologo.clinico@mentesana.cl" y "password123" o use Acceso Demo.');
      }
    }, 600);
  };

  const handleDemoAccess = () => {
    setEmail('psicologo.clinico@mentesana.cl');
    setPassword('password123');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      props.onLoginSuccess('psicologo.clinico@mentesana.cl', 'Dr. Alejandro Ruiz S.');
    }, 400);
  };

  return (
    <div id="login_container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto w-full max-w-md">
        <div className="flex justify-center">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-md flex items-center justify-center text-white">
            <HeartHandshake className="h-10 w-10" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-800">
          PsycheCabinet
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Portal Clínico de Alta Seguridad para Psicólogos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email_address" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Correo Electrónico Profesional
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email_address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                  placeholder="psicologo@correo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pass" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Contraseña Administrativa
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-xs text-slate-500">
                  Recordar sesión en esta estación
                </label>
              </div>
            </div>

            <div>
              <button
                id="btn_submit_login"
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                {loading ? 'Accediendo...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400">¿Deseas probar la interfaz?</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                id="btn_demo_login"
                type="button"
                onClick={handleDemoAccess}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-dashed border-emerald-300 rounded-xl bg-emerald-50/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold transition-all shadow-sm"
              >
                <Clipboard className="h-4 w-4" /> Activar Acceso de Demo Rápido
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security notice banner */}
      <div className="sm:mx-auto w-full max-w-md mt-6 px-4">
        <div className="bg-slate-100/60 p-4 rounded-xl border border-slate-200/50 flex gap-3 text-[11px] text-slate-500">
          <Key className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-700">Canal Seguro Local:</span> Para garantizar la privacidad (HIPAA / Ley de Derechos del Paciente), todos tus archivos cargados se encriptan con algoritmos locales en el navegador utilizando la clave que configures por archivo. Ningún tercero ni servidor central puede visualizar el contenido sin dicha contraseña de desbloqueo.
          </div>
        </div>
      </div>
    </div>
  );
}
