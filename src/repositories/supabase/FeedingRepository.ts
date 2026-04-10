import { IFeedingRepository } from '../IFeedingRepository';
import { FeedingRecord, CreateFeedingDTO } from '@/types/domain/feeding.schema';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseFeedingRepository implements IFeedingRepository {
  constructor(private supabase: SupabaseClient) {}

  async getByAnimal(animalId: string): Promise<FeedingRecord[]> {
    const { data, error } = await this.supabase
      .from('feeding_records')
      .select(`
        *,
        supply:supply_id (name, unit)
      `)
      .eq('animal_id', animalId)
      .order('fed_at', { ascending: false });

    if (error) throw new Error(`Error al obtener historial de alimentación: ${error.message}`);
    return data as any[];
  }

  async addFeeding(data: CreateFeedingDTO): Promise<void> {
    // Obtenemos la unidad del insumo para guardarla (o la derivamos en el RPC)
    const { data: supply } = await this.supabase
      .from('supplies')
      .select('unit')
      .eq('id', data.supply_id)
      .single();

    const { error } = await this.supabase.rpc('fn_register_feeding', {
      p_animal_id: data.animal_id,
      p_supply_id: data.supply_id,
      p_quantity: data.quantity,
      p_unit: supply?.unit || 'kg',
      p_notes: data.notes,
      p_registered_by: data.registered_by
    });

    if (error) throw new Error(`Error al registrar alimentación: ${error.message}`);
  }

  async getFeedingSummaryByAnimal(animalId: string): Promise<any> {
    // Lógica para obtener sumatorias (opcional para dashboards)
    return null;
  }
}
