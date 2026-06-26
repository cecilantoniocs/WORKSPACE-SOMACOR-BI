import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays, Save, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { CentroCosto, Empleado, AsistenciaMes } from '../types';
import { SIGLAS, SIGLA_COLOR, MESES, DIAS_SEMANA, claveAsistencia } from '../data/siglas';
import dataJson from '../data/somacor-data.json';

interface SomacorData {
  centrosDeCosto: CentroCosto[];
  empleados: Empleado[];
}
const data = dataJson as SomacorData;

type Paso = 'seleccion' | 'grilla';

const ANIO_ACTUAL = new Date().getFullYear();

// Cantidad de días reales del mes (mes: 1-12).
function diasDelMes(anio: number, mes: number): number {
  return new Date(anio, mes, 0).getDate();
}

// Día de la semana (0=dom..6=sáb) del día indicado.
function diaSemana(anio: number, mes: number, dia: number): number {
  return new Date(anio, mes - 1, dia).getDay();
}

// Anchos (px) de las 5 columnas fijas, en orden: CC, RUT, Nombre, Cargo, Ingreso.
// Sirven para "congelarlas" (quedan quietas al desplazar la tabla horizontalmente).
const ANCHO_FIJAS = [48, 104, 200, 150, 96];
const leftFija = (i: number) => ANCHO_FIJAS.slice(0, i).reduce((a, b) => a + b, 0);
const ANCHO_FIJAS_TOTAL = ANCHO_FIJAS.reduce((a, b) => a + b, 0);

