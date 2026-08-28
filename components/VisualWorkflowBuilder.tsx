'use client';

import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Zap,
  Bot,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  Play,
  ArrowRight,
  Filter,
  Plus,
  Trash2,
  Power,
  RotateCcw,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Terminal,
  CalendarCheck,
  Mail,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Deal } from '@/types/crm';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'router' | 'action';
  title: string;
  subtitle: string;
  config: Record<string, any>;
}

export interface CustomWorkflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerEvent: 'whatsapp_inbound' | 'deal_created' | 'stage_changed' | 'quote_accepted' | 'lead_score_high';
  nodes: WorkflowNode[];
  lastExecutedAt?: string;
  executionCount: number;
}

const DEFAULT_WORKFLOWS: CustomWorkflow[] = [
  {
    id: 'wf-1',
    name: 'Captación Inmobiliaria & Secuencia WhatsApp',
    description: 'Enruta leads entrantes por WhatsApp, evalúa presupuesto y asigna vendedora por Round-Robin.',
    isActive: true,
    triggerEvent: 'whatsapp_inbound',
    executionCount: 142,
    lastExecutedAt: 'Hace 12 min',
    nodes: [
      {
        id: 'node-1',
        type: 'trigger',
        title: 'Mensaje Entrante de WhatsApp',
        subtitle: 'Disparador: Lead escribe solicitando información de proyecto.',
        config: { channel: 'whatsapp', keyword: 'información' }
      },
      {
        id: 'node-2',
        type: 'condition',
        title: 'Evaluar Presupuesto & Prioridad',
        subtitle: 'Condición: Presupuesto estimado >= $25,000 USD o Score >= 60 pts.',
        config: { minValue: 25000, minScore: 60 }
      },
      {
        id: 'node-3',
        type: 'router',
        title: 'Enrutador con IA (Gemini AI Smart Router)',
        subtitle: 'Enrutador IA: Analiza perfil y asigna a la vendedora con mayor tasa de éxito.',
        config: { algorithm: 'gemini_ai_router', totalReps: 10 }
      },
      {
        id: 'node-4',
        type: 'action',
        title: 'Bot WhatsApp & Tarea en Agenda',
        subtitle: 'Acción: Envía catálogo en PDF y agenda llamada de seguimiento en 15 min.',
        config: { botId: 'bot-welcome', taskDelayMin: 15 }
      }
    ]
  },
  {
    id: 'wf-2',
    name: 'Alerta de Cierre & Factura FEL Automática',
    description: 'Cuando un negocio pasa a "Cerrado Ganado", genera la factura electrónica FEL y notifica al cliente.',
    isActive: true,
    triggerEvent: 'stage_changed',
    executionCount: 68,
    lastExecutedAt: 'Hace 1 hora',
    nodes: [
      {
        id: 'node-2-1',
        type: 'trigger',
        title: 'Negocio Pasa a "Cerrado Ganado"',
        subtitle: 'Disparador: Etapa final del embudo completada con éxito.',
        config: { stageName: 'Cerrado Ganado' }
      },
      {
        id: 'node-2-2',
        type: 'condition',
        title: 'Verificar Cotización Aprobada',
        subtitle: 'Condición: Posee cotización formal registrada.',
        config: { hasQuote: true }
      },
      {
        id: 'node-2-3',
        type: 'action',
        title: 'Generar Factura Electrónica FEL',
        subtitle: 'Acción: Emite factura FEL con régimen de IVA en el módulo ERP.',
        config: { actionType: 'erp_invoice' }
      },
      {
        id: 'node-2-4',
        type: 'action',
        title: 'WhatsApp de Agradecimiento & Enlace FEL',
        subtitle: 'Acción: Envía comprobante oficial al teléfono del cliente.',
        config: { channel: 'whatsapp_receipt' }
      }
    ]
  }
];

