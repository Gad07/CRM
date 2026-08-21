'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Building2, User } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Deal, PriorityType, DealStatus } from '@/types/crm';
import confetti from 'canvas-confetti';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDeal?: Deal | null;
  initialStageId?: string;
}

export function DealModal({ isOpen, onClose, initialDeal, initialStageId }: DealModalProps) {
  const { data, activePipeline, addDeal, updateDeal } = useCRM();

  const dealCustomFields = data.custom_fields.filter(cf => cf.entity_type === 'deal');

  const [title, setTitle] = useState('');
  const [value, setValue] = useState<number>(10000);
  const [currency, setCurrency] = useState('USD');
  const [stageId, setStageId] = useState('');
  const [contactId, setContactId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [priority, setPriority] = useState<PriorityType>('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [status, setStatus] = useState<DealStatus>('open');
  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  useEffect(() => {
    if (initialDeal) {
      setTitle(initialDeal.title);
      setValue(initialDeal.value);
      setCurrency(initialDeal.currency || 'USD');
      setStageId(initialDeal.stage_id);
      setContactId(initialDeal.contact_id || '');
      setCompanyId(initialDeal.company_id || '');
      setPriority(initialDeal.priority);
      setTagsInput(initialDeal.tags.join(', '));
      setExpectedCloseDate(initialDeal.expected_close_date || '');
      setStatus(initialDeal.status);
      setCustomFields(initialDeal.custom_fields || {});
    } else {
      setTitle('');
      setValue(5000);
      setCurrency(data.settings.currency_code || 'USD');
      setStageId(initialStageId || activePipeline?.stages[0]?.id || '');
      setContactId('');
      setCompanyId('');
      setPriority('medium');
      setTagsInput('Prioritario');
      setExpectedCloseDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
      setStatus('open');
      setCustomFields({});
    }
  }, [initialDeal, initialStageId, activePipeline, isOpen]);

  if (!isOpen || !activePipeline) return null;

  const handleCustomFieldChange = (key: string, val: any) => {
    setCustomFields(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !stageId) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const contact = data.contacts.find(c => c.id === contactId);
    const company = data.companies.find(comp => comp.id === companyId);

    if (status === 'won' && (!initialDeal || initialDeal.status !== 'won')) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    if (initialDeal) {
      updateDeal({
        ...initialDeal,
        title,
        value: Number(value),
        currency,
        stage_id: stageId,
        contact_id: contactId || undefined,
        contact_name: contact?.name,
        company_id: companyId || undefined,
        company_name: company?.name,
        priority,
        tags,
        expected_close_date: expectedCloseDate,
        status,
        custom_fields: customFields
      });
    } else {
      addDeal({
        title,
        value: Number(value),
        currency,
        pipeline_id: activePipeline.id,
        stage_id: stageId,
        contact_id: contactId || undefined,
        contact_name: contact?.name,
        company_id: companyId || undefined,
        company_name: company?.name,
        priority,
        tags,
        expected_close_date: expectedCloseDate,
        order_index: 0,
        status,
        custom_fields: customFields
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialDeal ? 'Editar Oportunidad / Negocio' : 'Nueva Oportunidad / Negocio'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Embudo: <span className="text-indigo-700 font-bold">{activePipeline.name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-900">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Título del Negocio / Oportunidad *</label>
              <input
                type="text"
                required
                placeholder="ej: Venta de Licencias Enterprise..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Valor Financiero ({data.settings.currency_symbol})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{data.settings.currency_symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={value}
                    onChange={e => setValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Etapa en el Embudo *</label>
                <select
                  value={stageId}
                  onChange={e => setStageId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  {activePipeline.stages.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.win_probability}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> Contacto Principal
                </label>
                <select
                  value={contactId}
                  onChange={e => setContactId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="">-- Sin Contacto Asignado --</option>
                  {data.contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company_name || 'Particular'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Empresa Asociada
                </label>
                <select
                  value={companyId}
                  onChange={e => setCompanyId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="">-- Sin Empresa Asignada --</option>
                  {data.companies.map(comp => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Prioridad</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as PriorityType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Estado de la Venta</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as DealStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="open">Abierta (En Proceso)</option>
                  <option value="won">GANADA (Cerrada)</option>
                  <option value="lost">PERDIDA</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fecha Cierre Estimada</label>
                <input
                  type="date"
                  value={expectedCloseDate}
                  onChange={e => setExpectedCloseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Etiquetas (separadas por coma)</label>
              <input
                type="text"
                placeholder="ej: VIP, Residencial, Urgente"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* DYNAMIC CUSTOM FIELDS SECTION */}
          {dealCustomFields.length > 0 && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Campos Personalizados de la Empresa ({dealCustomFields.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {dealCustomFields.map(cf => (
                  <div key={cf.id}>
                    <label className="text-xs font-bold text-slate-700 block mb-1">{cf.label}</label>

                    {cf.field_type === 'text' && (
                      <input
                        type="text"
                        value={customFields[cf.name] || ''}
                        onChange={e => handleCustomFieldChange(cf.name, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    )}

                    {cf.field_type === 'number' && (
                      <input
                        type="number"
                        value={customFields[cf.name] || ''}
                        onChange={e => handleCustomFieldChange(cf.name, parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    )}

                    {cf.field_type === 'select' && (
                      <select
                        value={customFields[cf.name] || ''}
                        onChange={e => handleCustomFieldChange(cf.name, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                      >
                        <option value="">-- Seleccionar --</option>
                        {cf.options?.map(opt => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {cf.field_type === 'date' && (
                      <input
                        type="date"
                        value={customFields[cf.name] || ''}
                        onChange={e => handleCustomFieldChange(cf.name, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    )}

                    {cf.field_type === 'boolean' && (
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(customFields[cf.name])}
                          onChange={e => handleCustomFieldChange(cf.name, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="text-xs text-slate-700 font-medium">Activo / Sí</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2 rounded-xl shadow-xs transition-all"
            >
              {initialDeal ? 'Guardar Cambios' : 'Crear Negocio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
