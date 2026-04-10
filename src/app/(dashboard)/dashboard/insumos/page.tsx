'use client';

import React, { useState } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { PackageSearch, Plus, AlertCircle } from 'lucide-react';
import { mockSupplies, MockSupply } from '@/lib/mock-data';

export default function InsumosPage() {
  const [supplies, setSupplies] = useState<MockSupply[]>(mockSupplies);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: Column<MockSupply>[] = [
    {
      key: 'name',
      header: 'Insumo',
      render: (s) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900">{s.name}</span>
          <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider">{s.code}</span>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (s) => <span className="font-bold text-gray-500 uppercase text-[10px] tracking-widest">{s.category}</span>
    },
    {
      key: 'stock',
      header: 'Inventario Actual',
      render: (s) => {
        const isLowStock = s.current_stock <= s.min_stock;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-black text-lg ${isLowStock ? 'text-red-500' : 'text-gray-900'}`}>
              {s.current_stock.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-gray-400">{s.unit}</span>
            {isLowStock && <AlertCircle size={14} className="text-red-500 ml-1" />}
          </div>
        );
      }
    },
    {
      key: 'price',
      header: 'Precio Unit.',
      render: (s) => <span className="font-medium text-gray-600">${s.unit_price.toFixed(2)}</span>
    },
    {
      key: 'expiry',
      header: 'Vencimiento',
      render: (s) => {
        // Lógica simple para alertas de vencimiento
        const expiry = new Date(s.expiry_date);
        const today = new Date();
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let variant: 'success' | 'warning' | 'danger' = 'success';
        if (diffDays <= 30) variant = 'danger';
        else if (diffDays <= 90) variant = 'warning';

        return <Badge variant={variant} dot>{s.expiry_date}</Badge>;
      }
    }
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in">
        <PageHeader 
          title="Gestión de Insumos"
          description="Controla el inventario de alimentos, medicamentos y suministros. Mantén el registro actualizado para evitar desabastecimiento."
          icon={PackageSearch}
          actions={
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              <Plus size={18} />
              <span>Nuevo Insumo</span>
            </button>
          }
        />

        <DataTable 
          columns={columns}
          data={supplies}
          keyExtractor={(s) => s.id}
        />

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Registrar Insumo"
          maxWidth="max-w-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Nombre del Insumo</label>
              <input type="text" className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none" placeholder="Ej. Alimento Premium Mixto" />
            </div>
            
             <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Categoría</label>
              <select className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[var(--brand)] outline-none">
                <option value="Alimento">Alimento</option>
                <option value="Medicamento">Medicamento</option>
                <option value="Suplemento">Suplemento</option>
                <option value="Herramienta">Herramienta</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Código o Lote</label>
              <input type="text" className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none" placeholder="INS-000" />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Stock Inicial</label>
              <input type="number" className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none" placeholder="0" />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Stock Mínimo (Alerta)</label>
              <input type="number" className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none" placeholder="0" />
            </div>
            
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Unidad de Medida</label>
              <input type="text" className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none" placeholder="kg, dosis, litros..." />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Fecha Vencimiento</label>
              <input type="date" className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none" />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button className="px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm">Guardar Insumo</button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
