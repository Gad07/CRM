'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, Copy, Target, Zap, MessageSquare, Mail, AlertCircle, Send, Loader2, Key, Settings } from 'lucide-react';
import { Deal } from '@/types/crm';
import { useCRM } from '@/context/CRMContext';

interface AICopilotDrawerProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AICopilotDrawer({ deal, isOpen, onClose }: AICopilotDrawerProps) {
  const { activePipeline, getLeadScoreInfo, formatCurrency } = useCRM();
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [responseProvider, setResponseProvider] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [apiKey, setApiKey] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(savedKey);
    }
  }, []);

  if (!isOpen || !deal) return null;

  const scoreInfo = getLeadScoreInfo(deal);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    }
    setIsKeyModalOpen(false);
    alert('Clave API de Google Gemini guardada con éxito.');
  };

  const handleAskGemini = async (promptToUse?: string) => {
    const query = promptToUse || customPrompt.trim();
    if (!query && !promptToUse) return;

    setIsLoading(true);
    setCopied(false);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          deal,
          userApiKey: apiKey.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.result) {
        setAiResponse(data.result);
        setResponseProvider(data.provider || 'Google Gemini IA');
      } else if (data.error) {
        setAiResponse(`Error de API: ${data.error}`);
      } else {
        setAiResponse('No se obtuvo respuesta de la IA.');
      }
    } catch (e: any) {
      setAiResponse('Error consultando a la IA. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!aiResponse) return;
    const phone = deal.contact_id ? '50255448899' : '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(aiResponse)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-fade-in overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Google Gemini Copilot IA</h2>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                  {apiKey ? 'API Gemini Activa' : 'Modo Gratuito'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Analizando: <span className="text-slate-900 font-bold">{deal.title}</span> ({formatCurrency(deal.value)})
              </p>
            </div>
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800">
          {/* Quick Prompts Presets */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Consultas Rápidas a Gemini IA:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleAskGemini('¿Cuál es la estrategia recomendada para cerrar este trato esta semana?')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-bold text-left transition-all cursor-pointer"
              >
                Estrategia de Cierre
              </button>

              <button
                onClick={() => handleAskGemini('Redacta un correo persuasivo de seguimiento para el cliente proponiendo una llamada.')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-bold text-left transition-all cursor-pointer"
              >
                Redactar Correo
              </button>

              <button
                onClick={() => handleAskGemini('Identifica los principales riesgos de no cerrar este trato y cómo mitigarlos.')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-bold text-left transition-all cursor-pointer"
              >
                Análisis de Riesgos
              </button>

              <button
                onClick={() => handleAskGemini('Genera una oferta especial de pronto pago para el cliente.')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-bold text-left transition-all cursor-pointer"
              >
                Oferta Pronto Pago
              </button>
            </div>
          </div>

          {/* Interactive Custom Prompt Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAskGemini();
            }}
            className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2"
          >
            <input
              type="text"
              placeholder="Pregúntale cualquier cosa a Google Gemini..."
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              className="w-full bg-transparent text-slate-900 text-xs font-medium focus:outline-none px-2"
            />
            <button
              type="submit"
              disabled={isLoading || !customPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs px-3 py-1.5 rounded-lg shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Consultar</span>
            </button>
          </form>

          {/* AI Generated Output Display */}
          {isLoading ? (
            <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-extrabold text-indigo-900">Consultando a Google Gemini IA en tiempo real...</p>
            </div>
          ) : aiResponse ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-700">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>{responseProvider || 'Google Gemini IA'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleSendWhatsApp}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                {aiResponse}
              </div>
            </div>
          ) : (
            /* Default Executive Diagnosis Card */
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Diagnóstico Inicial del Trato
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Escribe tu pregunta arriba o haz clic en los botones de consulta rápida para analizar la estrategia de este trato.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all"
          >
            Cerrar Asistente
          </button>
        </div>
      </div>
    </div>
  );
}
