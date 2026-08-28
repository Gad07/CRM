"use client";

import React, { useState, useEffect } from "react";
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
  Smartphone,
  RefreshCw,
  Loader2,
  SlidersHorizontal,
  AlertCircle,
  Wifi,
  Send,
  HelpCircle
} from "lucide-react";
import { useCRM } from "@/context/CRMContext";

const WA_KEYS = {
  PROVIDER: "WA_PROVIDER",
  PHONE_ID: "WA_PHONE_NUMBER_ID",
  BUSINESS_ID: "WA_BUSINESS_ACCOUNT_ID",
  ACCESS_TOKEN: "WA_ACCESS_TOKEN",
  VERIFY_TOKEN: "WA_VERIFY_TOKEN",
  IS_CONNECTED: "WA_IS_CONNECTED",
  USER_PHONE: "USER_WA_PHONE",
  TWILIO_SID: "WA_TWILIO_SID",
  TWILIO_TOKEN: "WA_TWILIO_TOKEN",
  TWILIO_FROM: "WA_TWILIO_FROM",
};

function ls(key: string, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) || fallback;
}
function lsSet(key: string, val: string) {
  if (typeof window !== "undefined") localStorage.setItem(key, val);
}
function lsDel(key: string) {
  if (typeof window !== "undefined") localStorage.removeItem(key);
}

