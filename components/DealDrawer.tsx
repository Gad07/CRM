'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileText,
  Bot,
  MessageSquare,
  Clock,
  Edit3,
  Sliders,
  Check,
  User,
  Building2,
  Paperclip,
  Upload,
  File,
  Download,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Deal } from '@/types/crm';
import { QuotationBuilder } from './QuotationBuilder';
import { AICopilotDrawer } from './AICopilotDrawer';

interface DealDrawerProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DealDrawer({ deal, isOpen, onClose }: DealDrawerProps) {
  const {
    activePipeline,
    getLeadScoreInfo,
    timelineEvents,
    addTimelineEvent,
    formatCurrency,
    botSequences,
    enrollDealInBot,
    templates,
    renderTemplateText,
    moveDealStage,
    attachments,
    addAttachment,
    deleteAttachment
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'timeline' | 'notes' | 'custom_fields' | 'files'>('timeline');
  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);

  const [activeActionModal, setActiveActionModal] = useState<'none' | 'bot' | 'whatsapp'>('none');
  const [selectedBotId, setSelectedBotId] = useState('');
  const [selectedTmplId, setSelectedTmplId] = useState('');
  const [whatsappPreview, setWhatsappPreview] = useState('');
  const [newNote, setNewNote] = useState('');

  if (!isOpen || !deal) return null;

  const scoreInfo = getLeadScoreInfo(deal);
  const dealEvents = timelineEvents.filter(e => e.deal_id === deal.id);
  const dealFiles = attachments.filter(a => a.deal_id === deal.id);
  const stages = activePipeline?.stages || [];
  const currentStageIndex = stages.findIndex(s => s.id === deal.stage_id);

  const handleEnrollInBot = () => {
    if (!selectedBotId) return;
    enrollDealInBot(deal.id, selectedBotId);
    alert('Cliente enrolado con éxito en la secuencia de Bot.');
    setSelectedBotId('');
    setActiveActionModal('none');
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTmplId(id);
    const tmpl = templates.find(t => t.id === id);
    if (tmpl) {
      setWhatsappPreview(renderTemplateText(tmpl.body, deal));
    } else {
      setWhatsappPreview('');
    }
  };

