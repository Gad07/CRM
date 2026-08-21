'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { LeadAssignmentManager } from '@/components/LeadAssignmentManager';
import { ArrowLeft, UserCheck } from 'lucide-react';

export default function SettingsLeadRoutingPage() {
  return (
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
              <UserCheck className="w-5 h-5 text-emerald-600" /> Configuración de Asignación Automática de Leads
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Gestiona el algoritmo Round-Robin, la carga equitativa y la lista de tus 10 vendedoras activas.
            </p>
          </div>
        </div>

        <LeadAssignmentManager />
      </main>
    </div>
  );
}
