import { SupabaseClient } from '@supabase/supabase-js';

export interface Supply {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
}

export interface SupplyCategoryRow {
  id: string;
  name: string;
  category: string;
}

export interface SupplyListRow {
  id: string;
  code: string;
  name: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  expiry_date: string | null;
  unit_price: number | null;
  category_name: string;
}

export type CreateSupplyInput = {
  name: string;
  category_id: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  expiry_date?: string | null;
  batch_number?: string | null;
};

export interface IInventoryRepository {
  getFoodSupplies(): Promise<Supply[]>;
  listSupplyCategories(): Promise<SupplyCategoryRow[]>;
  listSupplies(): Promise<SupplyListRow[]>;
  createSupply(input: CreateSupplyInput): Promise<{ id: string }>;
}

export class SupabaseInventoryRepository implements IInventoryRepository {
  constructor(private supabase: SupabaseClient) {}

  async getFoodSupplies(): Promise<Supply[]> {
    const { data: categories, error: catErr } = await this.supabase
      .from('supply_categories')
      .select('id')
      .eq('category', 'alimento')
      .eq('is_active', true);

    if (catErr) throw new Error(`Error al obtener categorías: ${catErr.message}`);
    const categoryIds = (categories ?? []).map((c) => c.id);
    if (categoryIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from('supplies')
      .select('id, name, unit, current_stock')
      .in('category_id', categoryIds)
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Error al obtener insumos: ${error.message}`);
    return data as Supply[];
  }

  async listSupplyCategories(): Promise<SupplyCategoryRow[]> {
    const { data, error } = await this.supabase
      .from('supply_categories')
      .select('id, name, category')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Error al cargar categorías: ${error.message}`);
    return (data ?? []) as SupplyCategoryRow[];
  }

  async listSupplies(): Promise<SupplyListRow[]> {
    const { data, error } = await this.supabase
      .from('supplies')
      .select(
        `
        id,
        code,
        name,
        unit,
        current_stock,
        min_stock,
        expiry_date,
        unit_price,
        supply_categories ( name )
      `
      )
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Error al listar insumos: ${error.message}`);

    return (data ?? []).map((row: Record<string, unknown>) => {
      const sc = row.supply_categories as { name?: string } | null;
      return {
        id: row.id as string,
        code: row.code as string,
        name: row.name as string,
        current_stock: Number(row.current_stock),
        min_stock: Number(row.min_stock),
        unit: row.unit as string,
        expiry_date: (row.expiry_date as string | null) ?? null,
        unit_price: row.unit_price != null ? Number(row.unit_price) : null,
        category_name: sc?.name ?? '—',
      };
    });
  }

  async createSupply(input: CreateSupplyInput): Promise<{ id: string }> {
    const {
      data: { user },
      error: authErr,
    } = await this.supabase.auth.getUser();
    if (authErr || !user) {
      throw new Error('Debes iniciar sesión para registrar insumos.');
    }

    const name = input.name.trim();
    if (name.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres.');
    }

    const unit = input.unit.trim();
    if (!unit) {
      throw new Error('Indica la unidad de medida (por ejemplo: kg, sacos, dosis).');
    }

    if (!Number.isFinite(input.current_stock) || input.current_stock < 0) {
      throw new Error('El stock inicial no es válido.');
    }
    if (!Number.isFinite(input.min_stock) || input.min_stock < 0) {
      throw new Error('El stock mínimo no es válido.');
    }

    const { data: catRow, error: catErr } = await this.supabase
      .from('supply_categories')
      .select('category')
      .eq('id', input.category_id)
      .single();

    if (catErr || !catRow) {
      throw new Error('Categoría no válida.');
    }

    const expiry = input.expiry_date?.trim() || null;
    if (catRow.category === 'medicamento' && !expiry) {
      throw new Error('Los medicamentos deben tener fecha de vencimiento.');
    }

    const row: Record<string, unknown> = {
      name,
      category_id: input.category_id,
      unit,
      current_stock: input.current_stock,
      min_stock: input.min_stock,
      registered_by: user.id,
    };

    if (expiry) row.expiry_date = expiry;
    const batch = input.batch_number?.trim();
    if (batch) row.batch_number = batch;

    const { data, error } = await this.supabase
      .from('supplies')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { id: (data as { id: string }).id };
  }
}
