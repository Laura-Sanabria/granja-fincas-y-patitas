import { createClient } from '@supabase/supabase-js';
import { ProfileSchema, type Profile } from '@/types/domain/profile.schema';
import type { IProfileRepository } from '../IProfileRepository';

// Usaremos un cliente service_role si necesitamos hacer querys administrativas saltando RLS (según el caso de uso)
// Pero típicamente, con un Server o Browser client con sesion activa es suficiente si las políticas de RLS lo permiten.
// Aquí usamos el anon+url simple para instanciar (o podriamos inyectar el cliente ya autenticado).

export class SupabaseProfileRepository implements IProfileRepository {
  private getClient(supabaseClient?: any) {
    if (supabaseClient) return supabaseClient;
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getById(id: string, supabaseClient?: any): Promise<Profile | null> {
    const supabase = this.getClient(supabaseClient);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return ProfileSchema.parse(data);
  }

  async getAll(supabaseClient?: any): Promise<Profile[]> {
    const supabase = this.getClient(supabaseClient);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw new Error(error.message);
    return ProfileSchema.array().parse(data);
  }

  async deactivate(id: string, supabaseClient?: any): Promise<void> {
    const supabase = this.getClient(supabaseClient);
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async updateRole(id: string, rol: string, supabaseClient?: any): Promise<void> {
    const supabase = this.getClient(supabaseClient);
    const { error } = await supabase
      .from('profiles')
      .update({ role: rol })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }
}
