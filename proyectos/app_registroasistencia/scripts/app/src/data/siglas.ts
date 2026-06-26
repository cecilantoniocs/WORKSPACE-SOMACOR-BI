import type { Sigla } from '../types';

// Las 12 siglas oficiales de la hoja "Siglas Asistencia" del Excel.
// Lista fija por ahora (ver PLAN-registro-asistencia.md §8).
export const SIGLAS: Sigla[] = [
  { sigla: 'TG', nombre: 'Turno Guardia' },
  { sigla: 'TO', nombre: 'Turno Operario' },
  { sigla: 'HA', nombre: 'Horario Administrativo' },
  { sigla: 'T4X3', nombre: 'Turno 4x3' },
  { sigla: 'DESC', nombre: 'Descanso' },
  { sigla: 'VAC', nombre: 'Vacaciones' },
  { sigla: 'LIC', nombre: 'Licencia' },
  { sigla: 'F', nombre: 'Falta' },
  { sigla: 'PCGS', nombre: 'Permiso con Goce de Sueldo' },
  { sigla: 'PSGS', nombre: 'Permiso sin Goce de Sueldo' },
  { sigla: 'DESV', nombre: 'Desvinculado' },
  { sigla: 'NI', nombre: 'Nuevo Ingreso' },
];

// Color de fondo de la celda según la sigla, para leer rápido la grilla.
// (clases de Tailwind)
export const SIGLA_COLOR: Record<string, string> = {
  TG:   'bg-somacor-100 text-somacor-900',
  TO:   'bg-blue-100 text-blue-800',
  HA:   'bg-indigo-100 text-indigo-800',
  T4X3: 'bg-cyan-100 text-cyan-800',
  DESC: 'bg-gray-100 text-gray-500',
  VAC:  'bg-teal-100 text-teal-800',
  LIC:  'bg-amber-100 text-amber-800',
  F:    'bg-red-100 text-red-700',
  PCGS: 'bg-green-100 text-green-800',
  PSGS: 'bg-orange-100 text-orange-800',
  DESV: 'bg-rose-200 text-rose-800',
  NI:   'bg-lime-100 text-lime-800',
};

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Abreviatura del día de la semana (0 = domingo), como en el Excel.
export const DIAS_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

// Clave única de un registro de asistencia: CC + año + mes (mes con 2 dígitos).
export function claveAsistencia(codigoCc: string, anio: number, mes: number): string {
  return `${codigoCc}-${anio}-${String(mes).padStart(2, '0')}`;
}
