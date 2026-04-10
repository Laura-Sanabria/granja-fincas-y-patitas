import { Rol } from '@/types/domain/user.schema';

/**
 * Definición de los permisos por ruta o módulo.
 * Esto permite centralizar la lógica de quién puede ver qué.
 */
export const ROUTE_PERMISSIONS: Record<string, Rol[]> = {
  // ===== Rutas Admin =====
  '/dashboard/usuarios': ['ADMINISTRADOR'],
  '/dashboard/animales': ['ADMINISTRADOR'],
  '/dashboard/insumos': ['ADMINISTRADOR'],
  '/dashboard/produccion': ['ADMINISTRADOR'],
  '/dashboard/reproduccion': ['ADMINISTRADOR'],
  '/dashboard/personal': ['ADMINISTRADOR'],
  '/dashboard/alertas': ['ADMINISTRADOR'],
  '/dashboard/actividad': ['ADMINISTRADOR'],
  '/dashboard/configuracion': ['ADMINISTRADOR'],

  // ===== Rutas Empleado / Encargado =====
  '/dashboard/empleado/tareas': ['EMPLEADO', 'ENCARGADO'],
  '/dashboard/empleado/alimentacion': ['EMPLEADO', 'ENCARGADO'],
  '/dashboard/empleado/turnos': ['EMPLEADO', 'ENCARGADO'],
  '/dashboard/empleado/animales': ['EMPLEADO', 'ENCARGADO'],
  '/dashboard/empleado/salud': ['EMPLEADO', 'ENCARGADO'],
  '/dashboard/empleado/produccion': ['EMPLEADO', 'ENCARGADO'],

  // ===== Ruta base accesible para todos =====
  '/dashboard': ['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO'],
};

/**
 * Verifica si un rol tiene acceso a una ruta específica.
 */
export function canAccess(role: Rol | null, path: string): boolean {
  if (!role) return false;

  // Encontrar la regla de permiso más específica para el path
  const protectedPath = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length) // Primero las rutas más largas/específicas
    .find(p => path.startsWith(p));

  if (!protectedPath) return true; // Si no está en la lista de protegidos, es pública (o manejada por middleware base)

  return ROUTE_PERMISSIONS[protectedPath].includes(role);
}
