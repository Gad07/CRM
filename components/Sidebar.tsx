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
  Briefcase
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function Sidebar() {
  const pathname = usePathname();
  const { data, activePipeline } = useCRM();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Tablero Kanban', href: '/pipeline', icon: Kanban },
    { label: 'Vista en Tabla', href: '/pipeline/table', icon: Table },
    { label: 'Contactos y Empresas', href: '/contacts', icon: Users },
    { label: 'Productos & Cotizar', href: '/products', icon: ShoppingBag },
    { label: 'Agenda y Tareas', href: '/activities', icon: CalendarCheck },
    { label: 'Analítica y Reportes', href: '/analytics', icon: BarChart3 },
    { label: 'Configuración CRM', href: '/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col justify-between p-4 sticky top-0 shrink-0 z-30 shadow-xs">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base tracking-tight leading-none">{data.settings.company_name}</h1>
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">CRM Empresarial</span>
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
        </nav>
      </div>

      {/* Supabase Status Footer */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs px-2">
          <span className="flex items-center gap-1.5 text-slate-600 font-bold">
            <Database className="w-3.5 h-3.5 text-indigo-600" /> Supabase:
          </span>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
              data.settings.is_supabase_connected
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            {data.settings.is_supabase_connected ? 'Conectado' : 'Modo Local'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-semibold px-2 text-center">v2.0 Enterprise</p>
      </div>
    </aside>
  );
}
