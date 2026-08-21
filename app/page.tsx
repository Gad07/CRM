'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Kanban,
  Target,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Navbar } from '@/components/Navbar';
import { DealModal } from '@/components/DealModal';
import { PipelineEditorModal } from '@/components/PipelineEditorModal';
import { Deal } from '@/types/crm';

export default function DashboardPage() {
  const { data, activePipeline, formatCurrency } = useCRM();

  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isStageEditorOpen, setIsStageEditorOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const deals = data.deals.filter(d => d.pipeline_id === activePipeline?.id);

  // Financial Metrics
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const weightedForecast = deals.reduce((sum, d) => {
    const stage = activePipeline?.stages.find(st => st.id === d.stage_id);
    const winProb = stage ? stage.win_probability / 100 : 0.5;
    return sum + d.value * winProb;
  }, 0);

  const wonDeals = deals.filter(d => d.status === 'won');
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;
  const avgDealValue = deals.length > 0 ? Math.round(totalValue / deals.length) : 0;

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDealModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Navbar
        onOpenNewDealModal={() => {
          setSelectedDeal(null);
          setIsDealModalOpen(true);
        }}
        onOpenPipelineEditorModal={() => setIsStageEditorOpen(true)}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" /> CRM Empresarial Adaptable
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Bienvenido al Panel de Control de Ventas
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Embudo Activo: <span className="text-slate-900 font-bold">{activePipeline?.name}</span> ({activePipeline?.stages.length} etapas personalizadas)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pipeline"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <Kanban className="w-4 h-4" />
              <span>Ver Tablero Kanban</span>
            </Link>
          </div>
        </div>

        {/* Key Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Valor Total Pipeline</span>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                <DollarSign className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(totalValue)}</p>
            <p className="text-[11px] font-semibold text-slate-500">Sumatoria de {deals.length} oportunidades</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Pronóstico Ponderado</span>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700">{formatCurrency(weightedForecast)}</p>
            <p className="text-[11px] font-semibold text-slate-500">Calculado con probabilidad por etapa</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Tasa de Cierre (Win Rate)</span>
              <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
                <Award className="w-4 h-4 text-purple-700" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-700">{winRate}%</p>
            <p className="text-[11px] font-semibold text-slate-500">{wonDeals.length} negocios ganados</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Promedio por Negocio</span>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                <Target className="w-4 h-4 text-amber-700" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-700">{formatCurrency(avgDealValue)}</p>
            <p className="text-[11px] font-semibold text-slate-500">Ticket promedio en embudo</p>
          </div>
        </div>

        {/* Funnel Stage Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Desglose de Etapas del Embudo Actual
            </h2>
            <button
              onClick={() => setIsStageEditorOpen(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              Configurar Etapas →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activePipeline?.stages.map(stage => {
              const stageDeals = deals.filter(d => d.stage_id === stage.id);
              const stageVal = stageDeals.reduce((sum, d) => sum + d.value, 0);

              return (
                <div key={stage.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      {stage.name}
                    </span>
                    <span className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
                      {stageDeals.length} tratos
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-sm font-extrabold text-slate-900">{formatCurrency(stageVal)}</span>
                    <span className="text-[11px] text-indigo-700 font-bold">{stage.win_probability}% Éxito</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        initialDeal={selectedDeal}
      />

      <PipelineEditorModal
        isOpen={isStageEditorOpen}
        onClose={() => setIsStageEditorOpen(false)}
      />
    </div>
  );
}
