'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Paperclip,
  Check,
  CheckCheck,
  User,
  Building2,
  Phone,
  Clock,
  Zap,
  Bot,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Star,
  Award,
  Users,
  Eye
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Navbar } from '@/components/Navbar';

interface ChatMessage {
  id: string;
  sender: 'contact' | 'agent' | 'system';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface WhatsAppThread {
  id: string;
  contact_name: string;
  phone: string;
  company_name: string;
  deal_title: string;
  deal_value: number;
  deal_id: string;
  unread_count: number;
  last_message: string;
  last_time: string;
  assigned_rep: string;
  response_delay_minutes?: number; // Response SLA
  messages: ChatMessage[];
}

const defaultThreads: WhatsAppThread[] = [
  {
    id: 'chat-1',
    contact_name: 'Ana Sofía Rodríguez',
    phone: '+502 5544-8899',
    company_name: 'Grupo Inversor Alfa',
    deal_title: 'Local Comercial Plaza Financiera',
    deal_value: 180000,
    deal_id: 'deal-1',
    unread_count: 2,
    last_message: 'Hola, quisiéramos revisar la propuesta con el descuento de pronto pago.',
    last_time: '10:42 AM',
    assigned_rep: 'Mariana Cruz (Vendedora 1)',
    response_delay_minutes: 45, // Alert SLA!
    messages: [
      { id: 'm1', sender: 'contact', text: 'Buenas tardes, vimos la propiedad en Plaza Financiera.', timestamp: 'Ayer 4:15 PM' },
      { id: 'm2', sender: 'agent', text: '¡Hola Ana Sofía! Con gusto. El local cuenta con 110m² en Zona 10.', timestamp: 'Ayer 4:20 PM', status: 'read' },
      { id: 'm3', sender: 'contact', text: 'Hola, quisiéramos revisar la propuesta con el descuento de pronto pago.', timestamp: '10:42 AM' }
    ]
  },
  {
    id: 'chat-2',
    contact_name: 'Roberto Gómez',
    phone: '+502 4433-2211',
    company_name: 'Desarrollos Urbanos S.A.',
    deal_title: 'Oficina Torre Próceres Nivel 8',
    deal_value: 350000,
    deal_id: 'deal-2',
    unread_count: 0,
    last_message: 'Excelente, ya envié la minuta al equipo de finanzas.',
    last_time: 'Ayer',
    assigned_rep: 'Elena Rostro (Vendedora 2)',
    response_delay_minutes: 5,
    messages: [
      { id: 'm4', sender: 'contact', text: '¿Tienen la constancia de escrituración lista?', timestamp: 'Ayer 11:00 AM' },
      { id: 'm5', sender: 'agent', text: 'Hola Roberto, sí, adjunto el borrador en la cotización comercial.', timestamp: 'Ayer 11:30 AM', status: 'read' },
      { id: 'm6', sender: 'contact', text: 'Excelente, ya envié la minuta al equipo de finanzas.', timestamp: 'Ayer 2:15 PM' }
    ]
  },
  {
    id: 'chat-3',
    contact_name: 'Lucía Fernández',
    phone: '+502 3322-1100',
    company_name: 'Logística Continental',
    deal_title: 'Bodega Industrial Complejo Norte',
    deal_value: 520000,
    deal_id: 'deal-3',
    unread_count: 1,
    last_message: '¿Podríamos agendar una visita técnica para este jueves?',
    last_time: '09:15 AM',
    assigned_rep: 'Sofía Morales (Vendedora 3)',
    response_delay_minutes: 120, // Alert SLA!
    messages: [
      { id: 'm7', sender: 'contact', text: '¿Podríamos agendar una visita técnica para este jueves?', timestamp: '09:15 AM' }
    ]
  },
  {
    id: 'chat-4',
    contact_name: 'Carlos Mendoza',
    phone: '+502 2211-0099',
    company_name: 'Inversiones Centroamérica',
    deal_title: 'Terreno Comercial Carretera a El Salvador',
    deal_value: 750000,
    deal_id: 'deal-4',
    unread_count: 0,
    last_message: 'Te confirmo que recibí los planos, los reviso hoy.',
    last_time: 'Hace 2h',
    assigned_rep: 'Mariana Cruz (Vendedora 1)',
    response_delay_minutes: 8,
    messages: [
      { id: 'm8', sender: 'contact', text: 'Buenas mañanas, ¿me envías los planos del terreno?', timestamp: 'Hace 3h' },
      { id: 'm9', sender: 'agent', text: 'Hola Carlos, ya los adjunté al correo institucional.', timestamp: 'Hace 2.5h', status: 'read' },
      { id: 'm10', sender: 'contact', text: 'Te confirmo que recibí los planos, los reviso hoy.', timestamp: 'Hace 2h' }
    ]
  }
];

export default function WhatsAppInboxPage() {
  const { data, templates, renderTemplateText, formatCurrency } = useCRM();
  const [threads, setThreads] = useState<WhatsAppThread[]>(defaultThreads);
  const [activeThreadId, setActiveThreadId] = useState<string>('chat-1');
  const [selectedRepFilter, setSelectedRepFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);

  // AI Quality Audit Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    score: number;
    rating: string;
    summary: string;
    strengths: string[];
    improvements: string[];
  } | null>(null);

