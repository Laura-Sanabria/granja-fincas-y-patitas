'use client';

import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Milk,
  Egg,
  Beef,
  PackageSearch
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { mockAnimals, mockSupplies, mockProduction, mockAlerts } from '@/lib/mock-data';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Calcular KPIs basados en los datos mock
  const totalAnimals = mockAnimals.length;
  const criticalAlerts = mockAlerts.filter(a => a.level === 'critica').length;
  const lowStockSupplies = mockSupplies.filter(s => s.current_stock <= s.min_stock).length;
  
  const latestProduction = mockProduction[mockProduction.length - 1] || { milk_liters: 0, egg_units: 0 };

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {/* 1. Cabecera */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
            Panel de Administración
          </h1>
          <p className="mt-4 text-gray-500 font-medium max-w-2xl leading-relaxed">
            Bienvenido, {user?.full_name || 'Administrador'}. Tienes {criticalAlerts} alertas críticas y la producción del último mes fue de {latestProduction.milk_liters.toLocaleString()} L de leche.
          </p>
        </div>
      </div>

      {/* 2. Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Animales"
          value={totalAnimals.toLocaleString()}
          icon={Beef}
          color="brand"
          href="/dashboard/animales"
        />
        
        <StatCard 
          title="Insumos Bajos"
          value={lowStockSupplies}
          icon={PackageSearch}
          color="orange"
          href="/dashboard/insumos"
        />
        
        <StatCard 
          title="Alertas Activas"
          value={mockAlerts.length}
          subtitle={`${criticalAlerts} críticas`}
          icon={AlertTriangle}
          color="red"
          href="/dashboard/alertas"
        />
        
        <StatCard 
          title="Producción de Leche"
          value={`${latestProduction.milk_liters.toLocaleString()} L`}
          icon={Milk}
          color="blue"
          trend={{ value: '5%', positive: true }}
          href="/dashboard/produccion"
        />
      </div>

      {/* 3. Accesos Rápidos */}
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-6">Módulos del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/dashboard/usuarios" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Personal y Usuarios</h4>
            <p className="text-sm text-gray-500 mt-2">Gestiona el acceso al sistema, roles y asignación de tareas a empleados.</p>
          </a>
          
          <a href="/dashboard/animales" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-[#E4EFE4]/60 flex items-center justify-center text-[var(--brand)] mb-4 group-hover:scale-110 transition-transform">
              <Beef size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Inventario Pecuario</h4>
            <p className="text-sm text-gray-500 mt-2">Accede al registro completo de animales, estados de salud y encargados.</p>
          </a>
          
          <a href="/dashboard/produccion" className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:border-[var(--brand)] transition-colors group">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Métricas de Producción</h4>
            <p className="text-sm text-gray-500 mt-2">Visualiza el rendimiento de producción de leche y huevos con gráficos mensuales.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
