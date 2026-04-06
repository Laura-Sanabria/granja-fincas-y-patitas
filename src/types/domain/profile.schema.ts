import { z } from 'zod';

export const RolEnum = z.enum(['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO']);

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().nullable().optional(),
  email: z.string().email(),
  rol: RolEnum.default('EMPLEADO'),
  activo: z.boolean().default(true),
  fecha_creacion: z.string().datetime().optional()
});

export type Rol = z.infer<typeof RolEnum>;
export type Profile = z.infer<typeof ProfileSchema>;
