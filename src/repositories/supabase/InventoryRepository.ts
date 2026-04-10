import { SupabaseClient } from '@supabase/supabase-js';

export interface Supply {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
}

export interface IInventoryRepository {
  getFoodSupplies(): Promise<Supply[]>;
}

export class SupabaseInventoryRepository implements IInventoryRepository {
  constructor(private supabase: SupabaseClient) {}

  async getFoodSupplies(): Promise<Supply[]> {
    const { data, error } = await this.supabase
      .from('supplies')
      .select('id, name, unit, current_stock')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Error al obtener insumos: ${error.message}`);
    return data as Supply[];
  }
}
