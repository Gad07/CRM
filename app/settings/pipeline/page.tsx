'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useCRM } from '@/context/CRMContext';
import { CustomFieldsManager } from '@/components/CustomFieldsManager';
import { PipelineEditorModal } from '@/components/PipelineEditorModal';
import { INDUSTRY_PRESETS } from '@/lib/presets';
import {
  ArrowLeft,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Building2,
  Laptop,
  Briefcase,
  Users,
  Car
} from 'lucide-react';

export default function SettingsPipelinePage() {
  const { applyIndustryPreset } = useCRM();
  const [isStageEditorOpen, setIsStageEditorOpen] = useState(false);

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'Laptop': return <Laptop className="w-5 h-5 text-indigo-600" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-purple-600" />;
      case 'Users': return <Users className="w-5 h-5 text-emerald-600" />;
      case 'Car': return <Car className="w-5 h-5 text-amber-600" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" /> Configuración de Embudos, Etapas y Campos Adaptables
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Personaliza las etapas del embudo de ventas, probabilidades de éxito y atributos adicionales.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsStageEditorOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Abrir Editor Visual de Etapas</span>
          </button>
        </div>

        {/* Industry Presets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" /> Plantillas por Industria (Carga Rápida en 1-Click)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDUSTRY_PRESETS.map(preset => (
              <div
                key={preset.id}
                className="bg-slate-50 border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">{getPresetIcon(preset.icon)}</div>
                    <h3 className="font-bold text-slate-900 text-sm">{preset.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2">{preset.description}</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`¿Deseas aplicar la plantilla "${preset.name}"?`)) {
                      applyIndustryPreset(preset.id);
                    }
                  }}
                  className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl shadow-xs"
                >
                  Aplicar Plantilla
                </button>
              </div>
            ))}
          </div>
        </div>

        <CustomFieldsManager />

        <PipelineEditorModal
          isOpen={isStageEditorOpen}
          onClose={() => setIsStageEditorOpen(false)}
        />
      </main>
    </div>
  );
}
