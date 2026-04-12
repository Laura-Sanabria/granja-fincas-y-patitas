import { IHealthRepository } from '../IHealthRepository';
import {
  HealthEvent,
  CreateHealthEventInput,
  AnimalEvent,
  AnimalTimelineFilter,
} from '@/types/domain/health.schema';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseHealthRepository implements IHealthRepository {
  constructor(private supabase: SupabaseClient) {}

  async getByAnimal(animalId: string): Promise<HealthEvent[]> {
    const { data, error } = await this.supabase
      .from('health_events')
      .select('*')
      .eq('animal_id', animalId)
      .order('detected_at', { ascending: false });

    if (error) throw new Error(`Error al obtener historial de salud: ${error.message}`);
    return data as HealthEvent[];
  }

  async getTimelineByAnimal(
    animalId: string,
    filter?: AnimalTimelineFilter
  ): Promise<AnimalEvent[]> {
    let q = this.supabase
      .from('animal_events')
      .select('*')
      .eq('animal_id', animalId)
      .order('event_date', { ascending: false });

    if (filter?.eventTypes?.length) {
      q = q.in('event_type', filter.eventTypes);
    }
    if (filter?.fromDate) {
      q = q.gte('event_date', `${filter.fromDate}T00:00:00.000Z`);
    }
    if (filter?.toDate) {
      q = q.lte('event_date', `${filter.toDate}T23:59:59.999Z`);
    }

    const { data, error } = await q;
    if (error) throw new Error(`Error al cargar historial integral: ${error.message}`);
    return (data ?? []) as AnimalEvent[];
  }

  async addHealthEvent(input: CreateHealthEventInput): Promise<HealthEvent> {
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Debes iniciar sesión para registrar un evento de salud.');
    }

    const recovery = input.recovery_status ?? 'en_tratamiento';
    let resolvedAt = input.resolved_at?.trim() || null;
    if (
      (recovery === 'recuperado' || recovery === 'fallecido') &&
      !resolvedAt
    ) {
      resolvedAt = input.detected_at;
    }

    const row: Record<string, unknown> = {
      animal_id: input.animal_id,
      event_type: input.event_type,
      detected_at: input.detected_at,
      description: input.description.trim(),
      diagnosis: input.diagnosis?.trim() || null,
      recovery_status: recovery,
      resolved_at: resolvedAt,
      notes: input.notes?.trim() || null,
      registered_by: user.id,
    };

    const { data: created, error: insertErr } = await this.supabase
      .from('health_events')
      .insert(row)
      .select()
      .single();

    if (insertErr) {
      throw new Error(`Error al registrar evento de salud: ${insertErr.message}`);
    }

    const event = created as HealthEvent;
    const treatments = input.treatments?.filter(
      (t) => t.medication_name?.trim() && t.responsible?.trim()
    );

    if (treatments?.length) {
      const treatRows = treatments.map((t) => ({
        health_event_id: event.id,
        medication_name: t.medication_name.trim(),
        dose: t.dose?.trim() || null,
        applied_at: t.applied_at,
        responsible: t.responsible.trim(),
        supply_id: t.supply_id ?? null,
        notes: t.notes?.trim() || null,
        registered_by: user.id,
      }));

      const { error: treatErr } = await this.supabase
        .from('health_treatments')
        .insert(treatRows);

      if (treatErr) {
        throw new Error(`Evento guardado pero falló el tratamiento: ${treatErr.message}`);
      }
    }

    return event;
  }

  async getHealthAlerts(): Promise<unknown[]> {
    const { data, error } = await this.supabase
      .from('health_events')
      .select('*, animals(code)')
      .eq('recovery_status', 'en_tratamiento')
      .order('detected_at', { ascending: false });

    if (error) throw new Error(`Error al obtener alertas de salud: ${error.message}`);
    return data ?? [];
  }
}
