'use client';

import React, { useState } from 'react';
import { Trophy, TrendingUp, DollarSign, Award, Target, CheckCircle2, Users, Download } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function CommissionsTracker() {
  const { salesReps, formatCurrency } = useCRM();
  const [paidRepIds, setPaidRepIds] = useState<string[]>([]);

  const handlePayCommission = (repId: string, repName: string, amount: number) => {
    if (confirm(`¿Confirmar liquidación y pago de comisión por ${formatCurrency(amount)} a ${repName}?`)) {
      setPaidRepIds(prev => [...prev, repId]);
    }
  };

  const totalClosedRevenue = salesReps.reduce((sum, r) => sum + r.revenue_closed, 0);
  const totalCommissionsEarned = salesReps.reduce((sum, r) => sum + r.commission_earned, 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Control de Metas y Comisiones por Vendedora (10 Integrantes)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Mide el cumplimiento de cuota mensual, calcula comisiones al 5% automáticamente y gestiona liquidaciones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-right">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">Total Comisiones Mes</span>
            <span className="text-sm font-black text-emerald-700">{formatCurrency(totalCommissionsEarned)}</span>
          </div>
        </div>
      </div>

      {/* Roster de Vendedoras con Cumplimiento de Metas y Comisiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {salesReps.map(rep => {
          const isPaid = paidRepIds.includes(rep.id);
          const completion = Math.min(100, Math.round((rep.revenue_closed / rep.monthly_target) * 100));

          return (
            <div
              key={rep.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${rep.avatar_color} text-white font-extrabold text-xs flex items-center justify-center`}>
                    {rep.rep_name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{rep.rep_name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{rep.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 block">{formatCurrency(rep.revenue_closed)}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Meta: {formatCurrency(rep.monthly_target)}</span>
                </div>
              </div>

              {/* Progress Bar of Target */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-600">
                  <span>Avance de Cuota:</span>
                  <span className={completion >= 100 ? 'text-emerald-600 font-extrabold' : 'text-indigo-600 font-extrabold'}>
                    {completion}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      completion >= 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>

              {/* Commissions Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Comisión ({rep.commission_rate_percent}%):</span>
                  <span className="font-extrabold text-slate-900">{formatCurrency(rep.commission_earned)}</span>
                </div>

                {isPaid ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded-xl text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Liquidado
                  </span>
                ) : (
                  <button
                    onClick={() => handlePayCommission(rep.id, rep.rep_name, rep.commission_earned)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    Liquidar Comisión
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
