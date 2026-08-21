'use client';

import React, { useState } from 'react';
import {
  Workflow,
  Zap,
  Bot,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  Play,
  Sliders,
  ArrowDown,
  ArrowRight,
  Sparkles,
  Layers,
  Filter,
  Plus
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function VisualWorkflowBuilder() {
  const { botSequences, automationRules } = useCRM();
  const [activeTab, setActiveTab] = useState<'visual_map' | 'bot_builder'>('visual_map');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setActiveStep(1);

    setTimeout(() => {
      setActiveStep(2);
      setTimeout(() => {
        setActiveStep(3);
        setTimeout(() => {
          setActiveStep(4);
          setTimeout(() => {
            setIsSimulating(false);
            setActiveStep(null);
            alert('¡Prueba de Flujo Ejecutada con Éxito! Todos los nodos automatizados se procesaron correctamente.');
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-600" /> Diseñador Visual de Flujos & Chatbots Automáticos
            </h2>
            <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              Motor de Automatización Estilo Zapier / HubSpot
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Crea flujos de trabajo inteligentes que conectan eventos de clientes, bots de WhatsApp y asignación automática.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Play className={`w-4 h-4 fill-white ${isSimulating ? 'animate-pulse' : ''}`} />
          <span>{isSimulating ? 'Ejecutando Flujo...' : 'Simular Flujo en Tiempo Real'}</span>
        </button>
      </div>

      {/* Diagrama Visual de Nodos Interactivos */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" /> Mapa del Flujo Activo: "Captación Inmobiliaria & Secuencia WhatsApp"
          </span>
          <span className="text-[10px] text-slate-400 font-mono">4 Nodos Conectados</span>
        </div>

        {/* Canvas de Nodos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {/* Nodo 1: Disparador */}
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 space-y-2 ${
              activeStep === 1
                ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/40 scale-105'
                : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase">1. Disparador</span>
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="text-xs font-extrabold text-white">Nuevo Mensaje Entrante en WhatsApp</h4>
            <p className="text-[11px] text-slate-400 font-medium">Cliente envía consulta por un inmueble.</p>
          </div>

          {/* Nodo 2: Condición */}
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 space-y-2 ${
              activeStep === 2
                ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/40 scale-105'
                : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase">2. Condición</span>
              <Filter className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-xs font-extrabold text-white">¿Valor Estimado &gt; $50,000 USD?</h4>
            <p className="text-[11px] text-slate-400 font-medium">Evalúa el presupuesto del cliente.</p>
          </div>

          {/* Nodo 3: Asignación */}
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 space-y-2 ${
              activeStep === 3
                ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/40 scale-105'
                : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase">3. Acción Enrutador</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-extrabold text-white">Asignar Vendedora Round-Robin</h4>
            <p className="text-[11px] text-slate-400 font-medium">Asigna equitativamente entre las 10 vendedoras.</p>
          </div>

          {/* Nodo 4: Chatbot Response */}
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 space-y-2 ${
              activeStep === 4
                ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/40 scale-105'
                : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-purple-400 uppercase">4. Chatbot IA</span>
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="text-xs font-extrabold text-white">Activar Bot de Bienvenida WhatsApp</h4>
            <p className="text-[11px] text-slate-400 font-medium">Envía la ficha técnica e introduce a la vendedora.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
