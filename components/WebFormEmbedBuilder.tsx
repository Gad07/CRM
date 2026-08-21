'use client';

import React, { useState } from 'react';
import { Globe, Code2, Copy, Check, Sparkles, Send, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function WebFormEmbedBuilder() {
  const { addTimelineEvent } = useCRM();
  const [formTitle, setFormTitle] = useState('Solicitar Cotización de Inmueble');
  const [formSubtitle, setFormSubtitle] = useState('Completa tus datos y un ejecutivo te contactará en menos de 5 minutos por WhatsApp.');
  const [buttonText, setButtonText] = useState('Enviar Solicitud');
  const [copied, setCopied] = useState(false);
  const [submittedTest, setSubmittedTest] = useState(false);

  // Form preview state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('180000');
  const [comments, setComments] = useState('');

  const embedCode = `<!-- Formulario de Captación AdaptableCRM Enterprise -->
<iframe
  src="https://tu-crm.com/embed/lead-form?title=${encodeURIComponent(formTitle)}"
  width="100%"
  height="500 shadow-sm"
  frameborder="0"
  style="border-radius: 16px; border: 1px solid #e2e8f0;"
></iframe>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedTest(true);

    addTimelineEvent({
      deal_id: 'deal-1',
      type: 'deal_created' as any,
      title: 'Lead Captado desde Formulario Web Embed',
      description: `Nombre: ${name || 'Juan Pérez'} • Tel: ${phone || '+502 5544-3322'} • Presupuesto: $${budget} USD`
    });

    setTimeout(() => setSubmittedTest(false), 4000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" /> Generador de Formularios Web Embed (Webhooks)
            </h2>
            <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Compatible con WordPress, Wix, Webflow y HTML
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Integra un formulario en tu sitio web. Cada cliente que llene el formulario se registra automáticamente como Lead en el embudo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Configuración del Formulario */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Título del Formulario Web</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subtítulo / Instrucción</label>
              <input
                type="text"
                value={formSubtitle}
                onChange={e => setFormSubtitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Texto del Botón de Envío</label>
              <input
                type="text"
                value={buttonText}
                onChange={e => setButtonText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Code Output Box */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Código HTML Embed para Pegar en tu Web
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Código'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap">
              {embedCode}
            </pre>
          </div>
        </div>

        {/* Columna Derecha: Vista Previa Interactiva del Formulario */}
        <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
            Vista Previa en Vivo (Simulación de tu Sitio Web):
          </span>

          {submittedTest && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-extrabold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¡Lead recibido! Registrado en el embudo y asignado por Round-Robin.</span>
            </div>
          )}

          <form onSubmit={handleTestFormSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">{formTitle}</h3>
              <p className="text-xs text-slate-500 font-medium">{formSubtitle}</p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                required
                placeholder="Nombre Completo *"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Teléfono WhatsApp *"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
                />
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <select
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
              >
                <option value="180000">Presupuesto: $100,000 - $200,000 USD</option>
                <option value="350000">Presupuesto: $200,000 - $500,000 USD</option>
                <option value="750000">Presupuesto: Más de $500,000 USD</option>
              </select>

              <textarea
                rows={2}
                placeholder="Comentarios adicionales..."
                value={comments}
                onChange={e => setComments(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{buttonText}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
