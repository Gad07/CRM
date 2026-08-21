'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Percent, Layers } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

interface PipelineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  '#2563eb', // Blue
  '#0891b2', // Cyan
  '#059669', // Emerald
  '#ca8a04', // Yellow
  '#ea580c', // Orange
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#475569'  // Slate
];

export function PipelineEditorModal({ isOpen, onClose }: PipelineEditorModalProps) {
  const {
    activePipeline,
    addPipeline,
    addStage,
    updateStage,
    deleteStage,
    reorderStages
  } = useCRM();

  const [newPipelineName, setNewPipelineName] = useState('');
  const [showNewPipelineInput, setShowNewPipelineInput] = useState(false);

  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#2563eb');
  const [newStageWinProb, setNewStageWinProb] = useState(50);

  if (!isOpen || !activePipeline) return null;

  const handleCreatePipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPipelineName.trim()) return;
    addPipeline(newPipelineName.trim());
    setNewPipelineName('');
    setShowNewPipelineInput(false);
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    addStage(activePipeline.id, newStageName.trim(), newStageColor, newStageWinProb);
    setNewStageName('');
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const stages = [...activePipeline.stages];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stages.length) return;

    const temp = stages[index];
    stages[index] = stages[targetIdx];
    stages[targetIdx] = temp;

    reorderStages(
      activePipeline.id,
      stages.map(s => s.id)
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Editar Etapas del Embudo</h2>
              <p className="text-xs text-slate-500 font-medium">Embudo actual: <span className="text-indigo-700 font-bold">{activePipeline.name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-900">
          {/* Create New Pipeline Toggle */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Crear Nuevo Embudo de Ventas</h3>
              <button
                onClick={() => setShowNewPipelineInput(!showNewPipelineInput)}
                className="text-xs text-indigo-700 hover:text-indigo-900 flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showNewPipelineInput ? 'Cancelar' : 'Nuevo Embudo'}</span>
              </button>
            </div>

            {showNewPipelineInput && (
              <form onSubmit={handleCreatePipeline} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Nombre del nuevo embudo..."
                  value={newPipelineName}
                  onChange={e => setNewPipelineName(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
                >
                  Crear
                </button>
              </form>
            )}
          </div>

          {/* Current Stages List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Etapas Actuales ({activePipeline.stages.length})</h3>
            
            <div className="space-y-2">
              {activePipeline.stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3"
                >
                  {/* Reorder controls & Color Badge */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveStage(idx, 'up')}
                        disabled={idx === 0}
                        className="text-slate-400 hover:text-slate-900 disabled:opacity-20 p-0.5"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveStage(idx, 'down')}
                        disabled={idx === activePipeline.stages.length - 1}
                        className="text-slate-400 hover:text-slate-900 disabled:opacity-20 p-0.5"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={stage.color}
                        onChange={e => updateStage({ ...stage, color: e.target.value })}
                        className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
                      />
                    </div>

                    <input
                      type="text"
                      value={stage.name}
                      onChange={e => updateStage({ ...stage, name: e.target.value })}
                      className="bg-white text-slate-900 font-bold text-sm px-2 py-1 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 font-bold">
                      <Percent className="w-3 h-3 text-indigo-600" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={stage.win_probability}
                        onChange={e => updateStage({ ...stage, win_probability: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                        className="w-10 bg-transparent text-slate-900 font-bold focus:outline-none text-right"
                      />
                      <span className="text-[10px] text-slate-500">% Prob.</span>
                    </div>

                    <button
                      onClick={() => deleteStage(stage.id)}
                      disabled={activePipeline.stages.length <= 1}
                      className="text-slate-400 hover:text-red-600 disabled:opacity-20 p-1.5 rounded-lg transition-colors"
                      title="Eliminar etapa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Stage Form */}
          <form onSubmit={handleAddStage} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Agregar Nueva Etapa
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-600 font-bold block mb-1">Nombre de la Etapa</label>
                <input
                  type="text"
                  placeholder="ej: Auditoría Técnica, Envío de Factura..."
                  value={newStageName}
                  onChange={e => setNewStageName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-bold block mb-1">% Éxito Estimado</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newStageWinProb}
                  onChange={e => setNewStageWinProb(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-bold block mb-1">Color Identificador</label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewStageColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      newStageColor === color ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                + Guardar Etapa
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2 rounded-xl transition-all"
          >
            Listo / Aplicar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
