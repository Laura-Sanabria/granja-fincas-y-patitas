'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Rol } from '@/types/domain/user.schema';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Rol[];
  fallback?: React.ReactNode;
  redirectPath?: string;
}

/**
 * Componente que protege una sección de la UI basada en el rol del usuario.
 * Si el usuario no tiene el rol permitido, muestra un fallback o redirige.
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null, 
  redirectPath 
}: RoleGuardProps) {
  const { role, loading } = useAuth();
  const router = useRouter();

  if (loading) return null; // O un spinner de carga

  const hasAccess = role && allowedRoles.includes(role);

  if (!hasAccess) {
    if (redirectPath) {
      router.push(redirectPath);
      return null;
    }
    
    return fallback || (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-xl font-bold text-red-700 mb-2">Acceso Denegado</h2>
        <p className="text-red-600">No tienes los permisos necesarios para ver esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
}
