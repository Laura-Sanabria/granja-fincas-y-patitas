'use client';

import React from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { UserCheck, Briefcase } from 'lucide-react';
import { mockPersonal, MockPersonal } from '@/lib/mock-data';

export default function PersonalPage() {
  const columns: Column<MockPersonal>[] = [
    {
      key: 'name',
      header: 'Nombre del Personal',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E4EFE4]/60 flex items-center justify-center font-black text-[var(--brand)]">
            {p.name.charAt(0)}
          </div>
          <span className="font-extrabold text-gray-900">{p.name}</span>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (p) => <span className="font-semibold text-gray-500">{p.phone}</span>
    },
    {
      key: 'role',
      header: 'Rol',
      render: (p) => (
        <Badge variant={p.role === 'ENCARGADO' ? 'info' : 'neutral'} dot>{p.role}</Badge>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (p) => (
        <Badge variant={p.is_active ? 'success' : 'danger'}>{p.is_active ? 'Activo' : 'Inactivo'}</Badge>
      )
    },
    {
      key: 'metrics',
      header: 'Asignaciones',
      render: (p) => {
        if (p.role === 'ENCARGADO') {
          return (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[var(--brand)]">{p.animals_assigned} animales</span>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">A Cargo</span>
            </div>
          );
        }
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-purple-600">{p.tasks_pending} tareas</span>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Pendientes</span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <button className="text-xs font-bold bg-white border border-gray-200 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
          {p.role === 'ENCARGADO' ? 'Asignar Animales' : 'Asignar Tareas'}
        </button>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in pb-10">
        <PageHeader 
          title="Gestión de Asignaciones"
          description="Asigna tareas diarias a los empleados y designa animales específicos a la responsabilidad de los encargados."
          icon={UserCheck}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Encargados Activos</p>
              <h3 className="text-3xl font-black text-gray-900">
                {mockPersonal.filter(p => p.role === 'ENCARGADO' && p.is_active).length}
              </h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Empleados Activos</p>
              <h3 className="text-3xl font-black text-gray-900">
                {mockPersonal.filter(p => p.role === 'EMPLEADO' && p.is_active).length}
              </h3>
            </div>
          </div>
        </div>

        <DataTable 
          columns={columns}
          data={mockPersonal}
          keyExtractor={(p) => p.id}
        />
      </div>
    </RoleGuard>
  );
}
