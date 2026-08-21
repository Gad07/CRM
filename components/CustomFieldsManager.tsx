'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Sliders, Type, Hash, ListFilter, Calendar, CheckSquare } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { EntityType, FieldType } from '@/types/crm';

export function CustomFieldsManager() {
  const { data, addCustomField, deleteCustomField } = useCRM();

  const [activeTab, setActiveTab] = useState<EntityType>('deal');
  const [label, setLabel] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [optionsInput, setOptionsInput] = useState('');

  const currentFields = data.custom_fields.filter(cf => cf.entity_type === activeTab);

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const keyName = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_');

    const options = fieldType === 'select'
      ? optionsInput.split(',').map(o => o.trim()).filter(Boolean)
      : [];

    addCustomField({
      entity_type: activeTab,
      name: keyName,
      label: label.trim(),
      field_type: fieldType,
      options,
      order_index: currentFields.length
    });

    setLabel('');
    setOptionsInput('');
  };

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4 text-blue-600" />;
      case 'number': return <Hash className="w-4 h-4 text-emerald-600" />;
      case 'select': return <ListFilter className="w-4 h-4 text-purple-600" />;
      case 'date': return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'boolean': return <CheckSquare className="w-4 h-4 text-pink-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Campos Personalizados (Adaptador de Empresa)</h2>
            <p className="text-xs text-slate-500 font-medium">Define nuevos campos específicos para tu modelo de negocio</p>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'deal', label: 'Negocios / Oportunidades' },
            { id: 'contact', label: 'Contactos' },
            { id: 'company', label: 'Empresas' }
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Existing Custom Fields */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Campos Activos para {activeTab === 'deal' ? 'Negocios' : activeTab === 'contact' ? 'Contactos' : 'Empresas'} ({currentFields.length})
        </h3>

        {currentFields.length === 0 ? (
          <p className="text-xs text-slate-500 font-medium p-4 text-center bg-slate-50 rounded-xl border border-slate-200">
            No hay campos personalizados creados para esta categoría.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentFields.map(cf => (
              <div
                key={cf.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                    {getFieldIcon(cf.field_type)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{cf.label}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Tipo: {cf.field_type} {cf.options && cf.options.length > 0 ? `(${cf.options.length} opciones)` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteCustomField(cf.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg shrink-0"
                  title="Eliminar campo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Custom Field Form */}
      <form onSubmit={handleAddField} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Agregar Nuevo Campo Personalizado
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre / Etiqueta del Campo *</label>
            <input
              type="text"
              required
              placeholder="ej: Presupuesto Estimado, Zona..."
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Tipo de Dato</label>
            <select
              value={fieldType}
              onChange={e => setFieldType(e.target.value as FieldType)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
            >
              <option value="text">Texto Libre</option>
              <option value="number">Número / Cantidad</option>
              <option value="select">Selección Desplegable (Dropdown)</option>
              <option value="date">Fecha (Calendario)</option>
              <option value="boolean">Casilla de Verificación (Sí/No)</option>
            </select>
          </div>

          {fieldType === 'select' && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Opciones (separadas por coma)</label>
              <input
                type="text"
                placeholder="ej: Alto, Medio, Bajo"
                value={optionsInput}
                onChange={e => setOptionsInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            + Crear Campo Personalizado
          </button>
        </div>
      </form>
    </div>
  );
}
