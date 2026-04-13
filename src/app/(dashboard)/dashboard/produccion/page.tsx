<<<<<<< HEAD
import React from 'react';
import Link from 'next/link';
import { Milk, EggFried, Activity, TrendingUp } from 'lucide-react';

export default function ProductionHubPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Módulo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[var(--brand)]">Producción</span>
        </h1>
        <p className="text-gray-500 font-medium max-w-2xl text-lg">
          Registra y monitorea el rendimiento diario de tus productos terminados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {/* Leche Card */}
        <Link href="/dashboard/produccion/leche" className="group rounded-3xl bg-white border border-gray-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors" />
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-6 group-hover:scale-110 transition-transform">
              <Milk className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Producción <br/>Lechera</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
              Registra los litros individuales por vaca en sus respectivos turnos de ordeño.
            </p>
            <div className="flex items-center text-blue-600 font-bold text-sm tracking-wide gap-2 group-hover:translate-x-1 transition-transform">
              Ir al Registro <Activity className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Huevos Card */}
        <Link href="/dashboard/produccion/huevos" className="group rounded-3xl bg-white border border-gray-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-50 rounded-full blur-3xl group-hover:bg-amber-100 transition-colors" />
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 mb-6 group-hover:scale-110 transition-transform">
              <EggFried className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Producción <br/>Avícola</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
              Captura las cubetas y unidades de huevos por lotes, incluyendo desglose de daños.
            </p>
            <div className="flex items-center text-amber-600 font-bold text-sm tracking-wide gap-2 group-hover:translate-x-1 transition-transform">
              Ir al Registro <Activity className="w-4 h-4" />
            </div>
          </div>
        </Link>
        
        {/* Reportes Card */}
        <div className="group rounded-3xl bg-gray-50 border border-gray-100 border-dashed p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="relative h-full flex flex-col opacity-60 grayscale cursor-not-allowed">
            <div className="w-14 h-14 bg-gray-300 rounded-2xl flex items-center justify-center text-gray-500 mb-6">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reportes <br/>Consolidados</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
              Gráficas y balances de la eficiencia productiva de la granja. Próximamente (Fase 6).
            </p>
          </div>
          <div className="absolute top-6 right-6 bg-gray-200 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            En Desarrollo
          </div>
        </div>
      </div>
    </div>
=======
'use client';

import React from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import { EggFried, Milk, TrendingUp } from 'lucide-react';
import { mockProduction } from '@/lib/mock-data';
import BarChart from '@/components/ui/BarChart';

export default function ProduccionPage() {
  const chartDataMilk = mockProduction.map(d => ({
    label: d.month,
    value: d.milk_liters
  }));

  const chartDataEggs = mockProduction.map(d => ({
    label: d.month,
    value: d.egg_units
  }));

  const totalMilk = mockProduction.reduce((sum, d) => sum + d.milk_liters, 0);
  const totalEggs = mockProduction.reduce((sum, d) => sum + d.egg_units, 0);

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in pb-10">
        <PageHeader 
          title="Métricas de Producción"
          description="Visualiza el rendimiento de producción de la granja a lo largo del año. Analiza las tendencias para tomar decisiones informadas."
          icon={TrendingUp}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Total Leche (Año Vidente)</p>
              <h3 className="text-4xl font-black text-gray-900">{totalMilk.toLocaleString()} <span className="text-xl text-gray-400 font-bold">L</span></h3>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Milk size={32} />
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Total Huevos (Año Vidente)</p>
              <h3 className="text-4xl font-black text-gray-900">{totalEggs.toLocaleString()} <span className="text-xl text-gray-400 font-bold">Ud</span></h3>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
              <EggFried size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5">
          <h3 className="text-xl font-black text-gray-900 mb-8">Comparativa de Producción</h3>
          
          <BarChart 
            data={chartDataMilk} 
            secondaryData={chartDataEggs} 
            height={400} 
            legend={{ primary: 'Leche (Litros)', secondary: 'Huevos (Unidades)' }}
          />
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5">
          <h3 className="text-xl font-black text-gray-900 mb-6">Detalle Mensual</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-extrabold text-gray-400">Mes</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-extrabold text-gray-400 text-right">Producción Leche (L)</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-extrabold text-gray-400 text-right">Producción Huevos (Ud)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockProduction.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-700">{d.month}</td>
                    <td className="px-6 py-4 font-black text-[var(--brand)] text-right">{d.milk_liters.toLocaleString()}</td>
                    <td className="px-6 py-4 font-black text-orange-500 text-right">{d.egg_units.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </RoleGuard>
>>>>>>> origin/develop
  );
}
