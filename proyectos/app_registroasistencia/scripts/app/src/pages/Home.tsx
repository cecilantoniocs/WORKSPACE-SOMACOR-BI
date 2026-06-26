import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Search, CheckCircle, Settings, ChevronLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

const cards = [
  {
    to: '/registrar',
    icon: ClipboardList,
    title: 'Registrar',
    desc: 'Ingresa horas extras o bonos para los trabajadores de tu centro de costo.',
    bg: 'bg-somacor-800 hover:bg-somacor-900',
    roles: ['supervisor', 'adc', 'jefatura', 'gerencia', 'admin'] as const,
  },
  {
    to: '/consultar',
    icon: Search,
    title: 'Consultar',
    desc: 'Revisa y filtra los registros ya ingresados. Puedes exportarlos a Excel.',
    bg: 'bg-brand-teal hover:bg-teal-700',
    roles: ['supervisor', 'adc', 'jefatura', 'gerencia', 'admin'] as const,
  },
  {
    to: '/validar',
    icon: CheckCircle,
    title: 'Validar',
    desc: 'Aprueba o rechaza los registros pendientes de validación.',
    bg: 'bg-brand-orange hover:bg-orange-700',
    roles: ['jefatura', 'gerencia', 'admin'] as const,
  },
  {
    to: '/admin',
    icon: Settings,
    title: 'Administrar',
    desc: 'Asigna centros de costo a supervisores y administradores de contrato.',
    bg: 'bg-somacor-900 hover:bg-somacor-900/80',
    roles: ['admin'] as const,
  },
];

export default function Home() {
  const usuarioActivo = useStore(s => s.usuarioActivo);
  const navigate = useNavigate();

  const visibles = cards.filter(c =>
    usuarioActivo && (c.roles as readonly string[]).includes(usuarioActivo.tipo)
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600" title="Volver al inicio">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-400">Inicio / Horas Extras y Bonos</span>
      </div>
      <div className="mb-6 ml-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Horas Extras y Bonos
        </h1>
        <p className="text-gray-500 mt-1">¿Qué deseas hacer hoy?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibles.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              to={card.to}
              className={`${card.bg} text-white rounded-xl p-6 flex flex-col gap-3 transition-colors shadow-sm`}
            >
              <Icon className="w-8 h-8 opacity-90" />
              <div>
                <h2 className="text-lg font-bold">{card.title}</h2>
                <p className="text-sm opacity-80 mt-1 leading-relaxed">{card.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