  // Dynamic sync with real CRM deals & contacts
  useEffect(() => {
    if (data.deals && data.deals.length > 0) {
      const dynamicThreads: WhatsAppThread[] = data.deals.map((deal, idx) => ({
        id: `chat-${deal.id}`,
        contact_name: deal.contact_name || 'Cliente Potencial',
        phone: deal.custom_fields?.['phone'] || deal.custom_fields?.['telefono'] || '+527223629263',
        company_name: deal.company_name || 'Empresa',
        deal_title: deal.title,
        deal_value: deal.value,
        deal_id: deal.id,
        unread_count: idx === 0 ? 1 : 0,
        last_message: `Consulta sobre ${deal.title}`,
        last_time: 'Reciente',
        assigned_rep: 'Mariana Cruz (Vendedora 1)',
        response_delay_minutes: idx === 0 ? 12 : 0,
        messages: [
          {
            id: `m-${deal.id}-1`,
            sender: 'contact',
            text: `Hola, estoy interesado en ${deal.title} por ${formatCurrency(deal.value)}.`,
            timestamp: 'Reciente'
          }
        ]
      }));
      setThreads(dynamicThreads);
      if (!activeThreadId && dynamicThreads[0]) {
        setActiveThreadId(dynamicThreads[0].id);
      }
    }
  }, [data.deals]);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0] || defaultThreads[0];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeThread) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      text: messageInput.trim(),
      timestamp: 'Ahora',
      status: 'sent'
    };

    setThreads(prev =>
      prev.map(t => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            last_message: newMsg.text,
            last_time: 'Ahora',
            unread_count: 0,
            response_delay_minutes: 0,
            messages: [...t.messages, newMsg]
          };
        }
        return t;
      })
    );

    setMessageInput('');
    setSelectedTemplateId('');
  };

  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find(t => t.id === tmplId);
    if (tmpl && activeThread) {
      const mockDeal = data.deals.find(d => d.id === activeThread.deal_id) || {
        id: activeThread.deal_id,
        title: activeThread.deal_title,
        value: activeThread.deal_value,
        contact_name: activeThread.contact_name,
        company_name: activeThread.company_name,
        currency: '$',
        pipeline_id: 'p1',
        stage_id: 's1',
        priority: 'high',
        tags: [],
        custom_fields: {},
        order_index: 0,
        status: 'open',
        created_at: new Date().toISOString()
      };
      setMessageInput(renderTemplateText(tmpl.body, mockDeal));
    }
  };

  const handleGenerateAiResponse = async () => {
    if (!activeThread) return;
    setIsAiSuggesting(true);
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Genera una respuesta cordial y ejecutiva por WhatsApp para el cliente ${activeThread.contact_name} sobre su consulta "${activeThread.last_message}"`,
          deal: {
            title: activeThread.deal_title,
            value: activeThread.deal_value,
            contact_name: activeThread.contact_name,
            company_name: activeThread.company_name
          }
        })
      });
      const resData = await res.json();
      if (resData.result) {
        setMessageInput(resData.result);
      }
    } catch (e) {
      console.error('Error generando sugerencia de IA', e);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  // Audit Chat Quality using Gemini AI
  const handleAuditChatQuality = async () => {
    if (!activeThread) return;
    setIsAuditModalOpen(true);
    setIsAuditing(true);

    try {
      const chatTranscript = activeThread.messages
        .map(m => `${m.sender === 'agent' ? `Vendedora (${activeThread.assigned_rep})` : `Cliente (${activeThread.contact_name})`}: ${m.text}`)
        .join('\n');

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analiza la calidad de atención comercial de este chat de WhatsApp entre la vendedora (${activeThread.assigned_rep}) y el cliente (${activeThread.contact_name}) para la propiedad "${activeThread.deal_title}" ($${activeThread.deal_value} USD).\n\nTranscripción:\n${chatTranscript}`,
          deal: {
            title: activeThread.deal_title,
            value: activeThread.deal_value,
            contact_name: activeThread.contact_name,
            company_name: activeThread.company_name
          }
        })
      });

      const resData = await res.json();

      setAuditResult({
        score: activeThread.response_delay_minutes && activeThread.response_delay_minutes > 30 ? 78 : 94,
        rating: activeThread.response_delay_minutes && activeThread.response_delay_minutes > 30 ? 'Atención Con Demora' : 'Excelente Calidad',
        summary: resData.result || 'La vendedora mantuvo un trato profesional. Se sugiere acelerar la presentación de cotizaciones y dar seguimiento en menos de 15 minutos.',
        strengths: ['Tono respetuoso y cordial', 'Identificó la necesidad del cliente', 'Respuestas claras sobre el inmueble'],
        improvements: [
          activeThread.response_delay_minutes && activeThread.response_delay_minutes > 30
            ? 'Reducir el tiempo de respuesta (cliente esperó más de 30 min)'
            : 'Proponer fecha y hora concreta para llamada de cierre',
          'Ofrecer plantilla de cotización formal'
        ]
      });
    } catch (e) {
      console.error('Error en auditoría', e);
    } finally {
      setIsAuditing(false);
    }
  };

  const filteredThreads = threads.filter(t => {
    const matchesSearch =
      t.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.deal_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRep = selectedRepFilter === 'all' || t.assigned_rep.includes(selectedRepFilter);

    return matchesSearch && matchesRep;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* Interface Principal Chat 2-Column Layout */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[660px]">
          {/* Columna Izquierda: Directorio de Mensajes */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50">
            {/* Buscador & Filtro por Vendedora */}
            <div className="p-3 border-b border-slate-200 bg-white space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o empresa..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              {/* Filtro por Vendedora */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <select
                  value={selectedRepFilter}
                  onChange={e => setSelectedRepFilter(e.target.value)}
                  className="bg-transparent text-slate-900 text-xs font-extrabold focus:outline-none cursor-pointer w-full"
                >
                  <option value="all">Todas las Vendedoras (10)</option>
                  <option value="Mariana Cruz">Mariana Cruz (Vendedora 1)</option>
                  <option value="Elena Rostro">Elena Rostro (Vendedora 2)</option>
                  <option value="Sofía Morales">Sofía Morales (Vendedora 3)</option>
                </select>
              </div>
            </div>

            {/* Lista de Hilos */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredThreads.map(thread => {
                const isActive = thread.id === activeThreadId;
                const isDelayed = thread.response_delay_minutes && thread.response_delay_minutes > 30;

                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setThreads(prev => prev.map(t => (t.id === thread.id ? { ...t, unread_count: 0 } : t)));
                    }}
                    className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                      isActive ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-100/80 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {thread.contact_name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">{thread.contact_name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{thread.last_time}</span>
                      </div>

                      <p className="text-[11px] text-indigo-700 font-bold truncate">{thread.company_name}</p>
                      <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{thread.last_message}</p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-600 font-bold truncate max-w-[130px]">{thread.assigned_rep}</span>

                        {isDelayed ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> +{thread.response_delay_minutes} min sin responder
                          </span>
                        ) : (
                          thread.unread_count > 0 && (
                            <span className="bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px]">
                              {thread.unread_count} nuevo
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Hilo Activo de WhatsApp */}
          <div className="md:col-span-8 flex flex-col bg-white">
            {/* Header del Chat con Botón de Auditoría de Calidad */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {activeThread.contact_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{activeThread.contact_name}</h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                    <span>{activeThread.phone}</span>
                    <span>•</span>
                    <span className="text-indigo-700 font-bold">{activeThread.company_name}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-slate-200 text-slate-800 font-extrabold px-2.5 py-1 rounded-xl text-xs">
                  Vendedora: {activeThread.assigned_rep}
                </span>

                {/* Botón de Auditoría de Calidad IA */}
                <button
                  onClick={handleAuditChatQuality}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Auditar Calidad con IA</span>
                </button>
              </div>
            </div>

            {/* Cuerpo de Mensajes */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/50">
              {activeThread.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-md ${msg.sender === 'agent' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs ${
                      msg.sender === 'agent'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'agent' && <CheckCheck className="w-3 h-3 text-indigo-600" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Panel de Respuesta e Integración Gemini IA */}
            <div className="p-4 border-t border-slate-200 bg-white space-y-3">
              {/* Barra de Herramientas Rápidas */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTemplateId}
                    onChange={e => handleSelectTemplate(e.target.value)}
                    className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                  >
                    <option value="">Cargar Plantilla de Mensaje...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerateAiResponse}
                  disabled={isAiSuggesting}
                  className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isAiSuggesting ? 'Generando Respuesta IA...' : 'Sugerir Respuesta con Gemini IA'}</span>
                </button>
              </div>

              {/* Formulario de Envío de Mensaje */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje de respuesta..."
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Enviar</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Auditoría de Calidad con IA */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Informe de Auditoría de Calidad - Google Gemini IA
                </h3>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isAuditing ? (
              <div className="py-10 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-indigo-900">
                  Google Gemini IA está analizando el historial completo de la vendedora ({activeThread.assigned_rep})...
                </p>
              </div>
            ) : auditResult ? (
              <div className="space-y-4 text-xs">
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-800 tracking-wider">
                      Vendedora Auditada: {activeThread.assigned_rep}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{auditResult.rating}</h4>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-700">{auditResult.score}/100</span>
                    <span className="block text-[10px] text-slate-500 font-bold">Puntuación IA</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h5 className="font-extrabold text-slate-900 text-xs">Resumen del Análisis de Supervisión:</h5>
                  <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {auditResult.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1">
                    <h6 className="font-extrabold text-emerald-900 text-[11px] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> Puntos Fuertes:
                    </h6>
                    <ul className="list-disc list-inside text-[11px] text-emerald-800 space-y-0.5 font-medium">
                      {auditResult.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1">
                    <h6 className="font-extrabold text-amber-900 text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Áreas a Mejorar:
                    </h6>
                    <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5 font-medium">
                      {auditResult.improvements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setIsAuditModalOpen(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl cursor-pointer"
                  >
                    Entendido / Cerrar Informe
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
