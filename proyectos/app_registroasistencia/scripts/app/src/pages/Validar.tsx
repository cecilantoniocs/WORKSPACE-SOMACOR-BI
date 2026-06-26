import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../store/useStore';
import type { Registro } from '../types';

export default function Validar() {
  const registros = useStore(s => s.registros);
  const validarRegistros = useStore(s => s.validarRegistros);
  const navigate = useNavigate();

  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ accion: 'validado' | 'rechazado'; ids: string[] } | null>(null);

  const pendientes = useMemo(
    () => registros.filter(r => r.estado === 'pendiente').sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro)),
    [registros]
  );

  const toggleSel = (id: string) =>
    setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleTodos = () =>
    setSeleccionados(prev => prev.length === pendientes.length ? [] : pendientes.map(r => r.id));

  const ejecutarAccion = () => {
    if (!confirm) return;
    validarRegistros(confirm.ids, confirm.accion);
    setSeleccionados([]);
    setConfirm(null);
  };

  const exportar = () => {
    const filas = pendientes.map(r => ({
      'Fecha': r.fecha,
      'Tipo': r.tipo === 'horas_extras' ? 'Horas Extras' : 'Bono',
      'CC Código': r.codigoCc,
      'CC Nombre': r.nombreCc,
      'RUT': r.rutEmpleado,
      'Nombre': r.nombreEmpleado,
      'Cargo': r.cargo,
      ...(r.tipo === 'horas_extras'
        ? { 'Horas': (r as Extract<Registro, { tipo: 'horas_extras' }>).cantidadHe }
        : { 'Monto': (r as Extract<Registro, { tipo: 'bono' }>).montoBono }),
      'Motivo': r.motivo,
      'Registrado Por': r.nombreRegistrador,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), 'Pendientes');
    XLSX.writeFile(wb, `somacor_pendientes_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Validar Registros</h1>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">{pendientes.length} pendiente(s)</span>
          <div className="flex gap-2">
            {seleccionados.length > 0 && (
              <>
                <button
                  className="btn-success text-sm py-1.5"
                  onClick={() => setConfirm({ accion: 'validado', ids: seleccionados })}
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" /> Validar ({seleccionados.length})
                </button>
                <button
                  className="btn-danger text-sm py-1.5"
                  onClick={() => setConfirm({ accion: 'rechazado', ids: seleccionados })}
                >
                  <XCircle className="w-4 h-4 inline mr-1" /> Rechazar ({seleccionados.length})
                </button>
              </>
            )}
            <button className="btn-secondary text-sm py-1.5" onClick={exportar}>
              <Download className="w-4 h-4 inline mr-1" /> Exportar
            </button>
          </div>
        </div>

        {pendientes.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-gray-400">No hay registros pendientes de validación.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-2 pr-3">
                    <input
                      type="checkbox"
                      checked={seleccionados.length === pendientes.length && pendientes.length > 0}
                      onChange={toggleTodos}
                    />
                  </th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">Fecha</th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">Tipo</th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">CC</th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">Trabajador</th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">Cantidad</th>
                  <th className="pb-2 pr-3 text-gray-500 font-medium">Motivo</th>
                  <th className="pb-2 text-gray-500 font-medium">Registró</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendientes.map(r => (
                  <tr key={r.id} className={`hover:bg-gray-50 ${seleccionados.includes(r.id) ? 'bg-somacor-50' : ''}`}>
                    <td className="py-2.5 pr-3">
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(r.id)}
                        onChange={() => toggleSel(r.id)}
                      />
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600">{r.fecha}</td>
                    <td className="py-2.5 pr-3">{r.tipo === 'horas_extras' ? 'HH.EE.' : 'Bono'}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-400">{r.codigoCc}</td>
                    <td className="py-2.5 pr-3 text-gray-800">{r.nombreEmpleado}</td>
                    <td className="py-2.5 pr-3 text-gray-600">
                      {r.tipo === 'horas_extras'
                        ? `${(r as Extract<Registro, { tipo: 'horas_extras' }>).cantidadHe} hr`
                        : `$${(r as Extract<Registro, { tipo: 'bono' }>).montoBono.toLocaleString('es-CL')}`}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-500 max-w-[160px] truncate">{r.motivo}</td>
                    <td className="py-2.5 text-xs text-gray-400">{r.nombreRegistrador}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirm.accion === 'validado' ? '¿Validar registros?' : '¿Rechazar registros?'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Se {confirm.accion === 'validado' ? 'validarán' : 'rechazarán'} {confirm.ids.length} registro(s).
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirm(null)}>Cancelar</button>
              <button
                className={confirm.accion === 'validado' ? 'btn-success flex-1' : 'btn-danger flex-1'}
                onClick={ejecutarAccion}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
