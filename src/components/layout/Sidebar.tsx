'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Tractor, 
  Settings, 
  ClipboardList, 
  Sprout,
  EggFried,
  X,
  Users
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Inicio', href: '/dashboard', icon: Tractor },
    { name: 'Gestión de Personal', href: '/dashboard/usuarios', icon: Users },
    { name: 'Inventario (Animales)', href: '/dashboard/inventario', icon: Tractor },
    { name: 'Insumos y Bodega', href: '/dashboard/insumos', icon: ClipboardList },
    { name: 'Producción', href: '/dashboard/produccion', icon: EggFried },
    { name: 'Reproductivo', href: '/dashboard/reproductivo', icon: Sprout },
    { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
  ];

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-[var(--glass-border)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full shadow-xl md:shadow-sm transition-all`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--glass-border)] bg-[var(--brand)] text-white gap-3">
          <div className="flex items-center gap-3">
            <Tractor className="h-6 w-6" />
            <span className="font-bold text-lg tracking-tight">Granja F & P</span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            {X ? <X className="h-6 w-6" /> : <span>X</span>}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1.5">
          <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Módulos
          </div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--brand-light)] text-[var(--brand-hover)] border border-[var(--brand)]/20' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon ? (
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-[var(--brand)]' : 'text-gray-500'}`} />
                ) : (
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                )}
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-[var(--glass-border)] text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Granja F&P v1.0
        </div>
      </aside>
    </>
  );
}
