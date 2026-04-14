'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import {
  Bell, AlertTriangle, AlertCircle, Info, Syringe,
  Heart, PackageX, ClockAlert, Loader2, RefreshCw,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { SupabaseHealthRepository } from '@/repositories/supabase/HealthRepository';
import { SupabaseInventoryRepository } from '@/repositories/supabase/InventoryRepository';
import type { VaccineAlert } from '@/types/domain/health.schema';

interface HealthAlertRow {
  id: string;
  animal_id: string;
  description: string;
  detected_at: string;
  animals?: { code: string };
}

interface StockAlert {
  id: string;
  name: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  expiry_date: string | null;
  category_name: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const daysLabel = (days: number) => {
  if (days > 0) return `${days} día${days !== 1 ? 's' : ''} de atraso`;
  if (days === 0) return 'Vence hoy';
  return `Faltan ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`;
};

export default function AlertasPage() {
  const router = useRouter();
  const [vaccineAlerts, setVaccineAlerts] = useState<VaccineAlert[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlertRow[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [healthRepo] = useState(() => new SupabaseHealthRepository(createClient()));
  const [inventoryRepo] = useState(() => new SupabaseInventoryRepository(createClient()));

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vaccAlerts, hAlerts, supplies] = await Promise.all([
        healthRepo.getVaccinationAlerts(),
        healthRepo.getHealthAlerts(),
        inventoryRepo.listSupplies(),
      ]);

      setVaccineAlerts(vaccAlerts);
      setHealthAlerts(hAlerts as HealthAlertRow[]);

      const today = new Date();
      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      setStockAlerts(
        supplies.filter((s) => {
          const stockLow = s.current_stock < s.min_stock;
          const expiringSoon = s.expiry_date
            ? new Date(s.expiry_date) <= in30Days
            : false;
          return stockLow || expiringSoon;
        })
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  }, [healthRepo, inventoryRepo]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const totalAlerts = vaccineAlerts.length + healthAlerts.length + stockAlerts.length;
  const criticalVacc = vaccineAlerts.filter((a) => a.urgency === 'immediate').length;

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR', 'ENCARGADO']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in pb-10">
        <PageHeader
          title="Centro de Alertas"
          description="Monitorea en tiempo real las vacunas atrasadas, animales en tratamiento y problemas de inventario."
          icon={Bell}
          actions={
            <button
              onClick={loadAlerts}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/5 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          }
        />

        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard
                icon={Syringe}
                label="Vacunaciones"
                count={vaccineAlerts.length}
                sub={criticalVacc > 0 ? `${criticalVacc} críticas` : 'Todo al día'}
                color="green"
              />
              <SummaryCard
                icon={Heart}
                label="En Tratamiento"
                count={healthAlerts.length}
                sub="Animales enfermos activos"
                color="red"
              />
              <SummaryCard
                icon={PackageX}
                label="Inventario"
                count={stockAlerts.length}
                sub="Bajo stock o próximo a vencer"
                color="orange"
              />
            </div>

            {totalAlerts === 0 && (
              <div className="py-20 text-center bg-white rounded-[2rem] border border-black/5 shadow-sm">
                <Bell className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="font-bold text-gray-400">¡Sin alertas activas! Todo bajo control.</p>
              </div>
            )}

            {/* Alertas de Vacunación */}
            {vaccineAlerts.length > 0 && (
              <AlertSection
                title="Vacunación"
                icon={<Syringe className="h-5 w-5 text-green-600" />}
                count={vaccineAlerts.length}
                badgeVariant="danger"
              >
                <div className="divide-y divide-black/5">
                  {vaccineAlerts.map((a, i) => (
                    <div
                      key={`${a.animal_id}-${a.vaccine_name}-${i}`}
                      className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/animales/${a.animal_id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          a.urgency === 'immediate' ? 'bg-red-50' : 'bg-amber-50'
                        }`}>
                          {a.urgency === 'immediate'
                            ? <AlertTriangle size={18} className="text-red-500" />
                            : <AlertCircle size={18} className="text-amber-500" />
                          }
                        </div>
                        <div>
                          <p className="font-black text-gray-900">
                            {a.animal_name ? `${a.animal_name} (${a.animal_code})` : a.animal_code}
                            {' '}<span className="font-medium text-gray-400">·</span>{' '}
                            <span className="text-[var(--brand)]">{a.vaccine_name}</span>
                          </p>
                          <p className="text-xs font-bold text-gray-400">
                            {a.species_name} · Próxima: {formatDate(a.next_dose_date)} · {daysLabel(a.days_overdue)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={a.urgency === 'immediate' ? 'danger' : 'warning'}>
                        {a.urgency === 'immediate' ? 'URGENTE' : 'PRÓXIMA'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </AlertSection>
            )}

            {/* Alertas de Salud */}
            {healthAlerts.length > 0 && (
              <AlertSection
                title="Animales en Tratamiento"
                icon={<Heart className="h-5 w-5 text-red-500" />}
                count={healthAlerts.length}
                badgeVariant="danger"
              >
                <div className="divide-y divide-black/5">
                  {healthAlerts.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => h.animal_id && router.push(`/dashboard/animales/${h.animal_id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                          <Heart size={18} className="text-red-500" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900">
                            {h.animals?.code ?? 'Animal desconocido'}
                          </p>
                          <p className="text-xs font-bold text-gray-400 max-w-sm truncate">
                            {h.description} · Detectado: {formatDate(h.detected_at)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="danger">EN TRATAMIENTO</Badge>
                    </div>
                  ))}
                </div>
              </AlertSection>
            )}

            {/* Alertas de Inventario */}
            {stockAlerts.length > 0 && (
              <AlertSection
                title="Inventario"
                icon={<PackageX className="h-5 w-5 text-orange-500" />}
                count={stockAlerts.length}
                badgeVariant="warning"
              >
                <div className="divide-y divide-black/5">
                  {stockAlerts.map((s) => {
                    const stockLow = s.current_stock < s.min_stock;
                    const expiryDate = s.expiry_date ? new Date(s.expiry_date) : null;
                    const daysToExpiry = expiryDate
                      ? Math.round((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;
                    const isCritical = stockLow && s.current_stock < s.min_stock * 0.5;

                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push('/dashboard/insumos')}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCritical ? 'bg-red-50' : 'bg-amber-50'
                          }`}>
                            <PackageX size={18} className={isCritical ? 'text-red-500' : 'text-amber-500'} />
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{s.name}</p>
                            <p className="text-xs font-bold text-gray-400">
                              {s.category_name}
                              {stockLow && ` · Stock: ${s.current_stock}/${s.min_stock} ${s.unit}`}
                              {daysToExpiry !== null && daysToExpiry <= 30 && (
                                ` · Vence en ${daysToExpiry} días`
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {stockLow && <Badge variant={isCritical ? 'danger' : 'warning'}>STOCK BAJO</Badge>}
                          {daysToExpiry !== null && daysToExpiry <= 30 && (
                            <Badge variant={daysToExpiry <= 7 ? 'danger' : 'warning'}>VENCE PRONTO</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AlertSection>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

function SummaryCard({
  icon: Icon, label, count, sub, color,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  sub: string;
  color: 'green' | 'red' | 'orange';
}) {
  const colors = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-500',
    orange: 'bg-orange-50 text-orange-500',
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-gray-900">{count}</p>
        <p className="text-xs font-bold text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

function AlertSection({
  title, icon, count, badgeVariant, children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  badgeVariant: 'danger' | 'warning';
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-black/5 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-extrabold text-gray-900">{title}</h3>
        </div>
        <Badge variant={badgeVariant} dot>{count} alerta{count !== 1 ? 's' : ''}</Badge>
      </div>
      {children}
    </div>
  );
}
