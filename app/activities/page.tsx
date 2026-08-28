'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useCRM } from '@/context/CRMContext';
import { Activity, ActivityType } from '@/types/crm';
import {
  CalendarCheck,
  Phone,
  Video,
  Mail,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckSquare,
  AlertCircle,
  Calendar
} from 'lucide-react';

export default function ActivitiesPage() {
  const { data, addActivity, updateActivity, deleteActivity, toggleActivityStatus } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('task');
  const [dealId, setDealId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const handleOpenForm = (act?: Activity) => {
    if (act) {
      setEditingActivity(act);
      setTitle(act.title);
      setType(act.type);
      setDealId(act.deal_id || '');
      setDueDate(act.due_date ? act.due_date.substring(0, 16) : '');
    } else {
      setEditingActivity(null);
      setTitle('');
      setType('task');
      setDealId('');
      setDueDate('');
    }
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const deal = data.deals.find(d => d.id === dealId);

    if (editingActivity) {
      updateActivity({
        ...editingActivity,
        title: title.trim(),
        type,
        deal_id: dealId || undefined,
        deal_title: deal?.title,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined
      });
    } else {
      addActivity({
        title: title.trim(),
        type,
        status: 'pending',
        deal_id: dealId || undefined,
        deal_title: deal?.title,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined
      });
    }

    setTitle('');
    setDealId('');
    setDueDate('');
    setEditingActivity(null);
    setIsFormOpen(false);
  };

  const getActivityIcon = (actType: ActivityType) => {
    switch (actType) {
      case 'call':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'meeting':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'task':
        return <CalendarCheck className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredActivities = data.activities.filter(act => {
    if (statusFilter !== 'all' && act.status !== statusFilter) return false;
    if (typeFilter !== 'all' && act.type !== typeFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      act.title.toLowerCase().includes(q) ||
      (act.deal_title && act.deal_title.toLowerCase().includes(q))
    );
  });

  const pendingCount = data.activities.filter(a => a.status === 'pending').length;
  const completedCount = data.activities.filter(a => a.status === 'completed').length;
  const callsCount = data.activities.filter(a => a.type === 'call').length;
  const meetingsCount = data.activities.filter(a => a.type === 'meeting').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
        {/* Stat Indicators Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tareas Pendientes</span>
              <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completadas</span>
              <p className="text-2xl font-black text-emerald-700">{completedCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Llamadas Agendadas</span>
              <p className="text-2xl font-black text-blue-700">{callsCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Phone className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reuniones / Demos</span>
              <p className="text-2xl font-black text-purple-700">{meetingsCount}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Video className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Action and Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" /> Agenda y Tareas de Seguimiento
            </h1>
            <p className="text-xs text-slate-500 font-medium">Gestiona llamadas, reuniones, correos y tareas vinculadas a tus negocios.</p>
          </div>

          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Actividad / Tarea</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({data.activities.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pendientes ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'completed' ? 'bg-white text-emerald-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completadas ({completedCount})
              </button>
            </div>

            {/* Type selector */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="all">Todos los Tipos</option>
              <option value="call">📞 Llamadas</option>
              <option value="meeting">🤝 Reuniones</option>
              <option value="email">📧 Correos</option>
              <option value="task">✅ Tareas</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título o negocio..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>

        {/* Activity Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fade-in text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-indigo-600" />
                  {editingActivity ? 'Editar Actividad' : 'Nueva Actividad / Tarea'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Título de la Actividad *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Llamar a Lic. Morales para confirmar firma..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Actividad</label>
                    <select
                      value={type}
                      onChange={e => setType(e.target.value as ActivityType)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                    >
                      <option value="call">📞 Llamada Telefónica</option>
                      <option value="meeting">🤝 Reunión / Demostración</option>
                      <option value="email">📧 Correo Electrónico</option>
                      <option value="task">✅ Tarea Pendiente</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Fecha Límite</label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vincular a Negocio / Oportunidad</label>
                  <select
                    value={dealId}
                    onChange={e => setDealId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                  >
                    <option value="">-- Ninguno (Actividad General) --</option>
                    {data.deals.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.contact_name || 'Sin contacto'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs"
                  >
                    {editingActivity ? 'Guardar Cambios' : 'Crear Actividad'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Listado de Actividades ({filteredActivities.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {filteredActivities.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No se encontraron actividades para los filtros seleccionados.</p>
              </div>
            ) : (
              filteredActivities.map(act => (
                <div
                  key={act.id}
                  className={`bg-slate-50 border p-4 rounded-2xl flex items-center justify-between gap-4 transition-all group ${
                    act.status === 'completed'
                      ? 'border-slate-200 opacity-60 bg-slate-50/50'
                      : 'border-slate-200 hover:border-indigo-400 hover:shadow-xs bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleActivityStatus(act.id)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                      title={act.status === 'completed' ? 'Marcar pendiente' : 'Marcar completada'}
                    >
                      {act.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                      {getActivityIcon(act.type)}
                    </div>

                    <div className="min-w-0">
                      <h4
                        className={`font-bold text-xs truncate ${
                          act.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {act.deal_title ? `Negocio: ${act.deal_title}` : 'Actividad General'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {act.due_date && (
                      <span className="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-600" />
                        {new Date(act.due_date).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenForm(act)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                      title="Editar actividad"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la actividad "${act.title}"?`)) {
                          deleteActivity(act.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Eliminar actividad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
