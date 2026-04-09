'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface DashboardShellProps {
  sidebar: React.ReactElement;
  header: React.ReactElement;
  children: React.ReactNode;
}

/**
 * Componente de cliente que envuelve la estructura del dashboard
 * para manejar estados interactivos como el menú lateral en móvil.
 */
export default function DashboardShell({ sidebar, header, children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar el sidebar automáticamente cuando cambie la ruta (navegación)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Sidebar con props inyectadas mediante clonación para pasar el estado */}
      {sidebar && React.isValidElement(sidebar) ? 
        React.cloneElement(sidebar as React.ReactElement<any>, { 
          isOpen: isSidebarOpen, 
          onClose: closeSidebar 
        }) : null
      }

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        {/* Header con toggle del menú */}
        {header && React.isValidElement(header) ? 
          React.cloneElement(header as React.ReactElement<any>, { 
            onMenuToggle: toggleSidebar 
          }) : null
        }

        <main className="flex-1 overflow-y-auto bg-[var(--brand-50)]/30 scroll-smooth">
          <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
