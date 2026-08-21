'use client';

import React, { useState } from 'react';
import { Bot, Trash2, Zap, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { TriggerType, ActionType } from '@/types/enterprise';

export function AutomationRulesManager() {
  const { automationRules, addAutomationRule, toggleAutomationRule, deleteAutomationRule } = useCRM();

  const [ruleName, setRuleName] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('stage_changed');
  const [triggerStageId, setTriggerStageId] = useState('');
  const [triggerMinValue, setTriggerMinValue] = useState(25000);
  const [actionType, setActionType] = useState<ActionType>('create_task');
  const [actionTaskTitle, setActionTaskTitle] = useState('');
  const [actionNewPriority, setActionNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('urgent');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    addAutomationRule({
      name: ruleName.trim(),
      is_active: true,
      trigger_type: triggerType,
      trigger_stage_id: triggerStageId || undefined,
      trigger_min_value: triggerMinValue,
      action_type: actionType,
      action_task_title: actionTaskTitle || 'Seguimiento Automático de Venta',
      action_new_priority: actionNewPriority
    });

    setRuleName('');
    setActionTaskTitle('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Motor de Automatizaciones & Workflows</h2>
            <p className="text-xs text-slate-500 font-medium">Ejecuta acciones automáticas en respuesta a eventos de tus negocios</p>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {automationRules.map(rule => (
          <div
            key={rule.id}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <button onClick={() => toggleAutomationRule(rule.id)} className="text-indigo-600 transition-transform">
                {rule.is_active ? <ToggleRight className="w-7 h-7 text-indigo-600" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
              </button>
              <div>
                <h3 className="font-bold text-slate-900 text-xs">{rule.name}</h3>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="text-indigo-700 font-bold">Si: {rule.trigger_type}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-700 font-bold">Entonces: {rule.action_type}</span>
                </p>
              </div>
            </div>

            <button onClick={() => deleteAutomationRule(rule.id)} className="text-slate-400 hover:text-red-600 p-1 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Rule Form */}
      <form onSubmit={handleAddRule} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
        <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Crear Nueva Regla de Automatización
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre de la Regla *</label>
            <input
              type="text"
              required
              placeholder="ej: Auto-Crear Tarea al Cotizar..."
              value={ruleName}
              onChange={e => setRuleName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Disparador (Trigger)</label>
            <select
              value={triggerType}
              onChange={e => setTriggerType(e.target.value as TriggerType)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="stage_changed">Al cambiar de etapa</option>
              <option value="value_exceeded">Al superar un monto financiero</option>
              <option value="priority_assigned">Al asignar prioridad</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Acción Automatizada (Action)</label>
            <select
              value={actionType}
              onChange={e => setActionType(e.target.value as ActionType)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="create_task">Crear Tarea / Seguimiento</option>
              <option value="change_priority">Cambiar Prioridad del Negocio</option>
            </select>
          </div>

          {actionType === 'create_task' && (
            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Título de la Tarea Automática</label>
              <input
                type="text"
                placeholder="ej: Enviar propuesta detallada y llamar a cliente..."
                value={actionTaskTitle}
                onChange={e => setActionTaskTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            + Guardar Regla
          </button>
        </div>
      </form>
    </div>
  );
}
