'use server';

import { createClient } from '@/utils/supabase/server';
import { MilkProductionInput, EggProductionInput, MilkProductionRecord, EggProductionRecord } from '@/types/domain/production.schema';
import { revalidatePath } from 'next/cache';

export async function createMilkRecord(data: MilkProductionInput) {
  const supabase = createClient();
  
  // Optionally connect it to the user who is creating it
  const { data: userData, error: authError } = await (await supabase).auth.getUser();
  if (authError || !userData?.user) {
    return { error: 'No autorizado' };
  }

  const { error } = await (await supabase).from('milk_production').insert([
    {
      animal_id: data.animal_id,
      production_date: data.date,
      shift: ['MAÑANA', 'MAQUINARIA'].includes(data.shift) ? 'manana' : data.shift.toLowerCase(),
      quantity_liters: data.quantity_liters,
      notes: data.notes || null,
      registered_by: userData.user.id
    }
  ]);

  if (error) {
    console.error('Error insertando registro de leche:', error);
    return { error: `Error de BD: ${error?.message || JSON.stringify(error)}` };
  }

  revalidatePath('/dashboard/produccion');
  revalidatePath('/dashboard/produccion/leche');
  return { success: true };
}

export async function getMilkRecords(): Promise<{ data: MilkProductionRecord[] | null, error: string | null }> {
  const supabase = createClient();
  
  const { data, error } = await (await supabase)
    .from('milk_production')
    .select(`
      *,
      animal:animals (
        code,
        notes
      )
    `)
    .order('production_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    // console.error('Error obteniendo registros de leche:', error);
    return { data: null, error: 'Error al obtener registros' };
  }

  return { data: data as unknown as MilkProductionRecord[], error: null };
}

export async function createEggRecord(data: EggProductionInput) {
  const supabase = createClient();
  
  const { data: userData, error: authError } = await (await supabase).auth.getUser();
  if (authError || !userData?.user) {
    return { error: 'No autorizado' };
  }

  const { error } = await (await supabase).from('egg_production').insert([
    {
      lot_name: data.batch_id,
      production_date: data.date,
      quantity_units: data.total_quantity,
      discarded_units: data.damaged_quantity || 0,
      notes: data.notes || null,
      registered_by: userData.user.id
    }
  ]);

  if (error) {
    console.error('Error insertando registro de huevos:', error);
    return { error: `Error de BD: ${error?.message || JSON.stringify(error)}` };
  }

  revalidatePath('/dashboard/produccion');
  revalidatePath('/dashboard/produccion/huevos');
  return { success: true };
}

export async function getEggRecords(): Promise<{ data: EggProductionRecord[] | null, error: string | null }> {
  const supabase = createClient();
  
  const { data, error } = await (await supabase)
    .from('egg_production')
    .select(`
      id,
      lot_name,
      production_date,
      quantity_units,
      discarded_units,
      notes
    `)
    .order('production_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    // console.error('Error obteniendo registros de huevos:', error);
    return { data: null, error: 'Error al obtener registros' };
  }

  return { data: data as unknown as EggProductionRecord[], error: null };
}

export async function getCows() {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from('animals')
    .select('id, code, notes')
    .limit(100);

  // Mapear los campos del esquema real (code, notes) al formato de la UI (name, tag_number)
  const mappedData = data ? data.map((a: any) => ({
    id: a.id,
    name: a.notes || 'Animal (sin apodo)',
    tag_number: a.code
  })) : [];

  return { data: mappedData, error: error?.message };
}

export async function getChickenBatches() {
  const supabase = createClient();
  let { data, error } = await (await supabase)
    .from('animal_batches')
    .select('id, name, quantity')
    .eq('species', 'GALLINA')
    .eq('status', 'ACTIVO')
    .order('name', { ascending: true });

  if (!error && (!data || data.length === 0)) {
    // Registros fijos de prueba
    await (await supabase).from('animal_batches').insert([
      { name: 'Lote Ponedoras A', species: 'GALLINA', quantity: 200, status: 'ACTIVO' },
      { name: 'Lote Libres B', species: 'GALLINA', quantity: 150, status: 'ACTIVO' }
    ]);
    
    const secondFetch = await (await supabase)
      .from('animal_batches').select('id, name, quantity').eq('species', 'GALLINA').eq('status', 'ACTIVO').order('name', { ascending: true });
    data = secondFetch.data;
    error = secondFetch.error;
  }
    
  return { data, error: error?.message };
}
