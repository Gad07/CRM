'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Briefcase,
  LayoutDashboard,
  Kanban,
  Table,
  Users,
  ShoppingBag,
  CalendarCheck,
  BarChart3,
  Settings,
  Plus,
  Search,
  Command,
  ChevronDown,
  TrendingUp,
  Sliders,
  Building2,
  Check,
  MessageSquare,
  ShieldCheck,
  Lock,
  Sparkles,
  LogOut,
  UserCheck,
  Rocket,
  Layers
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useAuth, DEMO_USERS } from '@/context/AuthContext';
import { NotificationCenter } from './NotificationCenter';
import { CommandPalette } from './CommandPalette';
import { UserRoleKey } from '@/types/enterprise';
import { getRoleName } from '@/lib/permissions';

interface NavbarProps {
  onOpenNewDealModal?: () => void;
  onOpenPipelineEditorModal?: () => void;
  onOpenCommandPalette?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export function Navbar({
  onOpenNewDealModal,
  onOpenPipelineEditorModal,
  onOpenCommandPalette,
  searchQuery,
  setSearchQuery
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, tenants, activeTenant, switchTenant, addTenant } = useCRM();
  const { currentUser, switchRole, switchUser, logout, isSuperAdmin, hasPermission } = useAuth();
  const [internalCommandPaletteOpen, setInternalCommandPaletteOpen] = useState(false);

  // Dropdown states for thematic groups & multi-company selector & user profile
  const [activeDropdown, setActiveDropdown] = useState<'ventas' | 'gestion' | 'company' | 'user' | null>(null);
  const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyTaxId, setNewCompanyTaxId] = useState('');

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    addTenant({
      name: newCompanyName.trim(),
      tax_id: newCompanyTaxId.trim() || 'NIT 1000000-0',
      industry: 'General / Servicios',
      currency_symbol: '$',
      currency_code: 'USD',
      plan: 'pro',
      plan_status: 'active',
      max_users: 10,
      max_deals: 1500,
      features: ['pipeline_custom', 'erp_fel', 'whatsapp_meta'],
      is_active: true
    });

