'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { PackageSearch, Plus, AlertCircle, Loader2 } from 'lucide-react';
import {
  SupabaseInventoryRepository,
  SupplyListRow,
  SupplyCategoryRow,
} from '@/repositories/supabase/InventoryRepository';
import { createClient } from '@/utils/supabase/client';

export default function InsumosPage() {
  const [repo] = useState(() => new SupabaseInventoryRepository(createClient()));
  const [supplies, setSupplies] = useState<SupplyListRow[]>([]);
  const [categories, setCategories] = useState<SupplyCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [unit, setUnit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [list, cats] = await Promise.all([repo.listSupplies(), repo.listSupplyCategories()]);
      setSupplies(list);
      setCategories(cats);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al cargar datos';
      setLoadError(msg);
      setSupplies([]);
    } finally {
      setLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const resetForm = () => {
    setName('');
    setBatchNumber('');
    setCurrentStock(0);
    setMinStock(0);
    setUnit('');
    setExpiryDate('');
    setFormError(null);
    setCategoryId((prev) => {
      if (categories.length > 0) return categories[0].id;
      return prev;
    });
  };

  useEffect(() => {
    if (isModalOpen && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [isModalOpen, categories, categoryId]);

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setSaving(true);
      if (!categoryId) throw new Error('Selecciona una categoría.');
      await repo.createSupply({
        name,
        category_id: categoryId,
        unit,
        current_stock: Number(currentStock),
        min_stock: Number(minStock),
        expiry_date: expiryDate.trim() || null,
        batch_number: batchNumber.trim() || null,
      });
      setIsModalOpen(false);
      resetForm();
      await loadAll();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<SupplyListRow>[] = [
    {
      key: 'name',
      header: 'Insumo',
      render: (s) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900">{s.name}</span>
          <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider">{s.code}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (s) => (
        <span className="font-bold text-gray-500 uppercase text-[10px] tracking-widest">
          {s.category_name}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Inventario actual',
      render: (s) => {
        const isLowStock = s.current_stock <= s.min_stock;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-black text-lg ${isLowStock ? 'text-red-500' : 'text-gray-900'}`}
            >
              {s.current_stock.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-gray-400">{s.unit}</span>
            {isLowStock && <AlertCircle size={14} className="text-red-500 ml-1" />}
          </div>
        );
      },
    },
    {
      key: 'price',
      header: 'Precio unit.',
      render: (s) => (
        <span className="font-medium text-gray-600">
          {s.unit_price != null ? `$${s.unit_price.toFixed(2)}` : '—'}
        </span>
      ),
    },
    {
      key: 'expiry',
      header: 'Vencimiento',
      render: (s) => {
        if (!s.expiry_date) {
          return <Badge variant="neutral">—</Badge>;
        }
        const expiry = new Date(s.expiry_date);
        const today = new Date();
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let variant: 'success' | 'warning' | 'danger' = 'success';
        if (diffDays <= 30) variant = 'danger';
        else if (diffDays <= 90) variant = 'warning';

        return (
          <Badge variant={variant} dot>
            {s.expiry_date}
          </Badge>
        );
      },
    },
  ];

  return (
    <RoleGuard
      allowedRoles={['ADMINISTRADOR', 'ENCARGADO']}
      redirectPath="/acceso-denegado"
    >
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Gestión de insumos"
          description="Controla el inventario de alimentos, medicamentos y suministros. Los altas quedan en bodega (M4) y el código se genera automáticamente."
          icon={PackageSearch}
          actions={
            <button
              type="button"
              onClick={handleOpenModal}
              className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              <Plus size={18} />
              <span>Nuevo insumo</span>
            </button>
          }
        />

        {loadError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--brand)]" />
          </div>
        ) : (
          <DataTable columns={columns} data={supplies} keyExtractor={(s) => s.id} />
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormError(null);
          }}
          title="Registrar insumo"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Nombre del insumo
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
                placeholder="Ej. Concentrado engorde"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Categoría
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[var(--brand)] outline-none"
                disabled={categories.length === 0}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-amber-700 mt-1 font-medium">
                  No hay categorías en la base. Ejecuta el SQL de planificación (supply_categories).
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Lote / referencia (opcional)
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
                placeholder="Ej. 51541"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Stock inicial
              </label>
              <input
                type="number"
                step="0.001"
                min={0}
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Stock mínimo (alerta)
              </label>
              <input
                type="number"
                step="0.001"
                min={0}
                required
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
              />
              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                Puede ser mayor que el stock inicial (solo dispara alerta visual).
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Unidad de medida
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
                placeholder="kg, sacos, dosis, litros…"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
                Fecha vencimiento
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--brand)] outline-none"
              />
              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                Obligatoria si la categoría es medicamento.
              </p>
            </div>

            {formError && (
              <div className="md:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                {formError}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError(null);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || categories.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-70"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Guardar insumo
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
