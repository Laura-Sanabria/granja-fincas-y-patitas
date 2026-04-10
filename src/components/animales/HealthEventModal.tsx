'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { CreateHealthEventDTO, HealthEventTypeEnum, RecoveryStatusEnum } from '@/types/domain/health.schema';
import { createClient } from '@/utils/supabase/client';
import { SupabaseHealthRepository } from '@/repositories/supabase/HealthRepository';
import { Loader2 } from 'lucide-react';

interface HealthEventModalProps {
  isOpen: boolean;
  animalId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HealthEventModal({ isOpen, animalId, onClose, onSuccess }: HealthEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [repo] = useState(() => new SupabaseHealthRepository(createClient()));

  const [formData, setFormData] = useState<Partial<CreateHealthEventDTO>>({
    event_type: 'enfermedad',
    detected_at: new Date().toISOString().split('T')[0],
    recovery_status: 'en_tratamiento',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!formData.description) throw new Error("La descripción es obligatoria");

      await repo.addEvent({
        animal_id: animalId,
        event_type: formData.event_type as any,
        detected_at: formData.detected_at!,
        description: formData.description!,
        diagnosis: formData.diagnosis,
        recovery_status: formData.recovery_status as any,
        notes: formData.notes,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Error al registrar evento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Evento de Salud" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Tipo de Evento</label>
            <select 
              required
              value={formData.event_type} 
              onChange={e => setFormData({...formData, event_type: e.target.value as any})}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="enfermedad">Enfermedad</option>
              <option value="accidente">Accidente</option>
              <option value="lesion">Lesión</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Fecha de Detección</label>
            <input 
              type="date" required
              value={formData.detected_at}
              onChange={e => setFormData({...formData, detected_at: e.target.value})}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Descripción del Problema</label>
          <textarea 
            required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Ej. Cojera en pata trasera derecha"
            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Estado de Recuperación</label>
            <select 
              value={formData.recovery_status} 
              onChange={e => setFormData({...formData, recovery_status: e.target.value as any})}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
            >
              <option value="en_tratamiento">En tratamiento</option>
              <option value="recuperado">Recuperado</option>
              <option value="cronico">Crónico</option>
              <option value="fallecido">Fallecido</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Diagnóstico (Opcional)</label>
            <input 
              type="text"
              value={formData.diagnosis || ''}
              onChange={e => setFormData({...formData, diagnosis: e.target.value})}
              placeholder="Ej. Infección pezuña"
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-70">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Registrar Evento
          </button>
        </div>
      </form>
    </Modal>
  );
}
