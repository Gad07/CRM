'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  MessageSquare,
  UserCheck,
  Workflow,
  Globe,
  Users,
  Layers,
  Building2,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Rocket
} from 'lucide-react';

export default function SettingsHubPage() {
  const { data } = useCRM();
  const { isSuperAdmin, hasPermission } = useAuth();

  const settingsCards = [
    {
      id: 'whatsapp',
      title: 'Conexión de WhatsApp Oficial & Webhooks',
      description: 'Conecta tu WhatsApp vía Meta Cloud API oficial (1,000 conversaciones gratis/mes) o Twilio con webhook en vivo.',
      href: '/settings/whatsapp',
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
      badge: 'Meta Cloud API + Twilio',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    {
      id: 'lead-routing',
      title: 'Asignación Inteligente de Leads con IA',
      description: 'Enrutador cognitivo con Google Gemini IA y Round-Robin para asignar prospectos según especialidad y carga.',
      href: '/settings/lead-routing',
      icon: <UserCheck className="w-6 h-6 text-indigo-600" />,
      badge: 'IA Gemini + Round-Robin',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
    },
    {
      id: 'workflows',
      title: 'Diseñador de Flujos & Chatbots',
      description: 'Diseña automatizaciones de nodos visuales, secuencias multipaso por WhatsApp y reglas desencadenantes.',
      href: '/settings/workflows',
      icon: <Workflow className="w-6 h-6 text-indigo-600" />,
      badge: 'Canvas de Nodos + Bots',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
    },
    {
      id: 'web-forms',
      title: 'Formularios Web Embed',
      description: 'Genera código HTML / iFrame para incrustar en WordPress, Wix o Webflow y captar leads automáticamente.',
      href: '/settings/web-forms',
      icon: <Globe className="w-6 h-6 text-purple-600" />,
      badge: 'Código HTML Embed',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
    },
    {
      id: 'team',
      title: 'Equipos, Roles & Permisos (RBAC)',
      description: 'Administra los usuarios del sistema, asigna roles de vendedora o gerente y controla niveles de acceso.',
      href: '/settings/team',
      icon: <Users className="w-6 h-6 text-pink-600" />,
      badge: 'Directorio & Permisos',
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-300'
    },
    {
      id: 'pipeline',
      title: 'Embudos, Etapas & Campos Adaptables',
      description: 'Edita etapas del embudo, porcentajes de éxito (%), colores identificadores y campos personalizados.',
      href: '/settings/pipeline',
      icon: <Layers className="w-6 h-6 text-amber-600" />,
      badge: 'Editor de Etapas + Presets',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    {
      id: 'company',
      title: 'Identidad de Empresa & Supabase',
      description: 'Configura la razón social, símbolo de moneda local y credenciales de conexión a Supabase Postgres.',
      href: '/settings/company',
      icon: <Building2 className="w-6 h-6 text-cyan-600" />,
      badge: 'Moneda + Base de Datos',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300'
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" /> Centro Principal de Configuración CRM Enterprise
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Selecciona el área que deseas personalizar. Cada sección cuenta con su propia pantalla dedicada para mayor organización.
          </p>
        </div>

        {/* Super Admin Special Access Cards */}
        {isSuperAdmin && (
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-indigo-700/50 shadow-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit">
                <ShieldCheck className="w-3.5 h-3.5" /> Acceso Super Administrador
              </span>
              <h2 className="text-base font-extrabold text-white">Panel de Administración de Empresas & SaaS</h2>
              <p className="text-xs text-slate-300 font-medium max-w-xl">
                Crea nuevas empresas clientes, administra planes de suscripción, cuotas de usuarios y monitorea el estado global de la plataforma.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/onboarding"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all border border-slate-700"
              >
                <Rocket className="w-4 h-4 text-emerald-400" />
                <span>Onboarding</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ir al Panel Master</span>
              </Link>
            </div>
          </div>
        )}

        {/* Grid de Secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsCards.map(card => (
            <Link
              key={card.id}
              href={card.href}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                <span>Configurar ahora</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
