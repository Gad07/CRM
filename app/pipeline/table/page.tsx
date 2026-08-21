'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { DealModal } from '@/components/DealModal';
import { useCRM } from '@/context/CRMContext';
import { Deal } from '@/types/crm';
import { Edit3, Trash2 } from 'lucide-react';

export default function PipelineTableView() {
  const { data, activePipeline, formatCurrency, deleteDeal, updateDeal } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  const deals = data.deals.filter(d => {
    if (d.pipeline_id !== activePipeline?.id) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      (d.contact_name && d.contact_name.toLowerCase().includes(q)) ||
      (d.company_name && d.company_name.toLowerCase().includes(q))
    );
  });

  const dealCustomFields = data.custom_fields.filter(cf => cf.entity_type === 'deal');

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDealModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewDealModal={() => {
          setSelectedDeal(null);
          setIsDealModalOpen(true);
        }}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Vista en Tabla de Negocios</h1>
            <p className="text-xs text-slate-500 font-medium">
              Embudo: <span className="text-indigo-700 font-bold">{activePipeline?.name}</span> ({deals.length} registros)
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs text-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Negocio / Título</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3">Contacto / Empresa</th>
                  <th className="px-4 py-3">Prioridad</th>
                  <th className="px-4 py-3">Estado</th>
                  {dealCustomFields.map(cf => (
                    <th key={cf.id} className="px-4 py-3 text-purple-700">
                      {cf.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {deals.length === 0 ? (
                  <tr>
                    <td colSpan={7 + dealCustomFields.length} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No se encontraron negocios con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  deals.map(deal => {
                    return (
                      <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900 max-w-xs truncate">
                          {deal.title}
                        </td>

                        <td className="px-4 py-3 font-black text-emerald-700">
                          {formatCurrency(deal.value)}
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={deal.stage_id}
                            onChange={e => updateDeal({ ...deal, stage_id: e.target.value })}
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-bold cursor-pointer"
                          >
                            {activePipeline?.stages.map(st => (
                              <option key={st.id} value={st.id}>
                                {st.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-slate-900">{deal.contact_name || 'Sin contacto'}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{deal.company_name || 'Sin empresa'}</p>
                          </div>
                        </td>

                        <td className="px-4 py-3 uppercase font-bold text-[10px]">
                          {deal.priority}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              deal.status === 'won'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : deal.status === 'lost'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {deal.status === 'won' ? 'GANADA' : deal.status === 'lost' ? 'PERDIDA' : 'ABIERTA'}
                          </span>
                        </td>

                        {dealCustomFields.map(cf => (
                          <td key={cf.id} className="px-4 py-3 text-purple-900 font-bold">
                            {String(deal.custom_fields?.[cf.name] ?? '-')}
                          </td>
                        ))}

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(deal)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteDeal(deal.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        initialDeal={selectedDeal}
      />
    </div>
  );
}
