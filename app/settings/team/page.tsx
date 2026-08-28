'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { RoleGuard } from '@/components/RoleGuard';
import { TeamRolesManager } from '@/components/TeamRolesManager';
import { ArrowLeft, Users } from 'lucide-react';

export default function SettingsTeamPage() {
  return (
    <RoleGuard permission="manage_team">
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900">
        <Navbar />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Configuración de Equipo, Roles & Permisos (RBAC)
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Gestiona el directorio de usuarios, invita vendedoras y define los niveles de acceso al sistema.
              </p>
            </div>
          </div>

          <TeamRolesManager />
        </main>
      </div>
    </RoleGuard>
  );
}
