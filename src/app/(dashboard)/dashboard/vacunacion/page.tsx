'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Syringe, Plus, Pencil, Trash2, Loader2, ChevronDown, AlertTriangle, X, Syringe as SyringeIcon } from 'lucide-react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/utils/supabase/client';
import { SupabaseHealthRepository } from '@/repositories/supabase/HealthRepository';
import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository';
import type { VaccineScheme, CreateVaccineSchemeInput } from '@/types/domain/health.schema';
import type { Species } from '@/types/domain/animal.schema';
import MassVaccinationModal from '@/components/animales/MassVaccinationModal';

type ModalMode = 'create' | 'edit';

const EMPTY_FORM: CreateVaccineSchemeInput = {
  species_id: null,
  vaccine_name: '',
  disease_target: '',
  apply_at_age_days: null,
  revaccinate_every_days: null,
  is_mandatory: true,
  notes: null,
};

export default function VacunacionPage() {
  const [schemes, setSchemes] = useState<VaccineScheme[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [filterSpeciesId, setFilterSpeciesId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateVaccineSchemeInput>(EMPTY_FORM);
  const [massVaccineOpen, setMassVaccineOpen] = useState(false);

  const [healthRepo] = useState(() => new SupabaseHealthRepository(createClient()));
  const [animalRepo] = useState(() => new SupabaseAnimalRepository(createClient()));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [schemesData, speciesData] = await Promise.all([
        healthRepo.getVaccineSchemes(filterSpeciesId || undefined),
        animalRepo.getSpecies(),
      ]);
      setSchemes(schemesData);
      setSpecies(speciesData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar esquemas');
    } finally {
      setLoading(false);
    }
  }, [healthRepo, animalRepo, filterSpeciesId]);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setModalMode('create');
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (scheme: VaccineScheme) => {
    setModalMode('edit');
    setEditingId(scheme.id);
    setForm({
      species_id: scheme.species_id ?? null,
      vaccine_name: scheme.vaccine_name,
      disease_target: scheme.disease_target,
      apply_at_age_days: scheme.apply_at_age_days ?? null,
      revaccinate_every_days: scheme.revaccinate_every_days ?? null,
      is_mandatory: scheme.is_mandatory,
      notes: scheme.notes ?? null,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await healthRepo.createVaccineScheme(form);
      } else if (editingId) {
        await healthRepo.updateVaccineScheme(editingId, form);
      }
      setModalOpen(false);
      void loadData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este esquema? No se eliminarán los registros históricos ya aplicados.')) return;
    try {
      await healthRepo.deleteVaccineScheme(id);
      void loadData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    }
  };

  const getSpeciesName = (speciesId: string | null | undefined) => {
    if (!speciesId) return 'Todas las especies';
    return species.find((s) => s.id === speciesId)?.display_name ?? '—';
  };

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR', 'ENCARGADO']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in pb-10">
        <PageHeader
          title="Esquemas de Vacunación"
          description="Define las reglas de vacunación para cada especie. Estos esquemas se usarán en el modal de registro para autocompletar fechas y nombres."
          icon={Syringe}
          actions={
            <div className="flex gap-2">
              <button
                onClick={() => setMassVaccineOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/5 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
              >
                <SyringeIcon size={16} className="text-emerald-500" />
                Aplicar Vacuna
              </button>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--brand)] text-white rounded-xl font-bold text-sm hover:bg-[var(--brand-hover)] shadow-sm transition-all"
              >
                <Plus size={16} />
                Nuevo Esquema
              </button>
            </div>
          }
        />

        {/* Filtro por especie */}
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
            Filtrar por especie
          </label>
          <div className="relative">
            <select
              value={filterSpeciesId}
              onChange={(e) => setFilterSpeciesId(e.target.value)}
              className="appearance-none bg-white border border-black/5 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)] pr-8 shadow-sm"
            >
              <option value="">Todas</option>
              {species.map((s) => (
                <option key={s.id} value={s.id}>{s.display_name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Tabla de esquemas */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-extrabold text-gray-900">Esquemas Registrados</h3>
            <Badge variant="neutral">{schemes.length} esquemas</Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
            </div>
          ) : schemes.length === 0 ? (
            <div className="py-20 text-center">
              <Syringe className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="font-bold text-gray-400">No hay esquemas registrados aún.</p>
              <p className="text-sm text-gray-300 mt-1">Crea el primero con el botón &quot;Nuevo Esquema&quot;</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <th className="px-6 py-4">Vacuna</th>
                    <th className="px-6 py-4">Especie</th>
                    <th className="px-6 py-4">Enfermedad Objetivo</th>
                    <th className="px-6 py-4">Primera Dosis</th>
                    <th className="px-6 py-4">Refuerzo</th>
                    <th className="px-6 py-4">Obligatoria</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {schemes.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-black text-gray-900">{s.vaccine_name}</td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral">{getSpeciesName(s.species_id)}</Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600">{s.disease_target}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-500">
                        {s.apply_at_age_days ? `A los ${s.apply_at_age_days} días` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-500">
                        {s.revaccinate_every_days ? `Cada ${s.revaccinate_every_days} días` : 'Única vez'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={s.is_mandatory ? 'danger' : 'neutral'}>
                          {s.is_mandatory ? 'Sí' : 'No'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(s)}
                            className="p-2 rounded-xl hover:bg-[var(--brand)]/10 text-gray-400 hover:text-[var(--brand)] transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Esquema */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Syringe className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-black text-gray-900">
                  {modalMode === 'create' ? 'Nuevo Esquema' : 'Editar Esquema'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Especie */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                  Especie
                </label>
                <div className="relative">
                  <select
                    value={form.species_id ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, species_id: e.target.value || null }))}
                    className="w-full appearance-none bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)] pr-10"
                  >
                    <option value="">Todas las especies</option>
                    {species.map((s) => (
                      <option key={s.id} value={s.id}>{s.display_name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Nombre vacuna */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                  Nombre de la Vacuna *
                </label>
                <input
                  type="text"
                  value={form.vaccine_name}
                  onChange={(e) => setForm((f) => ({ ...f, vaccine_name: e.target.value }))}
                  placeholder="Ej: Fiebre Aftosa, Newcastle..."
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
                  required
                />
              </div>

              {/* Enfermedad objetivo */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                  Enfermedad Objetivo *
                </label>
                <input
                  type="text"
                  value={form.disease_target}
                  onChange={(e) => setForm((f) => ({ ...f, disease_target: e.target.value }))}
                  placeholder="Ej: Aftosa, Brucelosis..."
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
                  required
                />
              </div>

              {/* Días primera dosis + Refuerzo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                    Primera Dosis (días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.apply_at_age_days ?? ''}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      apply_at_age_days: e.target.value ? parseInt(e.target.value) : null,
                    }))}
                    placeholder="Edad (días)"
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                    Refuerzo (días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.revaccinate_every_days ?? ''}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      revaccinate_every_days: e.target.value ? parseInt(e.target.value) : null,
                    }))}
                    placeholder="Cada N días"
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              {/* Obligatoria */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_mandatory"
                  checked={form.is_mandatory}
                  onChange={(e) => setForm((f) => ({ ...f, is_mandatory: e.target.checked }))}
                  className="h-4 w-4 accent-[var(--brand)] rounded"
                />
                <label htmlFor="is_mandatory" className="text-sm font-bold text-gray-700">
                  Vacuna obligatoria
                </label>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                  Notas
                </label>
                <textarea
                  value={form.notes ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
                  rows={2}
                  placeholder="Observaciones del protocolo..."
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)] resize-none"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm font-bold text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-black/10 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[var(--brand)] text-white font-bold text-sm hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {saving ? 'Guardando...' : modalMode === 'create' ? 'Crear Esquema' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MassVaccinationModal
        isOpen={massVaccineOpen}
        onClose={() => setMassVaccineOpen(false)}
        onSuccess={() => setMassVaccineOpen(false)}
      />
    </RoleGuard>
  );
}
