import { Tractor, Info, Users, EggFried } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inicio</h1>
          <p className="text-gray-500 mt-1">Bienvenido al panel gerencial de Granja Fincas y Patitas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--glass-border)] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-[var(--brand)]">
              <Tractor size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Inventario Pecuario</p>
              <h2 className="text-2xl font-bold text-gray-800">125</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500">Animales activos en todas las categorías.</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--glass-border)] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <EggFried size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Producción Hoy</p>
              <h2 className="text-2xl font-bold text-gray-800">430</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500">Unidades de huevos y litros de leche.</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--glass-border)] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Usuarios Sistema</p>
              <h2 className="text-2xl font-bold text-gray-800">3</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500">Empleados con acceso a la plataforma.</p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4 mt-4 text-blue-800">
        <Info className="shrink-0" />
        <div>
          <h3 className="font-bold">Módulo de Trazabilidad completado</h3>
          <p className="text-sm opacity-90 mt-1">La Fase 1 referente a la base arquitectónica y diseño base ha sido satisfactoriamente desarrollada. Ahora puedes verificar los roles asignados en este Dashboard.</p>
        </div>
      </div>
    </div>
  );
}
