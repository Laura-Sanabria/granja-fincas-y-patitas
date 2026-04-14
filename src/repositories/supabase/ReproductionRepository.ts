import type { IReproductionRepository } from '../IReproductionRepository';
import type {
  CreateReproductiveEventDTO,
  ReproductiveEvent,
  ReproductiveEventWithRelations,
  ReproductiveAnimalMini,
  UpdateReproductiveEventDTO,
} from '@/types/domain/reproduction.schema';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getReproEventAnimalColumnNames,
  rowToReproductiveEvent,
} from '@/lib/reproductive-events-columns';

/** Une filas de eventos con un mapa id → animal (evita embed PostgREST si no hay FK en caché). */
function attachAnimals(
  rows: ReproductiveEvent[],
  byId: Map<string, ReproductiveAnimalMini>
): ReproductiveEventWithRelations[] {
  return rows.map((row) => ({
    ...row,
    female_animal: row.female_animal_id ? byId.get(row.female_animal_id) ?? null : null,
    male_animal: row.male_animal_id ? byId.get(row.male_animal_id) ?? null : null,
  }));
}

export class SupabaseReproductionRepository implements IReproductionRepository {
  constructor(private supabase: SupabaseClient) {}

  private async requireRegisteredBy(): Promise<string> {
    const { data: auth, error: authErr } = await this.supabase.auth.getUser();
    if (authErr || !auth.user?.id) {
      throw new Error('Debes iniciar sesión para registrar eventos reproductivos.');
    }
    return auth.user.id;
  }

  async listAnimalsBySex(sex: 'macho' | 'hembra'): Promise<ReproductiveAnimalMini[]> {
    const { data, error } = await this.supabase
      .from('animals')
      .select(`id, code, name, species_id, breed:breed_id ( name )`)
      .eq('sex', sex)
      .eq('status', 'activo')
      .order('code');

    if (error) throw new Error(`Error al cargar animales: ${error.message}`);
    return (data ?? []) as unknown as ReproductiveAnimalMini[];
  }

