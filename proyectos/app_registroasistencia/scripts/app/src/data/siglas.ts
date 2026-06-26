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

// Color de fondo (bg) y de texto (text) de cada sigla, para leer rápido la grilla.
// Colores definidos por SOMACOR. El color de texto se elige para que se lea bien
// sobre el fondo (oscuro sobre amarillo, blanco sobre los demás).
export const SIGLA_COLOR: Record<string, { bg: string; text: string }> = {
  TG:   { bg: '#00a651', text: '#ffffff' },
  TO:   { bg: '#00a651', text: '#ffffff' },
  HA:   { bg: '#00a651', text: '#ffffff' },
  T4X3: { bg: '#00a651', text: '#ffffff' },
  DESC: { bg: '#7f7f7f', text: '#ffffff' },
  PSGS: { bg: '#7f7f7f', text: '#ffffff' },
  VAC:  { bg: '#ff9900', text: '#ffffff' },
  LIC:  { bg: '#ffff00', text: '#333333' },
  PCGS: { bg: '#ffff00', text: '#333333' },
  F:    { bg: '#ff0000', text: '#ffffff' },
  DESV: { bg: '#ffffff', text: '#ff0000' },
  NI:   { bg: '#333333', text: '#ffffff' },
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
