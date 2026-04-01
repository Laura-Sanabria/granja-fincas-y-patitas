import { z } from 'zod';

// Roles disponibles en la aplicación
export const RolEnum = z.enum(['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO']);

// Esquema de la entidad base de datos "perfiles"
export const UserSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Correo electrónico inválido'),
  rol: RolEnum,
  activo: z.boolean().default(true),
  fecha_creacion: z.string().datetime().optional(), // Puede venir como string ISO de Supabase
});

export type UserProfile = z.infer<typeof UserSchema>;
export type Rol = z.infer<typeof RolEnum>;

// Esquema para el formulario de Login
export const LoginCredentialsSchema = z.object({
  email: z.string().email('Por favor ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

// Esquema para crear un nuevo usuario/empleado
export const RegisterUserSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Por favor ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: RolEnum.default('EMPLEADO'),
});

export type RegisterUser = z.infer<typeof RegisterUserSchema>;
