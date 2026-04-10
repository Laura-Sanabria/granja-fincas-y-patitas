'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Beef, Filter, Activity, Plus } from 'lucide-react';
import { mockAnimals, MockAnimal } from '@/lib/mock-data';

export default function AnimalesPage() {
  const router = useRouter();
  const [filterSpecies, setFilterSpecies] = useState<string>('Todas');

  const speciesOptions = ['Todas', ...Array.from(new Set(mockAnimals.map(a => a.species_name)))];

  const filteredAnimals = useMemo(() => {
    if (filterSpecies === 'Todas') return mockAnimals;
    return mockAnimals.filter(a => a.species_name === filterSpecies);
  }, [filterSpecies]);

  const columns: Column<MockAnimal>[] = [
    {
      key: 'name',
      header: 'Identificación',
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900">{a.name}</span>
          <span className="text-xs font-bold text-gray-400 font-mono">{a.code}</span>
        </div>
      )
    },
    {
      key: 'species',
      header: 'Especie / Raza',
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-700">{a.species_name}</span>
          <span className="text-xs font-medium text-gray-500">{a.breed}</span>
        </div>
      )
    },
    {
      key: 'sex',
      header: 'Sexo',
      render: (a) => (
        <span className="capitalize font-medium text-gray-600">{a.sex}</span>
      )
    },
    {
      key: 'age',
      header: 'Edad / Nacimiento',
      render: (a) => {
        // Calcular edad simple (meses/años)
        const birthDate = new Date(a.birth_date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - birthDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let ageStr = `${Math.floor(diffDays / 30)} meses`;
        if (diffDays > 365) {
          ageStr = `${(diffDays / 365).toFixed(1)} años`;
        }
        
        return (
          <div className="flex flex-col">
            <span className="font-bold text-gray-700">{ageStr}</span>
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{a.birth_date}</span>
          </div>
        );
      }
    },
    {
      key: 'health',
      header: 'Salud',
      render: (a) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral';
        let label = a.health_status.replace('_', ' ');
        if (a.health_status === 'sano') variant = 'success';
        if (a.health_status === 'enfermo') variant = 'danger';
        if (a.health_status === 'en_tratamiento') variant = 'warning';
        if (a.health_status === 'cuarentena') variant = 'info';

        return <Badge variant={variant} dot>{label}</Badge>;
      }
    },
    {
      key: 'vaccines',
      header: 'Vacunas',
      render: (a) => {
        if (a.vaccination_status === 'al_dia') return <Badge variant="success" dot>Al día</Badge>;
        if (a.vaccination_status === 'pendiente') return <Badge variant="warning" dot>Pendientes</Badge>;
        return <Badge variant="danger" dot>Atrasado</Badge>;
      }
    },
    {
      key: 'status',
      header: 'Estado Pecuario',
      render: (a) => (
        <Badge variant={a.status === 'activo' ? 'neutral' : 'danger'}>{a.status}</Badge>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in">
        <PageHeader 
          title="Inventario Pecuario"
          description="Visualiza el registro completo de animales, filtra por especies y monitorea el estado de salud, vacunación y mortalidad."
          icon={Beef}
          actions={
            <button className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
              <Plus size={18} />
              <span>Registrar Animal</span>
            </button>
          }
        />

        {/* Panel de Filtros / KPIs Rápidos */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[1.5rem] shadow-sm border border-black/5">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Filter size={20} />
            </div>
            <select 
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="bg-gray-50 border border-black/5 rounded-xl px-4 py-2 font-bold text-gray-700 outline-none focus:border-[var(--brand)] transition-colors min-w-[200px]"
            >
              {speciesOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'Todas' ? 'Todas las especies' : opt}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-6 px-4 w-full lg:w-auto overflow-x-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Total Mostrados</span>
              <span className="text-xl font-black text-gray-900 leading-none mt-1">{filteredAnimals.length}</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                Tasa Mortalidad (30d) <Activity size={12} className="text-red-400" />
              </span>
              <span className="text-xl font-black text-red-500 leading-none mt-1">1.2%</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                Vacunas Pendientes
              </span>
              <span className="text-xl font-black text-orange-500 leading-none mt-1">
                {mockAnimals.filter(a => a.vaccination_status !== 'al_dia').length}
              </span>
            </div>
          </div>
        </div>

        <DataTable 
          columns={columns}
          data={filteredAnimals}
          keyExtractor={(a) => a.id}
          onRowClick={(a) => router.push(`/dashboard/animales/${a.id}`)}
          emptyMessage="No se encontraron animales para esta selección."
        />
      </div>
    </RoleGuard>
  );
}
