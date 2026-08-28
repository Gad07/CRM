'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRoleKey, PermissionKey } from '@/types/enterprise';
import { getRoleName } from '@/lib/permissions';

interface RoleGuardProps {
  children: React.ReactNode;
  permission?: PermissionKey;
  roles?: UserRoleKey[];
  fallback?: React.ReactNode;
  showBannerOnly?: boolean;
}

export function RoleGuard({
  children,
  permission,
  roles,
  fallback,
  showBannerOnly = false
}: RoleGuardProps) {
  const { currentUser, hasPermission, switchRole } = useAuth();

  let isAllowed = true;

  if (permission && !hasPermission(permission)) {
    isAllowed = false;
  }

  if (roles && roles.length > 0 && !roles.includes(currentUser.role)) {
    isAllowed = false;
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showBannerOnly) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Acción restringida para el rol <strong>{getRoleName(currentUser.role)}</strong>.</span>
        </div>
        <button
          onClick={() => switchRole('company_admin')}
          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
        >
          Probar con Admin
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center space-y-5 text-slate-900 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Control de Acceso RBAC
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">Módulo Restringido</h2>
          <p className="text-xs text-slate-500 font-medium">
            Tu perfil actual (<strong className="text-slate-800">{getRoleName(currentUser.role)}</strong>) no cuenta con los permisos necesarios para ver o modificar esta sección.
          </p>
        </div>

        {/* Quick Role Switcher for Testing */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
            🧪 Simulador de Roles para Pruebas:
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => switchRole('super_admin')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 font-bold text-left transition-colors cursor-pointer text-[11px]"
            >
              👑 Super Admin
            </button>
            <button
              onClick={() => switchRole('company_admin')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-purple-500 hover:text-purple-600 font-bold text-left transition-colors cursor-pointer text-[11px]"
            >
              🏢 Director Empresa
            </button>
            <button
              onClick={() => switchRole('sales_manager')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 font-bold text-left transition-colors cursor-pointer text-[11px]"
            >
              📊 Gerente Ventas
            </button>
            <button
              onClick={() => switchRole('erp_accountant')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-600 font-bold text-left transition-colors cursor-pointer text-[11px]"
            >
              📄 Contador ERP
            </button>
          </div>
        </div>

        <div className="flex gap-2 justify-center pt-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
