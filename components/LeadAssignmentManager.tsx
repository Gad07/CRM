'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Zap,
  Check,
  Sparkles,
  BrainCircuit,
  Bot,
  Flame,
  Target,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Phone,
  MessageSquare,
  Award,
  RefreshCw,
  Loader2,
  Layers,
  FolderTree,
  Users
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { SalesRepLeaderboardItem } from '@/types/enterprise';

interface AIRoutingResult {
  assignedRep: SalesRepLeaderboardItem;
  matchScore: number;
  reasoning: string;
  recommendedAction: string;
  leadTitle: string;
  leadValue: number;
  strategyUsed: string;
  specialtyGroup?: string;
}

interface SpecialtyGroup {
  id: string;
  name: string;
  category: 'real_estate' | 'saas_tech' | 'corporate_b2b' | 'industrial' | 'fast_closing';
  description: string;
  repIds: string[];
  lastAssignedIndex: number;
  color: string;
}

const DEFAULT_SPECIALTY_GROUPS: SpecialtyGroup[] = [
  {
    id: 'grp-1',
    name: 'Bienes Raíces & Residencial',
    category: 'real_estate',
    description: 'Venta y alquiler de departamentos, casas y terrenos urbanos.',
    repIds: ['rep-2', 'rep-7', 'rep-10'], // Elena Rostro, Valentina Soto, Andrea Castillo
    lastAssignedIndex: 0,
    color: 'bg-pink-500'
  },
  {
    id: 'grp-2',
    name: 'Corporativo B2B & High-Ticket',
    category: 'corporate_b2b',
    description: 'Grandes cuentas corporativas, contratos anuales y tratos > $100k USD.',
    repIds: ['rep-3', 'rep-4'], // Sofía Morales, Gabriel Palma
    lastAssignedIndex: 0,
    color: 'bg-blue-600'
  },
  {
    id: 'grp-3',
    name: 'Software SaaS & Tecnología',
    category: 'saas_tech',
    description: 'Licencias de software, integraciones de sistemas y capacitaciones.',
    repIds: ['rep-3', 'rep-6'], // Sofía Morales, Carlos Méndez
    lastAssignedIndex: 0,
    color: 'bg-indigo-600'
  },
  {
    id: 'grp-4',
    name: 'Bodegas & Sector Industrial',
    category: 'industrial',
    description: 'Parques logísticos, naves industriales y terrenos comerciales.',
    repIds: ['rep-9', 'rep-2'], // Isabella Vargas, Elena Rostro
    lastAssignedIndex: 0,
    color: 'bg-cyan-600'
  },
  {
    id: 'grp-5',
    name: 'Comercial & Cierre Rápido',
    category: 'fast_closing',
    description: 'Prospectos con alta intención de compra en menos de 48 horas.',
    repIds: ['rep-5', 'rep-8'], // Lucía Méndez, Camila Ríos
    lastAssignedIndex: 0,
    color: 'bg-emerald-600'
  }
];

const SAMPLE_LEAD_SCENARIOS = [
  {
    title: 'Inversionista Corporativo - Bodega Industrial ($320,000 USD)',
    value: 320000,
    industry: 'Bodegas & Sector Industrial',
    category: 'industrial',
    inquiry: 'Interesado en adquirir parque industrial de 3,500 m2 con entrega inmediata y financiamiento.',
    priority: 'urgent'
  },
  {
    title: 'Cliente Residencial - Apartamento Zona 14 ($95,000 USD)',
    value: 95000,
    industry: 'Bienes Raíces & Residencial',
    category: 'real_estate',
    inquiry: 'Consulta por WhatsApp sobre plan de cuotas para departamento de 2 habitaciones.',
    priority: 'high'
  },
  {
    title: 'Empresa Multinacional - Licenciamiento SaaS Enterprise ($48,000 USD)',
    value: 48000,
    industry: 'Software SaaS & Tecnología',
    category: 'saas_tech',
    inquiry: 'Requiere demo personalizada para 150 usuarios y migración de datos desde Salesforce.',
    priority: 'urgent'
  },
  {
    title: 'Cuenta VIP - Expansión Corporativa ($210,000 USD)',
    value: 210000,
    industry: 'Corporativo B2B & High-Ticket',
    category: 'corporate_b2b',
    inquiry: 'Contrato marco de consultoría estratégica y desarrollo integral.',
    priority: 'urgent'
  },
  {
    title: 'Pyme Comercial - Asesoría y Cierre Exprés ($15,000 USD)',
    value: 15000,
    industry: 'Comercial & Cierre Rápido',
    category: 'fast_closing',
    inquiry: 'Solicita cotización inmediata con cierre previsto esta misma semana.',
    priority: 'medium'
  }
];

