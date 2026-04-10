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
  );
}
