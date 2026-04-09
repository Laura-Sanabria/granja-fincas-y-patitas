'use client';

import { UserCircle, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  user?: { email: string; full_name?: string; role?: string };
  onMenuToggle?: () => void;
}

export default function Header({ user, onMenuToggle }: HeaderProps) {
  const { signOut } = useAuth();
  
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">ADMIN</span>;
      case 'ENCARGADO':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">ENCARGADO</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">EMPLEADO</span>;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[var(--glass-border)] flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight hidden sm:block">Panel de Control</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              {user?.full_name || user?.email || 'Usuario'}
            </span>
            {getRoleBadge(user?.role)}
          </div>
          <div className="h-10 w-10 bg-[var(--brand-light)] rounded-full flex items-center justify-center text-[var(--brand)] border border-[var(--brand)]/20 shadow-inner">
            <UserCircle className="h-6 w-6" />
          </div>
        </div>
        
        {/* Separator */}
        <div className="h-8 border-l border-gray-200 mx-1 hidden sm:block"></div>

        <button 
          onClick={() => signOut()}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
