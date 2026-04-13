import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { PackageSearch, Boxes, ListTree, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Bodega e Insumos',
};

export default function BodegaPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bodega e Insumos"
        description="Gestión integral de inventarios, medicamentos, alimentos y alertas de stock."
        icon={PackageSearch}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Insumos Registrados" 
          value="Gestionar" 
          subtitle="Ver y actualizar inventario" 
          icon={Boxes} 
          href="/bodega/insumos" 
          color="brand"
        />
        <StatCard 
          title="Categorías" 
          value="Configurar" 
          subtitle="Administrar tipos de insumos" 
          icon={ListTree} 
          href="/bodega/categorias" 
          color="blue"
        />
        <StatCard 
          title="Alertas de Stock" 
          value="Consultar" 
          subtitle="Próximos a vencer y agotados" 
          icon={AlertCircle} 
          href="/bodega/insumos" 
          color="red"
        />
      </div>
    </div>
  );
}
