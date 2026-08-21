'use client';

import React, { useState } from 'react';
import { Bot, FileText, Plus, Trash2, Zap, MessageSquare, Mail, Play, Check, Copy, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function BotsAndTemplatesManager() {
  const {
    templates,
    addTemplate,
    deleteTemplate,
    botSequences,
    addBotSequence,
    toggleBotSequence,
    deleteBotSequence,
    activePipeline
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'bots' | 'templates'>('bots');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Template Form State
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false);
  const [tmplName, setTmplName] = useState('');
  const [tmplCategory, setTmplCategory] = useState<'welcome' | 'proposal' | 'followup' | 'closing' | 'reengagement'>('followup');
  const [tmplChannel, setTmplChannel] = useState<'whatsapp' | 'email' | 'both'>('whatsapp');
  const [tmplSubject, setTmplSubject] = useState('');
  const [tmplBody, setTmplBody] = useState('');

  // Bot Sequence Form State
  const [isBotFormOpen, setIsBotFormOpen] = useState(false);
  const [botName, setBotName] = useState('');
  const [botDescription, setBotDescription] = useState('');
  const [botChannel, setBotChannel] = useState<'whatsapp' | 'email' | 'omnichannel'>('omnichannel');
  const [botStep1Delay, setBotStep1Delay] = useState(1);
  const [botStep1Body, setBotStep1Body] = useState('');

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmplName.trim() || !tmplBody.trim()) return;

    addTemplate({
      name: tmplName.trim(),
      category: tmplCategory,
      channel: tmplChannel,
      subject: tmplSubject.trim() || undefined,
      body: tmplBody.trim()
    });

    setTmplName('');
    setTmplSubject('');
    setTmplBody('');
    setIsTemplateFormOpen(false);
  };

  const handleAddBotSequence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName.trim()) return;

    addBotSequence({
      name: botName.trim(),
      description: botDescription.trim() || 'Secuencia automática de seguimiento',
      channel: botChannel,
      is_active: true,
      trigger_event: 'on_deal_created',
      enrolled_deals_count: 0,
      steps: [
        {
          id: `step-1`,
          delay_days: Number(botStep1Delay),
          channel: botChannel === 'email' ? 'email' : 'whatsapp',
          message_body: botStep1Body.trim() || 'Hola {{contact_name}}, le damos seguimiento a tu solicitud de {{deal_title}}.'
        }
      ]
    });

    setBotName('');
    setBotDescription('');
    setBotStep1Body('');
    setIsBotFormOpen(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 text-slate-900">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" /> Bots de Mensajería & Biblioteca de Plantillas
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Automatiza secuencias de seguimiento por WhatsApp/Email y utiliza plantillas dinámicas
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('bots')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bots'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Secuencias de Bots ({botSequences.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Plantillas ({templates.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BOTS AUTOMÁTICOS */}
      {activeTab === 'bots' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Secuencias de Bots Activas ({botSequences.length})
            </h3>

            <button
              onClick={() => setIsBotFormOpen(!isBotFormOpen)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isBotFormOpen ? 'Cancelar' : 'Crear Bot de Seguimiento'}</span>
            </button>
          </div>

          {/* Form Create Bot */}
          {isBotFormOpen && (
            <form onSubmit={handleAddBotSequence} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-slate-900 animate-fade-in">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Nuevo Bot de Seguimiento Continuo
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre del Bot / Secuencia *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Bot Nutrición Post-Cotización 7 Días..."
                    value={botName}
                    onChange={e => setBotName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Canal de Envío</label>
                  <select
                    value={botChannel}
                    onChange={e => setBotChannel(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                  >
                    <option value="omnichannel">Multicanal (WhatsApp + Email)</option>
                    <option value="whatsapp">Solo WhatsApp</option>
                    <option value="email">Solo Correo Electrónico</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Descripción / Objetivo</label>
                  <input
                    type="text"
                    placeholder="ej: Enviar 3 mensajes automatizados para asegurar firma de contrato..."
                    value={botDescription}
                    onChange={e => setBotDescription(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Paso 1: Días de Espera (Delay)</label>
                  <input
                    type="number"
                    min="1"
                    value={botStep1Delay}
                    onChange={e => setBotStep1Delay(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Mensaje Inicial del Bot</label>
                  <input
                    type="text"
                    placeholder="ej: Hola {{contact_name}}, le damos seguimiento a {{deal_title}}..."
                    value={botStep1Body}
                    onChange={e => setBotStep1Body(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl"
                >
                  + Activar Bot de Seguimiento
                </button>
              </div>
            </form>
          )}

          {/* List of Bot Sequences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {botSequences.map(seq => (
              <div key={seq.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleBotSequence(seq.id)} className="text-indigo-600">
                      {seq.is_active ? <ToggleRight className="w-7 h-7 text-indigo-600" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                    </button>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{seq.name}</h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">{seq.description}</p>
                    </div>
                  </div>

                  <button onClick={() => deleteBotSequence(seq.id)} className="text-slate-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {seq.steps.length} Pasos Automatizados
                  </span>
                  <span className="text-xs font-extrabold text-indigo-700">
                    {seq.enrolled_deals_count} Clientes Enrolados
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PLANTILLAS DE MENSAJERÍA */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Biblioteca de Plantillas Dinámicas ({templates.length})
            </h3>

            <button
              onClick={() => setIsTemplateFormOpen(!isTemplateFormOpen)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isTemplateFormOpen ? 'Cancelar' : 'Crear Plantilla'}</span>
            </button>
          </div>

          {/* Placeholders Cheatsheet */}
          <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-xs space-y-1 text-slate-700">
            <span className="font-bold text-indigo-900 block">💡 Variables Dinámicas Disponibles para Plantillas:</span>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <code className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-bold text-indigo-700">{'{{contact_name}}'}</code>
              <code className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-bold text-indigo-700">{'{{company_name}}'}</code>
              <code className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-bold text-indigo-700">{'{{deal_title}}'}</code>
              <code className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-bold text-indigo-700">{'{{deal_value}}'}</code>
            </div>
          </div>

          {/* Form Create Template */}
          {isTemplateFormOpen && (
            <form onSubmit={handleAddTemplate} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-slate-900 animate-fade-in">
              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" /> Crear Nueva Plantilla de Mensaje
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre de la Plantilla *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Oferta de Cierre VIP..."
                    value={tmplName}
                    onChange={e => setTmplName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={tmplCategory}
                    onChange={e => setTmplCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-purple-600 cursor-pointer"
                  >
                    <option value="followup">Seguimiento</option>
                    <option value="proposal">Propuesta / Cotización</option>
                    <option value="closing">Cierre de Venta</option>
                    <option value="reengagement">Re-activación</option>
                    <option value="welcome">Bienvenida</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Canal de Preferencia</label>
                  <select
                    value={tmplChannel}
                    onChange={e => setTmplChannel(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-purple-600 cursor-pointer"
                  >
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="email">📧 Correo Electrónico</option>
                    <option value="both">🌐 Ambos Canales</option>
                  </select>
                </div>

                {tmplChannel !== 'whatsapp' && (
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Asunto del Correo (Subject)</label>
                    <input
                      type="text"
                      placeholder="ej: Propuesta Especial para {{company_name}}..."
                      value={tmplSubject}
                      onChange={e => setTmplSubject(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                )}

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Cuerpo del Mensaje *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escribe el mensaje utilizando {{contact_name}}, {{deal_title}}, {{deal_value}}..."
                    value={tmplBody}
                    onChange={e => setTmplBody(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2 rounded-xl"
                >
                  + Guardar Plantilla
                </button>
              </div>
            </form>
          )}

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tmpl => (
              <div key={tmpl.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative group">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{tmpl.name}</h4>
                    <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {tmpl.category} • {tmpl.channel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(tmpl.id, tmpl.body)}
                      className="text-slate-400 hover:text-indigo-600 p-1"
                      title="Copiar texto"
                    >
                      {copiedId === tmpl.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteTemplate(tmpl.id)} className="text-slate-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {tmpl.subject && (
                  <p className="text-xs font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
                    Asunto: {tmpl.subject}
                  </p>
                )}

                <pre className="text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {tmpl.body}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
