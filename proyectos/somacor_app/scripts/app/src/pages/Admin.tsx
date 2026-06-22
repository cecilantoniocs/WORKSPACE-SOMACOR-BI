import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Check, Plus, Trash2 } from 'lucide-react';
import { useStore, type UsuarioApp, type TipoUsuario } from '../store/useStore';
import { setPasswordExterno } from '../store/useStore';
import supervisoresJson from '../data/supervisores.json';
import dataJson from '../data/somacor-data.json';
import type { CentroCosto } from '../types';

interface SupervisorData { rut: string; nombre: string; cargo: string; tipo: 'supervisor' | 'adc'; }
const supervisoresData = supervisoresJson as SupervisorData[];
const centrosCostoData = (dataJson as { centrosCosto: CentroCosto[] }).centrosCosto;

interface ModalExternoProps {
  onClose: () => void;
  onGuardar: (u: UsuarioApp) => void;
}

function ModalExterno({ onClose, onGuardar }: ModalExternoProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState<TipoUsuario>('jefatura');
  const [password, setPassword] = useState('');

  const handleGuardar = () => {
    if (!nombre.trim() || !email.trim() || !password) return;
    const u: UsuarioApp = {
      id: `ext-${Date.now()}`,
      nombre: nombre.trim(),
      cargo: tipo === 'jefatura' ? 'Jefe de Operaciones' : 'Gerente',
      email: email.trim().toLowerCase(),
      tipo,
      verTodosLosCc: true,
      centrosCosto: [],
      activo: true,
      fromExcel: false,
    };
    onGuardar(u);
    setPasswordExterno(u.id, password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar usuario externo</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Nombre completo</label>
            <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre Apellido" />
          </div>
          <div>
            <label className="label">Correo electrónico</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@somacor.cl" />
          </div>
          <div>
            <label className="label">Rol</label>
            <select className="input" value={tipo} onChange={e => setTipo(e.target.value as TipoUsuario)}>
              <option value="jefatura">Jefatura</option>
              <option value="gerencia">Gerencia</option>
            </select>
          </div>
          <div>
            <label className="label">Contraseña inicial</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary flex-1"
            disabled={!nombre.trim() || !email.trim() || password.length < 6}
            onClick={handleGuardar}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditorUsuarioProps {
  persona: SupervisorData;
  usuario: UsuarioApp | null;
  onGuardar: (u: UsuarioApp, password?: string) => void;
}

function EditorUsuario({ persona, usuario, onGuardar }: EditorUsuarioProps) {
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [password, setPassword] = useState('');
  const [verTodos, setVerTodos] = useState(usuario?.verTodosLosCc ?? false);
  const [ccsSel, setCcsSel] = useState<string[]>(usuario?.centrosCosto ?? []);
  const [busquedaCc, setBusquedaCc] = useState('');

  const ccsFiltrados = useMemo(() => {
    const q = busquedaCc.toLowerCase();
    return q
      ? centrosCostoData.filter(cc => cc.nombre.toLowerCase().includes(q) || cc.codigo.includes(q))
      : centrosCostoData;
  }, [busquedaCc]);

  const toggleCc = (codigo: string) =>
    setCcsSel(prev => prev.includes(codigo) ? prev.filter(c => c !== codigo) : [...prev, codigo]);

  const handleGuardar = () => {
    if (!email.trim()) return;
    const u: UsuarioApp = {
      id: usuario?.id ?? `excel-${persona.rut}`,
      rut: persona.rut,
      nombre: persona.nombre,
      cargo: persona.cargo,
      email: email.trim().toLowerCase(),
      tipo: persona.tipo,
      verTodosLosCc: verTodos,
      centrosCosto: verTodos ? [] : ccsSel,
      activo: true,
      fromExcel: true,
    };
    onGuardar(u, password || undefined);
  };

  return (
    <div className="space-y-4">
      <div className="bg-somacor-50 rounded-lg p-4">
        <p className="font-semibold text-gray-900">{persona.nombre}</p>
        <p className="text-sm text-gray-500">{persona.cargo}</p>
        <p className="text-xs text-gray-400 font-mono mt-1">{persona.rut}</p>
      </div>

      <div>
        <label className="label">Correo electrónico</label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="correo@somacor.cl"
        />
      </div>

      <div>
        <label className="label">Contraseña {usuario ? '(dejar vacío para no cambiar)' : ''}</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Nueva contraseña"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="ver-todos"
          checked={verTodos}
          onChange={e => setVerTodos(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="ver-todos" className="text-sm text-gray-700 cursor-pointer">
          Ver todos los centros de costo
        </label>
      </div>

      {!verTodos && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Centros de costo asignados</label>
            <span className="text-xs text-somacor-600 font-medium">{ccsSel.length} seleccionado(s)</span>
          </div>
          <input
            className="input mb-2"
            placeholder="Buscar CC..."
            value={busquedaCc}
            onChange={e => setBusquedaCc(e.target.value)}
          />
          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto divide-y divide-gray-50">
            {ccsFiltrados.map(cc => (
              <label
                key={cc.codigo}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 ${ccsSel.includes(cc.codigo) ? 'bg-somacor-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={ccsSel.includes(cc.codigo)}
                  onChange={() => toggleCc(cc.codigo)}
                  className="w-4 h-4 text-somacor-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">{cc.nombre}</span>
                  <span className="text-xs text-gray-400 ml-2">{cc.codigo}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn-primary w-full"
        disabled={!email.trim()}
        onClick={handleGuardar}
      >
        <Check className="w-4 h-4 inline mr-1" /> Guardar
      </button>
    </div>
  );
}

export default function Admin() {
  const { usuarios, guardarUsuario, eliminarUsuario, setPassword } = useStore();
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState('');
  const [personaSel, setPersonaSel] = useState<SupervisorData | null>(null);
  const [mostrarModalExterno, setMostrarModalExterno] = useState(false);

  const filteredSupervisores = useMemo(() => {
    const q = busqueda.toLowerCase();
    return supervisoresData.filter(p =>
      p.nombre.toLowerCase().includes(q) || p.cargo.toLowerCase().includes(q)
    );
  }, [busqueda]);

  const getUsuario = (rut: string) =>
    usuarios.find(u => u.rut === rut || u.id === `excel-${rut}`) ?? null;

  const handleGuardar = (u: UsuarioApp, password?: string) => {
    guardarUsuario(u);
    if (password) setPassword(u.id, password);
  };

  const handleGuardarExterno = (u: UsuarioApp) => {
    guardarUsuario(u);
    setMostrarModalExterno(false);
  };

  const usuariosExternos = usuarios.filter(u => !u.fromExcel && u.tipo !== 'admin');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Administrar Usuarios</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Supervisores y ADC</h2>
            <span className="text-xs text-gray-400">{supervisoresData.length} personas</span>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Buscar por nombre o cargo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {filteredSupervisores.map(p => {
              const u = getUsuario(p.rut);
              const configurado = !!u;
              return (
                <button
                  key={p.rut}
                  onClick={() => setPersonaSel(p)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${personaSel?.rut === p.rut ? 'bg-somacor-50 border border-somacor-200' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${configurado ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-400 truncate">{p.cargo}</p>
                  </div>
                  {configurado && (
                    <span className="ml-auto text-xs text-green-600 font-medium flex-shrink-0">
                      {u.verTodosLosCc ? 'Todos los CC' : `${u.centrosCosto.length} CC`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Usuarios externos (Jefatura / Gerencia)</p>
            {usuariosExternos.length === 0 && (
              <p className="text-xs text-gray-400 mb-2">Ninguno configurado</p>
            )}
            {usuariosExternos.map(u => (
              <div key={u.id} className="flex items-center justify-between py-1.5">
                <div>
                  <span className="text-sm text-gray-800">{u.nombre}</span>
                  <span className="text-xs text-gray-400 ml-2">{u.email}</span>
                </div>
                <button onClick={() => eliminarUsuario(u.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              className="btn-secondary text-sm py-1.5 mt-2 w-full"
              onClick={() => setMostrarModalExterno(true)}
            >
              <Plus className="w-4 h-4 inline mr-1" /> Usuario externo
            </button>
          </div>
        </div>

        <div className="card">
          {personaSel ? (
            <EditorUsuario
              key={personaSel.rut}
              persona={personaSel}
              usuario={getUsuario(personaSel.rut)}
              onGuardar={handleGuardar}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 bg-somacor-50 rounded-full flex items-center justify-center mb-3">
                <Search className="w-7 h-7 text-somacor-300" />
              </div>
              <p className="text-gray-400 text-sm">Selecciona una persona de la lista para configurarle los centros de costo y acceso.</p>
            </div>
          )}
        </div>
      </div>

      {mostrarModalExterno && (
        <ModalExterno
          onClose={() => setMostrarModalExterno(false)}
          onGuardar={handleGuardarExterno}
        />
      )}
    </div>
  );
}
