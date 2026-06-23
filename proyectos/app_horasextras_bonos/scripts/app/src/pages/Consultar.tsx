import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Trash2, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../store/useStore';
import type { Registro } from '../types';

function badge(estado: string) {
  if (estado === 'validado') return <span className="badge-validado">Validado</span>;
  if (estado === 'rechazado') return <span className="badge-rechazado">Rechazado</span>;
  return <span className="badge-pendiente">Pendiente</span>;
}

export default function Consultar() {
  const usuarioActivo = useStore(s => s.usuarioActivo);
  const registros = useStore(s => s.registros);
  const deleteRegistros = useStore(s => s.deleteRegistros);
  const navigate = useNavigate();

  const [filtroCc, setFiltroCc] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const puedeVerTodo = usuarioActivo?.verTodosLosCc || usuarioActivo?.tipo === 'admin';

  const registrosFiltrados = useMemo(() => {
    return registros.filter(r => {
      if (!puedeVerTodo && usuarioActivo) {
        if (!usuarioActivo.centrosCosto.includes(r.codigoCc)) return false;
      }
      if (filtroCc && !r.codigoCc.includes(filtroCc) && !r.nombreCc.toLowerCase().includes(filtroCc.toLowerCase())) return false;
      if (filtroTipo && r.tipo !== filtroTipo) return false;
      if (filtroEstado && r.estado !== filtroEstado) return false;
      if (fechaDesde && r.fecha < fechaDesde) return false;
      if (fechaHasta && r.fecha > fechaHasta) return false;
      return true;
    }).sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro));
  }, [registros, puedeVerTodo, usuarioActivo, filtroCc, filtroTipo, filtroEstado, fechaDesde, fechaHasta]);

  const pendientesSel = seleccionados.filter(id => {
    const r = registros.find(x => x.id === id);
    return r?.estado === 'pendiente';
  });

  const exportar = () => {
    const filas = registrosFiltrados.map(r => ({
      'Fecha': r.fecha,
      'Tipo': r.tipo === 'horas_extras' ? 'Horas Extras' : 'Bono',
      'CC Código': r.codigoCc,
      'CC Nombre': r.nombreCc,
      'RUT': r.rutEmpleado,
      'Nombre Trabajador': r.nombreEmpleado,
      'Cargo': r.cargo,
      ...(r.tipo === 'horas_extras'
        ? { 'Horas': (r as Extract<Registro, { tipo: 'horas_extras' }>).cantidadHe }
        : { 'Monto Bono': (r as Extract<Registro, { tipo: 'bono' }>).montoBono }),
      'Motivo': r.motivo,
      'Estado': r.estado,
      'Registrado Por': r.nombreRegistrador,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), 'Registros');
    XLSX.writeFile(wb, `somacor_registros_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const eliminarSeleccionados = () => {
    deleteRegistros(pendientesSel);
    setSeleccionados([]);
    setConfirmDelete(false);
  };

  const toggleSel = (id: string) =>
    setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleTodos = () =>
    setSeleccionados(prev =>
      prev.length === registrosFiltrados.length ? [] : registrosFiltrados.map(r => r.id)
    );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Consultar Registros</h1>
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <input className="input" placeholder="Centro de costo" value={filtroCc} onChange={e => setFiltroCc(e.target.value)} />
          <select className="input" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="horas_extras">Horas Extras</option>
            <option value="bono">Bono</option>
          </select>
          <select className="input" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="validado">Validado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <input type="date" className="input" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
          <input type="date" className="input" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">{registrosFiltrados.length} registro(s)</span>
          <div className="flex gap-2">
            {pendientesSel.length > 0 && (
              <button className="btn-danger text-sm py-1.5" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="w-4 h-4 inline mr-1" /> Eliminar ({pendientesSel.length})
              </button>
            )}
            <button className="btn-secondary text-sm py-1.5" onClick={exportar}>
              <Download className="w-4 h-4 inline mr-1" /> Exportar Excel
            </button>
          </div>
        </div>

        {registrosFiltrados.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No hay registros que mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-2 pr-3">
                    <input
                      type="checkbox"
                      checked={seleccionados.length === registrosFiltrados.length && registrosFiltrados.length > 0}
                      onChange={toggleTodos}
                    />
                  </th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">Fecha</th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">Tipo</th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">CC</th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">Trabajador</th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">Cantidad</th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrosFiltrados.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-3">
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(r.id)}
                        onChange={() => toggleSel(r.id)}
                      />
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600">{r.fecha}</td>
                    <td className="py-2.5 pr-3 text-gray-800">
                      {r.tipo === 'horas_extras' ? 'HH.EE.' : 'Bono'}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="text-xs text-gray-400">{r.codigoCc}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-gray-800">{r.nombreEmpleado}</td>
                    <td className="py-2.5 pr-3 text-gray-600">
                      {r.tipo === 'horas_extras'
                        ? `${(r as Extract<Registro, { tipo: 'horas_extras' }>).cantidadHe} hr`
                        : `$${(r as Extract<Registro, { tipo: 'bono' }>).montoBono.toLocaleString('es-CL')}`}
                    </td>
                    <td className="py-2.5">{badge(r.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar registros?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Se eliminarán {pendientesSel.length} registro(s) pendiente(s). Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirmDelete(false)}>Cancelar</button>
              <button className="btn-danger flex-1" onClick={eliminarSeleccionados}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
