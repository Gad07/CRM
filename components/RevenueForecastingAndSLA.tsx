'use client';

import React from 'react';
import { TrendingUp, Award, AlertTriangle, ShieldAlert, Target, Trophy, Flame, ChevronRight, Zap } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function RevenueForecastingAndSLA() {
  const { data, activePipeline, salesReps, formatCurrency } = useCRM();

  const deals = data.deals.filter(d => d.status === 'open');

  // Weighted Revenue Calculation
  let weightedRevenue = 0;
  let totalPipelineGross = 0;
  const dealsAtRisk: typeof deals = [];

  deals.forEach(deal => {
    totalPipelineGross += deal.value;
    const stage = activePipeline?.stages.find(s => s.id === deal.stage_id);
    const winProb = stage?.win_probability || 20;
    weightedRevenue += deal.value * (winProb / 100);

    // Check SLA (created or inactive > 7 days)
    const dealDate = new Date(deal.created_at).getTime();
    const daysOld = (Date.now() - dealDate) / (1000 * 3600 * 24);
    if (daysOld > 5) {
      dealsAtRisk.push(deal);
    }
  });

  const monthlyTarget = 500000;
  const targetPercent = Math.min(100, Math.round((weightedRevenue / monthlyTarget) * 100));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" /> Pronóstico de Ingresos, SLA & Leaderboard de Venta
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Proyección ponderada de ingresos, radar de fugas de negocios y comisiones por vendedor
          </p>
        </div>
      </div>

      {/* Grid Section 1: Forecasting & Target Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Forecast Card */}
        <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl space-y-2">
          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">Ingreso Ponderado Pronosticado</span>
          <span className="text-2xl font-extrabold text-indigo-700 block">{formatCurrency(weightedRevenue)}</span>
          <p className="text-xs text-slate-600 font-medium">
            Calculado sobre <strong className="text-slate-900">{formatCurrency(totalPipelineGross)}</strong> en embudo activo según probabilidad de cierre.
          </p>
        </div>

        {/* Goal Achievement Card */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-700 uppercase tracking-wider text-[11px]">Cumplimiento de Meta Mensual</span>
            <span className="text-indigo-600">{targetPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${targetPercent}%` }} />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Meta objetivo: <strong className="text-slate-900">{formatCurrency(monthlyTarget)}</strong>
          </p>
        </div>

        {/* SLA Leakage Alert Card */}
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span className="text-[11px] font-bold text-red-900 uppercase tracking-wider">Radar de Fugas SLA</span>
          </div>
          <span className="text-2xl font-extrabold text-red-700 block">{dealsAtRisk.length} Negocios en Riesgo</span>
          <p className="text-xs text-red-700 font-medium">
            Oportunidades estancadas por más de 5 días sin avance de etapa.
          </p>
        </div>
      </div>

      {/* Grid Section 2: Gamification Leaderboard & At Risk Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEADERBOARD VENDEDORES */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" /> Tabla de Clasificación de Vendedores (Comisiones)
          </h3>

          <div className="space-y-2">
            {salesReps.map((rep, idx) => (
              <div key={rep.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${rep.avatar_color} text-white font-extrabold text-xs flex items-center justify-center shadow-xs`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rep.rep_name}</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">{rep.role}</span>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-xs font-extrabold text-emerald-700 block">{formatCurrency(rep.revenue_closed)}</span>
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    Comisión: {formatCurrency(rep.commission_earned)} ({rep.commission_rate_percent}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AT RISK DEALS LIST */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600" /> Negocios Estancados & Alertas de Rescate
          </h3>

          {dealsAtRisk.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center text-xs text-emerald-800 font-bold">
              ¡Excelente! No hay oportunidades estancadas en el embudo.
            </div>
          ) : (
            <div className="space-y-2">
              {dealsAtRisk.slice(0, 4).map(deal => (
                <div key={deal.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{deal.title}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">{deal.contact_name} • {deal.company_name}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900 block">{formatCurrency(deal.value)}</span>
                    <span className="text-[10px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Estancado &gt; 5 días
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
