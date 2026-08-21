'use client';

import React, { useState } from 'react';
import { Plus, MoreVertical, Trash2, Edit3, User, Building2, Calendar, AlertCircle, ChevronRight, Flame, Sun, Snowflake, FileText } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Deal, PipelineStage, PriorityType } from '@/types/crm';
import { DealDrawer } from './DealDrawer';

interface KanbanBoardProps {
  searchQuery?: string;
  onEditDeal: (deal: Deal) => void;
  onQuickAddDeal: (stageId: string) => void;
}

export function KanbanBoard({ searchQuery = '', onEditDeal, onQuickAddDeal }: KanbanBoardProps) {
  const { data, activePipeline, moveDealStage, deleteDeal, getLeadScoreInfo, formatCurrency } = useCRM();

  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Selected deal for 360 Drawer
  const [drawerDeal, setDrawerDeal] = useState<Deal | null>(null);

  if (!activePipeline) {
    return (
      <div className="p-8 text-center text-gray-400">
        No hay ningún embudo activo. Por favor selecciona o crea uno en la barra superior.
      </div>
    );
  }

  // Filter deals for current pipeline and search query
  const pipelineDeals = data.deals.filter(d => {
    if (d.pipeline_id !== activePipeline.id) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      (d.contact_name && d.contact_name.toLowerCase().includes(q)) ||
      (d.company_name && d.company_name.toLowerCase().includes(q)) ||
      d.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStageId(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStageId(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    setDragOverStageId(null);
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (dealId) {
      moveDealStage(dealId, targetStageId);
    }
    setDraggedDealId(null);
  };

  const getPriorityBadge = (priority: PriorityType) => {
    switch (priority) {
      case 'urgent':
        return <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-md">Urgente</span>;
      case 'high':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">Alta</span>;
      case 'medium':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md">Media</span>;
      case 'low':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">Baja</span>;
    }
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 h-[calc(100vh-8rem)] items-start">
        {activePipeline.stages.map((stage, stageIdx) => {
          const stageDeals = pipelineDeals.filter(d => d.stage_id === stage.id);
          const stageTotalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
          const isDragOver = dragOverStageId === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={e => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, stage.id)}
              className={`w-80 shrink-0 bg-slate-100/80 rounded-2xl flex flex-col max-h-full border transition-all duration-200 ${
                isDragOver
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-slate-200/80'
                  : 'border-slate-200'
              }`}
            >
              {/* Stage Header */}
              <div className="p-4 border-b border-slate-200 bg-white/80 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: stage.color }}
                  />
                  <div className="truncate">
                    <h3 className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                      {stage.name}
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">
                        {stageDeals.length}
                      </span>
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {formatCurrency(stageTotalValue)} • <span className="text-indigo-600 font-bold">{stage.win_probability}% Éxito</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onQuickAddDeal(stage.id)}
                  className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Agregar negocio a esta etapa"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Stage Deals Cards List */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {stageDeals.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-300 rounded-xl">
                    <p className="text-xs text-slate-400">Arrastra negocios aquí o haz clic en + para crear uno</p>
                  </div>
                ) : (
                  stageDeals.map(deal => {
                    const score = getLeadScoreInfo(deal);

                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={e => handleDragStart(e, deal.id)}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-grab active:cursor-grabbing space-y-3 relative group transition-all"
                      >
                        {/* Deal Header */}
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => setDrawerDeal(deal)}
                            className="font-bold text-slate-900 text-xs hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer"
                          >
                            {deal.title}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            {score.rating === 'hot' && (
                              <span title="Lead Caliente">
                                <Flame className="w-4 h-4 text-red-500" />
                              </span>
                            )}
                            {score.rating === 'warm' && (
                              <span title="Lead Tibio">
                                <Sun className="w-4 h-4 text-amber-500" />
                              </span>
                            )}

                            <button
                              onClick={() => onEditDeal(deal)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 p-1 transition-opacity"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteDeal(deal.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Financial Value & Priority */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-emerald-600">
                            {formatCurrency(deal.value)}
                          </span>
                          {getPriorityBadge(deal.priority)}
                        </div>

                        {/* Contact / Company Info */}
                        {(deal.contact_name || deal.company_name) && (
                          <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                            {deal.contact_name && (
                              <div className="flex items-center gap-1.5 truncate">
                                <User className="w-3 h-3 text-indigo-600 shrink-0" />
                                <span className="truncate">{deal.contact_name}</span>
                              </div>
                            )}
                            {deal.company_name && (
                              <div className="flex items-center gap-1.5 truncate text-slate-500">
                                <Building2 className="w-3 h-3 text-purple-600 shrink-0" />
                                <span className="truncate">{deal.company_name}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tags & Actions */}
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <div className="flex flex-wrap gap-1">
                            {deal.tags.map(t => (
                              <span key={t} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-medium">
                                #{t}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDrawerDeal(deal)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold"
                            >
                              Ficha 360°
                            </button>

                            {stageIdx < activePipeline.stages.length - 1 && (
                              <button
                                onClick={() => moveDealStage(deal.id, activePipeline.stages[stageIdx + 1].id)}
                                className="flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                                title="Avanzar a siguiente etapa"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 360 Deal Drawer */}
      <DealDrawer
        deal={drawerDeal}
        isOpen={Boolean(drawerDeal)}
        onClose={() => setDrawerDeal(null)}
      />
    </>
  );
}
