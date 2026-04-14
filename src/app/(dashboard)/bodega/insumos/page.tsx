import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Boxes } from 'lucide-react';
import SupplyManager from './SupplyManager';

export const metadata = { title: 'Gestión de Insumos' };

export default function InsumosPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Insumos y Bodega"
        description="Gestione el inventario de alimentos, medicamentos y equipos."
        icon={Boxes}
      />
      <div className="mt-8">
        <SupplyManager />
      </div>
    </div>
  );
}
