import { IAnimalRepository } from '../IAnimalRepository';
import { 
  Animal, 
  AnimalWithRelations, 
  CreateAnimalDTO, 
  Species, 
  Breed 
} from '@/types/domain/animal.schema';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  toDbHealthStatus,
  toDbReproductiveStatus,
  toDbVaccinationStatus,
  type DbAnimalOrigin,
} from '@/lib/animals-db-map';

function todayLocalISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function normalizeWeightKg(value: unknown, fallback: number): number {
  const v = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(v) || v < 0.1) return fallback;
  return Math.round(v * 1000) / 1000;
}

export class SupabaseAnimalRepository implements IAnimalRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<AnimalWithRelations[]> {
    const { data, error } = await this.supabase
      .from('animals')
      .select(`
        *,
        species:species_id (*),
        breed:breed_id (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener animales: ${error.message}`);
    }

    return data as AnimalWithRelations[];
  }

  async getById(id: string): Promise<AnimalWithRelations | null> {
    const { data, error } = await this.supabase
      .from('animals')
      .select(`
        *,
        species:species_id (*),
        breed:breed_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw new Error(`Error al obtener el animal: ${error.message}`);
    }

    return data as AnimalWithRelations;
  }

  async create(payload: CreateAnimalDTO): Promise<Animal> {
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Debes iniciar sesión para registrar un animal.');
    }

    const { data: speciesRow, error: speciesError } = await this.supabase
      .from('species')
      .select('id')
      .eq('id', payload.species_id)
      .single();

    if (speciesError || !speciesRow) {
      throw new Error('Especie no encontrada o error de base de datos.');
    }

    const origin: DbAnimalOrigin = payload.origin ?? 'adquirido_externo';

    let birthDate = payload.birth_date?.trim() || null;
    let acquisitionDate = payload.acquisition_date?.trim() || null;
    if (!birthDate && !acquisitionDate) {
      acquisitionDate = todayLocalISODate();
    }
    if (origin === 'nacido_en_finca' && !birthDate) {
      throw new Error(
        'Para animales nacidos en la finca debes indicar la fecha de nacimiento.'
      );
    }

    const initialWeight = normalizeWeightKg(payload.initial_weight_kg, 0.1);
    const currentRaw = payload.current_weight_kg;
    const currentWeight =
      currentRaw !== undefined && currentRaw !== null && String(currentRaw).trim() !== ''
        ? normalizeWeightKg(currentRaw, initialWeight)
        : initialWeight;

    const breedId =
      payload.breed_id && String(payload.breed_id).trim() !== ''
        ? payload.breed_id
        : null;

    const nameTrim = payload.name?.trim();
    const notesTrim = payload.notes?.trim();
    const noteLines: string[] = [];
    if (nameTrim) noteLines.push(`Apodo: ${nameTrim}`);
    if (notesTrim) noteLines.push(notesTrim);
    const combinedNotes = noteLines.length ? noteLines.join('\n\n') : null;

    const animalToInsert: Record<string, unknown> = {
      species_id: payload.species_id,
      breed_id: breedId,
      sex: payload.sex,
      birth_date: birthDate,
      acquisition_date: acquisitionDate,
      origin,
      initial_weight_kg: initialWeight,
      current_weight_kg: currentWeight,
      status: 'activo',
      health_status: toDbHealthStatus(payload.health_status),
      reproductive_status: toDbReproductiveStatus(
        payload.reproductive_status,
        payload.sex
      ),
      vaccination_status: toDbVaccinationStatus(payload.vaccination_status),
      mother_id: payload.mother_id ?? null,
      father_id: payload.father_id ?? null,
      father_external: payload.father_external?.trim() || null,
      notes: combinedNotes,
      registered_by: user.id,
    };

    const { data, error } = await this.supabase
      .from('animals')
      .insert(animalToInsert)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear el animal: ${error.message}`);
    }

    return data as Animal;
  }

  async update(id: string, payload: Partial<Animal>): Promise<Animal> {
    const { data, error } = await this.supabase
      .from('animals')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar el animal: ${error.message}`);
    }

    return data as Animal;
  }

  async changeStatus(id: string, newStatus: Animal['status'], notes?: string): Promise<Animal> {
    const updateData: Partial<Animal> = { status: newStatus };
    if (newStatus === 'descartado' || newStatus === 'vendido' || newStatus === 'muerto') {
      updateData.egress_date = new Date().toISOString();
      if (notes) updateData.egress_notes = notes;
    }

    return this.update(id, updateData);
  }

  async getSpecies(): Promise<Species[]> {
    const { data, error } = await this.supabase
      .from('species')
      .select('*')
      .order('name');

    if (error) throw new Error(`Error al obtener especies: ${error.message}`);
    return data as Species[];
  }

  async getBreedsBySpecies(speciesId: string): Promise<Breed[]> {
    const { data, error } = await this.supabase
      .from('breeds')
      .select('*')
      .eq('species_id', speciesId)
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Error al obtener razas: ${error.message}`);
    return data as Breed[];
  }

  async getMalesBySpecies(speciesId: string): Promise<AnimalWithRelations[]> {
    const { data, error } = await this.supabase
      .from('animals')
      .select(`
        *,
        species:species_id (*),
        breed:breed_id (*)
      `)
      .eq('species_id', speciesId)
      .eq('sex', 'macho')
      .eq('status', 'activo')
      .order('code');

    if (error) throw new Error(`Error al obtener machos: ${error.message}`);
    return data as AnimalWithRelations[];
  }
}
