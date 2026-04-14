import { SupabaseClient } from '@supabase/supabase-js';
import { 
  ReproductiveEvent, 
  CreateReproductiveEventInput,
  ReproductiveEventWithRelations
} from '@/types/domain/reproduction.schema';

export interface IReproductionRepository {
  getEventsByAnimal(animalId: string): Promise<ReproductiveEvent[]>;
  getAllEventsWithRelations(): Promise<ReproductiveEventWithRelations[]>;
  getReproductionSummary(): Promise<{ successfulBirths: number; activeGestations: number; failures: number }>;
  registerEvent(input: CreateReproductiveEventInput): Promise<ReproductiveEvent>;
}

export class SupabaseReproductionRepository implements IReproductionRepository {
  constructor(private supabase: SupabaseClient) {}

  async getEventsByAnimal(animalId: string): Promise<ReproductiveEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('reproductive_events')
        .select('*')
        .eq('animal_id', animalId)
        .order('event_date', { ascending: false });

      if (error) return [];
      return data || [];
    } catch (e) {
      return [];
    }
  }

  async getAllEventsWithRelations(): Promise<ReproductiveEventWithRelations[]> {
    try {
      // 1. Obtener todos los eventos
      const { data: events, error: eventsErr } = await this.supabase
        .from('reproductive_events')
        .select('*')
        .order('event_date', { ascending: false });

      if (eventsErr || !events || events.length === 0) return [];

      // 2. Obtener IDs únicos de animales involucrados
      const animalIds = Array.from(new Set([
        ...events.map(e => e.animal_id),
        ...events.map(e => (e as any).father_id).filter(Boolean) as string[]
      ]));

      // 3. Obtener la información de esos animales
      const { data: animals, error: animalsErr } = await this.supabase
        .from('animals')
        .select('id, code, notes, species:species_id(display_name, gestation_days, is_productive_milk), breed:breed_id(name)')
        .in('id', animalIds);

      if (animalsErr || !animals) return events.map(e => ({ ...e }));

      // 4. Mapear los datos manualmente
      return events.map(event => {
        const animal = animals.find(a => a.id === event.animal_id);
        const father = animals.find(a => a.id === (event as any).father_id);

        return {
          ...event,
          animal: animal ? {
            code: animal.code,
            notes: animal.notes,
            species: animal.species as any,
            breed: animal.breed as any
          } : null,
          father: father ? { code: father.code } : null
        };
      }) as ReproductiveEventWithRelations[];
    } catch (e) {
      console.error('Error crítico en getAllEventsWithRelations:', e);
      return [];
    }
  }

  async getReproductionSummary(): Promise<{ successfulBirths: number; activeGestations: number; failures: number }> {
    const fmt = (err: { message?: string; code?: string; details?: string } | null) =>
      err ? [err.message, err.code, err.details].filter(Boolean).join(' — ') : '';

    const [
      { count: births, error: errB },
      { count: gestations, error: errG },
      { count: aborts, error: errA },
      { count: negatives, error: errN },
    ] = await Promise.all([
      this.supabase
        .from('reproductive_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'parto'),
      // En BD el dominio UI "gestante" se guarda como en_gestion (animals-db-map / enum GRANJA_DB)
      this.supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('reproductive_status', 'en_gestion')
        .eq('status', 'activo')
        .eq('sex', 'hembra'),
      this.supabase
        .from('reproductive_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'aborto'),
      this.supabase
        .from('reproductive_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'diagnostico')
        .eq('result', 'negativo'),
    ]);

    const warnParts = [
      errB && `partos: ${fmt(errB)}`,
      errG && `gestaciones: ${fmt(errG)}`,
      errA && `abortos: ${fmt(errA)}`,
      errN && `diagn. negativos: ${fmt(errN)}`,
    ].filter(Boolean);

    if (warnParts.length) {
      console.warn('[reproducción] resumen:', warnParts.join(' | '));
    }

    return {
      successfulBirths: errB ? 0 : (births ?? 0),
      activeGestations: errG ? 0 : (gestations ?? 0),
      failures: (errA ? 0 : (aborts ?? 0)) + (errN ? 0 : (negatives ?? 0)),
    };
  }

  async registerEvent(input: CreateReproductiveEventInput): Promise<ReproductiveEvent> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();
    if (authError || !user) throw new Error('Debes iniciar sesión.');

    const eventDate = input.event_date || new Date().toISOString();

    const { data: record, error } = await this.supabase
      .from('reproductive_events')
      .insert({
        ...input,
        event_date: eventDate,
        registered_by: user.id
      })
      .select()
      .single();

    if (error) throw new Error(`Error al registrar: ${error.message}`);
    
    // Registrar en línea de tiempo
    await this.supabase.from('animal_events').insert({
      animal_id: input.animal_id,
      event_type: 'reproductivo',
      event_date: record.event_date,
      title: this.getEventTitle(input),
      description: this.getEventDescription(input),
      reference_id: (record as ReproductiveEvent).id,
      reference_table: 'reproductive_events',
      performed_by: user.id,
    });

    return record as ReproductiveEvent;
  }

  private getEventTitle(input: CreateReproductiveEventInput): string {
    switch (input.event_type) {
      case 'servicio': return `Servicio: ${input.service_type}`;
      case 'diagnostico': return `Diagnóstico: ${input.result?.toUpperCase()}`;
      case 'parto': return 'Parto';
      case 'aborto': return 'Aborto';
      default: return 'Evento Reproductivo';
    }
  }

  private getEventDescription(input: CreateReproductiveEventInput): string {
    let desc = `Responsable: ${input.responsible}`;
    if (input.notes) desc += ` · ${input.notes}`;
    return desc;
  }
}
