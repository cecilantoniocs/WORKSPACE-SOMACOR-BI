import { LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const TIPO_LABEL: Record<string, string> = {
  supervisor: 'Supervisor',
  adc: 'Adm. Contrato',
  jefatura: 'Jefatura',
  gerencia: 'Gerencia',
  admin: 'Administrador',
};

export default function Header() {
  const usuarioActivo = useStore(s => s.usuarioActivo);
  const logout = useStore(s => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-somacor-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-somacor-300" />
          <span className="text-xl font-bold tracking-tight">SOMACOR</span>
          <span className="hidden sm:block text-somacor-300 text-sm ml-1">Horas Extras y Bonos</span>
        </div>

        {usuarioActivo && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">{usuarioActivo.nombre}</p>
              <p className="text-xs text-somacor-300">{TIPO_LABEL[usuarioActivo.tipo]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-somacor-700 hover:bg-somacor-600 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
