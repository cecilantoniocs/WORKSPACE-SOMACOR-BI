import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/');
    } else {
      setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-somacor-900 via-somacor-800 to-somacor-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">SOMACOR</h1>
          <p className="text-somacor-200 mt-1">Registro de Horas Extras y Bonos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu.correo@somacor.cl"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-500 font-medium mb-3">Credenciales de prueba (clave: 123456)</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="bg-gray-50 rounded p-2">
                <span className="font-semibold block">Admin</span>
                admin@somacor.cl
              </div>
              <div className="bg-gray-50 rounded p-2">
                <span className="font-semibold block">Supervisor</span>
                supervisor@somacor.cl
              </div>
              <div className="bg-gray-50 rounded p-2">
                <span className="font-semibold block">ADC</span>
                adc@somacor.cl
              </div>
              <div className="bg-gray-50 rounded p-2">
                <span className="font-semibold block">Jefatura</span>
                jefatura@somacor.cl
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
