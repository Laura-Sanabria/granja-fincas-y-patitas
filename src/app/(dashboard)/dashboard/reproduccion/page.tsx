'use client';

<<<<<<< HEAD
import React, { useCallback, useEffect, useMemo, useState } from 'react';
=======
import React, { useState, useEffect, useCallback } from 'react';
>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
<<<<<<< HEAD
import ReproductionEventModal from '@/components/reproduccion/ReproductionEventModal';
import ReproductionStatusModal from '@/components/reproduccion/ReproductionStatusModal';
import { Sprout, CheckCircle2, XCircle, Clock, Plus, Pencil, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { SupabaseReproductionRepository } from '@/repositories/supabase/ReproductionRepository';
import type {
  GestationStatus,
  ReproductiveEventWithRelations,
} from '@/types/domain/reproduction.schema';

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = iso.slice(0, 10);
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

function resultingBreed(ev: ReproductiveEventWithRelations) {
  const fb = ev.female_animal?.breed?.name;
  const mb = ev.male_animal?.breed?.name;
  if (fb && mb) return `${fb} × ${mb}`;
  return fb || mb || '—';
}

function crossTitle(ev: ReproductiveEventWithRelations) {
  const f = ev.female_animal?.name?.trim() || ev.female_animal?.code || 'Hembra';
  const m = ev.male_animal
    ? ev.male_animal.name?.trim() || ev.male_animal.code
    : ev.male_external?.trim() || '—';
  return `${f} × ${m}`;
}

function getTypeStr(type: string) {
  if (type === 'monta_natural') return 'Monta natural';
  if (type === 'inseminacion_artificial') return 'Inseminación artificial';
  return type;
}

function effectivenessCell(status: GestationStatus) {
  if (status === 'parto_exitoso') {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
        <CheckCircle2 size={16} /> Sí
      </div>
    );
  }
  if (status === 'fallida') {
    return (
      <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm">
        <XCircle size={16} /> No
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm">
      <Clock size={16} /> En curso
    </div>
  );
}

export default function ReproduccionPage() {
  const [repo] = useState(() => new SupabaseReproductionRepository(createClient()));
  const [rows, setRows] = useState<ReproductiveEventWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [createOpen, setCreateOpen] = useState(false);
  const [statusEvent, setStatusEvent] = useState<ReproductiveEventWithRelations | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repo.list();
      setRows(data);
    } catch (e) {
      setError((e as Error).message);
      setRows([]);
=======
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
>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
    } finally {
      setLoading(false);
    }
  }, [repo]);

  useEffect(() => {
<<<<<<< HEAD
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filterStatus === 'todas') return rows;
    return rows.filter((r) => r.gestation_status === filterStatus);
  }, [rows, filterStatus]);

  const completedCount = rows.filter((r) => r.gestation_status === 'parto_exitoso').length;
  const inProgressCount = rows.filter(
    (r) => r.gestation_status === 'en_seguimiento' || r.gestation_status === 'confirmada'
  ).length;
  const failureCount = rows.filter((r) => r.gestation_status === 'fallida').length;

  const getStatusBadge = (status: GestationStatus) => {
    switch (status) {
      case 'parto_exitoso':
        return (
          <Badge variant="success" dot>
            Parto exitoso
          </Badge>
        );
      case 'confirmada':
        return (
          <Badge variant="info" dot>
            Confirmada
          </Badge>
        );
      case 'en_seguimiento':
        return (
          <Badge variant="warning" dot>
            En seguimiento
          </Badge>
        );
      case 'fallida':
        return (
          <Badge variant="danger" dot>
            Fallida
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

=======
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

>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
  const columns: Column<ReproductiveEventWithRelations>[] = [
    {
      key: 'cross',
      header: 'Identificación del cruce',
      render: (r) => (
        <div className="flex flex-col">
<<<<<<< HEAD
          <span className="font-extrabold text-gray-900">{crossTitle(r)}</span>
          <span className="text-xs font-bold text-gray-400">
            Hembra: {r.female_animal?.code ?? '—'}
            {r.male_animal ? ` · Macho: ${r.male_animal.code}` : r.male_external ? ` · Externo: ${r.male_external}` : ''}
=======
          <span className="font-extrabold text-gray-900">{r.animal?.code}</span>
          <span className="text-xs font-bold text-gray-400">
            Madre: {r.animal?.code} | Padre: {r.father?.code || r.father_external || 'No especificado'}
>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
          </span>
        </div>
      ),
    },
    {
      key: 'breed',
<<<<<<< HEAD
      header: 'Raza / cruce',
      render: (r) => <span className="font-bold text-gray-600">{resultingBreed(r)}</span>,
    },
    {
      key: 'type',
      header: 'Tipo de evento',
      render: (r) => <span className="text-sm font-medium text-gray-500">{getTypeStr(r.event_type)}</span>,
    },
    {
      key: 'date',
      header: 'Fecha evento',
      render: (r) => <span className="font-medium text-gray-700">{formatDate(r.event_date)}</span>,
    },
    {
      key: 'est',
      header: 'Parto estimado',
      render: (r) => (
        <span className="font-medium text-gray-600">{formatDate(r.estimated_birth_date)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado de gestación',
      render: (r) => getStatusBadge(r.gestation_status),
    },
    {
      key: 'effectiveness',
      header: 'Resultado',
      render: (r) => effectivenessCell(r.gestation_status),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-28',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setStatusEvent(r);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-extrabold text-[var(--brand)] hover:bg-gray-50 transition-colors"
        >
          <Pencil size={14} />
          Estado
        </button>
      ),
    },
=======
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
>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR', 'ENCARGADO']} redirectPath="/acceso-denegado">
<<<<<<< HEAD
      <div className="space-y-6 animate-fade-in pb-10">
        <PageHeader
          title="Gestión de reproducción"
          description="Registra cruces e inseminaciones, actualiza el estado de gestación y consulta el historial desde tu base de datos."
          icon={Sprout}
          actions={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              <Plus size={18} />
              <span>Nuevo evento</span>
=======
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
>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
            </button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
            <div>
<<<<<<< HEAD
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">
                Partos exitosos
              </p>
              <h3 className="text-3xl font-black text-gray-900">{completedCount}</h3>
=======
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Partos Registrados</p>
              <h3 className="text-3xl font-black text-gray-900">{summary.successfulBirths}</h3>
>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
            <div>
<<<<<<< HEAD
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">
                Gestaciones activas
              </p>
              <h3 className="text-3xl font-black text-gray-900">{inProgressCount}</h3>
=======
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Gestaciones Activas</p>
              <h3 className="text-3xl font-black text-gray-900">{summary.activeGestations}</h3>
>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
            </div>
            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
            <div>
<<<<<<< HEAD
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">
                Cruces fallidos
              </p>
              <h3 className="text-3xl font-black text-gray-900">{failureCount}</h3>
=======
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Incidencias (Fallas/Abortos)</p>
              <h3 className="text-3xl font-black text-gray-900">{summary.failures}</h3>
>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
            </div>
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
              <XCircle size={24} />
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-[1.5rem] shadow-sm border border-black/5">
          <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Filtrar</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 border border-black/5 rounded-xl px-4 py-2 font-bold text-gray-700 outline-none focus:border-[var(--brand)] min-w-[200px]"
          >
            <option value="todas">Todos los estados</option>
            <option value="en_seguimiento">En seguimiento</option>
            <option value="confirmada">Confirmada</option>
            <option value="fallida">Fallida</option>
            <option value="parto_exitoso">Parto exitoso</option>
          </select>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800">
            {error}
=======
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
>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
          </div>
        )}

        {loading ? (
<<<<<<< HEAD
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-[var(--brand)] w-10 h-10" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(r) => r.id}
            emptyMessage="No hay eventos reproductivos. Crea el primero con «Nuevo evento»."
          />
        )}

        <ReproductionEventModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={load}
        />

        <ReproductionStatusModal
          isOpen={!!statusEvent}
          event={statusEvent}
          onClose={() => setStatusEvent(null)}
          onSuccess={load}
=======
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
>>>>>>> c96051fed39681d8bed1ee26195098f89acf5d5e
        />
      </div>
    </RoleGuard>
  );
}
