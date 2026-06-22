import { Link } from 'react-router-dom';
import { ClipboardList, Search, CheckCircle, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';

const cards = [
  {
    to: '/registrar',
    icon: ClipboardList,
    title: 'Registrar',
    desc: 'Ingresa horas extras o bonos para los trabajadores de tu centro de costo.',
    color: 'bg-somacor-800 hover:bg-somacor-700',
    roles: ['supervisor', 'adc', 'jefatura', 'gerencia', 'admin'] as const,
  },
  {
    to: '/consultar',
    icon: Search,
    title: 'Consultar',
    desc: 'Revisa y filtra los registros ya ingresados. Puedes exportarlos a Excel.',
    color: 'bg-somacor-600 hover:bg-somacor-500',
    roles: ['supervisor', 'adc', 'jefatura', 'gerencia', 'admin'] as const,
  },
  {
    to: '/validar',
    icon: CheckCircle,
    title: 'Validar',
    desc: 'Aprueba o rechaza los registros pendientes de validación.',
    color: 'bg-teal-700 hover:bg-teal-600',
    roles: ['jefatura', 'gerencia', 'admin'] as const,
  },
  {
    to: '/admin',
    icon: Settings,
    title: 'Administrar',
    desc: 'Asigna centros de costo a supervisores y administradores de contrato.',
    color: 'bg-slate-700 hover:bg-slate-600',
    roles: ['admin'] as const,
  },
];

export default function Home() {
  const usuarioActivo = useStore(s => s.usuarioActivo);

  const visibles = cards.filter(c =>
    usuarioActivo && (c.roles as readonly string[]).includes(usuarioActivo.tipo)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido/a, {usuarioActivo?.nombre.split(' ')[0]}
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
              className={`${card.color} text-white rounded-xl p-6 flex flex-col gap-3 transition-colors shadow-sm`}
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
