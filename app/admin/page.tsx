'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Search,
  Activity,
  Layers,
  Lock,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { RoleGuard } from '@/components/RoleGuard';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { CRMCompanyTenant, SubscriptionPlanKey } from '@/types/enterprise';

export default function PlatformAdminPage() {
  const {
    tenants,
    activeTenant,
    switchTenant,
    addTenant,
    updateTenant,
    deleteTenant,
    toggleTenantStatus,
    formatCurrency
  } = useCRM();

  const { currentUser, isSuperAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<CRMCompanyTenant | null>(null);

  // New Tenant Form State
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [industry, setIndustry] = useState('Bienes Raíces & Desarrollo');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [plan, setPlan] = useState<SubscriptionPlanKey>('pro');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [maxUsers, setMaxUsers] = useState(10);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addTenant({
      name: name.trim(),
      tax_id: taxId.trim() || 'NIT 1000000-0',
      industry,
      currency_symbol: currencySymbol,
      currency_code: currencyCode,
      plan,
      plan_status: 'active',
      max_users: Number(maxUsers),
      max_deals: plan === 'enterprise' ? 5000 : plan === 'pro' ? 1500 : 500,
      features: ['pipeline_custom', 'whatsapp_meta', 'erp_fel', 'automation_engine'],
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      is_active: true
    });

    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleUpdateTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    updateTenant(editingTenant);
    setEditingTenant(null);
  };

  const resetForm = () => {
    setName('');
    setTaxId('');
    setIndustry('Bienes Raíces & Desarrollo');
    setCurrencySymbol('$');
    setCurrencyCode('USD');
    setPlan('pro');
    setEmail('');
    setPhone('');
    setAddress('');
    setMaxUsers(10);
  };

  // Filtered tenants
  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tax_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || t.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  // Calculate SaaS ARR & metrics
  const planPrices = { starter: 49, pro: 149, enterprise: 399 };
  const totalMRR = tenants.reduce((acc, t) => acc + (t.is_active ? (planPrices[t.plan] || 99) : 0), 0);
  const totalARR = totalMRR * 12;

  return (
    <RoleGuard
      roles={['super_admin']}
      fallback={
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900">
          <Navbar />
          <div className="max-w-xl mx-auto p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-700">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Panel Super-Admin Restringido</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Esta sección es exclusiva para el <strong>Super Administrador</strong> de la plataforma. Para gestionarla cambia tu rol a Super Admin en el menú de usuario.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
            >
              Volver al CRM
            </Link>
          </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900">
        <Navbar />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          {/* Top Banner Header */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> SaaS Platform Master
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  Multi-Tenant Activo
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                Panel de Administración de Empresas & Clientes SaaS
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Crea, gestiona y monitorea los ecosistemas de todas las empresas cliente alojadas en la plataforma.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nueva Empresa</span>
            </button>
          </div>

          {/* Platform Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Empresas Activas</span>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{tenants.filter(t => t.is_active).length}</div>
              <p className="text-[11px] text-slate-400 font-medium">De {tenants.length} registradas en total</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">MRR de Plataforma</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-600">${totalMRR.toLocaleString()} USD</div>
              <p className="text-[11px] text-slate-400 font-medium">ARR Proyectado: ${totalARR.toLocaleString()} USD</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Aislamiento de Datos</span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-purple-600">100% RLS</div>
              <p className="text-[11px] text-slate-400 font-medium">Row Level Security por Tenant ID</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Salud del Sistema</span>
                <Activity className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-2xl font-extrabold text-cyan-600">99.9%</div>
              <p className="text-[11px] text-slate-400 font-medium">APIs Meta, Twilio y Gemini Online</p>
            </div>
          </div>

          {/* Tenants Directory Table Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Filter Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por empresa, NIT, industria..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-500">Plan:</span>
                <select
                  value={filterPlan}
                  onChange={e => setFilterPlan(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="all">Todos los Planes</option>
                  <option value="starter">Starter ($49/m)</option>
                  <option value="pro">Pro ($149/m)</option>
                  <option value="enterprise">Enterprise ($399/m)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="p-3.5 pl-5">Empresa / Ecosistema</th>
                    <th className="p-3.5">Industria / Nicho</th>
                    <th className="p-3.5">Plan SaaS</th>
                    <th className="p-3.5">Cuota Usuarios</th>
                    <th className="p-3.5">Moneda</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 pr-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenants.map(tenant => {
                    const isCurrent = tenant.id === activeTenant?.id;
                    return (
                      <tr
                        key={tenant.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCurrent ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                              {tenant.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                <span>{tenant.name}</span>
                                {isCurrent && (
                                  <span className="bg-indigo-100 text-indigo-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-indigo-200">
                                    EN USO
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">{tenant.tax_id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-700 font-medium">
                          {tenant.industry}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              tenant.plan === 'enterprise'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : tenant.plan === 'pro'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {tenant.plan.toUpperCase()}
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-700 font-medium">
                          Hasta {tenant.max_users} usuarios ({tenant.max_deals} tratos)
                        </td>

                        <td className="p-3.5 font-mono font-bold text-slate-800">
                          {tenant.currency_symbol} ({tenant.currency_code})
                        </td>

                        <td className="p-3.5">
                          <button
                            onClick={() => toggleTenantStatus(tenant.id)}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                              tenant.is_active
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}
                          >
                            {tenant.is_active ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-red-600" />}
                            {tenant.is_active ? 'Activa' : 'Suspendida'}
                          </button>
                        </td>

                        <td className="p-3.5 pr-5 text-right space-x-1.5">
                          <button
                            onClick={() => switchTenant(tenant.id)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                            title="Ingresar a esta Empresa"
                          >
                            Ingresar
                          </button>

                          <button
                            onClick={() => setEditingTenant(tenant)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Editar Datos"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteTenant(tenant.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Eliminar Empresa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Modal: Crear Nueva Empresa */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Registrar Nueva Empresa Cliente (Tenant)</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTenant} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Constructora San Jerónimo S.A."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Identificación Fiscal (NIT/RFC) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ej: NIT 5938492-1"
                      value={taxId}
                      onChange={e => setTaxId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Industria / Sector</label>
                    <select
                      value={industry}
                      onChange={e => setIndustry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="Bienes Raíces & Desarrollo">Bienes Raíces & Inmobiliaria</option>
                      <option value="Software & Tecnología B2B">Software & Tecnología B2B</option>
                      <option value="Finanzas & Inversiones">Finanzas & Seguros</option>
                      <option value="Comercio & Retail">Comercio & Retail</option>
                      <option value="Servicios Profesionales">Consultoría & Servicios</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Plan SaaS</label>
                    <select
                      value={plan}
                      onChange={e => setPlan(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="starter">Starter (Hasta 3 usuarios)</option>
                      <option value="pro">Pro (Hasta 10 usuarios)</option>
                      <option value="enterprise">Enterprise (Ilimitado + IA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Moneda Principal</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currencySymbol}
                        onChange={e => setCurrencySymbol(e.target.value)}
                        placeholder="$"
                        className="w-16 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 text-center"
                      />
                      <input
                        type="text"
                        value={currencyCode}
                        onChange={e => setCurrencyCode(e.target.value)}
                        placeholder="USD"
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  >
                    Crear Empresa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar Empresa */}
        {editingTenant && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Editar Empresa: {editingTenant.name}</h3>
                </div>
                <button
                  onClick={() => setEditingTenant(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateTenantSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la Empresa</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.name}
                    onChange={e => setEditingTenant({ ...editingTenant, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">NIT / Identificación Fiscal</label>
                    <input
                      type="text"
                      required
                      value={editingTenant.tax_id}
                      onChange={e => setEditingTenant({ ...editingTenant, tax_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Plan SaaS</label>
                    <select
                      value={editingTenant.plan}
                      onChange={e => setEditingTenant({ ...editingTenant, plan: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingTenant(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
