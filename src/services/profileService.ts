import { createClient } from '@/utils/supabase/client';
import { SupabaseProfileRepository } from '@/repositories/supabase/ProfileRepository';
import { IProfileRepository } from '@/repositories/IProfileRepository';
import { UserProfile, Rol } from '@/types/domain/user.schema';

const supabase = createClient();
const profileRepo: IProfileRepository = new SupabaseProfileRepository(supabase);

export const profileService = {
  /**
   * Obtiene la lista completa de perfiles (Solo para administradores)
   */
  async listarPerfiles(): Promise<UserProfile[]> {
    return profileRepo.getAll();
  },

  /**
   * Cambia el rol de un usuario
   */
  async actualizarRol(userId: string, nuevoRol: Rol): Promise<UserProfile> {
    return profileRepo.updateRole(userId, nuevoRol);
  },

  /**
   * Obtiene el perfil por ID
   */
  async obtenerPorId(id: string): Promise<UserProfile | null> {
    return profileRepo.getById(id);
  }
};