export function WhatsAppConnectionManager() {
  const [provider, setProvider] = useState<"meta" | "twilio">("meta");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("adaptable_crm_whatsapp_verify_2026");
  const [testPhone, setTestPhone] = useState("");

  // Twilio fields
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [twilioFrom, setTwilioFrom] = useState("");

  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSendingReal, setIsSendingReal] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("/api/webhooks/whatsapp");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setWebhookUrl(`${origin}/api/webhooks/whatsapp`);
      const savedProvider = ls(WA_KEYS.PROVIDER);
      setProvider(savedProvider === "twilio" ? "twilio" : "meta");
      setPhoneNumberId(ls(WA_KEYS.PHONE_ID));
      setBusinessAccountId(ls(WA_KEYS.BUSINESS_ID));
      setAccessToken(ls(WA_KEYS.ACCESS_TOKEN));
      setVerifyToken(ls(WA_KEYS.VERIFY_TOKEN) || "adaptable_crm_whatsapp_verify_2026");
      setTwilioSid(ls(WA_KEYS.TWILIO_SID));
      setTwilioToken(ls(WA_KEYS.TWILIO_TOKEN));
      setTwilioFrom(ls(WA_KEYS.TWILIO_FROM));
      setIsConnected(ls(WA_KEYS.IS_CONNECTED) === "true");
    }
  }, []);

  const handleCopyWebhook = () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/api/webhooks/whatsapp`
        : webhookUrl;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveMetaConfig = (e: React.FormEvent) => {
    e.preventDefault();
    lsSet(WA_KEYS.PROVIDER, "meta");
    lsSet(WA_KEYS.PHONE_ID, phoneNumberId);
    lsSet(WA_KEYS.BUSINESS_ID, businessAccountId);
    lsSet(WA_KEYS.ACCESS_TOKEN, accessToken);
    lsSet(WA_KEYS.VERIFY_TOKEN, verifyToken);
    lsSet(WA_KEYS.IS_CONNECTED, "true");
    lsSet(WA_KEYS.USER_PHONE, phoneNumberId);
    setIsConnected(true);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveTwilioConfig = (e: React.FormEvent) => {
    e.preventDefault();
    lsSet(WA_KEYS.PROVIDER, "twilio");
    lsSet(WA_KEYS.TWILIO_SID, twilioSid);
    lsSet(WA_KEYS.TWILIO_TOKEN, twilioToken);
    lsSet(WA_KEYS.TWILIO_FROM, twilioFrom);
    lsSet(WA_KEYS.IS_CONNECTED, "true");
    lsSet(WA_KEYS.USER_PHONE, twilioFrom);
    setIsConnected(true);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    lsDel(WA_KEYS.IS_CONNECTED);
    lsDel(WA_KEYS.PHONE_ID);
    lsDel(WA_KEYS.ACCESS_TOKEN);
    lsDel(WA_KEYS.TWILIO_SID);
    lsDel(WA_KEYS.TWILIO_TOKEN);
    lsDel(WA_KEYS.TWILIO_FROM);
  };

  const handleTestSend = async () => {
    if (!testPhone.trim()) {
      setSendResult({ ok: false, msg: "Ingresa un número de teléfono destinatario para la prueba." });
      return;
    }

    setSendResult(null);
    setIsSendingReal(true);

    try {
      const body: Record<string, any> = {
        to: testPhone,
        message: "⚡ Hola! Mensaje de prueba enviado desde tu CRM Adaptable. ¡La integración de WhatsApp está funcionando correctamente!",
        fromPhone: "CRM Test",
      };

      if (provider === "meta") {
        body.phoneNumberId = phoneNumberId;
        body.accessToken = accessToken;
      } else if (provider === "twilio") {
        body.twilioMode = true;
        body.twilioAccountSid = twilioSid;
        body.twilioAuthToken = twilioToken;
        body.twilioFrom = twilioFrom;
      }

      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.provider === "local_simulation") {
          setSendResult({
            ok: true,
            msg: `✅ Guardado localmente. Para enviar mensajes reales a WhatsApp, ingresa tu Phone Number ID y Access Token de Meta arriba. ID: ${data.message_id}`,
          });
        } else {
          setSendResult({
            ok: true,
            msg: `✅ Mensaje REAL enviado con éxito a WhatsApp vía ${data.provider === "twilio" ? "Twilio" : "Meta Cloud API v21.0"}. ID: ${data.message_id}`,
          });
        }
      } else {
        setSendResult({
          ok: false,
          msg: `❌ Error: ${data.error || "No se pudo enviar el mensaje"}`,
        });
      }
    } catch (err: any) {
      setSendResult({ ok: false, msg: `❌ Error de conexión: ${err.message}` });
    } finally {
      setIsSendingReal(false);
    }
  };

  const cardBase =
    "p-4 rounded-xl border text-left transition-all cursor-pointer relative z-30 select-none";
  const cardActive = "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30";
  const cardIdle = "bg-slate-50 border-slate-200 hover:border-slate-300";

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Conexión Oficial de WhatsApp (Meta Cloud API & Twilio)
            </h2>
            {isConnected && mounted && (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-600" /> Conectado Oficial
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Conecta tu cuenta empresarial para enviar y recibir mensajes de WhatsApp en tiempo real desde el CRM.
          </p>
        </div>
        {isConnected && mounted && (
          <button
            onClick={handleDisconnect}
            className="text-xs text-red-600 underline font-bold cursor-pointer shrink-0"
          >
            Desconectar
          </button>
        )}
      </div>

      {/* Provider selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            key: "meta",
            icon: <Zap className="w-4 h-4 text-emerald-600" />,
            title: "Meta Cloud API (Oficial de WhatsApp)",
            desc: "1,000 conversaciones gratis al mes. API oficial de Meta para envíos y webhooks en vivo.",
          },
          {
            key: "twilio",
            icon: <Phone className="w-4 h-4 text-blue-600" />,
            title: "Twilio for WhatsApp",
            desc: "Integración para empresas que ya cuentan con números corporativos en Twilio.",
          },
        ].map(({ key, icon, title, desc }) => (
          <div
            key={key}
            onClick={() => setProvider(key as any)}
            className={`${cardBase} ${provider === key ? cardActive : cardIdle}`}
          >
            <div className="flex items-center justify-between mb-1 pointer-events-none">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                {icon} {title}
              </h4>
              {provider === key && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-600 font-medium pointer-events-none">{desc}</p>
          </div>
        ))}
      </div>

      {/* ── MODE 1: META CLOUD API ── */}
      {provider === "meta" && (
        <form onSubmit={handleSaveMetaConfig} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" /> Credenciales de Meta Cloud API (WhatsApp Business)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Obtén tus credenciales gratis en{" "}
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
                >
                  Meta for Developers <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              1,000 conversaciones gratis / mes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Phone Number ID *
              </label>
              <input
                type="text"
                required
                placeholder="ej: 104582910394821"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                WhatsApp Business Account ID (WABA)
              </label>
              <input
                type="text"
                placeholder="ej: 984729104829104"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Permanent Access Token (o Token Temporal) *
            </label>
            <input
              type="password"
              required
              placeholder="EAAG..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Webhook Configuration for Meta */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-extrabold text-slate-900 block flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-emerald-600" /> Webhook para Recepción de Mensajes en Vivo
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              Copia esta URL en tu App de Meta Developers en la sección WhatsApp &gt; Configuration &gt; Webhook:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
              <span>Token de Verificación (Verify Token):</span>
              <code className="bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-bold font-mono">
                {verifyToken}
              </code>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Credenciales guardadas y activas.
              </span>
            )}
            <button
              type="submit"
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Guardar Credenciales de Meta
            </button>
          </div>
        </form>
      )}

      {/* ── MODE 2: TWILIO ── */}
      {provider === "twilio" && (
        <form onSubmit={handleSaveTwilioConfig} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" /> Credenciales de Twilio for WhatsApp
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Configura tus claves de API de Twilio Console para enviar mensajes desde tu número Twilio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Account SID *</label>
              <input
                type="text"
                required
                placeholder="AC..."
                value={twilioSid}
                onChange={(e) => setTwilioSid(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Auth Token *</label>
              <input
                type="password"
                required
                placeholder="Tu Auth Token..."
                value={twilioToken}
                onChange={(e) => setTwilioToken(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Twilio WhatsApp From Number * (ej: +14155238886)
            </label>
            <input
              type="text"
              required
              placeholder="+14155238886"
              value={twilioFrom}
              onChange={(e) => setTwilioFrom(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Credenciales guardadas y activas.
              </span>
            )}
            <button
              type="submit"
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Guardar Credenciales de Twilio
            </button>
          </div>
        </form>
      )}

      {/* Test Message Section */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Send className="w-4 h-4" /> Probar Envío de Mensaje Real a WhatsApp
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Proveedor: {provider === "meta" ? "Meta Cloud API" : "Twilio"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Número destinatario con código de país (ej: 50255443322 o 521...)"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleTestSend}
            disabled={isSendingReal}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 justify-center shrink-0 shadow-md"
          >
            {isSendingReal ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Enviar Mensaje de Prueba</span>
              </>
            )}
          </button>
        </div>

        {sendResult && (
          <div
            className={`p-3.5 rounded-xl text-xs font-mono font-bold border animate-fade-in ${
              sendResult.ok
                ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                : "bg-red-950/80 border-red-500/50 text-red-300"
            }`}
          >
            {sendResult.msg}
          </div>
        )}
      </div>

      {/* One-click direct WhatsApp note */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-950 font-medium">
        <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-emerald-900 font-extrabold mb-0.5">
            Envío Directo con 1-Clic siempre habilitado
          </strong>
          En todas las cotizaciones, fichas de contacto y negocios puedes presionar el botón <strong>"Enviar WhatsApp"</strong> para abrir WhatsApp Web o la App oficial de escritorio con el mensaje y desglose pre-cargado al instante.
        </div>
      </div>
    </div>
  );
}
