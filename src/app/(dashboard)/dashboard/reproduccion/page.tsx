'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Sprout, CheckCircle2, XCircle, Clock, PlusCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { SupabaseReproductionRepository } from '@/repositories/supabase/ReproductionRepository';
import { ReproductiveEventWithRelations } from '@/types/domain/reproduction.schema';
import GlobalReproductionModal from '@/components/animales/GlobalReproductionModal';
import { calculateReproMilestones } from '@/utils/reproduction-utils';

export default function ReproduccionPage() {
  const [events, setEvents] = useState<ReproductiveEventWithRelations[]>([]);
  const [summary, setSummary] = useState({ successfulBirths: 0, activeGestations: 0, failures: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [repo] = useState(() => new SupabaseReproductionRepository(createClient()));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [data, stats] = await Promise.all([
        repo.getAllEventsWithRelations(),
        repo.getReproductionSummary()
      ]);
      setEvents(data);
      setSummary(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Función para obtener la alerta más próxima de un evento
  const getNextAlert = (ev: ReproductiveEventWithRelations) => {
    if (!(ev.animal?.species as any)?.gestation_days) return null;
    const milestones = calculateReproMilestones(
      ev.event_date,
      (ev.animal?.species as any).gestation_days,
      (ev.animal?.species as any).is_productive_milk
    );
    // Buscamos el primero que no esté completado/vencido o el más próximo activo
    return milestones.find(m => m.status === 'active' || m.status === 'overdue') || milestones[0];
  };

  const getStatusBadge = (event: ReproductiveEventWithRelations) => {
    switch (event.event_type) {
      case 'parto': return <Badge variant="success" dot>Parto Registrado</Badge>;
      case 'diagnostico': 
        return event.result === 'positivo' 
          ? <Badge variant="info" dot>Confirmada (Preñez)</Badge>
          : <Badge variant="danger" dot>Negativo</Badge>;
      case 'servicio': return <Badge variant="warning" dot>Servicio Registrado</Badge>;
      case 'aborto': return <Badge variant="danger" dot>Aborto</Badge>;
      default: return <Badge variant="neutral">{event.event_type}</Badge>;
    }
  };

  const getTypeStr = (type: string, serviceType?: string | null) => {
    if (type === 'servicio') return serviceType === 'IA' ? 'Inseminación Artificial' : 'Monta Natural';
    if (type === 'diagnostico') return 'Diagnóstico (Eco/Palpación)';
    if (type === 'parto') return 'Parto / Nacimiento';
    return type;
  };

  const columns: Column<ReproductiveEventWithRelations>[] = [
    {
      key: 'cross',
      header: 'Identificación del cruce',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900">{r.animal?.code}</span>
          <span className="text-xs font-bold text-gray-400">
            Madre: {r.animal?.code} | Padre: {r.father?.code || r.father_external || 'No especificado'}
          </span>
        </div>
      ),
    },
    {
      key: 'breed',
      header: 'Especie / Raza',
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-600">{r.animal?.species?.display_name}</span>
          <span className="text-[10px] font-bold text-gray-400 capitalize">{r.animal?.breed?.name || 'Mestiza'}</span>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Tipo de Evento',
      render: (r) => <span className="text-sm font-medium text-gray-500">{getTypeStr(r.event_type, r.service_type)}</span>
    },
    {
      key: 'date',
      header: 'Fecha Registro',
      render: (r) => <span className="font-medium text-gray-700">{new Date(r.event_date).toLocaleDateString()}</span>
    },
    {
      key: 'status',
      header: 'Estado / Resultado',
      render: (r) => getStatusBadge(r)
    },
    {
      key: 'effectiveness',
      header: 'Responsable',
      render: (r) => <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{r.responsible}</span>
    }
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR', 'ENCARGADO']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in">
        <PageHeader 
          title="Gestión de Reproducción"
          description="Monitorea los eventos reproductivos, inseminaciones y cruces naturales. Haz seguimiento de la efectividad y fechas probables de parto."
          icon={Sprout}
          actions={
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--brand)] text-white rounded-2xl font-black hover:bg-[var(--brand-hover)] shadow-lg shadow-green-100 transition-all text-sm"
            >
              <PlusCircle size={20} />
              <span>Nuevo Registro</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Partos Registrados</p>
              <h3 className="text-3xl font-black text-gray-900">{summary.successfulBirths}</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Gestaciones Activas</p>
              <h3 className="text-3xl font-black text-gray-900">{summary.activeGestations}</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Incidencias (Fallas/Abortos)</p>
              <h3 className="text-3xl font-black text-gray-900">{summary.failures}</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
              <XCircle size={24} />
            </div>
          </div>
        </div>

        {/* Sección de Alertas Proactivas (CORREGIDO) */}
        {!loading && events.length > 0 && (
          <div className="bg-amber-50/30 border border-amber-100 rounded-[2rem] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock size={18} />
              </div>
              <h3 className="text-lg font-black text-gray-900 font-display uppercase tracking-tight">Atención Próximos Plazos</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {events
                .filter(e => e.event_type === 'servicio' && (e.animal?.species as any)?.gestation_days)
                .map(ev => {
                  const alert = getNextAlert(ev);
                  if (!alert) return null;
                  return (
                    <div key={ev.id} className={`p-4 rounded-2xl border flex flex-col gap-1 shadow-sm transition-all ${
                      alert.status === 'overdue' ? 'bg-red-50 border-red-100' : 'bg-white border-amber-200/50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          alert.status === 'overdue' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {ev.animal?.code} — {ev.animal?.species?.display_name}
                        </span>
                        {alert.status === 'overdue' && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{alert.label}</span>
                      <span className="text-xs text-gray-400 font-medium">
                        Fecha: {new Date(alert.date).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })
                .slice(0, 4)}
              {events.filter(e => e.event_type === 'servicio').length === 0 && (
                <p className="text-sm font-bold text-amber-700/50 italic">No hay alertas de seguimiento activas.</p>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-20 rounded-[2rem] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[var(--brand)]" size={32} />
            <p className="text-gray-400 font-bold">Cargando registros reproductivos...</p>
          </div>
        ) : (
          <DataTable 
            columns={columns}
            data={events}
            keyExtractor={(r) => r.id}
          />
        )}

        <GlobalReproductionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchData} 
        />
      </div>
    </RoleGuard>
  );
}
