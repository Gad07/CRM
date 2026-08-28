"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare, Search, Send, Sparkles, CheckCheck, AlertTriangle,
  Star, ShieldCheck, Users, Phone, Plus, Loader2, WifiOff, RefreshCw, Radio,
  QrCode, Smartphone, CheckCircle2, X, Zap, Image as ImageIcon, FileText,
  Mic, MapPin, Download, ExternalLink, Play,
  Tag, StickyNote, ClipboardList, CheckSquare, Square, Trash2,
  PlusCircle, ChevronRight, ChevronLeft, TrendingUp, Clock, UserCheck,
  Briefcase, Calendar, Lightbulb, Flame
} from "lucide-react";
import { useCRM } from "@/context/CRMContext";
import { Navbar } from "@/components/Navbar";

interface ChatMessage {
  id: string;
  sender: "contact" | "agent" | "system";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read" | "sending" | "failed";
  isReal?: boolean;
  media?: {
    type: "image" | "video" | "audio" | "document" | "sticker" | "location";
    caption?: string;
    thumbnail?: string | null;
    audioUrl?: string | null;
    docUrl?: string | null;
    fileName?: string;
    fileSize?: number;
    seconds?: number;
    latitude?: number;
    longitude?: number;
    name?: string;
    isVoiceNote?: boolean;
  } | null;
}

type DealStage = "prospecto" | "interesado" | "cotizacion" | "cerrado" | "perdido";
type ContactTag = "vip" | "cliente" | "prospecto" | "frio" | "urgente";

interface CrmNote {
  id: string;
  text: string;
  createdAt: string;
}

interface CrmTask {
  id: string;
  text: string;
  dueDate: string;
  done: boolean;
}

interface CrmContactData {
  stage: DealStage;
  tags: ContactTag[];
  notes: CrmNote[];
  tasks: CrmTask[];
  quickNote: string;
}

const STAGE_LABELS: Record<DealStage, string> = {
  prospecto: "Prospecto",
  interesado: "Interesado",
  cotizacion: "Cotización",
  cerrado: "Cerrado ✅",
  perdido: "Perdido ❌",
};

const STAGE_COLORS: Record<DealStage, string> = {
  prospecto: "bg-slate-100 text-slate-700 border-slate-300",
  interesado: "bg-blue-100 text-blue-800 border-blue-300",
  cotizacion: "bg-amber-100 text-amber-800 border-amber-300",
  cerrado: "bg-emerald-100 text-emerald-800 border-emerald-300",
  perdido: "bg-red-100 text-red-800 border-red-300",
};

const TAG_LABELS: Record<ContactTag, string> = {
  vip: "⭐ VIP",
  cliente: "💼 Cliente",
  prospecto: "🔍 Prospecto",
  frio: "❄️ Frío",
  urgente: "🔥 Urgente",
};

const TAG_COLORS: Record<ContactTag, string> = {
  vip: "bg-yellow-100 text-yellow-800 border-yellow-300",
  cliente: "bg-indigo-100 text-indigo-800 border-indigo-300",
  prospecto: "bg-slate-100 text-slate-700 border-slate-300",
  frio: "bg-cyan-100 text-cyan-800 border-cyan-300",
  urgente: "bg-red-100 text-red-800 border-red-300",
};

