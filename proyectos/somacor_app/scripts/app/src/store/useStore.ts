import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Registro } from '../types';

export type TipoUsuario = 'supervisor' | 'adc' | 'jefatura' | 'gerencia' | 'admin';

export interface UsuarioApp {
  id: string;
  rut?: string;
  nombre: string;
  cargo: string;
  email: string;
  tipo: TipoUsuario;
  verTodosLosCc: boolean;
  centrosCosto: string[];
  activo: boolean;
  fromExcel: boolean;
}

const ADMINS_FIJOS: UsuarioApp[] = [
  {
    id: 'admin-1', nombre: 'Administrador 1', cargo: 'Administrador Sistema',
    email: 'admin@somacor.cl', tipo: 'admin', verTodosLosCc: true,
    centrosCosto: [], activo: true, fromExcel: false,
  },
  {
    id: 'admin-2', nombre: 'Administrador 2', cargo: 'Administrador Sistema',
    email: 'admin2@somacor.cl', tipo: 'admin', verTodosLosCc: true,
    centrosCosto: [], activo: true, fromExcel: false,
  },
];

const USUARIOS_DEMO: UsuarioApp[] = [
  {
    id: 'demo-supervisor', nombre: 'Supervisor Demo', cargo: 'Supervisor de Seguridad',
    email: 'supervisor@somacor.cl', tipo: 'supervisor', verTodosLosCc: false,
    centrosCosto: ['002', '857', '855'], activo: true, fromExcel: false,
  },
  {
    id: 'demo-adc', nombre: 'ADC Demo', cargo: 'Administrador de Contrato',
    email: 'adc@somacor.cl', tipo: 'adc', verTodosLosCc: false,
    centrosCosto: ['868', '892', '029'], activo: true, fromExcel: false,
  },
  {
    id: 'demo-jefatura', nombre: 'Jefatura Demo', cargo: 'Jefe de Operaciones',
    email: 'jefatura@somacor.cl', tipo: 'jefatura', verTodosLosCc: true,
    centrosCosto: [], activo: true, fromExcel: false,
  },
];

const ADMIN_PASSWORD = '123456';
const passwords: Record<string, string> = {
  'admin-1': ADMIN_PASSWORD,
  'admin-2': ADMIN_PASSWORD,
  'demo-supervisor': ADMIN_PASSWORD,
  'demo-adc': ADMIN_PASSWORD,
  'demo-jefatura': ADMIN_PASSWORD,
};

interface StoreState {
  usuarioActivo: UsuarioApp | null;
  registros: Registro[];
  usuarios: UsuarioApp[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addRegistros: (registros: Registro[]) => void;
  deleteRegistros: (ids: string[]) => void;
  validarRegistros: (ids: string[], estado: 'validado' | 'rechazado') => void;
  guardarUsuario: (usuario: UsuarioApp) => void;
  eliminarUsuario: (id: string) => void;
  setPassword: (id: string, password: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      usuarioActivo: null,
      registros: [],
      usuarios: [],

      login: (email, password) => {
        const emailLower = email.toLowerCase().trim();

        const adminFijo = ADMINS_FIJOS.find(a => a.email.toLowerCase() === emailLower);
        if (adminFijo) {
          if (passwords[adminFijo.id] === password) {
            set({ usuarioActivo: adminFijo });
            return true;
          }
          return false;
        }

        const demo = USUARIOS_DEMO.find(u => u.email.toLowerCase() === emailLower);
        if (demo) {
          const yaConfigurado = get().usuarios.some(u => u.email.toLowerCase() === emailLower);
          if (!yaConfigurado && passwords[demo.id] === password) {
            set({ usuarioActivo: demo });
            return true;
          }
        }

        const usuario = get().usuarios.find(u => u.email.toLowerCase() === emailLower && u.activo);
        if (!usuario) return false;
        const pwd = passwords[usuario.id];
        if (!pwd || pwd !== password) return false;
        set({ usuarioActivo: usuario });
        return true;
      },

      logout: () => set({ usuarioActivo: null }),

      addRegistros: (nuevos) =>
        set(state => ({ registros: [...state.registros, ...nuevos] })),

      deleteRegistros: (ids) =>
        set(state => ({ registros: state.registros.filter(r => !ids.includes(r.id)) })),

      validarRegistros: (ids, estado) => {
        const { usuarioActivo } = get();
        const ahora = new Date().toISOString();
        set(state => ({
          registros: state.registros.map(r =>
            ids.includes(r.id)
              ? { ...r, estado, validadoPor: usuarioActivo?.email, fechaValidacion: ahora }
              : r
          ),
        }));
      },

      guardarUsuario: (usuario) =>
        set(state => {
          const existe = state.usuarios.find(u => u.id === usuario.id);
          if (existe) return { usuarios: state.usuarios.map(u => u.id === usuario.id ? usuario : u) };
          return { usuarios: [...state.usuarios, usuario] };
        }),

      eliminarUsuario: (id) =>
        set(state => ({ usuarios: state.usuarios.filter(u => u.id !== id) })),

      setPassword: (id, password) => { passwords[id] = password; },
    }),
    {
      name: 'somacor-store-v2',
      partialize: state => ({ registros: state.registros, usuarios: state.usuarios }),
    }
  )
);

export const setPasswordExterno = (id: string, password: string) => { passwords[id] = password; };
