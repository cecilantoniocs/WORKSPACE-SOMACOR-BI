export interface CentroCosto {
  codigo: string;
  nombre: string;
}

export interface Empleado {
  rut: string;
  nombre: string;
  cargo: string;
  centrosCosto: CentroCosto[];
}

export type TipoUsuario = 'supervisor' | 'adc' | 'jefatura' | 'gerencia' | 'admin';

export type TipoRegistro = 'horas_extras' | 'bono';

export type EstadoRegistro = 'pendiente' | 'validado' | 'rechazado';

export interface RegistroHE {
  id: string;
  tipo: 'horas_extras';
  rutEmpleado: string;
  nombreEmpleado: string;
  cargo: string;
  codigoCc: string;
  nombreCc: string;
  cantidadHe: number;
  motivo: string;
  fecha: string;
  estado: EstadoRegistro;
  registradoPor: string;
  nombreRegistrador: string;
  fechaRegistro: string;
  validadoPor?: string;
  fechaValidacion?: string;
}

export interface RegistroBono {
  id: string;
  tipo: 'bono';
  rutEmpleado: string;
  nombreEmpleado: string;
  cargo: string;
  codigoCc: string;
  nombreCc: string;
  montoBono: number;
  motivo: string;
  fecha: string;
  estado: EstadoRegistro;
  registradoPor: string;
  nombreRegistrador: string;
  fechaRegistro: string;
  validadoPor?: string;
  fechaValidacion?: string;
}

export type Registro = RegistroHE | RegistroBono;