export default function RegistroAsistencia() {
  const usuarioActivo = useStore(s => s.usuarioActivo);
  const asistencias = useStore(s => s.asistencias);
  const guardarAsistencia = useStore(s => s.guardarAsistencia);
  const navigate = useNavigate();

  const [paso, setPaso] = useState<Paso>('seleccion');
  const [ccSeleccionado, setCcSeleccionado] = useState<CentroCosto | null>(null);
  // Mes por defecto = mes actual. El año se fija al año actual (no se pregunta).
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const anio = ANIO_ACTUAL;

  // Datos editables de la grilla: rut -> { día -> sigla }
  const [grilla, setGrilla] = useState<AsistenciaMes>({});
  const [guardado, setGuardado] = useState(false);

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

  const dias = ccSeleccionado ? diasDelMes(anio, mes) : 0;
  const listaDias = useMemo(() => Array.from({ length: dias }, (_, i) => i + 1), [dias]);

  const abrirGrilla = () => {
    if (!ccSeleccionado) return;
    const clave = claveAsistencia(ccSeleccionado.codigo, anio, mes);
    // Carga el registro existente de ese CC+mes+año (o vacío si no hay).
    setGrilla(asistencias[clave] ? structuredClone(asistencias[clave]) : {});
    setGuardado(false);
    setPaso('grilla');
  };

  const setCelda = (rut: string, dia: number, sigla: string) => {
    setGuardado(false);
    setGrilla(prev => {
      const delTrabajador = { ...(prev[rut] ?? {}) };
      if (sigla === '') delete delTrabajador[dia];
      else delTrabajador[dia] = sigla;
      return { ...prev, [rut]: delTrabajador };
    });
  };

  const guardar = () => {
    if (!ccSeleccionado) return;
    const clave = claveAsistencia(ccSeleccionado.codigo, anio, mes);
    guardarAsistencia(clave, grilla);
    setGuardado(true);
  };

  // ---------- PASO 1: Selección de CC + mes + año ----------
  if (paso === 'seleccion') {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Registro de Asistencia</h1>
        </div>

        <div className="card max-w-3xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Selecciona el período</h2>
          <p className="text-sm text-gray-500 mb-5">
            Elige el centro de costo y el mes. Cada mes se guarda por separado: el registro
            de un mes nunca pisa al de otro.
          </p>

          {/* Mes */}
          <div className="mb-5 max-w-[220px]">
            <label className="label">Mes ({anio})</label>
            <select className="input" value={mes} onChange={e => setMes(Number(e.target.value))}>
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Centro de costo */}
          <label className="label">Centro de costo</label>
          {ccDisponibles.length === 0 ? (
            <p className="text-gray-400 text-sm">No tienes centros de costo asignados. Contacta al administrador.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {ccDisponibles.map(cc => {
                const sel = ccSeleccionado?.codigo === cc.codigo;
                return (
                  <button
                    key={cc.codigo}
                    onClick={() => setCcSeleccionado(cc)}
                    className={`text-left border rounded-lg p-3 transition-colors ${
                      sel
                        ? 'border-somacor-800 bg-somacor-50 ring-1 ring-somacor-800'
                        : 'border-gray-200 hover:border-somacor-800 hover:bg-somacor-50'
                    }`}
                  >
                    <span className="font-mono text-xs text-gray-400">{cc.codigo}</span>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{cc.nombre}</p>
                  </button>
                );
              })}
            </div>
          )}

          <button
            className="btn-primary w-full mt-6"
            disabled={!ccSeleccionado}
            onClick={abrirGrilla}
          >
            Abrir registro de asistencia
            <ChevronRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // ---------- PASO 2: Grilla de asistencia ----------
  return (
    <div>
      {/* Encabezado con botón volver y guardar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaso('seleccion')}
            className="btn-secondary text-sm py-1.5 px-3"
          >
            <ChevronLeft className="w-4 h-4 inline" /> Volver
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-somacor-800" />
            Registro de Asistencia
          </h1>
        </div>
        <button className="btn-success" onClick={guardar}>
          {guardado ? <Check className="w-4 h-4 inline mr-1" /> : <Save className="w-4 h-4 inline mr-1" />}
          {guardado ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      {/* Cabecera tipo Excel */}
      <div className="card !p-4 mb-3">
        <p className="text-sm font-semibold text-somacor-900">Registro Asistencia - SOMACOR</p>
        <p className="text-sm text-gray-700">{MESES[mes - 1]} {anio}</p>
        <p className="text-sm text-gray-500">
          {ccSeleccionado?.nombre} <span className="font-mono text-xs">· CC {ccSeleccionado?.codigo}</span>
        </p>
      </div>

      {/* Leyenda de siglas */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SIGLAS.map(s => {
          const c = SIGLA_COLOR[s.sigla];
          return (
            <span
              key={s.sigla}
              className="text-[11px] px-2 py-0.5 rounded border border-gray-200"
              style={{ backgroundColor: c?.bg ?? '#e5e7eb', color: c?.text ?? '#333333' }}
              title={s.nombre}
            >
              <span className="font-bold">{s.sigla}</span> · {s.nombre}
            </span>
          );
        })}
      </div>

      {empleadosDelCc.length === 0 ? (
        <div className="card text-center text-gray-400 text-sm py-10">
          Este centro de costo no tiene trabajadores asignados.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-auto max-h-[70vh]">
          <table className="border-collapse text-xs">
            <thead>
              {/* Fila día de la semana */}
              <tr>
                <th
                  colSpan={5}
                  className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-200"
                  style={{ minWidth: ANCHO_FIJAS_TOTAL, width: ANCHO_FIJAS_TOTAL }}
                />
                {listaDias.map(d => {
                  const ds = diaSemana(anio, mes, d);
                  const finde = ds === 0 || ds === 6;
                  return (
                    <th
                      key={d}
                      className={`border-b border-gray-200 px-1 py-1 font-normal text-[10px] ${
                        finde ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {DIAS_SEMANA[ds]}
                    </th>
                  );
                })}
              </tr>
              {/* Fila encabezados de columnas (las 5 primeras quedan congeladas) */}
              <tr className="bg-somacor-800 text-white">
                {['CC', 'RUT', 'Nombre', 'Cargo', 'Ingreso'].map((titulo, i) => (
                  <th
                    key={titulo}
                    className={`sticky z-30 bg-somacor-800 px-2 py-2 text-left ${i === 4 ? 'border-r border-somacor-700' : ''}`}
                    style={{ left: leftFija(i), minWidth: ANCHO_FIJAS[i], width: ANCHO_FIJAS[i] }}
                  >
                    {titulo}
                  </th>
                ))}
                {listaDias.map(d => {
                  const ds = diaSemana(anio, mes, d);
                  const finde = ds === 0 || ds === 6;
                  return (
                    <th key={d} className={`px-1 py-2 w-12 text-center ${finde ? 'bg-somacor-900' : ''}`}>
                      {d}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {empleadosDelCc.map((emp, idx) => {
                const bgFila = idx % 2 ? '#f9fafb' : '#ffffff';
                // Estilo común de las celdas fijas (congeladas): sticky + fondo sólido
                const fija = (i: number) => ({
                  position: 'sticky' as const,
                  left: leftFija(i),
                  zIndex: 20,
                  minWidth: ANCHO_FIJAS[i],
                  width: ANCHO_FIJAS[i],
                  backgroundColor: bgFila,
                });
                return (
                <tr key={emp.rut}>
                  <td className="px-2 py-1 border-r border-gray-200 font-mono text-gray-400 text-[11px]" style={fija(0)}>
                    {ccSeleccionado?.codigo}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-gray-500" style={fija(1)}>{emp.rut}</td>
                  <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-800 overflow-hidden text-ellipsis" style={fija(2)}>{emp.nombre}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-gray-500 overflow-hidden text-ellipsis" style={fija(3)}>{emp.cargo}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-gray-500 border-r border-gray-200" style={fija(4)}>
                    {emp.fechaIngreso ?? '—'}
                  </td>
                  {listaDias.map(d => {
                    const valor = grilla[emp.rut]?.[d] ?? '';
                    const c = valor ? SIGLA_COLOR[valor] : undefined;
                    return (
                      <td key={d} className="p-0 border-l border-gray-100">
                        <select
                          value={valor}
                          onChange={e => setCelda(emp.rut, d, e.target.value)}
                          className="w-12 h-8 text-center text-[11px] font-semibold border-0 focus:ring-1 focus:ring-somacor-800 cursor-pointer"
                          style={c
                            ? { backgroundColor: c.bg, color: c.text }
                            : { color: '#d1d5db' }}
                          title={SIGLAS.find(s => s.sigla === valor)?.nombre ?? 'Sin registrar'}
                        >
                          <option value="" style={{ color: '#282b35', fontWeight: 700 }}>·</option>
                          {SIGLAS.map(s => (
                            <option
                              key={s.sigla}
                              value={s.sigla}
                              title={s.nombre}
                              style={{ color: '#282b35', fontWeight: 700 }}
                            >
                              {s.sigla}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <button className="btn-secondary" onClick={() => setPaso('seleccion')}>
          <ChevronLeft className="w-4 h-4 inline" /> Volver
        </button>
        <button className="btn-success" onClick={guardar}>
          {guardado ? <Check className="w-4 h-4 inline mr-1" /> : <Save className="w-4 h-4 inline mr-1" />}
          {guardado ? 'Guardado' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