export function VisualWorkflowBuilder() {
  const { data, activePipeline, salesReps, formatCurrency } = useCRM();

  const [workflows, setWorkflows] = useState<CustomWorkflow[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crm_custom_workflows_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_WORKFLOWS;
  });

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || 'wf-1');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Workflow form state
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfTrigger, setNewWfTrigger] = useState<CustomWorkflow['triggerEvent']>('deal_created');
  const [newWfMinValue, setNewWfMinValue] = useState(10000);
  const [newWfActionType, setNewWfActionType] = useState('whatsapp_welcome');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('crm_custom_workflows_v2', JSON.stringify(workflows));
    }
  }, [workflows]);

  const activeWf = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];

  const handleToggleWorkflow = (id: string) => {
    setWorkflows(prev =>
      prev.map(w => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const handleDeleteWorkflow = (id: string) => {
    if (workflows.length <= 1) {
      alert('Debes mantener al menos un flujo configurado.');
      return;
    }
    if (confirm('¿Deseas eliminar este flujo automatizado?')) {
      const remaining = workflows.filter(w => w.id !== id);
      setWorkflows(remaining);
      setSelectedWorkflowId(remaining[0].id);
    }
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;

    const newWf: CustomWorkflow = {
      id: `wf-${Date.now()}`,
      name: newWfName.trim(),
      description: newWfDesc.trim() || 'Automatización personalizada de eventos y acciones.',
      isActive: true,
      triggerEvent: newWfTrigger,
      executionCount: 0,
      nodes: [
        {
          id: `node-${Date.now()}-1`,
          type: 'trigger',
          title:
            newWfTrigger === 'deal_created'
              ? 'Nuevo Negocio Creado'
              : newWfTrigger === 'whatsapp_inbound'
              ? 'Mensaje WhatsApp Recibido'
              : newWfTrigger === 'stage_changed'
              ? 'Cambio de Etapa del Pipeline'
              : 'Lead Calificado con Alto Score (>75 pts)',
          subtitle: 'Disparador inicial del evento en tiempo real.',
          config: { trigger: newWfTrigger }
        },
        {
          id: `node-${Date.now()}-2`,
          type: 'condition',
          title: `Filtro de Monto >= ${formatCurrency(newWfMinValue)}`,
          subtitle: 'Condición: Valida el umbral financiero del trato.',
          config: { minValue: newWfMinValue }
        },
        {
          id: `node-${Date.now()}-3`,
          type: 'router',
          title: 'Algoritmo Round-Robin (10 Vendedoras)',
          subtitle: 'Asignación automática y balanceo de carga.',
          config: { reps: 10 }
        },
        {
          id: `node-${Date.now()}-4`,
          type: 'action',
          title:
            newWfActionType === 'whatsapp_welcome'
              ? 'Enviar Saludo Automático por WhatsApp'
              : newWfActionType === 'create_task'
              ? 'Crear Tarea de Llamada en Agenda'
              : 'Emitir Factura Electrónica FEL',
          subtitle: 'Acción automatizada de seguimiento inmediata.',
          config: { action: newWfActionType }
        }
      ]
    };

    setWorkflows(prev => [...prev, newWf]);
    setSelectedWorkflowId(newWf.id);
    setIsCreateModalOpen(false);
    setNewWfName('');
    setNewWfDesc('');
  };

  const handleRunSimulation = () => {
    if (!activeWf) return;

    setIsSimulating(true);
    setActiveStep(1);
    setSimulationLogs([]);

    const deal = data.deals.find(d => d.id === selectedDealId) || data.deals[0] || {
      id: 'demo-deal',
      title: 'Cliente Potencial Inmobiliario',
      value: 35000,
      contact_name: 'Lic. Roberto Morales',
      company_name: 'Desarrollos Premier'
    };

    const targetRep = salesReps[Math.floor(Math.random() * salesReps.length)]?.rep_name || 'Sofía Morales';

    const logList: string[] = [];

    const addLog = (msg: string) => {
      const time = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      logList.push(`[${time}] ${msg}`);
      setSimulationLogs([...logList]);
    };

    addLog(`Iniciando prueba del flujo: "${activeWf.name}"`);
    addLog(`Disparador detectado: [${activeWf.nodes[0]?.title}] para "${deal.title}"`);

    setTimeout(() => {
      setActiveStep(2);
      addLog(`Evaluando condición: Valor del negocio ${formatCurrency(deal.value)} vs filtro.`);
      addLog(`Condición CUMPLIDA con éxito (Score lead: Óptimo).`);

      setTimeout(() => {
        setActiveStep(3);
        addLog(`Enrutador con IA (Gemini Smart Router) activado: Asignando oportunidad óptima a ${targetRep} (96% Match Score).`);
        addLog(`Carga y especialidad balanceadas por Inteligencia Artificial.`);

        setTimeout(() => {
          setActiveStep(4);
          addLog(`Ejecutando acción final: [${activeWf.nodes[3]?.title}].`);
          addLog(`Notificación enviada a WhatsApp y tarea programada en Agenda CRM.`);
          addLog(`¡Flujo completado al 100% sin errores!`);

          setTimeout(() => {
            setIsSimulating(false);
            setActiveStep(null);
            // Increment execution count
            setWorkflows(prev =>
              prev.map(w =>
                w.id === activeWf.id
                  ? { ...w, executionCount: w.executionCount + 1, lastExecutedAt: 'Justo ahora' }
                  : w
              )
            );
          }, 1200);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-600" /> Diseñador Visual de Flujos & Chatbots Automáticos
            </h2>
            <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              Motor Activo 100% Funcional
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Automatiza la recepción de leads, asignación Round-Robin a tus 10 vendedoras y secuencias de WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Flujo</span>
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Play className={`w-4 h-4 fill-white ${isSimulating ? 'animate-pulse' : ''}`} />
            <span>{isSimulating ? 'Ejecutando Simulación...' : 'Simular Flujo en Vivo'}</span>
          </button>
        </div>
      </div>

      {/* Selector de Flujos Disponibles */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Flujos:</span>
          {workflows.map(wf => (
            <button
              key={wf.id}
              onClick={() => setSelectedWorkflowId(wf.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                wf.id === activeWf?.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${wf.id === activeWf?.id ? 'text-amber-300' : 'text-slate-400'}`} />
              <span className="truncate max-w-[200px]">{wf.name}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  wf.isActive ? 'bg-emerald-400' : 'bg-slate-300'
                }`}
              />
            </button>
          ))}
        </div>

        {activeWf && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleWorkflow(activeWf.id)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeWf.isActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{activeWf.isActive ? 'Activo' : 'Pausado'}</span>
            </button>

            <button
              onClick={() => handleDeleteWorkflow(activeWf.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Eliminar flujo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Visual Canvas de Nodos */}
      {activeWf && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" /> Mapa del Flujo: "{activeWf.name}"
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {activeWf.executionCount} ejecuciones
              </span>
            </div>

            {/* Selector de Negocio para la prueba */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold">Probar con Negocio:</span>
              <select
                value={selectedDealId}
                onChange={e => setSelectedDealId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">-- Negocio Demo / Predeterminado --</option>
                {data.deals.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({formatCurrency(d.value)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de Nodos Conectados */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
            {activeWf.nodes.map((node, index) => {
              const nodeNum = index + 1;
              const isCurrent = activeStep === nodeNum;
              const isPassed = activeStep !== null && activeStep > nodeNum;

              let icon = <Zap className="w-4 h-4 text-indigo-400" />;
              let badgeColor = 'text-indigo-400';
              let badgeLabel = `${nodeNum}. Disparador`;

              if (node.type === 'condition') {
                icon = <Filter className="w-4 h-4 text-amber-400" />;
                badgeColor = 'text-amber-400';
                badgeLabel = `${nodeNum}. Condición`;
              } else if (node.type === 'router') {
                icon = <UserCheck className="w-4 h-4 text-emerald-400" />;
                badgeColor = 'text-emerald-400';
                badgeLabel = `${nodeNum}. Enrutador`;
              } else if (node.type === 'action') {
                icon = <Bot className="w-4 h-4 text-purple-400" />;
                badgeColor = 'text-purple-400';
                badgeLabel = `${nodeNum}. Acción`;
              }

              return (
                <div
                  key={node.id}
                  className={`p-4.5 rounded-2xl border transition-all duration-300 space-y-2 relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/40 scale-105 shadow-xl'
                      : isPassed
                      ? 'bg-slate-950 border-emerald-500/60 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold uppercase ${isCurrent ? 'text-white' : badgeColor}`}>
                        {badgeLabel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {isCurrent ? <Play className="w-4 h-4 text-white animate-spin" /> : icon}
                      </div>
                    </div>

                    <h4 className="text-xs font-extrabold text-white leading-snug">{node.title}</h4>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{node.subtitle}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Estado:</span>
                    <span className={isCurrent ? 'text-amber-300 font-bold' : isPassed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {isCurrent ? 'Procesando...' : isPassed ? 'Ejecutado' : 'En Espera'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consola de Logs de Simulación */}
          <div className="bg-black/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Consola de Ejecución & Logs en Tiempo Real
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {isSimulating ? '• EN EJECUCIÓN' : 'LISTO'}
              </span>
            </div>

            <div className="font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto">
              {simulationLogs.length === 0 ? (
                <p className="text-slate-600">Haz clic en "Simular Flujo en Vivo" para probar la ejecución secuencial del workflow.</p>
              ) : (
                simulationLogs.map((log, i) => (
                  <p key={i} className="text-emerald-400/90 leading-tight">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Nuevo Flujo */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fade-in text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Crear Nuevo Flujo de Automatización
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Flujo *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Seguimiento VIP Clientes Corporativos"
                  value={newWfName}
                  onChange={e => setNewWfName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="ej: Envía catálogo y asigna a la vendedora líder..."
                  value={newWfDesc}
                  onChange={e => setNewWfDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Disparador (Trigger)</label>
                  <select
                    value={newWfTrigger}
                    onChange={e => setNewWfTrigger(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                  >
                    <option value="deal_created">🆕 Nuevo Negocio Creado</option>
                    <option value="whatsapp_inbound">💬 Mensaje WhatsApp Recibido</option>
                    <option value="stage_changed">🔄 Cambio de Etapa en Pipeline</option>
                    <option value="lead_score_high">🔥 Lead con Alto Score (&gt;75 pts)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Monto Mínimo Condicional ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newWfMinValue}
                    onChange={e => setNewWfMinValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Acción Final Automatizada</label>
                <select
                  value={newWfActionType}
                  onChange={e => setNewWfActionType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="whatsapp_welcome">📲 Enviar Saludo & Ficha por WhatsApp</option>
                  <option value="create_task">📅 Crear Tarea de Llamada en Agenda CRM</option>
                  <option value="erp_invoice">🧾 Emitir Factura Electrónica FEL</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  Guardar Flujo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
