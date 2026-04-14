'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { createClient } from '@/utils/supabase/client';
import { SupabaseReproductionRepository } from '@/repositories/supabase/ReproductionRepository';
import type {
  GestationStatus,
  ReproductiveEventWithRelations,
  UpdateReproductiveEventDTO,
} from '@/types/domain/reproduction.schema';
import { Loader2 } from 'lucide-react';

interface ReproductionStatusModalProps {
  isOpen: boolean;
  event: ReproductiveEventWithRelations | null;
  onClose: () => void;
  onSuccess: () => void;
}

function crossTitle(ev: ReproductiveEventWithRelations) {
  const f = ev.female_animal?.name?.trim() || ev.female_animal?.code || 'Hembra';
  const m = ev.male_animal
    ? ev.male_animal.name?.trim() || ev.male_animal.code
    : ev.male_external?.trim() || '—';
  return `${f} × ${m}`;
}

export default function ReproductionStatusModal({
  isOpen,
  event,
  onClose,
  onSuccess,
}: ReproductionStatusModalProps) {
  const [repo] = useState(() => new SupabaseReproductionRepository(createClient()));
  const [loading, setLoading] = useState(false);
  const [gestationStatus, setGestationStatus] = useState<GestationStatus>('en_seguimiento');
  const [failureReason, setFailureReason] = useState('');
  const [actualBirthDate, setActualBirthDate] = useState('');
  const [estimatedBirthDate, setEstimatedBirthDate] = useState('');

  useEffect(() => {
    if (!event) return;
    setGestationStatus(event.gestation_status);
    setFailureReason(event.failure_reason ?? '');
    setActualBirthDate(event.actual_birth_date?.slice(0, 10) ?? '');
    setEstimatedBirthDate(event.estimated_birth_date?.slice(0, 10) ?? '');
  }, [event]);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: UpdateReproductiveEventDTO = {
        gestation_status: gestationStatus,
        failure_reason: gestationStatus === 'fallida' ? failureReason.trim() || null : null,
        actual_birth_date:
          gestationStatus === 'parto_exitoso'
            ? actualBirthDate.trim() || null
            : undefined,
        estimated_birth_date:
          estimatedBirthDate !== (event.estimated_birth_date?.slice(0, 10) ?? '')
            ? estimatedBirthDate.trim() || null
            : undefined,
      };

      if (gestationStatus === 'parto_exitoso' && !payload.actual_birth_date) {
        throw new Error('Indique la fecha real de parto para cerrar como parto exitoso.');
      }

      await repo.update(event.id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Actualizar gestación" maxWidth="max-w-lg">
      <div className="mb-5 rounded-xl bg-gray-50 border border-black/5 px-4 py-3">
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Evento</p>
        <p className="font-black text-gray-900">{crossTitle(event)}</p>
        <p className="text-xs text-gray-500 mt-1">
          Fecha del cruce: {event.event_date} · Tipo:{' '}
          {event.event_type === 'monta_natural' ? 'Monta natural' : 'Inseminación artificial'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
            Estado de gestación *
          </label>
          <select
            value={gestationStatus}
            onChange={(e) => setGestationStatus(e.target.value as GestationStatus)}
            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
          >
            <option value="en_seguimiento">En seguimiento</option>
            <option value="confirmada">Confirmada</option>
            <option value="fallida">Fallida</option>
            <option value="parto_exitoso">Parto exitoso</option>
          </select>
        </div>

        {gestationStatus === 'fallida' && (
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Motivo del fallo
            </label>
            <textarea
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>
        )}

        {gestationStatus === 'parto_exitoso' && (
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Fecha real de parto *
            </label>
            <input
              type="date"
              required
              value={actualBirthDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setActualBirthDate(e.target.value)}
              className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">
            Parto estimado (opcional)
          </label>
          <input
            type="date"
            value={estimatedBirthDate}
            onChange={(e) => setEstimatedBirthDate(e.target.value)}
            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Si tu base calcula esta fecha con un trigger, solo ajústala cuando haga falta.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors shadow-sm disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}
