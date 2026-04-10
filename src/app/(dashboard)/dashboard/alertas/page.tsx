'use client';

import React from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { mockAlerts, MockAlert } from '@/lib/mock-data';

export default function AlertasPage() {
  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critica': return <AlertTriangle size={24} className="text-red-500" />;
      case 'media': return <AlertCircle size={24} className="text-orange-500" />;
      default: return <Info size={24} className="text-blue-500" />;
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'critica': return 'danger';
      case 'media': return 'warning';
      default: return 'info';
    }
  };

  const columns: Column<MockAlert>[] = [
    {
      key: 'level',
      header: 'Nivel',
      render: (a) => (
        <div className="flex items-center gap-4">
          <div className="shrink-0">{getAlertIcon(a.level)}</div>
          <Badge variant={getLevelBadgeClass(a.level)}>{a.level.toUpperCase()}</Badge>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (a) => (
        <span className="font-extrabold text-gray-500 uppercase text-[10px] tracking-widest">{a.type}</span>
      )
    },
    {
      key: 'details',
      header: 'Detalle de Alerta',
      render: (a) => (
        <div className="flex flex-col max-w-md">
          <span className="font-black text-gray-900">{a.title} - <span className="text-[var(--brand)]">{a.entity_name}</span></span>
          <span className="text-sm font-medium text-gray-500 mt-0.5">{a.detail}</span>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Fecha Detección',
      render: (a) => <span className="font-bold text-gray-600 font-mono text-xs">{a.created_at}</span>
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (a) => (
        <button className="text-xs font-bold text-[var(--brand)] hover:text-[var(--brand-hover)] border border-[var(--brand)]/20 hover:bg-[var(--brand)]/10 px-4 py-2 rounded-xl transition-colors">
          Resolver
        </button>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in pb-10">
        <PageHeader 
          title="Centro de Alertas"
          description="Monitorea situaciones que requieren atención inmediata en la granja, como bajo inventario, vencimientos próximos o protocolos de salud atrasados."
          icon={Bell}
        />

        <div className="bg-white rounded-[2rem] shadow-sm border border-black/5 overflow-hidden ring-1 ring-black/5">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-extrabold text-gray-900">Alertas Activas</h3>
            <Badge variant="danger" dot>{mockAlerts.length} detectadas</Badge>
          </div>
          
          <DataTable 
            columns={columns}
            data={mockAlerts}
            keyExtractor={(a) => a.id}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
