'use client';

import React from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Sprout, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { mockReproductions, MockReproduction } from '@/lib/mock-data';

export default function ReproduccionPage() {
  const completedCount = mockReproductions.filter(r => r.gestation_status === 'parto_exitoso').length;
  const inProgressCount = mockReproductions.filter(r => r.gestation_status === 'en_seguimiento' || r.gestation_status === 'confirmada').length;
  const failureCount = mockReproductions.filter(r => r.gestation_status === 'fallida').length;

  const getStatusBadge = (status: MockReproduction['gestation_status']) => {
    switch (status) {
      case 'parto_exitoso': return <Badge variant="success" dot>Parto Exitoso</Badge>;
      case 'confirmada': return <Badge variant="info" dot>Confirmada</Badge>;
      case 'en_seguimiento': return <Badge variant="warning" dot>En Seguimiento</Badge>;
      case 'fallida': return <Badge variant="danger" dot>Fallida</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getTypeStr = (type: string) => {
    if (type === 'monta_natural') return 'Monta Natural';
    if (type === 'inseminacion') return 'Inseminación Artificial';
    return type;
  };

  const columns: Column<MockReproduction>[] = [
    {
      key: 'cross',
      header: 'Identificación del Cruce',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900">{r.cross_name}</span>
          <span className="text-xs font-bold text-gray-400">Madre: {r.female_name} | Padre: {r.male_name}</span>
        </div>
      )
    },
    {
      key: 'breed',
      header: 'Raza Resultante',
      render: (r) => <span className="font-bold text-gray-600">{r.breed}</span>
    },
    {
      key: 'type',
      header: 'Tipo de Evento',
      render: (r) => <span className="text-sm font-medium text-gray-500">{getTypeStr(r.event_type)}</span>
    },
    {
      key: 'date',
      header: 'Fecha Evento',
      render: (r) => <span className="font-medium text-gray-700">{r.event_date}</span>
    },
    {
      key: 'status',
      header: 'Estado de Gestación',
      render: (r) => getStatusBadge(r.gestation_status)
    },
    {
      key: 'effectiveness',
      header: 'Efectividad',
      render: (r) => {
        if (r.effective) {
          return (
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
              <CheckCircle2 size={16} /> Sí
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm">
            <XCircle size={16} /> No
          </div>
        );
      }
    }
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in">
        <PageHeader 
          title="Gestión de Reproducción"
          description="Monitorea los eventos reproductivos, inseminaciones y cruces naturales. Haz seguimiento de la efectividad y fechas probables de parto."
          icon={Sprout}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
             <div>
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Partos Exitosos</p>
              <h3 className="text-3xl font-black text-gray-900">{completedCount}</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
             <div>
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Gestaciones Activas</p>
              <h3 className="text-3xl font-black text-gray-900">{inProgressCount}</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
             <div>
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Cruces Fallidos</p>
              <h3 className="text-3xl font-black text-gray-900">{failureCount}</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
              <XCircle size={24} />
            </div>
          </div>
        </div>

        <DataTable 
          columns={columns}
          data={mockReproductions}
          keyExtractor={(r) => r.id}
        />
      </div>
    </RoleGuard>
  );
}
