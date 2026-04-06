'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Tractor, 
  LayoutDashboard, 
  Settings, 
  ClipboardList, 
  Sprout,
  HeartPulse,
  EggFried
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Inventario (Animales)', href: '/inventario', icon: Tractor },
    { name: 'Salud Animal', href: '/salud', icon: HeartPulse },
    { name: 'Insumos y Bodega', href: '/insumos', icon: ClipboardList },
    { name: 'Producción', href: '/produccion', icon: EggFried },
    { name: 'Reproductivo', href: '/reproductivo', icon: Sprout },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[var(--glass-border)] hidden md:flex flex-col h-full shadow-sm z-10 transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-[var(--glass-border)] bg-[var(--brand)] text-white gap-3">
        <Tractor className="h-6 w-6" />
        <span className="font-bold text-lg tracking-tight">Granja F & P</span>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-[var(--brand-light)] text-[var(--brand-hover)] border border-[var(--brand)]/20' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-[var(--brand)]' : 'text-gray-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[var(--glass-border)] text-xs text-gray-400 text-center">
        &copy; {new Date().getFullYear()} Granja F&P v1.0
      </div>
    </aside>
  );
}
