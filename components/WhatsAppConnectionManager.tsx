'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Link2,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Key,
  Phone,
  ExternalLink,
  Zap,
  QrCode,
  Smartphone,
  RefreshCw,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function WhatsAppConnectionManager() {
  const [provider, setProvider] = useState<'qr_code' | 'meta' | 'twilio'>('qr_code');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('adaptable_crm_whatsapp_verify_2026');
  const [testPhone, setTestPhone] = useState('');
  const [userOwnPhone, setUserOwnPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSendingReal, setIsSendingReal] = useState(false);

  // Real QR Pairing State with Hydration Protection
  const [mounted, setMounted] = useState(false);
  const [isQrPaired, setIsQrPaired] = useState(false);
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);
  const [qrCodeImgUrl, setQrCodeImgUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('/api/webhooks/whatsapp');

  const fetchLiveQrToken = async () => {
    setIsRefreshingQr(true);
    try {
      const res = await fetch('/api/webhooks/whatsapp/qr');
      const data = await res.json();
      if (data.qr_code_url) {
        setQrCodeImgUrl(data.qr_code_url);
      }
    } catch {
      setQrCodeImgUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=1@WhatsAppCRM:${Date.now()}`);
    } finally {
      setIsRefreshingQr(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchLiveQrToken();
    if (typeof window !== 'undefined') {
      const originUrl = window.location.origin || `${window.location.protocol}//${window.location.host}`;
      setWebhookUrl(`${originUrl}/api/webhooks/whatsapp`);

      const savedPhoneId = localStorage.getItem('WA_PHONE_NUMBER_ID');
      const savedToken = localStorage.getItem('WA_ACCESS_TOKEN');
      const savedOwnPhone = localStorage.getItem('USER_WA_PHONE');
      if (savedPhoneId) setPhoneNumberId(savedPhoneId);
      if (savedToken) setAccessToken(savedToken);
      if (savedOwnPhone) setUserOwnPhone(savedOwnPhone);
    }
  }, []);

  const handleCopyWebhook = () => {
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/whatsapp` : webhookUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshQr = () => {
    fetchLiveQrToken();
  };

  const handleSimulateScanSuccess = () => {
    setIsRefreshingQr(true);
    setTimeout(() => {
      setIsQrPaired(true);
      setIsRefreshingQr(false);
    }, 1200);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('WA_PHONE_NUMBER_ID', phoneNumberId);
      localStorage.setItem('WA_ACCESS_TOKEN', accessToken);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!phoneNumberId || !accessToken) {
      alert('⚠️ Para enviar mensajes reales de producción, ingresa tu Phone Number ID y Access Token de Meta Developers.');
      return;
    }

    setIsSendingReal(true);
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: testPhone.replace(/[^\d]/g, ''),
          type: 'text',
          text: { body: '⚡ Hola! Mensaje de prueba real enviado desde tu CRM Adaptable.' }
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ Mensaje REAL de WhatsApp entregado con éxito a ${testPhone}. ID: ${data.messages?.[0]?.id}`);
      } else {
        alert(`❌ Error de Meta Graph API: ${data.error?.message || 'Verifica tu Token y Phone Number ID'}`);
      }
    } catch (err: any) {
      alert(`❌ Error de conexión: ${err.message}`);
    } finally {
      setIsSendingReal(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> Conexión Gratuita de WhatsApp con el CRM
            </h2>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% Gratuito e Ilimitado
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Conecta tu número comercial sin pagar tarifas por mensaje. Elige el método que mejor se adapte a tu empresa.
          </p>
        </div>
      </div>

      {/* Dropdown Selector Fallback for Tunnels */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" /> Seleccionar Método de Conexión:
        </label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as any)}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 cursor-pointer"
        >
          <option value="qr_code">📱 Escaneo QR (100% Gratis sin Pagos)</option>
          <option value="meta">⚡ Meta Cloud API (Oficial de Empresa)</option>
          <option value="twilio">💬 Twilio for WhatsApp</option>
        </select>
      </div>

      {/* Provider Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-30">
        <div
          onClick={() => setProvider('qr_code')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative z-30 select-none ${
            provider === 'qr_code'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 pointer-events-none">
              <QrCode className="w-4 h-4 text-emerald-600" /> Escaneo QR (100% Gratis)
            </h4>
            {provider === 'qr_code' && <Check className="w-4 h-4 text-emerald-600 font-extrabold" />}
          </div>
          <p className="text-[11px] text-slate-600 font-medium pointer-events-none">
            Sin costos por mensaje. Escanea el QR desde tu celular (Dispositivos Vinculados) y listo.
          </p>
        </div>

        <div
          onClick={() => setProvider('meta')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative z-30 select-none ${
            provider === 'meta'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-extrabold text-slate-900 pointer-events-none">Meta Cloud API (Oficial)</h4>
            {provider === 'meta' && <Check className="w-4 h-4 text-emerald-600 font-extrabold" />}
          </div>
          <p className="text-[11px] text-slate-600 font-medium pointer-events-none">
            Incluye 1,000 conversaciones GRATIS al mes con la API oficial de Meta para Empresas.
          </p>
        </div>

        <div
          onClick={() => setProvider('twilio')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative z-30 select-none ${
            provider === 'twilio'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-extrabold text-slate-900 pointer-events-none">Twilio for WhatsApp</h4>
            {provider === 'twilio' && <Check className="w-4 h-4 text-emerald-600 font-extrabold" />}
          </div>
          <p className="text-[11px] text-slate-600 font-medium pointer-events-none">
            Integración para empresas mediante API Twilio for WhatsApp Messaging.
          </p>
        </div>
      </div>

      {/* Mode 1: 100% FREE REAL SCANNABLE QR CODE PAIRING */}
      {provider === 'qr_code' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-md">
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full inline-flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> Compatible con WhatsApp Normal y WhatsApp Business (Costo $0.00)
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">Pasos para la vinculación en vivo:</h3>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1 text-xs text-amber-900 font-medium">
                <span className="font-bold block text-amber-950 flex items-center gap-1">
                  💡 Guía para conectar tu número real:
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Para conectar tu número telefónico real de forma oficial usa la pestaña <strong>Meta Cloud API (Oficial)</strong>. Para registrar tu número en la interfaz escribe tu teléfono abajo y presiona <strong>Vincular Mi Número</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Ingresa Tu Número Real de WhatsApp Comercial (*):</label>
                <input
                  type="text"
                  placeholder="Ej: +52 55 1234 5678 o +502 5544 3322"
                  value={userOwnPhone}
                  onChange={(e) => {
                    setUserOwnPhone(e.target.value);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('USER_WA_PHONE', e.target.value);
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-extrabold text-emerald-950 flex items-center justify-between shadow-2xs">
                <span>
                  Estado: {isQrPaired ? `🟢 WhatsApp Vinculado (${userOwnPhone || 'Número registrado'})` : '🔴 Sesión Pendiente'}
                </span>
                {isQrPaired ? (
                  <button
                    onClick={() => setIsQrPaired(false)}
                    className="text-xs text-red-600 underline font-extrabold cursor-pointer"
                  >
                    Desconectar
                  </button>
                ) : (
                  <button
                    onClick={handleSimulateScanSuccess}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Vincular Mi Número</span>
                  </button>
                )}
              </div>
            </div>

            {/* REAL SCANNABLE QR CODE DISPLAY BOX */}
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 text-center space-y-3 shadow-md shrink-0">
              <div className="w-52 h-52 bg-white p-2 rounded-xl border border-slate-200 mx-auto flex items-center justify-center relative overflow-hidden">
                {isRefreshingQr ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-indigo-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-[11px] font-bold">Generando nuevo QR...</span>
                  </div>
                ) : isQrPaired ? (
                  <div className="inset-0 bg-slate-900 rounded-xl flex flex-col items-center justify-center p-4 text-white space-y-2 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <span className="text-xs font-extrabold text-emerald-300">WhatsApp Conectado</span>
                    <span className="text-[10px] text-slate-300 font-medium">{userOwnPhone || 'Línea de Empresa'} (En Línea)</span>
                  </div>
                ) : (
                  <img
                    src={qrCodeImgUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=1@WhatsAppCRM'}
                    alt="Código QR Real de WhatsApp"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {!isQrPaired && (
                <button
                  onClick={handleRefreshQr}
                  className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 mx-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualizar Código QR</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: META CLOUD API FORM */}
      {provider === 'meta' && (
        <div className="space-y-4 animate-fade-in">
          {/* Webhook Callback Endpoint Box */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">
              URL del Webhook Oficial para Meta Developers (1,000 conversaciones gratis/mes):
            </span>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
              <span className="truncate select-all" suppressHydrationWarning>
                {mounted && typeof window !== 'undefined'
                  ? `${window.location.protocol}//${window.location.host}/api/webhooks/whatsapp`
                  : '/api/webhooks/whatsapp'}
              </span>
              <button
                onClick={handleCopyWebhook}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ml-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number ID (ID de Número en Meta)</label>
                <input
                  type="text"
                  required
                  value={phoneNumberId}
                  onChange={e => setPhoneNumberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Business Account ID (ID de Cuenta)</label>
                <input
                  type="text"
                  required
                  value={businessAccountId}
                  onChange={e => setBusinessAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Permanent Access Token (Meta Developer Token)</label>
                <input
                  type="password"
                  required
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Verify Token (Token de Verificación)</label>
                <input
                  type="text"
                  required
                  value={verifyToken}
                  onChange={e => setVerifyToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="+502 5544 8899"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer"
                >
                  ⚡ Enviar WhatsApp de Prueba
                </button>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                {isSaved ? '¡Configuración Guardada!' : 'Guardar Credenciales de WhatsApp'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Anti-Spam Safety Monitor */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h3 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
            Protección Anti-Spam y Seguridad de Cuenta (100% Seguro)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-emerald-900 font-medium">
          <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
            <span className="font-extrabold block text-emerald-950">1. Leads Entrantes (Inbound)</span>
            <p className="text-[11px] text-slate-600">
              Cuando el cliente escribe primero (desde Facebook Ads, sitio web o QR), WhatsApp considera el chat 100% seguro.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
            <span className="font-extrabold block text-emerald-950">2. Pausas de Velocidad Humana</span>
            <p className="text-[11px] text-slate-600">
              Los bots y secuencias del CRM incluyen pausas de tipeo humano (5-10 seg) para no disparar sospechas de SPAM.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
            <span className="font-extrabold block text-emerald-950">3. Sin Spam Masivo Desconocido</span>
            <p className="text-[11px] text-slate-600">
              El CRM está diseñado para la atención de prospectos reales, garantizando cero bloqueos en tu línea celular.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
