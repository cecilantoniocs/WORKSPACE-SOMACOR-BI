import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Registro, CentroCosto, Empleado, TipoRegistro } from '../types';
import dataJson from '../data/somacor-data.json';

interface SomacorData {
  centrosDeCosto: CentroCosto[];
  empleados: Empleado[];
}

const data = dataJson as SomacorData;

type Paso = 'cc' | 'seleccion' | 'confirmacion' | 'exito';

const PASOS = [
  { key: 'cc', label: 'Centro de costo' },
  { key: 'seleccion', label: 'Detalle Registro' },
  { key: 'confirmacion', label: 'Confirmación' },
] as const;

export default function Registrar() {
  const usuarioActivo = useStore(s => s.usuarioActivo);
  const addRegistros = useStore(s => s.addRegistros);
  const navigate = useNavigate();

  const [paso, setPaso] = useState<Paso>('cc');
  const [ccSeleccionado, setCcSeleccionado] = useState<CentroCosto | null>(null);
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<Empleado[]>([]);
  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistro>('horas_extras');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [cantidadHe, setCantidadHe] = useState<number>(1);
  const [montoBono, setMontoBono] = useState<number>(0);
  const [motivo, setMotivo] = useState('');
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('');

  const ccDisponibles = useMemo(() => {
    if (!usuarioActivo) return [];
    if (usuarioActivo.verTodosLosCc) return data.centrosDeCosto;
    return data.centrosDeCosto.filter(cc => usuarioActivo.centrosCosto.includes(cc.codigo));
  }, [usuarioActivo]);

  const empleadosDelCc = useMemo(() => {
    if (!ccSeleccionado) return [];
    return data.empleados.filter(e =>
      e.centrosCosto.some(cc => cc.codigo === ccSeleccionado.codigo)
    );
  }, [ccSeleccionado]);

  const empleadosFiltrados = useMemo(() => {
    const q = busquedaEmpleado.toLowerCase();
    return q
      ? empleadosDelCc.filter(e => e.nombre.toLowerCase().includes(q) || e.rut.includes(q))
      : empleadosDelCc;
  }, [empleadosDelCc, busquedaEmpleado]);

  const todosSel = empleadosFiltrados.length > 0 && empleadosFiltrados.every(e =>
    empleadosSeleccionados.some(s => s.rut === e.rut)
  );

  const toggleEmpleado = (emp: Empleado) => {
    setEmpleadosSeleccionados(prev =>
      prev.some(e => e.rut === emp.rut)
        ? prev.filter(e => e.rut !== emp.rut)
        : [...prev, emp]
    );
  };

  const toggleTodosEmpleados = () => {
    if (todosSel) {
      const rutsFiltrados = new Set(empleadosFiltrados.map(e => e.rut));
      setEmpleadosSeleccionados(prev => prev.filter(e => !rutsFiltrados.has(e.rut)));
    } else {
      const yaSelec = new Set(empleadosSeleccionados.map(e => e.rut));
      const nuevos = empleadosFiltrados.filter(e => !yaSelec.has(e.rut));
      setEmpleadosSeleccionados(prev => [...prev, ...nuevos]);
    }
  };

  const formularioValido =
    motivo.trim().length > 0 &&
    (tipoRegistro === 'horas_extras' ? cantidadHe > 0 : montoBono > 0);

  const confirmarRegistro = () => {
    if (!usuarioActivo || !ccSeleccionado) return;
    const ahora = new Date().toISOString();
    const nuevos: Registro[] = empleadosSeleccionados.map(emp => {
      const base = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        rutEmpleado: emp.rut,
        nombreEmpleado: emp.nombre,
        cargo: emp.cargo,
        codigoCc: ccSeleccionado.codigo,
        nombreCc: ccSeleccionado.nombre,
        motivo,
        fecha,
        estado: 'pendiente' as const,
        registradoPor: usuarioActivo.email,
        nombreRegistrador: usuarioActivo.nombre,
        fechaRegistro: ahora,
      };
      if (tipoRegistro === 'horas_extras') {
        return { ...base, tipo: 'horas_extras' as const, cantidadHe };
      }
      return { ...base, tipo: 'bono' as const, montoBono };
    });
    addRegistros(nuevos);
    setPaso('exito');
  };

  const pasoIndex = PASOS.findIndex(p => p.key === paso);

  if (paso === 'exito') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-brand-teal" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">¡Registrado con éxito!</h2>
          <p className="text-gray-500 mt-1">
            Se {tipoRegistro === 'horas_extras' ? 'registraron horas extras' : 'registró un bono'} para {empleadosSeleccionados.length} trabajador(es).
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>Volver al inicio</button>
          <button className="btn-primary" onClick={() => {
            setCcSeleccionado(null);
            setEmpleadosSeleccionados([]);
            setMotivo('');
            setPaso('cc');
          }}>Registrar otro</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Registrar Horas Extras / Bono</h1>
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-2 mb-6">
        {PASOS.map((p, i) => (
          <div key={p.key} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${pasoIndex === i ? 'bg-somacor-800 text-white' :
                  pasoIndex > i ? 'bg-brand-teal text-white' : 'bg-gray-200 text-gray-400'}`}>
                {pasoIndex > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-xs font-medium ${pasoIndex === i ? 'text-somacor-800' : pasoIndex > i ? 'text-brand-teal' : 'text-gray-400'}`}>
                {p.label}
              </span>
            </div>
            {i < PASOS.length - 1 && <div className="w-6 sm:w-12 h-0.5 bg-gray-200 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Paso 1: Seleccionar CC */}
      {paso === 'cc' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Selecciona el centro de costo</h2>
          {ccDisponibles.length === 0 ? (
            <p className="text-gray-400 text-sm">No tienes centros de costo asignados. Contacta al administrador.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {ccDisponibles.map(cc => (
                <button
                  key={cc.codigo}
                  onClick={() => { setCcSeleccionado(cc); setEmpleadosSeleccionados([]); setPaso('seleccion'); }}
                  className="text-left border border-gray-200 rounded-lg p-3 hover:border-somacor-800 hover:bg-somacor-50 transition-colors"
                >
                  <span className="font-mono text-xs text-gray-400">{cc.codigo}</span>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{cc.nombre}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Paso 2: Trabajadores + Detalle (lado a lado) */}
      {paso === 'seleccion' && ccSeleccionado && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">

          {/* Panel izquierdo: Trabajadores */}
          <div className="card flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Trabajadores</h2>
                <p className="text-xs text-gray-400">{ccSeleccionado.nombre} · {ccSeleccionado.codigo}</p>
              </div>
              <span className="text-sm text-somacor-800 font-medium">{empleadosSeleccionados.length} sel.</span>
            </div>

            <input
              className="input mb-2"
              placeholder="Buscar por nombre o RUT..."
              value={busquedaEmpleado}
              onChange={e => setBusquedaEmpleado(e.target.value)}
            />

            {/* Seleccionar / Descartar todos */}
            <button
              onClick={toggleTodosEmpleados}
              className="w-full text-left text-xs font-medium px-3 py-1.5 mb-1 rounded-lg border border-dashed border-gray-300 hover:border-somacor-800 hover:bg-somacor-50 text-gray-500 hover:text-somacor-800 transition-colors"
            >
              {todosSel ? '✗ Descartar todos los visibles' : '✓ Seleccionar todos los visibles'}
            </button>

            <div className="border border-gray-100 rounded-lg divide-y max-h-80 overflow-y-auto">
              {empleadosFiltrados.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">Sin resultados</p>
              )}
              {empleadosFiltrados.map(emp => {
                const sel = empleadosSeleccionados.some(e => e.rut === emp.rut);
                return (
                  <label
                    key={emp.rut}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 ${sel ? 'bg-somacor-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={sel}
                      onChange={() => toggleEmpleado(emp)}
                      className="w-4 h-4 accent-somacor-800"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-tight">{emp.nombre}</p>
                      <p className="text-xs text-gray-400">{emp.cargo} · {emp.rut}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <button className="btn-secondary w-full mt-3 text-sm py-1.5" onClick={() => setPaso('cc')}>
              <ChevronLeft className="w-4 h-4 inline" /> Atrás
            </button>
          </div>

          {/* Panel derecho: Detalle del registro */}
          <div className="card flex flex-col">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Detalle del registro</h2>

            <div className="mb-4">
              <label className="label">Tipo de registro</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoRegistro('horas_extras')}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    tipoRegistro === 'horas_extras'
                      ? 'bg-somacor-800 text-white border-somacor-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Horas Extras
                </button>
                <button
                  type="button"
                  onClick={() => setTipoRegistro('bono')}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    tipoRegistro === 'bono'
                      ? 'bg-somacor-800 text-white border-somacor-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Bono
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Fecha</label>
              <input
                type="date"
                className="input"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
              />
            </div>

            {tipoRegistro === 'horas_extras' ? (
              <div className="mb-4">
                <label className="label">Cantidad de horas extras</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  max={24}
                  className="input"
                  value={cantidadHe}
                  onChange={e => setCantidadHe(Number(e.target.value))}
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="label">Monto del bono ($)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  className="input"
                  value={montoBono}
                  onChange={e => setMontoBono(Number(e.target.value))}
                />
              </div>
            )}

            <div className="mb-5">
              <label className="label">Motivo</label>
              <textarea
                className="input"
                rows={3}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Describe el motivo del registro..."
              />
            </div>

            {empleadosSeleccionados.length === 0 && (
              <p className="text-xs text-amber-600 mb-3">Selecciona al menos un trabajador en el panel izquierdo.</p>
            )}

            <button
              className="btn-primary w-full"
              disabled={empleadosSeleccionados.length === 0 || !formularioValido}
              onClick={() => setPaso('confirmacion')}
            >
              Revisar y confirmar <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Confirmación */}
      {paso === 'confirmacion' && ccSeleccionado && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmar registro</h2>

          <div className="bg-somacor-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Centro de costo:</span>
              <span className="font-medium">{ccSeleccionado.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tipo:</span>
              <span className="font-medium">{tipoRegistro === 'horas_extras' ? 'Horas Extras' : 'Bono'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha:</span>
              <span className="font-medium">{fecha}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                {tipoRegistro === 'horas_extras' ? 'Horas:' : 'Monto:'}
              </span>
              <span className="font-medium">
                {tipoRegistro === 'horas_extras'
                  ? `${cantidadHe} hr`
                  : `$${montoBono.toLocaleString('es-CL')}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Motivo:</span>
              <span className="font-medium text-right max-w-[60%]">{motivo}</span>
            </div>
          </div>

          <p className="text-sm font-medium text-gray-700 mb-2">
            Trabajadores ({empleadosSeleccionados.length}):
          </p>
          <div className="border border-gray-100 rounded-lg divide-y max-h-48 overflow-y-auto mb-4">
            {empleadosSeleccionados.map(emp => (
              <div key={emp.rut} className="flex items-center justify-between px-3 py-2">
                <span className="text-sm">{emp.nombre}</span>
                <button
                  onClick={() =>
                    setEmpleadosSeleccionados(prev => prev.filter(e => e.rut !== emp.rut))
                  }
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-brand-red" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setPaso('seleccion')}>
              <ChevronLeft className="w-4 h-4 inline" /> Atrás
            </button>
            <button className="btn-success" onClick={confirmarRegistro}>
              <Check className="w-4 h-4 inline mr-1" /> Confirmar y enviar
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