  const handleSendTemplateWhatsApp = () => {
    if (!selectedTmplId) return;
    const tmpl = templates.find(t => t.id === selectedTmplId);
    if (!tmpl) return;

    const rendered = whatsappPreview || renderTemplateText(tmpl.body, deal);
    const phone = deal.contact_id ? '50255448899' : '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(rendered)}`;
    window.open(url, '_blank');

    addTimelineEvent({
      deal_id: deal.id,
      type: 'message_sent',
      title: `Plantilla enviada por WhatsApp: ${tmpl.name}`,
      description: rendered
    });

    setSelectedTmplId('');
    setWhatsappPreview('');
    setActiveActionModal('none');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addTimelineEvent({
      deal_id: deal.id,
      type: 'note_added',
      title: 'Nota de Seguimiento',
      description: newNote.trim()
    });

    setNewNote('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        addAttachment({
          deal_id: deal.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          file_url: (reader.result as string) || ''
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const getScoreBadge = () => {
    if (scoreInfo.rating === 'hot') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
          Prioridad Alta ({scoreInfo.score} pts)
        </span>
      );
    } else if (scoreInfo.rating === 'warm') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
          Prioridad Media ({scoreInfo.score} pts)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
          Prioridad Baja ({scoreInfo.score} pts)
        </span>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-fade-in text-slate-900 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getScoreBadge()}
              <span className="bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-slate-200">
                {deal.status === 'open' ? 'En Negociación' : deal.status === 'won' ? 'Ganado' : 'Perdido'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{deal.title}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs mt-1.5 font-bold text-slate-600">
              <span className="text-emerald-700 font-extrabold text-sm">{formatCurrency(deal.value)}</span>
              {deal.contact_name && (
                <>
                  <span>•</span>
                  <span>{deal.contact_name}</span>
                </>
              )}
              {deal.company_name && (
                <>
                  <span>•</span>
                  <span>{deal.company_name}</span>
                </>
              )}
            </div>
          </div>

          {/* Selector de Etapa del Embudo */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Etapa del Embudo:</span>
              <select
                value={deal.stage_id}
                onChange={e => moveDealStage(deal.id, e.target.value)}
                className="bg-transparent text-slate-900 font-extrabold text-xs focus:outline-none cursor-pointer text-right"
              >
                {stages.map(st => (
                  <option key={st.id} value={st.id} className="bg-white text-slate-900 font-bold">
                    {st.name} ({st.win_probability}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round(((currentStageIndex + 1) / Math.max(1, stages.length)) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Clean Executive Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <button
              onClick={() => setIsAICopilotOpen(true)}
              className="flex flex-col items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-2 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Copilot IA</span>
            </button>

            <button
              onClick={() => setIsQuoteBuilderOpen(true)}
              className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 px-2 rounded-xl transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Cotización</span>
            </button>

            <button
              onClick={() => setActiveActionModal(activeActionModal === 'bot' ? 'none' : 'bot')}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-bold py-2.5 px-2 rounded-xl border transition-colors cursor-pointer ${
                activeActionModal === 'bot'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Secuencia Bot</span>
            </button>

            <button
              onClick={() => setActiveActionModal(activeActionModal === 'whatsapp' ? 'none' : 'whatsapp')}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-bold py-2.5 px-2 rounded-xl border transition-colors cursor-pointer ${
                activeActionModal === 'whatsapp'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Action Expandable Modal: Bot Enroller */}
          {activeActionModal === 'bot' && (
            <div className="bg-purple-50/70 border border-purple-200 p-4 rounded-xl space-y-3 animate-fade-in">
              <h4 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-600" /> Enrolar en Secuencia de Bot Automático
              </h4>
              <div className="space-y-2">
                <select
                  value={selectedBotId}
                  onChange={e => setSelectedBotId(e.target.value)}
                  className="w-full bg-white border border-purple-300 rounded-lg p-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-purple-600 cursor-pointer"
                >
                  <option value="">Selecciona la secuencia de bot...</option>
                  {botSequences.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.steps.length} pasos)
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setActiveActionModal('none')}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEnrollInBot}
                    disabled={!selectedBotId}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-xs cursor-pointer"
                  >
                    Activar Bot
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Expandable Modal: WhatsApp Sender */}
          {activeActionModal === 'whatsapp' && (
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-3 animate-fade-in">
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" /> Enviar Plantilla de Mensaje WhatsApp
              </h4>
              <div className="space-y-2">
                <select
                  value={selectedTmplId}
                  onChange={e => handleSelectTemplate(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg p-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="">Selecciona una plantilla de mensaje...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                {whatsappPreview && (
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs text-slate-700 font-mono space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Vista Previa del Mensaje:</span>
                    <p className="whitespace-pre-wrap">{whatsappPreview}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setActiveActionModal('none')}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSendTemplateWhatsApp}
                    disabled={!selectedTmplId}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-xs cursor-pointer"
                  >
                    Enviar Mensaje WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pestañas de Contenido */}
        <div className="px-6 pt-3 border-b border-slate-200 overflow-x-auto">
          <div className="flex gap-4 text-xs font-bold min-w-max">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'timeline'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Historial ({dealEvents.length})
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'notes'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Notas y Minutas
            </button>

            <button
              onClick={() => setActiveTab('custom_fields')}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'custom_fields'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Campos Adaptables
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === 'files'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Archivos ({dealFiles.length})</span>
            </button>
          </div>
        </div>

        {/* Cuerpo de Pestaña */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 text-slate-900">
          {activeTab === 'timeline' && (
            <div className="space-y-2">
              {dealEvents.length === 0 ? (
                <div className="text-center py-10 space-y-1">
                  <Clock className="w-7 h-7 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">Sin historial registrado.</p>
                </div>
              ) : (
                dealEvents.map(event => (
                  <div key={event.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <span className="text-indigo-600 uppercase">{event.type}</span>
                      <span>{new Date(event.timestamp).toLocaleString('es-ES')}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">{event.title}</h4>
                    {event.description && <p className="text-xs text-slate-600 font-medium">{event.description}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Escribe una nota sobre el negocio..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                + Guardar Nota
              </button>
            </form>
          )}

          {activeTab === 'custom_fields' && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {Object.keys(deal.custom_fields || {}).length === 0 ? (
                <p className="text-xs text-slate-400 text-center">No hay valores en campos personalizados.</p>
              ) : (
                Object.entries(deal.custom_fields).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200 last:border-0">
                    <span className="font-bold text-slate-600">{k}:</span>
                    <span className="font-extrabold text-slate-900">{String(v)}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: ARCHIVOS & DOCUMENTOS ADJUNTOS */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              {/* File Upload Drop Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Haz clic o arrastra archivos aquí para adjuntarlos</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Soporta PDF, Planos, Imágenes, Contratos DOCX (hasta 25 MB)</p>
                  </div>
                </div>
              </div>

              {/* Attachments List */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Documentos del Negocio ({dealFiles.length})
                </h4>

                {dealFiles.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-1">
                    <File className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-500">No hay archivos adjuntos aún.</p>
                  </div>
                ) : (
                  dealFiles.map(att => (
                    <div
                      key={att.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{att.file_name}</h5>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {(att.file_size / 1024).toFixed(1)} KB • {new Date(att.uploaded_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={att.file_url}
                          target="_blank"
                          rel="noreferrer"
                          download={att.file_name}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Descargar / Abrir Archivo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => deleteAttachment(att.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar Archivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <QuotationBuilder
        deal={deal}
        isOpen={isQuoteBuilderOpen}
        onClose={() => setIsQuoteBuilderOpen(false)}
      />

      <AICopilotDrawer
        deal={deal}
        isOpen={isAICopilotOpen}
        onClose={() => setIsAICopilotOpen(false)}
      />
    </div>
  );
}
