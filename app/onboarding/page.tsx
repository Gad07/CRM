'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  MessageSquare,
  Rocket,
  Plus,
  Trash2,
  Check,
  Zap,
  DollarSign
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { INDUSTRY_PRESETS } from '@/lib/presets';

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const { addTenant, applyIndustryPreset } = useCRM();
  const { switchRole } = useAuth();

  const [step, setStep] = useState(1);

  // Step 1: Company Profile
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Industry & Pipeline
  const [selectedPresetId, setSelectedPresetId] = useState(INDUSTRY_PRESETS[0].id);

  // Step 3: Team Invitations
  const [teamMembers, setTeamMembers] = useState([
    { name: '', email: '', role: 'sales_rep' }
  ]);

  // Step 4: WhatsApp Preferences
  const [whatsAppMode, setWhatsAppMode] = useState<'meta' | 'direct'>('meta');

  const addTeamMember = () => {
    setTeamMembers(prev => [...prev, { name: '', email: '', role: 'sales_rep' }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    setTeamMembers(prev => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const handleFinishOnboarding = () => {
    if (!companyName.trim()) return;

    const preset = INDUSTRY_PRESETS.find(p => p.id === selectedPresetId);

    addTenant({
      name: companyName.trim(),
      tax_id: taxId.trim() || 'NIT 1000000-0',
      industry: preset?.name || 'General / Servicios',
      currency_symbol: currencySymbol,
      currency_code: currencyCode,
      plan: 'pro',
      plan_status: 'active',
      max_users: 10,
      max_deals: 1500,
      features: ['pipeline_custom', 'whatsapp_meta', 'erp_fel', 'automation_engine'],
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      is_active: true
    });

    applyIndustryPreset(selectedPresetId);
    switchRole('company_admin');

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white">Configuración del Ecosistema de Empresa</h1>
            <p className="text-xs text-slate-400 font-medium">Asistente de Onboarding Multi-Tenant</p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white font-bold transition-colors"
        >
          Omitir y volver al inicio
        </Link>
      </div>

      {/* Center Wizard Container */}
      <div className="max-w-3xl mx-auto w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 my-8 shadow-2xl space-y-6">
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          {[
            { num: 1, title: 'Empresa' },
            { num: 2, title: 'Embudo' },
            { num: 3, title: 'Equipo' },
            { num: 4, title: 'WhatsApp' },
            { num: 5, title: 'Lanzar' }
          ].map(s => (
            <div
              key={s.num}
              className={`flex items-center gap-2 text-xs font-bold ${
                step === s.num
                  ? 'text-indigo-400'
                  : step > s.num
                  ? 'text-emerald-400'
                  : 'text-slate-600'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  step === s.num
                    ? 'bg-indigo-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: Datos de la Empresa */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-black text-white">1. Identidad Corporativa de la Empresa</h2>
              <p className="text-xs text-slate-400 font-medium">Ingresa los datos generales para personalizar los documentos y cotizaciones.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Oficial de la Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Inmobiliaria & Desarrollo Metrópolis S.A."
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Identificación Fiscal (NIT / RFC) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: NIT 9847291-5"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Moneda del Sistema</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currencySymbol}
                      onChange={e => setCurrencySymbol(e.target.value)}
                      placeholder="$"
                      className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold text-center"
                    />
                    <input
                      type="text"
                      value={currencyCode}
                      onChange={e => setCurrencyCode(e.target.value)}
                      placeholder="USD"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Correo Electrónico de Contacto</label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Teléfono Principal</label>
                  <input
                    type="text"
                    placeholder="+502 2200 4400"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Selección de Industria */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-black text-white">2. Sector de la Empresa & Embudo Prediseñado</h2>
              <p className="text-xs text-slate-400 font-medium">Selecciona el modelo comercial para preconfigurar las etapas de venta óptimas.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INDUSTRY_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPresetId === preset.id
                      ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-white">{preset.name}</h4>
                      {selectedPresetId === preset.id && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">{preset.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 mt-2 flex flex-wrap gap-1">
                    {preset.stages.map((st, i) => (
                      <span key={i} className="text-[9px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                        {st.name}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Equipo de Ventas */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">3. Miembros del Equipo & Roles Iniciales</h2>
                <p className="text-xs text-slate-400 font-medium">Invita a tus vendedoras y gerentes para asignarles acceso inmediato.</p>
              </div>
              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={member.name}
                    onChange={e => updateTeamMember(idx, 'name', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="email"
                    placeholder="correo@empresa.com"
                    value={member.email}
                    onChange={e => updateTeamMember(idx, 'email', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <select
                    value={member.role}
                    onChange={e => updateTeamMember(idx, 'role', e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-bold"
                  >
                    <option value="sales_rep">Ejecutivo de Ventas</option>
                    <option value="sales_manager">Gerente de Ventas</option>
                    <option value="erp_accountant">Contador ERP</option>
                  </select>
                  {teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeamMember(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: WhatsApp */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-black text-white">4. Conexión de WhatsApp Oficial</h2>
              <p className="text-xs text-slate-400 font-medium">Elige cómo enviará mensajes este ecosistema de empresa.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setWhatsAppMode('meta')}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                  whatsAppMode === 'meta'
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Meta Cloud API Oficial
                  </span>
                  {whatsAppMode === 'meta' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Envío 100% automático desde el servidor con 1,000 conversaciones gratis al mes y recepción por webhook.
                </p>
              </div>

              <div
                onClick={() => setWhatsAppMode('direct')}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                  whatsAppMode === 'direct'
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-indigo-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" /> Enlace 1-Clic Directo
                  </span>
                  {whatsAppMode === 'direct' && <Check className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Abre WhatsApp Web o la App oficial con el mensaje pre-cargado al hacer clic. Sin necesidad de configurar APIs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Lanzamiento */}
        {step === 5 && (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-xl text-white">
              <Rocket className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-xl font-black text-white">¡Todo Listo para Lanzar el Ecosistema!</h2>
              <p className="text-xs text-slate-400 font-medium">
                La empresa <strong className="text-white">{companyName || 'Tu Empresa'}</strong> ha sido configurada con aislamiento total de datos y embudo activo.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Empresa:</span>
                <span className="text-white font-bold">{companyName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Identificación Fiscal:</span>
                <span className="text-white font-bold">{taxId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Moneda:</span>
                <span className="text-white font-bold">{currencySymbol} ({currencyCode})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tu Rol:</span>
                <span className="text-emerald-400 font-bold">Director de Empresa</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !companyName.trim()) {
                  alert('Por favor ingresa el nombre de la empresa para continuar.');
                  return;
                }
                setStep(step + 1);
              }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-xl transition-all cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>Lanzar CRM de Empresa</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom info */}
      <div className="max-w-4xl mx-auto w-full text-center text-[11px] text-slate-500">
        AdaptableCRM Multi-Tenant Architecture • Datos Aislados por Row Level Security (RLS)
      </div>
    </div>
  );
}
