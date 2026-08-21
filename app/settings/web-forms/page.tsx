'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { WebFormEmbedBuilder } from '@/components/WebFormEmbedBuilder';
import { ArrowLeft, Globe } from 'lucide-react';

export default function SettingsWebFormsPage() {
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
              <Globe className="w-5 h-5 text-indigo-600" /> Configuración de Formularios Web Embed
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Crea formularios para incrustar en WordPress, Wix o Webflow para la captación automática de leads.
            </p>
          </div>
        </div>

        <WebFormEmbedBuilder />
      </main>
    </div>
  );
}
