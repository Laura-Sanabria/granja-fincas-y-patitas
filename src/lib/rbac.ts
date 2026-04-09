import { Rol } from '@/types/domain/user.schema';

/**
 * Definición de los permisos por ruta o módulo.
 * Esto permite centralizar la lógica de quién puede ver qué.
 */
export const ROUTE_PERMISSIONS: Record<string, Rol[]> = {
  '/dashboard/usuarios': ['ADMINISTRADOR'],
  '/dashboard/configuracion': ['ADMINISTRADOR'],
  // Rutas que pueden ver todos los roles autenticados
  '/dashboard': ['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO'],
  '/dashboard/inventario': ['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO'],
  '/dashboard/insumos': ['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO'],
  '/dashboard/produccion': ['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO'],
  '/dashboard/reproductivo': ['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO'],
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