  async list(): Promise<ReproductiveEventWithRelations[]> {
    const { data: rows, error } = await this.supabase
      .from('reproductive_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) throw new Error(`Error al cargar reproducción: ${error.message}`);

    const cols = await getReproEventAnimalColumnNames(this.supabase);
    const events: ReproductiveEvent[] = [];

    for (const r of rows ?? []) {
      try {
        events.push(rowToReproductiveEvent(r as Record<string, unknown>, cols));
      } catch (e) {
        // Si hay un registro corrupto, lo saltamos para no romper toda la vista
        console.error('Saltando registro reproductivo inválido:', e);
      }
    }

    const ids = new Set<string>();
    for (const e of events) {
      if (e.female_animal_id) ids.add(e.female_animal_id);
      if (e.male_animal_id) ids.add(e.male_animal_id);
    }

    if (ids.size === 0) {
      return events.map((row) => ({
        ...row,
        female_animal: null,
        male_animal: null,
      }));
    }

    const { data: animals, error: animalsError } = await this.supabase
      .from('animals')
      .select('id, code, name, species_id, breed:breed_id ( name )')
      .in('id', [...ids]);

    if (animalsError) throw new Error(`Error al cargar animales del cruce: ${animalsError.message}`);

    const byId = new Map<string, ReproductiveAnimalMini>();
    for (const a of animals ?? []) {
      byId.set((a as ReproductiveAnimalMini).id, a as unknown as ReproductiveAnimalMini);
    }

    return attachAnimals(events, byId);
  }

  async create(payload: CreateReproductiveEventDTO): Promise<ReproductiveEvent> {
    const registered_by = await this.requireRegisteredBy();
    const cols = await getReproEventAnimalColumnNames(this.supabase);

    const { data: active } = await this.supabase
      .from('reproductive_events')
      .select('id')
      .eq(cols.female, payload.female_animal_id)
      .in('gestation_status', ['en_seguimiento', 'confirmada'])
      .maybeSingle();

    if (active) {
      throw new Error(
        'Esta hembra ya tiene una gestación activa. Actualice ese evento antes de crear otro.'
      );
    }

    const male_animal_id = payload.male_animal_id?.trim() || null;
    const male_external = payload.male_external?.trim() || null;

    if (!cols.male && male_animal_id) {
      throw new Error(
        'Esta base no tiene columna para el macho registrado; use «Padre externo / pajilla» o añade la FK en Supabase.'
      );
    }

    const row: Record<string, unknown> = {
      [cols.female]: payload.female_animal_id,
      [cols.eventType]: payload.event_type,
      event_date: payload.event_date,
      [cols.maleExternal]: male_external,
      notes: payload.notes?.trim() || null,
      [cols.registeredBy]: registered_by,
      [cols.status]: 'en_seguimiento' as const,
    };
    if (cols.male) {
      row[cols.male] = male_animal_id;
    }

    const { data, error } = await this.supabase
      .from('reproductive_events')
      .insert(row)
      .select('*')
      .single();

    if (error) throw new Error(`Error al crear el evento: ${error.message}`);

    // INTEGRACIÓN FASE 4: Actualizar estado de la hembra y registrar en historial
    const femaleId = payload.female_animal_id;
    await Promise.all([
      // 1. Marcar hembra como "en gestión" (Valor sincronizado con DB)
      this.supabase
        .from('animals')
        .update({ reproductive_status: 'en_gestion' })
        .eq('id', femaleId),
      // 2. Registrar evento en el historial del animal para trazabilidad
      this.supabase.from('animal_events').insert({
        animal_id: femaleId,
        event_type: 'reproductivo',
        event_date: new Date().toISOString(),
        title: 'Inicio de gestión reproductiva',
        description: `Evento tipo ${payload.event_type.replace('_', ' ')}. Macho: ${
          payload.male_animal_id || payload.male_external || 'No especificado'
        }`,
        reference_id: data.id,
        reference_table: 'reproductive_events',
        performed_by: registered_by,
      }),
    ]);

    return rowToReproductiveEvent(data as Record<string, unknown>, cols);
  }

  async update(id: string, payload: UpdateReproductiveEventDTO): Promise<ReproductiveEvent> {
    await this.requireRegisteredBy();

    const cols = await getReproEventAnimalColumnNames(this.supabase);
    const patch: Record<string, unknown> = {
      [cols.status]: payload.gestation_status,
      updated_at: new Date().toISOString(),
    };

    if (payload.gestation_status === 'fallida') {
      patch.failure_reason = payload.failure_reason?.trim() || null;
    } else {
      patch.failure_reason = null;
    }

    if (payload.actual_birth_date !== undefined) {
      patch.actual_birth_date = payload.actual_birth_date?.trim() || null;
    }

    if (payload.estimated_birth_date !== undefined && cols.estimated) {
      patch[cols.estimated] = payload.estimated_birth_date?.trim() || null;
    }

    const { data, error } = await this.supabase
      .from('reproductive_events')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(`Error al actualizar el evento: ${error.message}`);

    // INTEGRACIÓN FASE 4: Actualizar estado del animal según el resultado
    const femaleId = data[cols.female];
    if (femaleId) {
      if (payload.gestation_status === 'fallida') {
        await Promise.all([
          // Revertir estado si falla
          this.supabase
            .from('animals')
            .update({ reproductive_status: 'sin_gestion_activa' })
            .eq('id', femaleId),
          // Registrar fallo en historial
          this.supabase.from('animal_events').insert({
            animal_id: femaleId,
            event_type: 'reproductivo',
            event_date: new Date().toISOString(),
            title: 'Gestión reproductiva fallida',
            description: payload.failure_reason || 'Sin motivo especificado',
            reference_id: id,
            reference_table: 'reproductive_events',
            performed_by: (await this.requireRegisteredBy()), // Re-usar sesión
          }),
        ]);
      } else if (payload.gestation_status === 'confirmada') {
        // Registrar confirmación
        await this.supabase.from('animal_events').insert({
          animal_id: femaleId,
          event_type: 'reproductivo',
          event_date: new Date().toISOString(),
          title: 'Gestión reproductiva confirmada',
          description: 'Gestión marcada como confirmada/en seguimiento avanzado.',
          reference_id: id,
          reference_table: 'reproductive_events',
          performed_by: (await this.requireRegisteredBy()),
        });
      }
    }


    return rowToReproductiveEvent(data as Record<string, unknown>, cols);
  }

  async listByAnimal(animalId: string): Promise<ReproductiveEventWithRelations[]> {
    const cols = await getReproEventAnimalColumnNames(this.supabase);
    
    // Buscar donde el animal sea hembra o sea macho
    let query = this.supabase.from('reproductive_events').select('*');
    
    if (cols.male) {
      query = query.or(`${cols.female}.eq.${animalId},${cols.male}.eq.${animalId}`);
    } else {
      query = query.eq(cols.female, animalId);
    }

    const { data: rows, error } = await query.order('event_date', { ascending: false });

    if (error) throw new Error(`Error al cargar historial reproductivo: ${error.message}`);

    const events: ReproductiveEvent[] = [];
    for (const r of rows ?? []) {
      try {
        events.push(rowToReproductiveEvent(r as Record<string, unknown>, cols));
      } catch (e) {
        console.error('Saltando registro corrupto en historial:', e);
      }
    }

    const ids = new Set<string>();
    for (const e of events) {
      if (e.female_animal_id) ids.add(e.female_animal_id);
      if (e.male_animal_id) ids.add(e.male_animal_id);
    }

    if (ids.size === 0) {
      return events.map((row) => ({ ...row, female_animal: null, male_animal: null }));
    }

    const { data: animals } = await this.supabase
      .from('animals')
      .select('id, code, name, species_id, breed:breed_id ( name )')
      .in('id', [...ids]);

    const byId = new Map<string, ReproductiveAnimalMini>();
    for (const a of animals ?? []) {
      byId.set((a as ReproductiveAnimalMini).id, a as unknown as ReproductiveAnimalMini);
    }

    return attachAnimals(events, byId);
  }
}
