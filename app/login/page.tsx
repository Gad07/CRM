'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Sparkles,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '@/context/AuthContext';
import { getRoleName } from '@/lib/permissions';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    const success = login(email, password);
    if (success) {
      router.push('/');
    } else {
      setError('Credenciales inválidas.');
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-xl">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AdaptableCRM Enterprise</h1>
          <p className="text-xs text-slate-400 font-medium">
            Acceso seguro a tu ecosistema de empresa multi-tenant con RBAC
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Correo Electrónico Corporativo
              </label>
              <input
                type="email"
                required
                placeholder="usuario@empresa.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Profiles */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
              ⚡ Acceso Rápido por Rol para Pruebas:
            </span>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.id)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${u.avatar_color} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {getRoleName(u.role)}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                    Entrar
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA to Onboarding */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>
            ¿Tu empresa es nueva?{' '}
            <Link href="/onboarding" className="text-indigo-400 font-bold hover:underline">
              Configurar nuevo ecosistema de empresa
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
