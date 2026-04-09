'use client';

import React, { useEffect, useState } from 'react';
import { UserProfile, Rol, RolEnum } from '@/types/domain/user.schema';
import { profileService } from '@/services/profileService';
import { RoleGuard } from '@/components/RoleGuard';
import { Users, UserCog, Check, AlertCircle, Loader2, Phone, MapPin } from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const roles = RolEnum.options;

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await profileService.listarPerfiles();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Rol) => {
    try {
      setUpdatingId(userId);
      await profileService.actualizarRol(userId, newRole);
      setUsuarios(prev => 
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
    } catch (err: any) {
      alert(`Error al actualizar el rol: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadgeClass = (role: Rol) => {
    switch (role) {
      case 'ADMINISTRADOR': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'ENCARGADO': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'EMPLEADO': return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']} redirectPath="/acceso-denegado">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8 text-zinc-400" />
              Gestión de Personal
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Administra los accesos y roles de los usuarios del sistema.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden text-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              <p className="text-zinc-400 font-medium">Cargando lista de usuarios...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-12 h-12" />
              <p className="font-semibold">{error}</p>
              <button 
                onClick={fetchUsuarios}
                className="mt-4 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400">Usuario</th>
                    <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400">Contacto y Dirección</th>
                    <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400">Rol</th>
                    <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-base">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-400 border border-zinc-200 dark:border-zinc-700 uppercase">
                            {u.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{u.full_name || 'Sin nombre'}</p>
                            <p className="text-xs text-zinc-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" /> {u.phone || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> {u.address || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeClass(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          {updatingId === u.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                          ) : (
                            <div className="relative group">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as Rol)}
                                className="appearance-none bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all font-medium cursor-pointer text-sm"
                              >
                                {roles.map(rol => (
                                  <option key={rol} value={rol}>{rol}</option>
                                ))}
                              </select>
                              <UserCog className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usuarios.length === 0 && (
                <div className="p-12 text-center text-zinc-400 italic">
                  No se encontraron usuarios registrados.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