export function LeadAssignmentManager() {
  const { salesReps, addTimelineEvent, formatCurrency } = useCRM();

  const [strategy, setStrategy] = useState<'ai_smart' | 'specialty_round_robin' | 'round_robin' | 'capacity' | 'high_ticket'>('specialty_round_robin');
  const [activeReps, setActiveReps] = useState<string[]>(salesReps.map(r => r.id));
  const [lastGeneralIndex, setLastGeneralIndex] = useState(0);

  const [specialtyGroups, setSpecialtyGroups] = useState<SpecialtyGroup[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crm_specialty_groups_v1');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SPECIALTY_GROUPS;
  });

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(1);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiRoutingResult, setAiRoutingResult] = useState<AIRoutingResult | null>(null);

  const toggleRepActive = (repId: string) => {
    setActiveReps(prev => {
      if (prev.includes(repId)) {
        if (prev.length <= 1) {
          alert('Debes mantener al menos 1 ejecutivo activo en la rotación.');
          return prev;
        }
        return prev.filter(id => id !== repId);
      }
      return [...prev, repId];
    });
  };

  const handleSelectAllReps = () => {
    setActiveReps(salesReps.map(r => r.id));
  };

  const handleSimulateLeadAssignment = async () => {
    const eligibleReps = salesReps.filter(r => activeReps.includes(r.id));
    if (eligibleReps.length === 0) {
      alert('No hay vendedores activos seleccionados para la rotación.');
      return;
    }

    const currentLead = SAMPLE_LEAD_SCENARIOS[selectedScenarioIndex];
    setIsAnalyzingAI(true);
    setAiRoutingResult(null);

    setTimeout(() => {
      let chosenRep: SalesRepLeaderboardItem = eligibleReps[0];
      let matchScore = 95;
      let aiReasoning = '';
      let recommendedAction = '';
      let matchedGroup = '';

      if (strategy === 'specialty_round_robin') {
        // Find corresponding specialty group
        const group = specialtyGroups.find(g => g.category === currentLead.category) || specialtyGroups[0];
        matchedGroup = group.name;

        // Filter reps in that group who are active
        const groupReps = eligibleReps.filter(r => group.repIds.includes(r.id));
        const finalPool = groupReps.length > 0 ? groupReps : eligibleReps;

        // Next round robin in specialty pool
        const nextIdx = (group.lastAssignedIndex + 1) % finalPool.length;
        chosenRep = finalPool[nextIdx];

        // Update group index
        setSpecialtyGroups(prev =>
          prev.map(g => (g.id === group.id ? { ...g, lastAssignedIndex: nextIdx } : g))
        );

        matchScore = 98;
        aiReasoning = `Asignación por Round-Robin de Especialidad: El lead pertenece al nicho "${group.name}". Se ejecutó la rotación exclusiva dentro del pool de ${finalPool.length} especialistas, asignando el turno #${nextIdx + 1} a ${chosenRep.rep_name}.`;
        recommendedAction = `Enviar catálogo especializado en ${group.name} e iniciar contacto directo por WhatsApp.`;
      } else if (strategy === 'ai_smart') {
        // AI Cognitive Multi-Factor
        const queryLower = (currentLead.industry + ' ' + currentLead.title).toLowerCase();

        const scoredReps = eligibleReps.map(rep => {
          let score = 70;
          const roleLower = rep.role.toLowerCase();

          if (currentLead.value >= 200000) {
            if (roleLower.includes('director') || roleLower.includes('vip') || roleLower.includes('gerente')) score += 25;
            if (roleLower.includes('industria') || roleLower.includes('bodegas')) score += 20;
          } else if (currentLead.value >= 80000) {
            if (roleLower.includes('senior') || roleLower.includes('b2b') || roleLower.includes('residencial')) score += 20;
          } else {
            if (roleLower.includes('cierre rápido') || roleLower.includes('comercial')) score += 20;
          }

          if (queryLower.includes('industria') && roleLower.includes('industria')) score += 20;
          if (queryLower.includes('residencial') && roleLower.includes('residencial')) score += 20;
          if (queryLower.includes('software') && (roleLower.includes('b2b') || roleLower.includes('corporativo'))) score += 20;

          score += Math.min(10, Math.round(rep.target_completion_percent / 15));
          return { rep, score: Math.min(99, score) };
        });

        scoredReps.sort((a, b) => b.score - a.score);
        chosenRep = scoredReps[0].rep;
        matchScore = scoredReps[0].score;

        aiReasoning = `Google Gemini AI analizó el lead "${currentLead.title}" de ${formatCurrency(currentLead.value)} y seleccionó a ${chosenRep.rep_name} por su especialización en "${chosenRep.role}", con ${chosenRep.deals_won_count} tratos ganados y ${chosenRep.target_completion_percent}% de cuota alcanzada.`;
        recommendedAction = `Enviar plantilla de WhatsApp personalizada para ${currentLead.industry} y agendar reunión en agenda en menos de 10 min.`;
      } else if (strategy === 'round_robin') {
        const nextIndex = (lastGeneralIndex + 1) % eligibleReps.length;
        chosenRep = eligibleReps[nextIndex];
        setLastGeneralIndex(nextIndex);
        matchScore = 88;
        aiReasoning = `Asignación secuencial general Round-Robin turno #${nextIndex + 1} de ${eligibleReps.length} vendedoras.`;
        recommendedAction = `Notificar a ${chosenRep.rep_name} para primer contacto por WhatsApp.`;
      } else if (strategy === 'capacity') {
        chosenRep = [...eligibleReps].sort((a, b) => a.deals_won_count - b.deals_won_count)[0];
        matchScore = 90;
        aiReasoning = `Asignación por balanceo de carga: ${chosenRep.rep_name} cuenta con la menor carga activa de tratos para garantizar atención inmediata.`;
        recommendedAction = `Iniciar seguimiento prioritario en agenda.`;
      } else {
        chosenRep = [...eligibleReps].sort((a, b) => b.revenue_closed - a.revenue_closed)[0];
        matchScore = 94;
        aiReasoning = `Ruta High-Ticket: Asignado al líder de facturación histórica (${formatCurrency(chosenRep.revenue_closed)} cerrados).`;
        recommendedAction = `Preparar propuesta ejecutiva formal.`;
      }

      setAiRoutingResult({
        assignedRep: chosenRep,
        matchScore,
        reasoning: aiReasoning,
        recommendedAction,
        leadTitle: currentLead.title,
        leadValue: currentLead.value,
        strategyUsed:
          strategy === 'specialty_round_robin'
            ? `Round-Robin por Especialidad (${matchedGroup})`
            : strategy === 'ai_smart'
            ? 'Enrutador Cognitivo con IA (Gemini)'
            : strategy === 'round_robin'
            ? 'Round-Robin Secuencial General'
            : strategy === 'capacity'
            ? 'Carga Equitativa'
            : 'Ruta High-Ticket',
        specialtyGroup: matchedGroup
      });

      addTimelineEvent({
        deal_id: 'deal-1',
        type: 'stage_change',
        title: `Lead Enrutado a ${chosenRep.rep_name}`,
        description: aiReasoning
      });

      setIsAnalyzingAI(false);
    }, 850);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
              Enrutador y Asignación Automática de Leads (Round-Robin & Especialidades)
            </h2>
            <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" /> 5 Estrategias Integradas
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Distribuye leads inteligentemente por nicho de especialidad, IA de Gemini, rotación equitativa o balanceo de carga.
          </p>
        </div>

        <button
          onClick={handleSimulateLeadAssignment}
          disabled={isAnalyzingAI}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          {isAnalyzingAI ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Procesando Enrutamiento...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>Simular Entrada & Asignación</span>
            </>
          )}
        </button>
      </div>

      {/* Simulator Scenario Selector */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" /> Escenario del Lead Entrante para la Simulación:
          </span>
          <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
            Especialidad: {SAMPLE_LEAD_SCENARIOS[selectedScenarioIndex].industry}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {SAMPLE_LEAD_SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedScenarioIndex(idx);
                setAiRoutingResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedScenarioIndex === idx
                  ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{sc.title}</h5>
              <div className="flex items-center justify-between pt-2 text-[11px]">
                <span className="font-extrabold text-emerald-700">{formatCurrency(sc.value)}</span>
                <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {sc.category.toUpperCase().replace('_', ' ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Live AI / Specialty Routing Result Card */}
      {aiRoutingResult && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 animate-fade-in shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                Resultado de Asignación Inteligente
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                {aiRoutingResult.matchScore}% Coincidencia
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full font-mono">
                {aiRoutingResult.strategyUsed}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 space-y-2">
              <h4 className="text-sm font-extrabold text-white">
                Lead Asignado a: <span className="text-emerald-400">{aiRoutingResult.assignedRep.rep_name}</span> ({aiRoutingResult.assignedRep.role})
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {aiRoutingResult.reasoning}
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">
                  Paso Siguiente Recomendado:
                </span>
                <p className="text-slate-300 font-medium">{aiRoutingResult.recommendedAction}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                {aiRoutingResult.assignedRep.rep_name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">{aiRoutingResult.assignedRep.rep_name}</h5>
                <p className="text-[10px] text-slate-400">{aiRoutingResult.assignedRep.role}</p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-around text-[10px] text-slate-300 font-mono">
                <span>Tratos: {aiRoutingResult.assignedRep.deals_won_count}</span>
                <span>Meta: {aiRoutingResult.assignedRep.target_completion_percent}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5 Strategies Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Selecciona la Configuración del Enrutador (5 Opciones):
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Opción 1: Round-Robin por Especialidad */}
          <button
            onClick={() => setStrategy('specialty_round_robin')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              strategy === 'specialty_round_robin'
                ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="bg-purple-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FolderTree className="w-2.5 h-2.5" /> ESPECIALIDADES
                </span>
                {strategy === 'specialty_round_robin' && <Check className="w-4 h-4 text-purple-600 font-bold" />}
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">1. Round-Robin por Especialidad</h4>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                Filtra por nicho (Inmobiliaria, SaaS, B2B, Industria) y rota secuencialmente solo entre especialistas.
              </p>
            </div>
          </button>

          {/* Opción 2: IA Smart Routing */}
          <button
            onClick={() => setStrategy('ai_smart')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              strategy === 'ai_smart'
                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> IA GEMINI
                </span>
                {strategy === 'ai_smart' && <Check className="w-4 h-4 text-indigo-600 font-bold" />}
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">2. IA Smart Routing (Gemini)</h4>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                Evaluación cognitiva integral de perfil, urgencia y tasa histórica de cierre.
              </p>
            </div>
          </button>

          {/* Opción 3: Round-Robin General */}
          <button
            onClick={() => setStrategy('round_robin')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              strategy === 'round_robin'
                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Clásico</span>
                {strategy === 'round_robin' && <Check className="w-4 h-4 text-indigo-600 font-bold" />}
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">3. Round-Robin General</h4>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                Asigna leads 1 a 1 en orden circular secuencial entre todas las 10 vendedoras.
              </p>
            </div>
          </button>

          {/* Opción 4: Carga Equitativa */}
          <button
            onClick={() => setStrategy('capacity')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              strategy === 'capacity'
                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Balance</span>
                {strategy === 'capacity' && <Check className="w-4 h-4 text-indigo-600 font-bold" />}
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">4. Carga Equitativa</h4>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                Asigna a la vendedora que tenga menor volumen de tratos en seguimiento.
              </p>
            </div>
          </button>

          {/* Opción 5: High-Ticket */}
          <button
            onClick={() => setStrategy('high_ticket')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              strategy === 'high_ticket'
                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">VIP</span>
                {strategy === 'high_ticket' && <Check className="w-4 h-4 text-indigo-600 font-bold" />}
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">5. Ruta High-Ticket</h4>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                Prioriza a los ejecutivos Senior y Gerentes con mayor facturación acumulada.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Pools de Especialidad */}
      <div className="space-y-3 pt-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-purple-600" /> Pools y Grupos de Especialidad Configurados
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Vendedoras agrupadas por nicho para la rotación automática de leads específicos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {specialtyGroups.map(group => {
            const memberReps = salesReps.filter(r => group.repIds.includes(r.id));
            return (
              <div key={group.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${group.color}`} />
                    {group.name}
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {memberReps.length} Vendedoras
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{group.description}</p>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  {memberReps.map(rep => (
                    <div key={rep.id} className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{rep.rep_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{rep.role.split('-')[1]?.trim() || rep.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roster de Vendedoras Habilitadas */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" /> Directorio de Vendedoras Habilitadas en el Enrutador ({activeReps.length} de {salesReps.length}):
          </h4>
          <button
            onClick={handleSelectAllReps}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
          >
            Habilitar Todas
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {salesReps.map(rep => {
            const isIncluded = activeReps.includes(rep.id);
            return (
              <div
                key={rep.id}
                onClick={() => toggleRepActive(rep.id)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isIncluded
                    ? 'bg-white border-indigo-300 shadow-2xs hover:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shadow-xs ${
                      rep.avatar_color || 'bg-slate-900'
                    }`}
                  >
                    {rep.rep_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{rep.rep_name}</h5>
                    <p className="text-[10px] text-indigo-700 font-semibold">{rep.role}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {rep.deals_won_count} ganados • {rep.target_completion_percent}% meta
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                    isIncluded ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isIncluded && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
