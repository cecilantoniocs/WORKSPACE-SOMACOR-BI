import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const TIPO_LABEL: Record<string, string> = {
  supervisor: 'Supervisor',
  adc: 'Adm. Contrato',
  jefatura: 'Jefatura',
  gerencia: 'Gerencia',
  admin: 'Administrador',
};

function LogoMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <rect width="60" height="60" rx="6" fill="white" fillOpacity="0.15" />
      <circle cx="30" cy="30" r="17" stroke="white" strokeWidth="6" fill="none" />
      <circle cx="30" cy="30" r="6" fill="white" fillOpacity="0.5" />
    </svg>
  );
}

export default function Header() {
  const usuarioActivo = useStore(s => s.usuarioActivo);
  const logout = useStore(s => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-somacor-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <span className="text-xl font-extrabold tracking-widest">SOMACOR</span>
              <span className="hidden sm:block text-xs text-somacor-300 tracking-wider -mt-0.5">
                SERVICIOS INTEGRALES
              </span>
            </div>
            <span className="hidden md:block text-somacor-400 text-sm ml-2 border-l border-somacor-600 pl-3">
              Horas Extras y Bonos
            </span>
          </div>

          {usuarioActivo && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-tight">{usuarioActivo.nombre}</p>
                <p className="text-xs text-somacor-300">{TIPO_LABEL[usuarioActivo.tipo]}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-somacor-900 hover:bg-somacor-900/80 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Barra de colores del logo */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(to right, #df0847, #e45021, #17a6a4, #0cc0df)' }}
      />
    </>
  );
}
