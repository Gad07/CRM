'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useCRM } from '@/context/CRMContext';
import { ActivityType } from '@/types/crm';
import { CalendarCheck, Phone, Video, Mail, CheckCircle2, Circle, Plus, Clock } from 'lucide-react';

export default function ActivitiesPage() {
  const { data, addActivity, toggleActivityStatus } = useCRM();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('task');
  const [dealId, setDealId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const deal = data.deals.find(d => d.id === dealId);

    addActivity({
      title: title.trim(),
      type,
      status: 'pending',
      deal_id: dealId || undefined,
      deal_title: deal?.title,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined
    });

    setTitle('');
    setDealId('');
    setDueDate('');
    setIsFormOpen(false);
  };

  const getActivityIcon = (actType: ActivityType) => {
    switch (actType) {
      case 'call': return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'meeting': return <Video className="w-4 h-4 text-purple-600" />;
      case 'email': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'task': return <CalendarCheck className="w-4 h-4 text-amber-600" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" /> Agenda y Tareas de Seguimiento
            </h1>
            <p className="text-xs text-slate-500 font-medium">Gestiona llamadas, reuniones, correos y tareas vinculadas a tus negocios.</p>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isFormOpen ? 'Cancelar' : 'Nueva Tarea / Actividad'}</span>
          </button>
        </div>

        {/* New Activity Collapsible Form */}
        {isFormOpen && (
          <form onSubmit={handleAdd} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-fade-in text-slate-900">
            <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Crear Nueva Actividad / Seguimiento</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Título de la Actividad *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Llamar para confirmar firma de contrato..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tipo de Actividad</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as ActivityType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="call">📞 Llamada Telefónica</option>
                  <option value="meeting">🤝 Reunión / Demostración</option>
                  <option value="email">📧 Correo Electrónico</option>
                  <option value="task">✅ Tarea Pendiente</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Vincular a Negocio / Oportunidad</label>
                <select
                  value={dealId}
                  onChange={e => setDealId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="">-- Ninguno (General) --</option>
                  {data.deals.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Fecha Límite</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Guardar Actividad
              </button>
            </div>
          </form>
        )}

        {/* Activities List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Lista de Tareas Pendientes ({data.activities.length})</h2>

          <div className="space-y-2">
            {data.activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-medium">No hay tareas o seguimientos programados.</p>
            ) : (
              data.activities.map(act => (
                <div
                  key={act.id}
                  onClick={() => toggleActivityStatus(act.id)}
                  className={`bg-slate-50 border p-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    act.status === 'completed'
                      ? 'border-slate-200 opacity-60 line-through'
                      : 'border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                      {act.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      {getActivityIcon(act.type)}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{act.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {act.deal_title ? `Negocio: ${act.deal_title}` : 'Tarea General'}
                      </p>
                    </div>
                  </div>

                  {act.due_date && (
                    <span className="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                      {new Date(act.due_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
