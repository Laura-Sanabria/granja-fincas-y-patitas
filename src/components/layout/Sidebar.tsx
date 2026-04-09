'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { canAccess } from '@/lib/rbac';
import { 
  Tractor, 
  Settings, 
  ClipboardList, 
  Sprout,
  EggFried,
  X,
  Users
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { role, loading } = useAuth();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  const navItems = [
    { name: 'Inicio', href: '/dashboard', icon: Tractor },
    { name: 'Gestión de Personal', href: '/dashboard/usuarios', icon: Users },
    { name: 'Inventario (Animales)', href: '/dashboard/inventario', icon: Tractor },
    { name: 'Insumos y Bodega', href: '/dashboard/insumos', icon: ClipboardList },
    { name: 'Producción', href: '/dashboard/produccion', icon: EggFried },
    { name: 'Reproductivo', href: '/dashboard/reproductivo', icon: Sprout },
    { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
  ];

  // Filtrar ítems según el rol del usuario (mostrarlos si está cargando para evitar vacío)
  const filteredNavItems = navItems.filter(item => {
    if (loading) return true;
    return canAccess(role, item.href);
  });

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[var(--sidebar-bg)] border-r border-[var(--glass-border)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full shadow-sm transition-all`}>
        <div className="h-24 flex items-center justify-between px-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-black/5">
              <Tractor className="h-6 w-6 text-[var(--brand)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-gray-800 tracking-tight leading-none">Fincas y Patitas</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1">Suite de Gestión</span>
            </div>
          </div>
          <button 
            onClick={closeSidebar}
            className="md:hidden p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={closeSidebar}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-white text-gray-900 shadow-sm border border-black/5' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-8 bg-[var(--brand)] rounded-r-full" />
                )}
                
                {item.icon ? (
                  <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-[var(--brand)]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                ) : (
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                )}
                <span className="uppercase tracking-wider text-[11px] font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 px-6 border-t border-[var(--glass-border)] flex flex-col gap-6 bg-white/30">
          <button className="w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 group active:scale-[0.98]">
            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl leading-none">+</span>
            </div>
            <span className="text-sm">Nueva Entrada</span>
          </button>
          
          <div className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest opacity-60 pb-2">
            &copy; {new Date().getFullYear()} Precision Systems
          </div>
        </div>
      </aside>
    </>
  );
}
