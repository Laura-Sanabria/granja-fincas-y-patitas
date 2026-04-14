import { IHealthRepository } from '../IHealthRepository';
import { HealthEvent, CreateHealthEventDTO } from '@/types/domain/health.schema';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseHealthRepository implements IHealthRepository {
  constructor(private supabase: SupabaseClient) { }

  async getByAnimal(animalId: string): Promise<HealthEvent[]> {
    const { data, error } = await this.supabase
      .from('health_events')
      .select('*')
      .eq('animal_id', animalId)
      .order('detected_at', { ascending: false });

    if (error) throw new Error(`Error al obtener historial de salud: ${error.message}`);
    return data as HealthEvent[];
  }

  async addEvent(data: CreateHealthEventDTO): Promise<HealthEvent> {
    const { data: result, error } = await this.supabase
      .from('health_events')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Error al registrar evento de salud: ${error.message}`);
    return result as HealthEvent;
  }

  async getHealthAlerts(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('health_events')
      .select('*, animals(*)')
      .eq('recovery_status', 'en_tratamiento')
      .order('detected_at', { ascending: false });

    if (error) throw new Error(`Error al obtener alertas de salud: ${error.message}`);
    return data;
  }

  async getAllEvents(limit = 50): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('health_events')
      .select('*, animals(*)')
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Error al obtener historial de salud completo: ${error.message}`);
    return data;
  }
}