    setNewCompanyName('');
    setNewCompanyTaxId('');
    setIsNewCompanyOpen(false);
    setActiveDropdown(null);
  };

  const handleTriggerCommandPalette = () => {
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    } else {
      setInternalCommandPaletteOpen(true);
    }
  };

  const isVentasActive = pathname === '/' || pathname === '/pipeline' || pathname === '/pipeline/table';
  const isGestionActive = pathname === '/analytics' || pathname === '/settings';

  const canAccessAnalytics = hasPermission('view_analytics');
  const canAccessSettings = hasPermission('manage_company') || hasPermission('manage_team') || hasPermission('manage_automations');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs text-slate-900">
      <div className="max-w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Multi-Company Tenant Selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8.5 h-8.5 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Briefcase className="w-4.5 h-4.5 text-white" />
            </div>
          </Link>

          {/* Multi-Company Dropdown Switcher */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'company' ? null : 'company')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <div className="text-left leading-tight">
                <span className="block text-slate-900 font-extrabold text-xs max-w-[130px] sm:max-w-[160px] truncate">
                  {activeTenant?.name || data.settings.company_name}
                </span>
                <span className="block text-[9px] text-slate-500 font-semibold">{activeTenant?.tax_id || 'Multi-Empresa'}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'company' && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)} />
                <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-2 space-y-2 animate-fade-in text-slate-900">
                  <div className="px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Ecosistemas de Empresa
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-indigo-200">
                      {tenants.length} Activas
                    </span>
                  </div>

                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {tenants.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          switchTenant(t.id);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                          t.id === activeTenant?.id
                            ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="block truncate">{t.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{t.tax_id} • Plan {t.plan.toUpperCase()}</span>
                        </div>
                        {t.id === activeTenant?.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-100 space-y-1">
                    <Link
                      href="/onboarding"
                      onClick={() => setActiveDropdown(null)}
                      className="w-full flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    >
                      <Rocket className="w-4 h-4 text-emerald-600" />
                      <span>Wizard de Nueva Empresa</span>
                    </Link>

                    {isSuperAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setActiveDropdown(null)}
                        className="w-full flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Administrar Todas las Empresas</span>
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Main Thematic Navigation */}
        <nav className="flex items-center gap-1 py-1">
          {/* 1. Tema: Ventas */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'ventas' ? null : 'ventas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isVentasActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <TrendingUp className={`w-3.5 h-3.5 ${isVentasActive ? 'text-indigo-600' : 'text-slate-500'}`} />
              <span>Ventas</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'ventas' && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)} />
                <div className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-1.5 space-y-1 animate-fade-in text-slate-900">
                  <Link
                    href="/"
                    onClick={() => setActiveDropdown(null)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      pathname === '/' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                    <span>Panel Dashboard</span>
                  </Link>
                  <Link
                    href="/pipeline"
                    onClick={() => setActiveDropdown(null)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      pathname === '/pipeline' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Kanban className="w-4 h-4 text-indigo-600" />
                    <span>Tablero Kanban</span>
                  </Link>
                  <Link
                    href="/pipeline/table"
                    onClick={() => setActiveDropdown(null)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      pathname === '/pipeline/table' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Table className="w-4 h-4 text-indigo-600" />
                    <span>Vista en Tabla</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* 2. Directorio de Contactos */}
          <Link
            href="/contacts"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pathname === '/contacts'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${pathname === '/contacts' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <span>Contactos</span>
          </Link>

          {/* 3. Agenda & Tareas */}
          <Link
            href="/activities"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pathname === '/activities'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className={`w-3.5 h-3.5 ${pathname === '/activities' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <span>Agenda</span>
          </Link>

          {/* 4. Catálogo & ERP Stock */}
          <Link
            href="/products"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pathname === '/products'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className={`w-3.5 h-3.5 ${pathname === '/products' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <span>Catálogo</span>
          </Link>

          {/* 5. WhatsApp */}
          <Link
            href="/whatsapp"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pathname === '/whatsapp'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </Link>

          {/* 6. Gestión (Analítica & Configuración) */}
          {(canAccessAnalytics || canAccessSettings) && (
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'gestion' ? null : 'gestion')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isGestionActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Sliders className={`w-3.5 h-3.5 ${isGestionActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>Gestión</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {activeDropdown === 'gestion' && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-1.5 space-y-1 animate-fade-in text-slate-900">
                    {canAccessAnalytics && (
                      <Link
                        href="/analytics"
                        onClick={() => setActiveDropdown(null)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          pathname === '/analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4 text-indigo-600" />
                        <span>Analítica y Reportes</span>
                      </Link>
                    )}
                    {canAccessSettings && (
                      <Link
                        href="/settings"
                        onClick={() => setActiveDropdown(null)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          pathname === '/settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Settings className="w-4 h-4 text-indigo-600" />
                        <span>Configuración CRM</span>
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Super Admin Direct Badge Link */}
          {isSuperAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold border transition-all ${
                pathname === '/admin'
                  ? 'bg-indigo-900 text-white border-indigo-700'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
              title="Panel Global de Super Administrador"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden lg:inline">Admin Plataforma</span>
            </Link>
          )}
        </nav>

        {/* Right: Search, Notifications & Active User Profile Menu */}
        <div className="flex items-center gap-2.5 shrink-0">
          {setSearchQuery !== undefined ? (
            <div className="relative w-48 sm:w-64 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar en el CRM..."
                value={searchQuery || ''}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium shadow-2xs"
              />
            </div>
          ) : (
            <button
              onClick={handleTriggerCommandPalette}
              className="flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors w-44 sm:w-56 shadow-2xs cursor-pointer"
              title="Buscar en todo el CRM (Ctrl + K)"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Search className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Buscar...</span>
              </span>
              <span className="bg-white text-[9px] text-slate-700 font-mono font-bold px-1.5 py-0.2 rounded border border-slate-300 flex items-center gap-0.5 shrink-0">
                <Command className="w-2.5 h-2.5" />K
              </span>
            </button>
          )}

          <NotificationCenter />

          {onOpenNewDealModal && (
            <button
              onClick={onOpenNewDealModal}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Negocio</span>
            </button>
          )}

          {/* User Profile & RBAC Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Perfil & Simulador de Roles"
            >
              <div className="text-right hidden sm:block leading-tight">
                <span className="block text-xs font-extrabold text-slate-900 max-w-[120px] truncate">{currentUser.name}</span>
                <span className="block text-[9px] font-bold text-indigo-700">{getRoleName(currentUser.role).split('(')[0]}</span>
              </div>
              <div className={`w-8 h-8 rounded-xl ${currentUser.avatar_color || 'bg-indigo-600'} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
            </button>

            {activeDropdown === 'user' && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)} />
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 p-3 space-y-3 animate-fade-in text-slate-900">
                  {/* User info */}
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                    <div className={`w-10 h-10 rounded-xl ${currentUser.avatar_color} text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`}>
                      {currentUser.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{currentUser.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{currentUser.email}</p>
                      <span className="inline-block mt-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-extrabold px-2 py-0.2 rounded-full border border-indigo-200">
                        {getRoleName(currentUser.role)}
                      </span>
                    </div>
                  </div>

                  {/* Quick Role Simulation Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      🧪 Cambiar Rol para Pruebas RBAC:
                    </span>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {[
                        { key: 'super_admin' as UserRoleKey, label: '👑 Super Administrador' },
                        { key: 'company_admin' as UserRoleKey, label: '🏢 Director de Empresa' },
                        { key: 'sales_manager' as UserRoleKey, label: '📊 Gerente de Ventas' },
                        { key: 'sales_rep' as UserRoleKey, label: '💼 Ejecutivo de Ventas' },
                        { key: 'erp_accountant' as UserRoleKey, label: '📄 Contador / Facturación' }
                      ].map(r => (
                        <button
                          key={r.key}
                          onClick={() => {
                            switchRole(r.key);
                            setActiveDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between p-1.5 px-2 rounded-lg text-left text-[11px] font-bold transition-colors cursor-pointer ${
                            currentUser.role === r.key
                              ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{r.label}</span>
                          {currentUser.role === r.key && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profile Actions */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <Link
                      href="/onboarding"
                      onClick={() => setActiveDropdown(null)}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Rocket className="w-4 h-4 text-emerald-600" />
                      <span>Asistente Onboarding</span>
                    </Link>

                    {isSuperAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setActiveDropdown(null)}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Panel Super-Admin</span>
                      </Link>
                    )}

                    <Link
                      href="/login"
                      onClick={() => {
                        logout();
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <CommandPalette
        isOpen={internalCommandPaletteOpen}
        onClose={() => setInternalCommandPaletteOpen(false)}
      />
    </header>
  );
}
