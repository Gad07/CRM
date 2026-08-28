'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { RoleGuard } from '@/components/RoleGuard';
import { useCRM } from '@/context/CRMContext';
import { ArrowLeft, Building2, Database, RotateCcw } from 'lucide-react';

export default function SettingsCompanyPage() {
  const { data, updateSettings, resetToDefaultData } = useCRM();

  const [companyName, setCompanyName] = useState(data.settings.company_name);
  const [currencySymbol, setCurrencySymbol] = useState(data.settings.currency_symbol);
  const [currencyCode, setCurrencyCode] = useState(data.settings.currency_code);

  const [supabaseUrl, setSupabaseUrl] = useState(data.settings.supabase_url);
  const [supabaseKey, setSupabaseKey] = useState(data.settings.supabase_anon_key);
  const [showSql, setShowSql] = useState(false);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      company_name: companyName,
      currency_symbol: currencySymbol,
      currency_code: currencyCode,
      supabase_url: supabaseUrl,
      supabase_anon_key: supabaseKey,
      is_supabase_connected: Boolean(supabaseUrl && supabaseKey)
    });
    alert('Configuración de identidad guardada correctamente.');
  };

  return (
    <RoleGuard permission="manage_company">
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
              <Building2 className="w-5 h-5 text-blue-600" /> Configuración de Identidad de Empresa & Base de Datos
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Define la razón social, moneda predeterminada y credenciales de conexión con Supabase Postgres.
            </p>
          </div>
        </div>

        {/* Formulario de Empresa y Moneda */}
        <form onSubmit={handleSaveBranding} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Identidad de la Empresa y Moneda Local
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la Empresa</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Símbolo de Moneda (ej: $, €, Q, MXN)</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={e => setCurrencySymbol(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Código ISO de Moneda</label>
              <input
                type="text"
                value={currencyCode}
                onChange={e => setCurrencyCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs"
            >
              Guardar Cambios de Identidad
            </button>
          </div>
        </form>

        {/* Supabase Connection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" /> Integración con Base de Datos Supabase Postgres
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Conecta tu instancia de Supabase Postgres para persistencia remota en tiempo real.
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                data.settings.is_supabase_connected
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {data.settings.is_supabase_connected ? 'Conectado a Supabase' : 'Modo Demo Local'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">NEXT_PUBLIC_SUPABASE_URL</label>
              <input
                type="text"
                placeholder="https://xxxx.supabase.co"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
              <input
                type="password"
                placeholder="eyJhbGciOi..."
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setShowSql(!showSql)}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-bold cursor-pointer"
            >
              {showSql ? 'Ocultar Script SQL' : '📄 Ver / Copiar Script SQL de Tablas Supabase'}
            </button>

            <button
              onClick={() => {
                if (confirm('¿Deseas reiniciar los datos locales a su estado inicial demo?')) {
                  resetToDefaultData();
                }
              }}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Datos Demo</span>
            </button>
          </div>

          {showSql && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 space-y-2">
              <pre className="text-[11px] text-slate-300 whitespace-pre-wrap">
{`CREATE TABLE IF NOT EXISTS pipelines (...);
CREATE TABLE IF NOT EXISTS pipeline_stages (...);
CREATE TABLE IF NOT EXISTS deals (...);
CREATE TABLE IF NOT EXISTS contacts (...);`}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  </RoleGuard>
);
}
