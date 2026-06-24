import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList } from 'lucide-react';
import { useStore } from '../store/useStore';

const modulos = [
  {
    to: '/registro-asistencia',
    icon: CalendarDays,
    title: 'Registro de Asistencia',
    desc: 'Registra la asistencia diaria de los trabajadores de cada centro de costo, mes a mes.',
    bg: 'bg-somacor-800 hover:bg-somacor-900',
  },
  {
    to: '/horas-extras',
    icon: ClipboardList,
    title: 'Horas Extras y Bonos',
    desc: 'Ingresa, consulta y valida las horas extras y bonos de los trabajadores.',
    bg: 'bg-brand-teal hover:bg-teal-700',
  },
];

export default function Inicio() {
  const usuarioActivo = useStore(s => s.usuarioActivo);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido/a, {usuarioActivo?.nombre.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">¿Qué módulo deseas usar hoy?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        {modulos.map(m => {
          const Icon = m.icon;
          return (
            <Link
              key={m.to}
              to={m.to}
              className={`${m.bg} text-white rounded-xl p-7 flex flex-col gap-3 transition-colors shadow-sm`}
            >
              <Icon className="w-10 h-10 opacity-90" />
              <div>
                <h2 className="text-xl font-bold">{m.title}</h2>
                <p className="text-sm opacity-80 mt-1 leading-relaxed">{m.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
