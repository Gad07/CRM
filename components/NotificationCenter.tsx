'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function NotificationCenter() {
  const { data, getLeadScoreInfo, formatCurrency } = useCRM();
  const [isOpen, setIsOpen] = useState(false);

  const notifications: Array<{
    id: string;
    type: 'hot_lead' | 'high_value' | 'task_due';
    title: string;
    description: string;
    timestamp: string;
  }> = [];

  data.deals.forEach(deal => {
    const scoreInfo = getLeadScoreInfo(deal);
    if (scoreInfo.rating === 'hot' && deal.status === 'open') {
      notifications.push({
        id: `notif-hot-${deal.id}`,
        type: 'hot_lead',
        title: `Lead Caliente: ${deal.title}`,
        description: `Score de ${scoreInfo.score}/100 pts. Valor: ${formatCurrency(deal.value)}.`,
        timestamp: 'Ahora'
      });
    }
  });

  data.deals.forEach(deal => {
    if (deal.value >= 25000 && deal.status === 'open') {
      notifications.push({
        id: `notif-val-${deal.id}`,
        type: 'high_value',
        title: `Oportunidad VIP: ${deal.title}`,
        description: `Monto relevante de ${formatCurrency(deal.value)}.`,
        timestamp: 'Hoy'
      });
    }
  });

  data.activities.forEach(act => {
    if (act.status !== 'completed') {
      notifications.push({
        id: `notif-act-${act.id}`,
        type: 'task_due',
        title: `Tarea Pendiente: ${act.title}`,
        description: `Vence el ${act.due_date || 'pronto'}.`,
        timestamp: 'Pendiente'
      });
    }
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
        title="Centro de Notificaciones"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-xs">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-4 space-y-3 animate-fade-in text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Centro de Notificaciones</h3>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                {notifications.length} nuevas
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 font-medium">
                  ¡No hay alertas pendientes! Todo al día.
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 hover:border-slate-300 transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[9px] text-slate-500 font-mono font-bold">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">{n.description}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider"
              >
                Cerrar Notificaciones
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
