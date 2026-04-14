'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Search, Loader2, Database, User } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { RoleGuard } from '@/components/RoleGuard';
import { getAuditHistory } from '@/actions/dashboard.actions';

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const data = await getAuditHistory(50);
      setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    switch(action) {
      case 'INSERT': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'UPDATE': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DELETE': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActionLabel = (action: string) => {
    switch(action) {
      case 'INSERT': return 'Creó';
      case 'UPDATE': return 'Modificó';
      case 'DELETE': return 'Eliminó';
      default: return action;
    }
  };

  const formatearFecha = (iso: string) => {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']}>
      <div className="flex flex-col gap-8 animate-fade-in pb-12">
        <PageHeader 
          title="Auditoría y Trazabilidad"
          description="Monitoreo global del sistema. Historial de acciones y alteraciones a la base de datos."
          icon={Activity}
        />

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Últimas 50 Operaciones</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Database className="w-4 h-4" /> En vivo (PostgreSQL Triggers)
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4 text-gray-400">
                 <Loader2 className="w-8 h-8 animate-spin" />
                 <p className="font-medium text-sm tracking-wide">Recuperando registros directos de Base de Datos...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center p-20 text-gray-400 font-medium">
                No hay actividades recientes.
              </div>
            ) : (
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 font-extrabold text-[10px] uppercase tracking-widest border-b border-gray-100">
                    <th className="p-5 pl-8">Fecha y Hora</th>
                    <th className="p-5">Usuario / Rol</th>
                    <th className="p-5">Acción</th>
                    <th className="p-5">Módulo Afectado</th>
                    <th className="p-5 text-right pr-8">ID de Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-5 pl-8">
                        <span className="text-sm font-bold text-gray-700">{formatearFecha(log.created_at)}</span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{log.profiles?.full_name || 'Desconocido'}</p>
                            <p className="text-xs text-gray-500 font-medium">{log.profiles?.role || 'Sistema'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border inline-block ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                          {log.table_name}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-8 text-xs font-mono text-gray-400">
                        {log.record_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
