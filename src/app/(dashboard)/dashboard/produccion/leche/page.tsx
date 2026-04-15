import React from 'react';
import MilkProductionForm from '@/components/production/MilkProductionForm';
import { getCows, getMilkRecords } from '@/actions/production.actions';
import { Milk, ArrowLeft, History } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MilkProductionPage() {
  const [{ data: cows }, { data: records }] = await Promise.all([
    getCows(),
    getMilkRecords()
  ]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/produccion" className="bg-white p-2 rounded-xl text-gray-500 hover:text-[var(--brand)] shadow-sm border border-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
               <Milk className="w-6 h-6" />
             </div>
             <div>
               <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Producción Lechera</h1>
               <p className="text-gray-500 text-sm font-medium">Bovinos y registro de litros</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulario (Columna Izquierda) */}
        <div className="lg:col-span-5">
           <MilkProductionForm cows={cows || []} />
        </div>

        {/* Historial (Columna Derecha) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" /> Historial Reciente
            </h3>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">Ultimos 50</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">Fecha / Turno</th>
                  <th className="px-6 py-4">Vaca</th>
                  <th className="px-6 py-4 text-right rounded-tr-xl">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(!records || records.length === 0) ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-medium">
                      No hay registros recientes.
                    </td>
                  </tr>
                ) : (
                  records.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{new Date(record.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{record.shift}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {record.animal?.notes || 'Animal (sin apodo)'} 
                        <span className="block text-xs text-gray-400">Código ID: {record.animal?.code}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                          {record.quantity_liters} L
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
