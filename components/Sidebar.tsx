'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  Table,
  Users,
  CalendarCheck,
  BarChart3,
  Settings,
  Database,
  ShoppingBag,
  ChevronRight,
  Briefcase,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { getRoleName } from '@/lib/permissions';

export function Sidebar() {
  const pathname = usePathname();
  const { data, activePipeline, activeTenant } = useCRM();
  const { currentUser, isSuperAdmin, hasPermission } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard, permission: null },
    { label: 'Tablero Kanban', href: '/pipeline', icon: Kanban, permission: null },
    { label: 'Vista en Tabla', href: '/pipeline/table', icon: Table, permission: null },
    { label: 'Contactos y Empresas', href: '/contacts', icon: Users, permission: null },
    { label: 'Productos & Cotizar', href: '/products', icon: ShoppingBag, permission: null },
    { label: 'Agenda y Tareas', href: '/activities', icon: CalendarCheck, permission: null },
    { label: 'WhatsApp Chat', href: '/whatsapp', icon: MessageSquare, permission: null },
    { label: 'Analítica y Reportes', href: '/analytics', icon: BarChart3, permission: 'view_analytics' as const },
    { label: 'Configuración CRM', href: '/settings', icon: Settings, permission: 'manage_company' as const }
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col justify-between p-4 sticky top-0 shrink-0 z-30 shadow-xs">
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight truncate">
              {activeTenant?.name || data.settings.company_name}
            </h1>
            <span className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase block">
              {activeTenant?.tax_id || 'CRM Multi-Empresa'}
            </span>
          </div>
        </div>

        {/* Active Pipeline Badge */}
        {activePipeline && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Embudo Activo</p>
                <p className="text-xs font-bold text-slate-900 truncate">{activePipeline.name}</p>
              </div>
            </div>
            <Link href="/settings" className="text-slate-400 hover:text-indigo-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map(item => {
            if (item.permission && !hasPermission(item.permission)) {
              return null;
            }
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Super Admin Special Link */}
          {isSuperAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                pathname === '/admin'
                  ? 'bg-indigo-900 text-white border-indigo-700'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Panel Super Admin</span>
            </Link>
          )}
        </nav>
      </div>

      {/* User & Tenant Footer */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
          <div className={`w-7 h-7 rounded-lg ${currentUser.avatar_color} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
            {currentUser.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 font-semibold truncate">{getRoleName(currentUser.role).split('(')[0]}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
