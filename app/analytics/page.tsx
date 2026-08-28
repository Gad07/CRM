'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { RoleGuard } from '@/components/RoleGuard';
import { useCRM } from '@/context/CRMContext';
import { RevenueForecastingAndSLA } from '@/components/RevenueForecastingAndSLA';
import { ERPInvoicingAndStock } from '@/components/ERPInvoicingAndStock';
import { CommissionsTracker } from '@/components/CommissionsTracker';
import { BarChart3, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
  const { data, activePipeline, formatCurrency } = useCRM();

  const deals = data.deals.filter(d => d.pipeline_id === activePipeline?.id);
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  const wonDeals = deals.filter(d => d.status === 'won');
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  const lostDeals = deals.filter(d => d.status === 'lost');

  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  return (
    <RoleGuard permission="view_analytics">
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
        <Navbar />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Analítica Financiera, Pronóstico & ERP
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Supervisa la facturación, pronóstico de ventas, comisiones por vendedora e inventarios.
          </p>
        </div>

        {/* 4 CARDS RESUMEN EJECUTIVO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Total del Embudo</span>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(totalValue)}</p>
            <span className="text-xs text-slate-500 font-medium">{deals.length} oportunidades activas</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Ventas Ganadas</span>
            <p className="text-2xl font-black text-emerald-700">{formatCurrency(wonValue)}</p>
            <span className="text-xs text-emerald-600 font-bold">{wonDeals.length} tratos cerrados</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Tasa de Conversión (Win Rate)</span>
            <p className="text-2xl font-black text-indigo-700">{winRate}%</p>
            <span className="text-xs text-slate-500 font-medium">Basado en volumen de tratos</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Tratos Perdidos</span>
            <p className="text-2xl font-black text-red-600">{lostDeals.length}</p>
            <span className="text-xs text-slate-500 font-medium">Oportunidades no concretadas</span>
          </div>
        </div>

        {/* DISTRIBUCIÓN DE VALOR POR ETAPA */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" /> Distribución de Ingresos por Etapa del Embudo
          </h2>

          <div className="space-y-3">
            {activePipeline?.stages.map(stage => {
              const stageDeals = deals.filter(d => d.stage_id === stage.id);
              const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
              const percentOfTotal = totalValue > 0 ? Math.round((stageValue / totalValue) * 100) : 0;

              return (
                <div key={stage.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{stage.name} ({stageDeals.length})</span>
                    <span className="text-slate-900">{formatCurrency(stageValue)} ({percentOfTotal}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentOfTotal}%`,
                        backgroundColor: stage.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Control de Metas y Comisiones por Vendedora (10 Integrantes) */}
        <CommissionsTracker />

        {/* Pronóstico de Ingresos Weighted Forecast y SLA */}
        <RevenueForecastingAndSLA />

        {/* Módulo ERP Facturación FEL y Stock de Inventario */}
        <ERPInvoicingAndStock />
      </main>
    </div>
  </RoleGuard>
);
}
