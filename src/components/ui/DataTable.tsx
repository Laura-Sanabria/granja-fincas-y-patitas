'use client';

import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T>({ columns, data, keyExtractor, emptyMessage = 'No se encontraron registros.', onRowClick }: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-black/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 text-[10px] uppercase tracking-widest font-extrabold text-gray-400 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`hover:bg-gray-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 text-sm ${col.className || ''}`}>
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="p-12 text-center text-gray-400 italic font-medium">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
