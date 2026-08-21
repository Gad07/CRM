'use client';

import React, { useState } from 'react';
import { UserCheck, Zap, Check } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function LeadAssignmentManager() {
  const { salesReps, addTimelineEvent } = useCRM();
  const [strategy, setStrategy] = useState<'round_robin' | 'capacity' | 'high_ticket'>('round_robin');
  const [activeReps, setActiveReps] = useState<string[]>(['rep-1', 'rep-2', 'rep-3']);
  const [lastAssignedIndex, setLastAssignedIndex] = useState(0);
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  const toggleRepActive = (repId: string) => {
    setActiveReps(prev =>
      prev.includes(repId) ? prev.filter(id => id !== repId) : [...prev, repId]
    );
  };

  const handleSimulateLeadAssignment = () => {
    const eligibleReps = salesReps.filter(r => activeReps.includes(r.id));
    if (eligibleReps.length === 0) {
      alert('No hay vendedores activos seleccionados para la rotación.');
      return;
    }

    let assignedRep = eligibleReps[0];

    if (strategy === 'round_robin') {
      const nextIndex = (lastAssignedIndex + 1) % eligibleReps.length;
      assignedRep = eligibleReps[nextIndex];
      setLastAssignedIndex(nextIndex);
    } else if (strategy === 'capacity') {
      assignedRep = [...eligibleReps].sort((a, b) => a.deals_won_count - b.deals_won_count)[0];
    } else {
      assignedRep = [...eligibleReps].sort((a, b) => b.revenue_closed - a.revenue_closed)[0];
    }

    const mockLeadName = `Lead Web #${Math.floor(100 + Math.random() * 900)} (Inversión Corporativa)`;
    const notifMsg = `⚡ Nuevo Lead "${mockLeadName}" asignado automáticamente a ${assignedRep.rep_name} (${assignedRep.role}) vía ${
      strategy === 'round_robin' ? 'Round-Robin' : strategy === 'capacity' ? 'Carga Equitativa' : 'Asignación High-Ticket'
    }`;

    setLastNotification(notifMsg);

    addTimelineEvent({
      deal_id: 'deal-1',
      type: 'stage_change',
      title: 'Asignación Automática de Lead',
      description: notifMsg
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-slate-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" /> Enrutador y Asignación Automática de Leads (Round-Robin)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Distribuye los leads entrantes de WhatsApp o Webhooks equitativamente entre tus ejecutivos de ventas sin intervención manual.
          </p>
        </div>

        <button
          onClick={handleSimulateLeadAssignment}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Simular Entrada de Lead</span>
        </button>
      </div>

      {lastNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-xl text-xs font-bold flex items-center justify-between animate-fade-in">
          <span>{lastNotification}</span>
          <button onClick={() => setLastNotification(null)} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Selector de Estrategia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setStrategy('round_robin')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            strategy === 'round_robin'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-extrabold text-slate-900">1. Rotación Round-Robin</h4>
            {strategy === 'round_robin' && <Check className="w-4 h-4 text-emerald-600" />}
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Asigna leads 1 a 1 en orden secuencial estricto a cada vendedor disponible.
          </p>
        </button>

        <button
          onClick={() => setStrategy('capacity')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            strategy === 'capacity'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-extrabold text-slate-900">2. Carga Equitativa</h4>
            {strategy === 'capacity' && <Check className="w-4 h-4 text-emerald-600" />}
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Asigna el nuevo lead al ejecutivo que tenga menor número de tratos abiertos actualmente.
          </p>
        </button>

        <button
          onClick={() => setStrategy('high_ticket')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            strategy === 'high_ticket'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-extrabold text-slate-900">3. Ruta High-Ticket</h4>
            {strategy === 'high_ticket' && <Check className="w-4 h-4 text-emerald-600" />}
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Prioriza la asignación directa al Gerente o Vendedor Senior con mayor facturación histórica.
          </p>
        </button>
      </div>

      {/* Roster de Vendedores Habilitados */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Ejecutivos Activos en el Algoritmo ({activeReps.length} de {salesReps.length}):
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {salesReps.map(rep => {
            const isIncluded = activeReps.includes(rep.id);
            return (
              <div
                key={rep.id}
                onClick={() => toggleRepActive(rep.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isIncluded ? 'bg-white border-emerald-300 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                    {rep.rep_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{rep.rep_name}</h5>
                    <p className="text-[10px] text-slate-500 font-medium">{rep.role}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    isIncluded ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isIncluded && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