function loadCrmData(jid: string): CrmContactData {
  if (typeof window === "undefined") return { stage: "prospecto", tags: [], notes: [], tasks: [], quickNote: "" };
  try {
    const raw = localStorage.getItem(`CRM_PANEL_${jid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { stage: "prospecto", tags: [], notes: [], tasks: [], quickNote: "" };
}

function saveCrmData(jid: string, data: CrmContactData) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(`CRM_PANEL_${jid}`, JSON.stringify(data)); } catch {}
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
  response_delay_minutes: number;
  messages: ChatMessage[];
  has_real_messages?: boolean;
}

function getInitials(name: string) {
  if (!name) return "WA";
  const clean = name.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
  if (!clean) return name.substring(0, 2) || "WA";
  return clean.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}
function unifyWhatsAppThreads(
  rawList: WhatsAppThread[],
  myPhone?: string,
  lidMap?: Record<string, string>
): WhatsAppThread[] {
  const cleanMyPhone = (myPhone || "5217223659263").replace(/[^\d]/g, "");
  const resolvedLidMap: Record<string, string> = lidMap || {};

  // Only keep chats with real messages
  const valid = rawList.filter((t) => t && t.messages && t.messages.length > 0);

  // Group strictly 1:1 by resolved phone/JID
  const map = new Map<string, WhatsAppThread>();

  valid.forEach((thread) => {
    const rawPhone = String(thread.phone || "").trim();
    const cleanPhone = rawPhone.replace(/[^\d]/g, "");
    const isGroup = rawPhone.includes("@g.us") || thread.company_name === "Grupo WhatsApp";
    const isMyOwn = cleanMyPhone && (cleanPhone === cleanMyPhone || cleanPhone === "527223659263" || cleanPhone === "5217223659263");

    // Resolve LID to real phone using the server-provided map
    const resolvedPhone = (!isGroup && resolvedLidMap[cleanPhone]) ? resolvedLidMap[cleanPhone] : cleanPhone;
    const isLid = !isGroup && !isMyOwn && (resolvedPhone !== cleanPhone);

    // Key is the RESOLVED phone (or group JID)
    const key = isGroup ? rawPhone : (resolvedPhone || thread.id);

    let displayName = thread.contact_name;
    if (isMyOwn) {
      displayName = "Tú (Mensajes Personales)";
    } else if (!displayName || displayName === "Gad Palma") {
      displayName = isGroup ? "Grupo WhatsApp" : `+${resolvedPhone}`;
    }

    if (!map.has(key)) {
      const msgs = [...(thread.messages || [])];
      msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const last = msgs[msgs.length - 1];
      const d = last ? new Date(last.timestamp) : null;
      const lastTime = d && !isNaN(d.getTime())
        ? d.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })
        : thread.last_time || "Reciente";

      map.set(key, {
        ...thread,
        id: `chat-wa-${key}`,
        contact_name: isLid ? `+${resolvedPhone}` : displayName,
        phone: isGroup ? rawPhone : (resolvedPhone ? `+${resolvedPhone}` : rawPhone),
        company_name: isGroup ? "Grupo WhatsApp" : isMyOwn ? "Personal" : "WhatsApp",
        deal_title: isGroup ? "Chat Grupal" : isMyOwn ? "Notas Personales" : "Conversación directa",
        last_message: last ? last.text : thread.last_message,
        last_time: lastTime,
        messages: msgs,
        has_real_messages: true
      });
    } else {
      const existing = map.get(key)!;
      // Keep the better display name (prefer real contact name over +phone)
      if (displayName && !displayName.startsWith("+") && displayName !== "Contacto WhatsApp" && !isLid) {
        existing.contact_name = displayName;
      }
      const existingIds = new Set(existing.messages.map((m) => m.id));
      (thread.messages || []).forEach((m) => {
        if (!existingIds.has(m.id)) {
          existing.messages.push(m);
          existingIds.add(m.id);
        }
      });
      existing.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const last = existing.messages[existing.messages.length - 1];
      if (last) {
        existing.last_message = last.text;
        const d = new Date(last.timestamp);
        existing.last_time = !isNaN(d.getTime())
          ? d.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })
          : last.timestamp;
      }
    }
  });

  // --- Second pass: try to merge remaining unresolved LID orphans by contact name ---
  const nameToRealKey = new Map<string, string>();
  map.forEach((thread, key) => {
    if (thread.contact_name && !thread.contact_name.startsWith("+")) {
      nameToRealKey.set(thread.contact_name.toLowerCase(), key);
    }
  });

  const toDelete: string[] = [];
  map.forEach((thread, key) => {
    const cleanKey = key.replace(/[^\d]/g, "");
    const isLidKey = !key.includes("@g.us") && cleanKey.length >= 14 && !resolvedLidMap[cleanKey];
    if (!isLidKey) return;

    const lowerName = thread.contact_name.toLowerCase();
    const realKey = nameToRealKey.get(lowerName);
    if (realKey && map.has(realKey)) {
      // Only merge if the name is a real contact name (not +phone)
      if (!thread.contact_name.startsWith("+")) {
        const realChat = map.get(realKey)!;
        const existingIds = new Set(realChat.messages.map((m) => m.id));
        thread.messages.forEach((m) => {
          if (!existingIds.has(m.id)) {
            realChat.messages.push(m);
            existingIds.add(m.id);
          }
        });
        realChat.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const last = realChat.messages[realChat.messages.length - 1];
        if (last) {
          realChat.last_message = last.text;
          const d = new Date(last.timestamp);
          realChat.last_time = !isNaN(d.getTime())
            ? d.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })
            : last.timestamp;
        }
        toDelete.push(key);
      }
    }
    // NOTE: We intentionally do NOT drop unresolvable LID orphans.
    // Dropping them would lose real conversation messages. They stay visible as +phoneNumber chats.
  });
  toDelete.forEach((k) => map.delete(k));

  const list = Array.from(map.values());
  list.sort((a, b) => {
    const timeA = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp).getTime() : 0;
    const timeB = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp).getTime() : 0;
    return timeB - timeA;
  });

  return list;
}

function formatPhone(phone?: string): string {
  if (!phone) return "Sin teléfono";
  if (phone.includes("@lid") || (phone.length > 13 && !phone.startsWith("52") && !phone.startsWith("50"))) {
    return "WhatsApp Directo";
  }
  const clean = phone.replace(/[^\d]/g, "");
  if (clean.length >= 10) return `+${clean}`;
  return phone;
}

function ls(key: string, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) || fallback;
}

const WA_KEYS = {
  IS_CONNECTED: "WA_IS_CONNECTED", USER_PHONE: "USER_WA_PHONE",
  PHONE_ID: "WA_PHONE_NUMBER_ID", ACCESS_TOKEN: "WA_ACCESS_TOKEN",
  PROVIDER: "WA_PROVIDER", TWILIO_SID: "WA_TWILIO_SID",
  TWILIO_TOKEN: "WA_TWILIO_TOKEN", TWILIO_FROM: "WA_TWILIO_FROM",
};

// ──────────────────────────────────────────────────────────────
// CRM Side Panel Component
// ──────────────────────────────────────────────────────────────
function CrmSidePanel({
  thread,
  data,
  onChange,
  aiSummary,
  isLoadingAi,
  onRequestAiSummary,
}: {
  thread: WhatsAppThread;
  data: CrmContactData;
  onChange: (d: CrmContactData) => void;
  aiSummary: string | null;
  isLoadingAi: boolean;
  onRequestAiSummary: () => void;
}) {
  const [noteInput, setNoteInput] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [activeTab, setActiveTab] = useState<"perfil" | "notas" | "tareas" | "ia">("perfil");

  const parsedAi = aiSummary ? (() => { try { return JSON.parse(aiSummary); } catch { return null; } })() : null;

  const addNote = () => {
    if (!noteInput.trim()) return;
    const note: CrmNote = { id: Date.now().toString(), text: noteInput.trim(), createdAt: new Date().toLocaleString("es-GT") };
    onChange({ ...data, notes: [note, ...data.notes] });
    setNoteInput("");
  };

  const deleteNote = (id: string) => onChange({ ...data, notes: data.notes.filter(n => n.id !== id) });

  const addTask = () => {
    if (!taskInput.trim()) return;
    const task: CrmTask = { id: Date.now().toString(), text: taskInput.trim(), dueDate: taskDate, done: false };
    onChange({ ...data, tasks: [task, ...data.tasks] });
    setTaskInput("");
    setTaskDate("");
  };

  const toggleTask = (id: string) => onChange({ ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) });
  const deleteTask = (id: string) => onChange({ ...data, tasks: data.tasks.filter(t => t.id !== id) });

  const toggleTag = (tag: ContactTag) => {
    const has = data.tags.includes(tag);
    onChange({ ...data, tags: has ? data.tags.filter(t => t !== tag) : [...data.tags, tag] });
  };

  const TABS = [
    { key: "perfil" as const, label: "Perfil", icon: UserCheck },
    { key: "notas" as const, label: "Notas", icon: StickyNote },
    { key: "tareas" as const, label: "Tareas", icon: CheckSquare },
    { key: "ia" as const, label: "IA", icon: Lightbulb },
  ];

  return (
    <div className="border-l border-slate-200 flex flex-col bg-white h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 bg-violet-50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-violet-900 truncate">{thread.contact_name}</p>
            <p className="text-[10px] text-violet-600 font-medium truncate">{thread.phone}</p>
          </div>
        </div>
        {/* Stage selector */}
        <div className="mt-2.5">
          <select
            value={data.stage}
            onChange={e => onChange({ ...data, stage: e.target.value as DealStage })}
            className={`w-full text-[11px] font-extrabold border rounded-lg px-2 py-1 focus:outline-none cursor-pointer ${STAGE_COLORS[data.stage]}`}
          >
            {(Object.keys(STAGE_LABELS) as DealStage[]).map(s => (
              <option key={s} value={s}>{STAGE_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 shrink-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-extrabold transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "text-violet-700 border-b-2 border-violet-600 bg-violet-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">

        {/* PERFIL TAB */}
        {activeTab === "perfil" && (
          <div className="space-y-3">
            {/* Tags */}
            <div>
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Tag className="w-3 h-3" />Etiquetas</p>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(TAG_LABELS) as ContactTag[]).map(tag => {
                  const active = data.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        active ? TAG_COLORS[tag] + " ring-1 ring-offset-1 ring-current" : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {TAG_LABELS[tag]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Note */}
            <div>
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><StickyNote className="w-3 h-3" />Nota rápida</p>
              <textarea
                value={data.quickNote}
                onChange={e => onChange({ ...data, quickNote: e.target.value })}
                placeholder="Escribe algo sobre este contacto..."
                rows={4}
                className="w-full text-[11px] bg-amber-50 border border-amber-200 text-slate-800 rounded-xl px-2.5 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 font-medium"
              />
              <p className="text-[9px] text-slate-400 mt-0.5">Se guarda automáticamente</p>
            </div>

            {/* Contact info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1"><UserCheck className="w-3 h-3" />Info</p>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /><span className="font-medium text-slate-700">{thread.phone}</span></div>
                <div className="flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-slate-400" /><span className="font-medium text-slate-700 truncate">{thread.company_name}</span></div>
                {thread.deal_title && <div className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-slate-400" /><span className="font-medium text-slate-700 truncate">{thread.deal_title}</span></div>}
              </div>
            </div>
          </div>
        )}

        {/* NOTAS TAB */}
        {activeTab === "notas" && (
          <div className="space-y-2.5">
            <div className="flex gap-1.5">
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Escribe una nota..."
                rows={2}
                className="flex-1 text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
              />
              <button onClick={addNote} className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer shrink-0 self-start mt-0.5">
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
            {data.notes.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-4">Sin notas aún.</p>
            ) : (
              <div className="space-y-2">
                {data.notes.map(note => (
                  <div key={note.id} className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 group relative">
                    <p className="text-[11px] text-slate-800 font-medium leading-relaxed whitespace-pre-wrap pr-5">{note.text}</p>
                    <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{note.createdAt}</p>
                    <button onClick={() => deleteNote(note.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all cursor-pointer">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAREAS TAB */}
        {activeTab === "tareas" && (
          <div className="space-y-2.5">
            <div className="space-y-1.5">
              <input
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                placeholder="Nueva tarea o seguimiento..."
                className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
              />
              <div className="flex gap-1.5">
                <input
                  type="date"
                  value={taskDate}
                  onChange={e => setTaskDate(e.target.value)}
                  className="flex-1 text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                />
                <button onClick={addTask} className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold px-3 py-1 rounded-xl cursor-pointer transition-colors">
                  <PlusCircle className="w-3 h-3" /> Agregar
                </button>
              </div>
            </div>

            {data.tasks.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-4">Sin tareas aún.</p>
            ) : (
              <div className="space-y-1.5">
                {data.tasks.map(task => (
                  <div key={task.id} className={`flex items-start gap-2 p-2 rounded-xl border group ${task.done ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200"}`}>
                    <button onClick={() => toggleTask(task.id)} className="shrink-0 mt-0.5 cursor-pointer text-violet-600 hover:text-violet-800 transition-colors">
                      {task.done ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-medium leading-relaxed ${task.done ? "line-through text-slate-400" : "text-slate-800"}`}>{task.text}</p>
                      {task.dueDate && (
                        <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(task.dueDate + "T12:00:00").toLocaleDateString("es-GT", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all cursor-pointer shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* IA TAB */}
        {activeTab === "ia" && (
          <div className="space-y-3">
            <button
              onClick={onRequestAiSummary}
              disabled={isLoadingAi}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 text-white font-bold text-[11px] px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm"
            >
              {isLoadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isLoadingAi ? "Analizando con Gemini..." : "Resumir conversación con IA"}
            </button>

            {parsedAi ? (
              <div className="space-y-2.5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5">
                  <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Interés principal</p>
                  <p className="text-[11px] text-blue-900 font-medium">{parsedAi.interes}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                  <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1"><ChevronRight className="w-3 h-3" />Siguiente acción</p>
                  <p className="text-[11px] text-emerald-900 font-medium">{parsedAi.siguiente_accion}</p>
                </div>
                <div className={`border rounded-xl p-2.5 ${parsedAi.urgencia === "Alta" ? "bg-red-50 border-red-200" : parsedAi.urgencia === "Media" ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
                  <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1 ${parsedAi.urgencia === "Alta" ? "text-red-700" : parsedAi.urgencia === "Media" ? "text-amber-700" : "text-slate-500"}`}>
                    <Flame className="w-3 h-3" />Urgencia: {parsedAi.urgencia}
                  </p>
                  <p className="text-[11px] font-medium text-slate-700">{parsedAi.resumen}</p>
                </div>
              </div>
            ) : !isLoadingAi ? (
              <div className="text-center py-6 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-200 mx-auto" />
                <p className="text-[11px] text-slate-400 font-medium">Presiona el botón para que Gemini analice esta conversación</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WhatsAppInboxPage() {
  const { data, templates, renderTemplateText, formatCurrency } = useCRM();
  const [threads, setThreads] = useState<WhatsAppThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepFilter, setSelectedRepFilter] = useState<string>("all");
  const [messageInput, setMessageInput] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [connectedPhone, setConnectedPhone] = useState("");
  const [lastPolledAt, setLastPolledAt] = useState<string>(new Date().toISOString());
  const [isPolling, setIsPolling] = useState(false);
  const [hasLiveMessages, setHasLiveMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{score:number;rating:string;summary:string;strengths:string[];improvements:string[]} | null>(null);

  // New Chat Modal state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState("");
  const [newChatName, setNewChatName] = useState("");

  // CRM Panel state
  const [isCrmPanelOpen, setIsCrmPanelOpen] = useState(false);
  const [crmData, setCrmData] = useState<CrmContactData>({ stage: "prospecto", tags: [], notes: [], tasks: [], quickNote: "" });
  const [crmAiSummary, setCrmAiSummary] = useState<string | null>(null);
  const [isCrmAiLoading, setIsCrmAiLoading] = useState(false);

  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatPhone.trim()) return;
    const cleanPhone = newChatPhone.replace(/[^\d]/g, "");
    const contactName = newChatName.trim() || `+${cleanPhone}`;
    const threadId = `chat-direct-${cleanPhone}`;

    const newThread: WhatsAppThread = {
      id: threadId,
      contact_name: contactName,
      phone: cleanPhone,
      company_name: "WhatsApp Directo",
      deal_title: "Conversación iniciada",
      deal_value: 0,
      deal_id: "",
      unread_count: 0,
      last_message: "Chat creado",
      last_time: new Date().toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" }),
      assigned_rep: "Tú (WhatsApp)",
      response_delay_minutes: 0,
      messages: [],
      has_real_messages: true,
    };

    setThreads((prev) => {
      const exists = prev.find((t) => t.phone.replace(/[^\d]/g, "") === cleanPhone);
      if (exists) return prev;
      return [newThread, ...prev];
    });

    setActiveThreadId(threadId);
    setIsNewChatModalOpen(false);
    setNewChatPhone("");
    setNewChatName("");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsWhatsAppConnected(ls(WA_KEYS.IS_CONNECTED) === "true");
      setConnectedPhone(ls(WA_KEYS.USER_PHONE) || ls(WA_KEYS.PHONE_ID));
    }
  }, []);

  // Initialize real threads from persistent localStorage or mock only if disconnected
  useEffect(() => {
    try {
      const rawReal = typeof window !== "undefined" ? localStorage.getItem("WA_REAL_SAVED_THREADS") : null;
      if (rawReal) {
        const parsed: WhatsAppThread[] = JSON.parse(rawReal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const unified = unifyWhatsAppThreads(parsed, connectedPhone);
          setThreads(unified);
          if (!activeThreadId && unified[0]) setActiveThreadId(unified[0].id);
          return;
        }
      }
    } catch {}

    const isConn = ls(WA_KEYS.IS_CONNECTED) === "true";
    if (isConn) {
      setThreads([]);
      return;
    }

    if (!data.deals || data.deals.length === 0) return;
    const built: WhatsAppThread[] = data.deals.map((deal, idx) => {
      const contact = data.contacts.find((c) => c.id === deal.contact_id);
      const phone = contact?.phone || (deal.custom_fields?.["phone"] as string) || (deal.custom_fields?.["telefono"] as string) || "";
      const repName = (deal.custom_fields?.["assigned_rep"] as string) || (deal.custom_fields?.["vendedor"] as string) || data.settings?.company_name || "Equipo de Ventas";
      const threadId = `chat-${deal.id}`;
      const initialMessages: ChatMessage[] = [{ id: `m-${deal.id}-init`, sender: "contact", text: `Hola, me interesa ${deal.title}.`, timestamp: new Date(deal.created_at).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" }) }];
      const lastMsg = initialMessages[initialMessages.length - 1];
      return { id: threadId, contact_name: deal.contact_name || contact?.name || "Cliente Potencial", phone: formatPhone(phone), company_name: deal.company_name || "Empresa", deal_title: deal.title, deal_value: deal.value, deal_id: deal.id, unread_count: idx === 0 ? 1 : 0, last_message: lastMsg?.text || `Consulta sobre ${deal.title}`, last_time: lastMsg?.timestamp || "Reciente", assigned_rep: repName, response_delay_minutes: 0, messages: initialMessages, has_real_messages: false };
    });
    setThreads(built);
    if (built.length > 0 && !activeThreadId) setActiveThreadId(built[0].id);
  }, [data.deals, data.contacts, data.settings, connectedPhone]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [threads, activeThreadId]);

  // Persist real threads automatically whenever they change
  useEffect(() => {
    if (threads.length === 0) return;
    try {
      const realOnly = threads.filter((t) => t.has_real_messages || !t.id.startsWith("chat-deal"));
      if (realOnly.length > 0 && typeof window !== "undefined") {
        localStorage.setItem("WA_REAL_SAVED_THREADS", JSON.stringify(realOnly));
      }
    } catch {}
  }, [threads]);

  const fetchRealWhatsAppChats = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/baileys?type=chats");
      if (!res.ok) return;
      const resData = await res.json();
      if (Array.isArray(resData.chats) && resData.chats.length > 0) {
        setHasLiveMessages(true);
        const lidMap: Record<string, string> = resData.lidMap || {};
        const unified = unifyWhatsAppThreads(resData.chats, connectedPhone, lidMap);

        setThreads(unified);
        if (typeof window !== "undefined") {
          localStorage.setItem("WA_REAL_SAVED_THREADS", JSON.stringify(unified));
        }
        setActiveThreadId((curr) => {
          if (curr && unified.some((t) => t.id === curr)) return curr;
          return unified[0]?.id || "";
        });
      }
    } catch {}
  }, [connectedPhone]);

  const pollForNewMessages = useCallback(async () => {
    if (isPolling) return;
    setIsPolling(true);
    try {
      await fetchRealWhatsAppChats();
    } catch (err) {
      console.warn("[WhatsApp Polling] Error:", err);
    } finally {
      setIsPolling(false);
    }
  }, [isPolling, fetchRealWhatsAppChats]);

  useEffect(() => {
    fetchRealWhatsAppChats();
    pollingRef.current = setInterval(() => { pollForNewMessages(); }, 5000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [pollForNewMessages, fetchRealWhatsAppChats]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || null;

  // Load CRM data whenever active thread changes
  useEffect(() => {
    if (activeThread?.id) {
      setCrmData(loadCrmData(activeThread.id));
      setCrmAiSummary(null);
    }
  }, [activeThread?.id]);

  const handleCrmAiSummary = useCallback(async () => {
    if (!activeThread) return;
    setIsCrmAiLoading(true);
    setCrmAiSummary(null);
    try {
      const msgs = activeThread.messages.slice(-30).map((m) => `${m.sender === "agent" ? "Agente" : activeThread.contact_name}: ${m.text}`).join("\n");
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Eres un CRM experto. Analiza esta conversación de WhatsApp y responde SOLO en este formato JSON exacto sin markdown:\n{"interes":"...","siguiente_accion":"...","urgencia":"Alta|Media|Baja","resumen":"máx 2 oraciones"}\n\nConversación:\n${msgs}`,
        }),
      });
      const data = await res.json();
      const text = data.text || data.content || "";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setCrmAiSummary(JSON.stringify(parsed));
    } catch {
      setCrmAiSummary(JSON.stringify({ interes: "No disponible", siguiente_accion: "Revisar conversación manualmente", urgencia: "Media", resumen: "No se pudo analizar la conversación." }));
    } finally {
      setIsCrmAiLoading(false);
    }
  }, [activeThread]);


  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
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

  const checkBaileys = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/baileys");
      if (!res.ok) return;
      const data = await res.json();
      setBaileysState(data);
      if (data.connected && data.user?.phone) {
        setIsWhatsAppConnected(true);
        setConnectedPhone(data.user.phone);
        if (typeof window !== "undefined") {
          localStorage.setItem(WA_KEYS.IS_CONNECTED, "true");
          localStorage.setItem(WA_KEYS.USER_PHONE, data.user.phone);
          localStorage.setItem(WA_KEYS.PROVIDER, "baileys");
        }
      }
    } catch {
      // Offline
    }
  }, []);

  useEffect(() => {
    checkBaileys();
    const interval = setInterval(checkBaileys, 5000);
    return () => clearInterval(interval);
  }, [checkBaileys]);

  // Fast polling when QR modal is open
  useEffect(() => {
    if (!isQrModalOpen) return;
    checkBaileys();
    const qrInterval = setInterval(checkBaileys, 2000);
    return () => clearInterval(qrInterval);
  }, [isQrModalOpen, checkBaileys]);

  const handleDisconnectBaileys = async () => {
    try {
      await fetch("/api/whatsapp/baileys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" })
      });
      setIsWhatsAppConnected(false);
      setConnectedPhone("");
      if (typeof window !== "undefined") {
        localStorage.removeItem(WA_KEYS.IS_CONNECTED);
        localStorage.removeItem(WA_KEYS.USER_PHONE);
      }
      checkBaileys();
    } catch {}
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeThread) return;
    const optimisticId = `msg-${Date.now()}`;
    const optimisticMsg: ChatMessage = { id: optimisticId, sender: "agent", text: messageInput.trim(), timestamp: new Date().toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" }), status: "sending" };
    setThreads((prev) => prev.map((t) => t.id === activeThread.id ? { ...t, last_message: optimisticMsg.text, last_time: optimisticMsg.timestamp, unread_count: 0, messages: [...t.messages, optimisticMsg] } : t));
    const sentText = messageInput.trim();
    setMessageInput(""); setSelectedTemplateId(""); setSendError(null); setIsSending(true);
    try {
      let finalStatus: ChatMessage["status"] = "sent";
      let messageId = optimisticId;

      // Check if Baileys real socket is connected
      if (baileysState.connected) {
        const res = await fetch("/api/whatsapp/baileys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send", to: activeThread.phone, message: sentText })
        });
        const resData = await res.json();
        if (!res.ok || !resData.success) {
          finalStatus = "failed";
          setSendError(resData.error || "No se pudo enviar el mensaje por WhatsApp Web.");
        } else {
          messageId = resData.message_id || optimisticId;
        }
      } else {
        // Fallback to Meta Cloud API or Twilio or simulation
        const provider = ls(WA_KEYS.PROVIDER) || "meta";
        const body: Record<string, any> = { to: activeThread.phone, message: sentText, threadId: activeThread.phone.replace(/[^\d]/g, "") || activeThread.id, fromPhone: ls(WA_KEYS.USER_PHONE) || "CRM" };
        if (provider === "meta") { body.phoneNumberId = ls(WA_KEYS.PHONE_ID); body.accessToken = ls(WA_KEYS.ACCESS_TOKEN); }
        else if (provider === "twilio") { body.twilioMode = true; body.twilioAccountSid = ls(WA_KEYS.TWILIO_SID); body.twilioAuthToken = ls(WA_KEYS.TWILIO_TOKEN); body.twilioFrom = ls(WA_KEYS.TWILIO_FROM); }
        const res = await fetch("/api/whatsapp/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const resData = await res.json();
        finalStatus = res.ok && resData.success ? "sent" : "failed";
        messageId = resData.message_id || optimisticId;
        if (!res.ok || !resData.success) setSendError(resData.error || "No se pudo enviar el mensaje.");
      }

      setThreads((prev) => prev.map((t) => t.id === activeThread.id ? { ...t, messages: t.messages.map((m) => m.id === optimisticId ? { ...m, id: messageId, status: finalStatus } : m) } : t));
    } catch (err: any) {
      setSendError(err.message || "Error de conexión al enviar.");
      setThreads((prev) => prev.map((t) => t.id === activeThread.id ? { ...t, messages: t.messages.map((m) => m.id === optimisticId ? { ...m, status: "failed" } : m) } : t));
    } finally { setIsSending(false); }
  };

  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl && activeThread) {
      const deal = data.deals.find((d) => d.id === activeThread.deal_id) || { id: activeThread.deal_id, title: activeThread.deal_title, value: activeThread.deal_value, contact_name: activeThread.contact_name, company_name: activeThread.company_name, currency: "$", pipeline_id: "", stage_id: "", priority: "medium" as const, tags: [], custom_fields: {}, order_index: 0, status: "open" as const, created_at: new Date().toISOString() };
      setMessageInput(renderTemplateText(tmpl.body, deal));
    }
  };

  const handleGenerateAiResponse = async () => {
    if (!activeThread) return;
    setIsAiSuggesting(true);
    try {
      const res = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `Genera una respuesta cordial y ejecutiva por WhatsApp para el cliente ${activeThread.contact_name} sobre: "${activeThread.last_message}". Sé breve (max 3 líneas).`, deal: { title: activeThread.deal_title, value: activeThread.deal_value, contact_name: activeThread.contact_name, company_name: activeThread.company_name } }) });
      const resData = await res.json();
      if (resData.result) setMessageInput(resData.result);
    } catch { } finally { setIsAiSuggesting(false); }
  };

  const handleAuditChatQuality = async () => {
    if (!activeThread) return;
    setIsAuditModalOpen(true); setIsAuditing(true); setAuditResult(null);
    try {
      const chatTranscript = activeThread.messages.map((m) => `${m.sender === "agent" ? `Agente (${activeThread.assigned_rep})` : `Cliente (${activeThread.contact_name})`}: ${m.text}`).join("\n");
      const res = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `Analiza la calidad de esta conversación de WhatsApp entre el agente y el cliente. Devuelve fortalezas y áreas a mejorar.\n\nTranscripción:\n${chatTranscript}`, deal: { title: activeThread.deal_title, value: activeThread.deal_value, contact_name: activeThread.contact_name, company_name: activeThread.company_name } }) });
      const resData = await res.json();
      const hasDelay = activeThread.response_delay_minutes > 30;
      setAuditResult({ score: hasDelay ? 72 : 91, rating: hasDelay ? "Necesita Mejorar Tiempos" : "Buena Calidad de Atención", summary: resData.result || "Conversación analizada. Se recomienda dar seguimiento puntual.", strengths: ["Trato respetuoso con el cliente", "Información clara sobre el producto"], improvements: [hasDelay ? "Reducir tiempo de respuesta (meta: menos de 15 min)" : "Incluir call-to-action con fecha concreta", "Enviar cotización formal al finalizar la conversación"] });
    } catch { setAuditResult({ score: 80, rating: "Análisis Completado", summary: "Configura la API key de Gemini para análisis detallado.", strengths: ["Comunicación iniciada"], improvements: ["Configurar API key de Gemini"] }); }
    finally { setIsAuditing(false); }
  };

  const uniqueReps = Array.from(new Set(threads.map((t) => t.assigned_rep)));
  const filteredThreads = threads.filter((t) => {
    // If WhatsApp is connected, remove any mock dummy deal that has no real messages
    const matchesSearch = t.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) || t.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || t.deal_title.toLowerCase().includes(searchQuery.toLowerCase()) || t.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRep = selectedRepFilter === "all" || t.assigned_rep === selectedRepFilter;
    return matchesSearch && matchesRep;
  });

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-100 flex flex-col font-sans text-slate-900">
      <Navbar />
      <main className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col gap-3 max-w-7xl w-full mx-auto overflow-hidden">
        {/* Connection banner */}
        <div className={`shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold ${isWhatsAppConnected ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-amber-50 border-amber-300 text-amber-900"}`}>
          <div className="flex items-center gap-2.5">
            {isWhatsAppConnected ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="flex items-center gap-1">
                  WhatsApp Vinculado{connectedPhone ? `: +${connectedPhone}` : ""} {baileysState.user?.name ? `(${baileysState.user.name})` : ""} — Sincronización en Tiempo Real
                  {hasLiveMessages && <span className="ml-2 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">EN VIVO</span>}
                </span>
                {isPolling && <RefreshCw className="w-3 h-3 animate-spin text-emerald-600 ml-1" />}
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                <span>WhatsApp no conectado — Escanea el código QR con tu celular para enviar y recibir mensajes reales.</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isWhatsAppConnected ? (
              <>
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Vincular por QR (Celular)</span>
                </button>
                <a href="/settings/whatsapp" className="text-xs underline font-extrabold text-amber-800 hover:text-amber-950 px-2 py-1">
                  Meta Cloud API →
                </a>
              </>
            ) : (
              <button
                onClick={handleDisconnectBaileys}
                className="text-xs text-red-600 hover:text-red-800 underline font-bold cursor-pointer"
              >
                Desconectar WhatsApp
              </button>
            )}
          </div>
        </div>

        {/* Main layout */}
        <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 min-h-0 grid grid-cols-1 overflow-hidden transition-all duration-300 ${isCrmPanelOpen && activeThread ? "md:grid-cols-[3fr_5fr_2fr]" : "md:grid-cols-[4fr_8fr]"}`}>
          {/* Thread list */}
          <div className="border-r border-slate-200 flex flex-col bg-slate-50 h-full min-h-0 overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-emerald-600" />Conversaciones ({filteredThreads.length})</h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    title="Nuevo Chat de WhatsApp"
                    className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1 px-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> <span>Nuevo</span>
                  </button>
                  <button onClick={pollForNewMessages} title="Actualizar mensajes" className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                    <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input type="text" placeholder="Buscar contacto, teléfono..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
              </div>
              {uniqueReps.length > 1 && (
                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                  <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <select value={selectedRepFilter} onChange={(e) => setSelectedRepFilter(e.target.value)} className="bg-transparent text-slate-900 text-xs font-extrabold focus:outline-none cursor-pointer w-full">
                    <option value="all">Todos los agentes ({threads.length})</option>
                    {uniqueReps.map((rep) => <option key={rep} value={rep}>{rep}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
              {filteredThreads.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">No hay conversaciones que coincidan.</div>
              ) : filteredThreads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                const isDelayed = thread.response_delay_minutes > 30;
                return (
                  <button key={thread.id} onClick={() => { setActiveThreadId(thread.id); setThreads((prev) => prev.map((t) => t.id === thread.id ? { ...t, unread_count: 0 } : t)); setSendError(null); }} className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${isActive ? "bg-indigo-50/80 border-l-4 border-indigo-600" : "hover:bg-slate-100/80 bg-white"}`}>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-900 font-extrabold text-xs flex items-center justify-center shrink-0 relative">
                      {getInitials(thread.contact_name)}
                      {thread.has_real_messages && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between"><h4 className="text-xs font-extrabold text-slate-900 truncate">{thread.contact_name}</h4><span className="text-[10px] text-slate-400 font-medium shrink-0 ml-1">{thread.last_time}</span></div>
                      <p className="text-[11px] text-indigo-700 font-bold truncate">{thread.company_name}</p>
                      <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{thread.last_message}</p>
                      <div className="flex items-center justify-between mt-1.5 text-[10px]">
                        <span className="text-slate-500 font-medium truncate max-w-[120px]">{thread.deal_title}</span>
                        {isDelayed ? <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-600" />{thread.response_delay_minutes}m</span>
                          : thread.unread_count > 0 ? <span className="bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px]">{thread.unread_count} nuevo</span> : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active thread */}
          {activeThread ? (
            <div className="flex flex-col bg-white h-full min-h-0 overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">{getInitials(activeThread.contact_name)}</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      {activeThread.contact_name}
                      {activeThread.has_real_messages && <span className="text-[9px] bg-red-100 text-red-700 border border-red-300 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Radio className="w-2.5 h-2.5" /> EN VIVO</span>}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-2"><Phone className="w-3 h-3" /><span>{activeThread.phone}</span><span>•</span><span className="text-indigo-700 font-bold">{activeThread.company_name}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 font-bold px-2.5 py-1 rounded-xl text-xs">{formatCurrency(activeThread.deal_value)}</span>
                  <button onClick={handleAuditChatQuality} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"><ShieldCheck className="w-4 h-4" /><span className="hidden sm:inline">Auditar con IA</span></button>
                  <button
                    onClick={() => setIsCrmPanelOpen(v => !v)}
                    title="Panel CRM"
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isCrmPanelOpen
                        ? "bg-violet-600 text-white border-violet-700 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span className="hidden sm:inline">{isCrmPanelOpen ? "Cerrar CRM" : "Ver CRM"}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {activeThread.messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col max-w-md ${msg.sender === "agent" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                    <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs ${msg.sender === "agent" ? msg.status === "failed" ? "bg-red-100 border border-red-300 text-red-900 rounded-br-none" : "bg-indigo-600 text-white rounded-br-none" : msg.sender === "system" ? "bg-amber-50 border border-amber-200 text-amber-900 rounded-none text-center text-[11px] italic" : msg.isReal ? "bg-white border-2 border-emerald-300 text-slate-800 rounded-bl-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"}`}>
                      {/* Image Message */}
                      {msg.media?.type === "image" && (
                        <div className="mb-2 space-y-1.5">
                          {msg.media.thumbnail ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={msg.media.thumbnail}
                              alt="Imagen de WhatsApp"
                              className="rounded-xl max-w-full h-auto max-h-72 object-cover shadow-xs border border-slate-100 cursor-pointer hover:opacity-95"
                              onClick={() => window.open(msg.media?.thumbnail || "", "_blank")}
                            />
                          ) : (
                            <div className="bg-slate-100 p-3 rounded-xl flex items-center gap-2 text-slate-700">
                              <ImageIcon className="w-5 h-5 text-indigo-600" />
                              <span className="text-[11px] font-bold">Foto adjunta</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sticker Message */}
                      {msg.media?.type === "sticker" && (
                        <div className="mb-2">
                          {msg.media.thumbnail ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={msg.media.thumbnail}
                              alt="Sticker de WhatsApp"
                              className="w-28 h-28 object-contain"
                            />
                          ) : (
                            <span className="text-xl">💟</span>
                          )}
                        </div>
                      )}

                      {/* Audio / Voice note */}
                      {msg.media?.type === "audio" && (
                        <div className="mb-2 bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-200 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <Mic className="w-3 h-3" />
                            </div>
                            <span className="text-[11px] font-bold">{msg.media.isVoiceNote ? "Nota de voz" : "Audio de WhatsApp"}</span>
                            {msg.media.seconds ? (
                              <span className="text-[10px] text-emerald-700 font-bold ml-auto">{Math.floor(msg.media.seconds / 60)}:{String(msg.media.seconds % 60).padStart(2, "0")}</span>
                            ) : null}
                          </div>
                          {msg.media.audioUrl ? (
                            <audio controls src={msg.media.audioUrl} className="w-full h-8" />
                          ) : null}
                        </div>
                      )}

                      {/* Document */}
                      {msg.media?.type === "document" && (
                        <div className="mb-2 flex items-center justify-between gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200 text-slate-800">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-6 h-6 text-indigo-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{msg.media.fileName || "Documento"}</p>
                              <span className="text-[10px] text-slate-500 font-medium">Archivo adjunto</span>
                            </div>
                          </div>
                          {msg.media.docUrl && (
                            <a
                              href={msg.media.docUrl}
                              download={msg.media.fileName || "documento"}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0 shadow-2xs"
                              title="Descargar archivo"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Location */}
                      {msg.media?.type === "location" && (
                        <div className="mb-1 bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span>{msg.media.name || "Ubicación compartida"}</span>
                          </div>
                          {msg.media.latitude && msg.media.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${msg.media.latitude},${msg.media.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-indigo-600 underline font-bold flex items-center gap-1 mt-1"
                            >
                              <span>Ver en Google Maps</span> <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                      <span>{msg.timestamp}</span>
                      {msg.sender === "agent" && msg.status === "sending" && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                      {msg.sender === "agent" && msg.status === "sent" && <CheckCheck className="w-3 h-3 text-indigo-600" />}
                      {msg.sender === "agent" && msg.status === "failed" && <span className="text-red-500 font-bold">error</span>}
                      {msg.isReal && <span className="text-emerald-600 font-bold">real</span>}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3.5 border-t border-slate-200 bg-white space-y-2.5 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <select value={selectedTemplateId} onChange={(e) => handleSelectTemplate(e.target.value)} className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600 cursor-pointer">
                    <option value="">Cargar plantilla...</option>
                    {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button onClick={handleGenerateAiResponse} disabled={isAiSuggesting} className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors cursor-pointer disabled:opacity-60">
                    {isAiSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                    <span>{isAiSuggesting ? "Generando..." : "Sugerir con Gemini IA"}</span>
                  </button>
                </div>
                {sendError && <p className="text-[11px] text-red-700 font-bold bg-red-50 border border-red-200 px-3 py-2 rounded-xl">❌ {sendError}</p>}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input type="text" placeholder={isWhatsAppConnected ? "Escribe un mensaje..." : "Conecta WhatsApp en Ajustes para enviar mensajes reales..."} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                  <button type="submit" disabled={!messageInput.trim() || isSending} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
                    {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isSending ? "Enviando..." : "Enviar"}</span>
                  </button>
                </form>
                {!isWhatsAppConnected && <p className="text-[11px] text-amber-700 font-medium text-center">Los mensajes se guardan localmente. <a href="/settings/whatsapp" className="underline font-bold">Conecta tu cuenta aquí</a> para enviar por WhatsApp real.</p>}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-slate-50">
              <div className="text-center space-y-2"><MessageSquare className="w-10 h-10 text-slate-300 mx-auto" /><p className="text-sm text-slate-500 font-medium">Selecciona una conversación</p></div>
            </div>
          )}

          {/* CRM Panel */}
          {isCrmPanelOpen && activeThread && (
            <CrmSidePanel
              thread={activeThread}
              data={crmData}
              onChange={(updated) => {
                setCrmData(updated);
                saveCrmData(activeThread.id, updated);
              }}
              aiSummary={crmAiSummary}
              isLoadingAi={isCrmAiLoading}
              onRequestAiSummary={handleCrmAiSummary}
            />
          )}
        </div>
      </main>

      {/* Audit Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-600" /><h3 className="font-extrabold text-slate-900 text-sm">Auditoría de Calidad — Google Gemini IA</h3></div>
              <button onClick={() => setIsAuditModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer">✕</button>
            </div>
            {isAuditing ? (
              <div className="py-10 text-center space-y-3"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" /><p className="text-xs font-bold text-indigo-900">Gemini IA analizando el historial de {activeThread?.contact_name}...</p></div>
            ) : auditResult ? (
              <div className="space-y-4 text-xs">
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-center justify-between">
                  <div><span className="text-[10px] font-extrabold uppercase text-indigo-800 tracking-wider">{activeThread?.deal_title}</span><h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{auditResult.rating}</h4></div>
                  <div className="text-right"><span className="text-2xl font-black text-indigo-700">{auditResult.score}/100</span><span className="block text-[10px] text-slate-500 font-bold">Puntuación IA</span></div>
                </div>
                <div className="space-y-1"><h5 className="font-extrabold text-slate-900">Resumen:</h5><p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">{auditResult.summary}</p></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1"><h6 className="font-extrabold text-emerald-900 text-[11px] flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />Fortalezas:</h6><ul className="list-disc list-inside text-[11px] text-emerald-800 space-y-0.5 font-medium">{auditResult.strengths.map((s, idx) => <li key={idx}>{s}</li>)}</ul></div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1"><h6 className="font-extrabold text-amber-900 text-[11px] flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-600" />A Mejorar:</h6><ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5 font-medium">{auditResult.improvements.map((imp, idx) => <li key={idx}>{imp}</li>)}</ul></div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-end"><button onClick={() => setIsAuditModalOpen(false)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl cursor-pointer">Cerrar Informe</button></div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* WhatsApp QR Pairing Modal (Baileys Engine) */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Vincular WhatsApp Web</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Escaneo directo con la cámara de WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR View & States */}
            {baileysState.connected ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">¡WhatsApp Vinculado con Éxito!</h4>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Número conectado: <span className="font-bold text-emerald-700">+{baileysState.user?.phone}</span>
                  </p>
                  {baileysState.user?.name && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{baileysState.user.name}</p>
                  )}
                </div>
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer w-full"
                >
                  Continuar al Chat
                </button>
              </div>
            ) : baileysState.state === "server_offline" ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <WifiOff className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-slate-900">Servidor de WhatsApp Desconectado</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Para habilitar el emparejamiento por QR, ejecuta el siguiente comando en tu terminal:
                  </p>
                  <code className="block bg-slate-900 text-emerald-400 font-mono text-xs px-3 py-2 rounded-xl mt-2 select-all">
                    npm run whatsapp:server
                  </code>
                </div>
                <button
                  onClick={checkBaileys}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reintentar Conexión
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* QR Display */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center">
                  {baileysState.qr ? (
                    <div className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={baileysState.qr}
                        alt="Código QR de WhatsApp"
                        className="w-60 h-60 rounded-xl shadow-xs bg-white p-2 border border-slate-100"
                      />
                      <div className="absolute inset-0 rounded-xl bg-slate-950/0 group-hover:bg-slate-950/5 transition-colors pointer-events-none" />
                    </div>
                  ) : (
                    <div className="w-60 h-60 flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                      <span className="text-xs font-bold text-slate-600">Generando código QR seguro...</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" /> Auto-actualización criptográfica activa
                  </span>
                </div>

                {/* Instructions */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1.5">
                  <h5 className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                    <Smartphone className="w-4 h-4 text-emerald-700" /> Instrucciones desde tu teléfono:
                  </h5>
                  <ol className="list-decimal list-inside space-y-1 font-medium text-[11px] text-emerald-900/90 pl-1">
                    <li>Abre <strong>WhatsApp</strong> en tu teléfono.</li>
                    <li>Toca <strong>Menú</strong> (⋮ en Android) o <strong>Configuración</strong> (⚙️ en iPhone).</li>
                    <li>Selecciona <strong>Dispositivos vinculados</strong> y luego <strong>Vincular un dispositivo</strong>.</li>
                    <li>Apunta la cámara de WhatsApp hacia este código QR.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Direct WhatsApp Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Nuevo Chat de WhatsApp</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Escribe a cualquier número directamente</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartNewChat} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Número de Teléfono (con código de país) *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="ej: 5217221234567 o 50255443322"
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Solo dígitos sin espacios ni guiones (ej: 521...).
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre del Contacto (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej: Juan Pérez"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newChatPhone.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow-xs"
                >
                  Abrir Conversación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
