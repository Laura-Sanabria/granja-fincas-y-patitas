'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { CreateFeedingDTO } from '@/types/domain/feeding.schema';
import { createClient } from '@/utils/supabase/client';
import { SupabaseFeedingRepository } from '@/repositories/supabase/FeedingRepository';
import { SupabaseInventoryRepository, Supply } from '@/repositories/supabase/InventoryRepository';
import { Loader2 } from 'lucide-react';

interface FeedingModalProps {
  isOpen: boolean;
  animalId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FeedingModal({ isOpen, animalId, onClose, onSuccess }: FeedingModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingSupplies, setFetchingSupplies] = useState(true);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  
  const [feedingRepo] = useState(() => new SupabaseFeedingRepository(createClient()));
  const [inventoryRepo] = useState(() => new SupabaseInventoryRepository(createClient()));

  const [formData, setFormData] = useState<Partial<CreateFeedingDTO>>({
    quantity: 1,
  });

  useEffect(() => {
    if (isOpen) {
      loadSupplies();
    }
  }, [isOpen]);

  const loadSupplies = async () => {
    try {
      setFetchingSupplies(true);
      const data = await inventoryRepo.getFoodSupplies();
      setSupplies(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, supply_id: data[0].id }));
      }
    } catch (error) {
      console.error("Error al cargar insumos:", error);
    } finally {
      setFetchingSupplies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!formData.supply_id || !formData.quantity) {
        throw new Error("Producto y cantidad son obligatorios");
      }

      await feedingRepo.addFeeding({
        animal_id: animalId,
        supply_id: formData.supply_id,
        quantity: Number(formData.quantity.toString()),
        notes: formData.notes,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Error: ${error.message}. ¿Ejecutaste el RPC en la base de datos?`);
    } finally {
      setLoading(false);
    }
  };

  const selectedSupply = supplies.find(s => s.id === formData.supply_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Alimentación" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {fetchingSupplies ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--brand)]" /></div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Insumo / Alimento</label>
              <select 
                required
                value={formData.supply_id || ''} 
                onChange={e => setFormData({...formData, supply_id: e.target.value})}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
              >
                {supplies.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Stock: {s.current_stock} {s.unit})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Cantidad a Suministrar</label>
                <div className="relative">
                  <input 
                    type="number" step="0.01" required
                    value={formData.quantity || ''}
                    onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">
                    {selectedSupply?.unit || 'uds'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <p className="text-[10px] text-gray-400 font-bold uppercase italic">* El stock bajará automáticamente</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Notas / Observaciones</label>
              <input 
                type="text"
                value={formData.notes || ''}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Ej. Suministrado en corral 3"
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
          <button type="submit" disabled={loading || fetchingSupplies} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-70">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Guardar Registro
          </button>
        </div>
      </form>
    </Modal>
  );
}
