'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/RoleGuard';
import { ArrowLeft, Activity, WeighingMachine, UserCheck, Heart, Calendar } from 'lucide-react';
import { mockAnimals, MockAnimal } from '@/lib/mock-data';
import Badge from '@/components/ui/Badge';
import BarChart from '@/components/ui/BarChart';

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const animal = useMemo(() => mockAnimals.find(a => a.id === id), [id]);

  if (!animal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-black text-gray-800">Animal no encontrado</h2>
        <button onClick={() => router.back()} className="text-[var(--brand)] font-bold">Volver al listado</button>
      </div>
    );
  }

  // Prepara datos para el gráfico de producción si existe
  const chartData = animal.production_data
    ? animal.production_data.map(d => ({ label: d.month, value: d.value }))
    : [];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']} redirectPath="/acceso-denegado">
      <div className="space-y-8 animate-fade-in pb-10">
        
        {/* Cabecera / Navegación */}
        <div className="flex items-center gap-4 border-b border-black/5 pb-6">
          <button 
            onClick={() => router.back()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 border border-black/5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-none">{animal.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="neutral">{animal.code}</Badge>
              <span className="text-sm font-bold text-gray-400">•</span>
              <span className="text-sm font-bold text-gray-500">{animal.species_name} - {animal.breed} ({animal.sex})</span>
            </div>
          </div>
        </div>

        {/* Tarjetas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#E4EFE4]/60 flex items-center justify-center text-[var(--brand)]">
              <WeighingMachine size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Peso Actual</span>
              <span className="text-2xl font-black text-gray-900">{animal.current_weight_kg} kg</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <UserCheck size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Encargado Asignado</span>
              <span className="text-xl font-black text-gray-900 truncate" title={animal.encargado || 'Sin asignar'}>
                {animal.encargado || 'Sin asignar'}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <Heart size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Estado de Salud</span>
              <span className="text-lg font-black text-gray-900 capitalize mt-1">
                <Badge variant={animal.health_status === 'sano' ? 'success' : 'warning'}>{animal.health_status.replace('_', ' ')}</Badge>
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Calendar size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">F. Nacimiento</span>
              <span className="text-lg font-black text-gray-900">{animal.birth_date}</span>
            </div>
          </div>
        </div>

        {/* Zona Inferior: Gráfico y Detalles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Activity size={24} className="text-[var(--brand)]" />
                Historial de Producción
              </h3>
              {chartData.length > 0 && (
                <span className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1.5 rounded-full">Últimos 6 meses</span>
              )}
            </div>
            
            {chartData.length > 0 ? (
              <div className="pt-4">
                <BarChart data={chartData} height={280} />
                <p className="text-xs font-medium text-gray-400 text-center mt-6">
                  Producción expresada en {animal.species_name === 'Gallina' ? 'unidades (huevos)' : 'litros (leche)'}
                </p>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
                <Activity size={32} className="text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-400">Sin datos de producción registrados</p>
                <p className="text-xs text-gray-400">Este animal no está categorizado como productivo o es muy joven.</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5 flex flex-col gap-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              Información Adicional
            </h3>
            
            <div className="flex flex-col gap-1 pb-4 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID Sistema</span>
              <span className="text-sm font-medium text-gray-700 font-mono break-all">{animal.id}</span>
            </div>
            
            <div className="flex flex-col gap-1 pb-4 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado de Vacunación</span>
              <div className="mt-1">
                 {animal.vaccination_status === 'al_dia' ? <Badge variant="success">Plan completo</Badge> : <Badge variant="danger">Requiere atención</Badge>}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado Comercial</span>
              <div className="mt-1">
                <Badge variant={animal.status === 'activo' ? 'neutral' : 'danger'}>{animal.status.toUpperCase()}</Badge>
              </div>
            </div>
          </div>
        </div>

      </div>
    </RoleGuard>
  );
}
