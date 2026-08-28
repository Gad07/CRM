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
  WifiOff,
  Send,
  HelpCircle,
  QrCode,
  X
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
  const [provider, setProvider] = useState<"baileys" | "meta" | "twilio">("baileys");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("adaptable_crm_whatsapp_verify_2026");
  const [testPhone, setTestPhone] = useState("");

  // Twilio fields
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [twilioFrom, setTwilioFrom] = useState("");

  // Baileys state
  const [baileysState, setBaileysState] = useState<{
    connected: boolean;
    state: string;
    qr: string | null;
    user: { id: string; phone: string; name: string } | null;
    message?: string;
  }>({
    connected: false,
    state: "checking",
    qr: null,
    user: null,
  });

  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSendingReal, setIsSendingReal] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("/api/webhooks/whatsapp");

  const checkBaileys = async () => {
    try {
      const res = await fetch("/api/whatsapp/baileys");
      if (!res.ok) return;
      const data = await res.json();
      setBaileysState(data);
      if (data.connected && data.user?.phone) {
        setIsConnected(true);
        if (typeof window !== "undefined") {
          localStorage.setItem(WA_KEYS.IS_CONNECTED, "true");
          localStorage.setItem(WA_KEYS.USER_PHONE, data.user.phone);
        }
      }
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setWebhookUrl(`${origin}/api/webhooks/whatsapp`);
      const savedProvider = ls(WA_KEYS.PROVIDER);
      if (savedProvider === "meta" || savedProvider === "twilio" || savedProvider === "baileys") {
        setProvider(savedProvider);
      }
      setPhoneNumberId(ls(WA_KEYS.PHONE_ID));
      setBusinessAccountId(ls(WA_KEYS.BUSINESS_ID));
      setAccessToken(ls(WA_KEYS.ACCESS_TOKEN));
      setVerifyToken(ls(WA_KEYS.VERIFY_TOKEN) || "adaptable_crm_whatsapp_verify_2026");
      setTwilioSid(ls(WA_KEYS.TWILIO_SID));
      setTwilioToken(ls(WA_KEYS.TWILIO_TOKEN));
      setTwilioFrom(ls(WA_KEYS.TWILIO_FROM));
      setIsConnected(ls(WA_KEYS.IS_CONNECTED) === "true");
    }
    checkBaileys();
    const interval = setInterval(checkBaileys, 3000);
    return () => clearInterval(interval);
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

  const handleDisconnect = async () => {
    if (provider === "baileys") {
      try {
        await fetch("/api/whatsapp/baileys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "disconnect" })
        });
      } catch {}
    }
    setIsConnected(false);
    lsDel(WA_KEYS.IS_CONNECTED);
    lsDel(WA_KEYS.PHONE_ID);
    lsDel(WA_KEYS.ACCESS_TOKEN);
    lsDel(WA_KEYS.TWILIO_SID);
    lsDel(WA_KEYS.TWILIO_TOKEN);
    lsDel(WA_KEYS.TWILIO_FROM);
    checkBaileys();
  };

  const handleTestSend = async () => {
    if (!testPhone.trim()) {
      setSendResult({ ok: false, msg: "Ingresa un número de teléfono destinatario para la prueba." });
      return;
    }

    setSendResult(null);
    setIsSendingReal(true);

    try {
      if (provider === "baileys") {
        const res = await fetch("/api/whatsapp/baileys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send",
            to: testPhone,
            message: "⚡ ¡Hola! Mensaje de prueba enviado exitosamente desde tu CRM Adaptable mediante WhatsApp Web vinculado por QR.",
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSendResult({
            ok: true,
            msg: `✅ Mensaje REAL enviado con éxito por WhatsApp Web (Baileys) a +${data.to}. ID: ${data.message_id}`,
          });
        } else {
          setSendResult({
            ok: false,
            msg: `❌ Error: ${data.error || "No se pudo enviar vía WhatsApp Web. Asegúrate de tener el código QR escaneado."}`,
          });
        }
        return;
      }

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
              Integración de WhatsApp (QR Web, Meta Cloud API o Twilio)
            </h2>
            {isConnected && mounted && (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-600" /> Conectado Activo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Vincula cualquier número escaneando el código QR con tu celular o usa la API oficial de Meta para empresas.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            key: "baileys",
            icon: <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />,
            title: "WhatsApp Web (Código QR)",
            desc: "Escanea el código con tu celular (Personal o Business). 100% gratis y sin verificación en Meta.",
          },
          {
            key: "meta",
            icon: <Zap className="w-4 h-4 text-indigo-600 shrink-0" />,
            title: "Meta Cloud API (Oficial)",
            desc: "1,000 conversaciones gratis al mes. Requiere cuenta comercial verificada en Meta Business.",
          },
          {
            key: "twilio",
            icon: <Phone className="w-4 h-4 text-blue-600 shrink-0" />,
            title: "Twilio for WhatsApp",
            desc: "Integración para empresas que ya cuentan con números corporativos en Twilio.",
          },
        ].map(({ key, icon, title, desc }) => {
          const isActive = provider === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => {
                setProvider(key as any);
                lsSet(WA_KEYS.PROVIDER, key);
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative z-20 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs ${
                isActive
                  ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xs"
                  : "bg-slate-50/80 hover:bg-slate-100/90 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <h4 className={`text-xs font-extrabold flex items-center gap-1.5 ${isActive ? "text-emerald-950" : "text-slate-900"}`}>
                  {icon} {title}
                </h4>
                {isActive && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className={`text-[11px] font-medium leading-relaxed ${isActive ? "text-emerald-800/90" : "text-slate-500"}`}>{desc}</p>
            </button>
          );
        })}
      </div>

      {/* ── MODE 0: BAILEYS QR SCANNER ── */}
      {provider === "baileys" && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" /> Vinculación por Código QR en Tiempo Real
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Conexión WebSocket directa con los servidores de WhatsApp mediante protocolo Noise/Multi-Device.
              </p>
            </div>
            {baileysState.connected ? (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Conectado (+{baileysState.user?.phone})
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" /> Esperando vinculación
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              {baileysState.connected ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">¡Dispositivo Vinculado!</h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Teléfono: <span className="font-bold text-emerald-700">+{baileysState.user?.phone}</span>
                  </p>
                  {baileysState.user?.name && (
                    <p className="text-[11px] text-slate-400">{baileysState.user.name}</p>
                  )}
                  <button
                    onClick={handleDisconnect}
                    className="mt-2 text-xs font-bold text-red-600 hover:text-red-800 underline cursor-pointer"
                  >
                    Desvincular y generar nuevo QR
                  </button>
                </div>
              ) : baileysState.state === "server_offline" ? (
                <div className="py-6 text-center space-y-3">
                  <WifiOff className="w-8 h-8 text-amber-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-900">Servidor de WhatsApp Desconectado</p>
                  <p className="text-[11px] text-slate-500">Ejecuta en tu terminal:</p>
                  <code className="bg-slate-900 text-emerald-400 font-mono text-[11px] px-2 py-1 rounded-md block">
                    npm run whatsapp:server
                  </code>
                </div>
              ) : baileysState.qr ? (
                <div className="space-y-2 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={baileysState.qr}
                    alt="Código QR de WhatsApp"
                    className="w-56 h-56 rounded-xl bg-white p-2 border border-slate-100 mx-auto shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" /> Sincronización criptográfica activa
                  </p>
                </div>
              ) : (
                <div className="w-56 h-56 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <span className="text-xs font-bold text-slate-600">Generando QR...</span>
                </div>
              )}
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950 space-y-2">
                <h5 className="font-extrabold flex items-center gap-1.5 text-emerald-900 text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-700" /> Pasos para escanear desde tu celular:
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 font-medium text-xs text-emerald-900/90 pl-1">
                  <li>Abre la aplicación de <strong>WhatsApp</strong> en tu teléfono.</li>
                  <li>Toca el menú de <strong>tres puntos</strong> (Android) o ve a <strong>Configuración</strong> (iPhone).</li>
                  <li>Selecciona la opción <strong>Dispositivos vinculados</strong>.</li>
                  <li>Toca el botón verde <strong>Vincular un dispositivo</strong>.</li>
                  <li>Apunta la cámara de tu teléfono al código QR mostrado a la izquierda.</li>
                </ol>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={checkBaileys}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Actualizar Estado
                </button>
                <a
                  href="/whatsapp"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs"
                >
                  Ir a la Bandeja de Chat →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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
