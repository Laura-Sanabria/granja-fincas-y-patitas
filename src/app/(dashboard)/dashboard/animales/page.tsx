'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Beef, Filter, Activity, Plus, Loader2 } from 'lucide-react';
import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository';
import { createClient } from '@/utils/supabase/client';
import { AnimalWithRelations } from '@/types/domain/animal.schema';
import { animalDisplayName } from '@/lib/animal-display';
import AnimalFormModal from '@/components/animales/AnimalFormModal';

export default function AnimalesPage() {
  const router = useRouter();
  const [filterSpecies, setFilterSpecies] = useState<string>('Todas');
  
  const [animals, setAnimals] = useState<AnimalWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [repo] = useState(() => new SupabaseAnimalRepository(createClient()));

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await repo.getAll();
      setAnimals(data);
    } catch (error) {
      console.error("Error cargando animales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const speciesOptions = ['Todas', ...Array.from(new Set(animals.map(a => a.species?.name).filter(Boolean)))];

  const filteredAnimals = useMemo(() => {
    if (filterSpecies === 'Todas') return animals;
    return animals.filter(a => a.species?.name === filterSpecies);
  }, [filterSpecies, animals]);

  const columns: Column<AnimalWithRelations>[] = [
    {
      key: 'name',
      header: 'Identificación',
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900">{animalDisplayName(a)}</span>
          <span className="text-xs font-bold text-[var(--brand)] font-mono">{a.code}</span>
        </div>
      )
    },
    {
      key: 'species',
      header: 'Especie / Raza',
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-700">{a.species?.display_name || 'Desconocida'}</span>
          <span className="text-xs font-medium text-gray-500">{a.breed?.name || 'Mestiza/Sin definir'}</span>
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
        if (!a.birth_date) {
          return <span className="text-xs text-gray-400">Sin registro</span>;
        }
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
        if (a.health_status === 'cronico') variant = 'warning';
        if (a.health_status === 'fallecido') variant = 'danger';

        return <Badge variant={variant} dot>{label}</Badge>;
      }
    },
    {
      key: 'vaccines',
      header: 'Vacunas',
      render: (a) => {
        if (a.vaccination_status === 'al_dia') return <Badge variant="success" dot>Al día</Badge>;
        if (a.vaccination_status === 'pendiente') return <Badge variant="warning" dot>Pendientes</Badge>;
        if (a.vaccination_status === 'vencido') return <Badge variant="danger" dot>Vencido</Badge>;
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
      <div className="space-y-6 animate-fade-in pb-10">
        <PageHeader 
          title="Inventario Pecuario"
          description="Visualiza el registro completo de animales, filtra por especies y monitorea el estado de salud, vacunación y mortalidad."
          icon={Beef}
          actions={
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
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
              <option value="Todas">Todas las especies</option>
              {speciesOptions.filter(opt => opt !== 'Todas').map(opt => (
                <option key={opt as string} value={opt as string}>{opt}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-6 px-4 w-full lg:w-auto overflow-x-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Total Registrados</span>
              <span className="text-xl font-black text-gray-900 leading-none mt-1">{filteredAnimals.length}</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                Tasa Mortalidad (30d) <Activity size={12} className="text-[var(--brand)] ml-1" />
              </span>
              <span className="text-xl font-black text-gray-900 leading-none mt-1">
                N/A
              </span>
            </div>
            <div className="w-[1px] h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                Vacunas Pendientes
              </span>
              <span className="text-xl font-black text-orange-500 leading-none mt-1">
                {animals.filter(a => a.vaccination_status !== 'al_dia' && a.status === 'activo').length}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-[var(--brand)] w-10 h-10" />
          </div>
        ) : (
          <DataTable 
            columns={columns}
            data={filteredAnimals}
            keyExtractor={(a) => a.id}
            onRowClick={(a) => router.push(`/dashboard/animales/${a.id}`)}
            emptyMessage="No se encontraron animales registrados."
          />
        )}

        <AnimalFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={loadData} 
        />
      </div>
    </RoleGuard>
  );
}
