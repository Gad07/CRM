'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CRMUser, UserRoleKey, PermissionKey } from '@/types/enterprise';
import { hasPermission as checkPermission, getRoleName } from '@/lib/permissions';

export const DEMO_USERS: CRMUser[] = [
  {
    id: 'user-super-admin',
    tenant_id: 'tenant-1',
    name: 'Gabriel Palma',
    email: 'superadmin@adaptablecrm.com',
    role: 'super_admin',
    avatar_color: 'bg-indigo-700',
    is_active: true,
    last_active: 'En línea',
    phone: '+502 5500-1122',
    accessible_tenants: ['tenant-1', 'tenant-2', 'tenant-3']
  },
  {
    id: 'user-company-admin',
    tenant_id: 'tenant-1',
    name: 'Valeria Morales',
    email: 'valeria.morales@empresa.com',
    role: 'company_admin',
    avatar_color: 'bg-purple-600',
    is_active: true,
    last_active: 'Hace 5 minutos',
    phone: '+502 4411-2233',
    accessible_tenants: ['tenant-1']
  },
  {
    id: 'user-sales-manager',
    tenant_id: 'tenant-1',
    name: 'Alejandro Paz',
    email: 'alejandro.paz@empresa.com',
    role: 'sales_manager',
    avatar_color: 'bg-blue-600',
    is_active: true,
    last_active: 'Hace 12 minutos',
    phone: '+502 5599-8877',
    accessible_tenants: ['tenant-1']
  },
  {
    id: 'user-sales-rep',
    tenant_id: 'tenant-1',
    name: 'Elena Rostro',
    email: 'elena.rostro@empresa.com',
    role: 'sales_rep',
    avatar_color: 'bg-pink-600',
    is_active: true,
    last_active: 'Hace 2 minutos',
    phone: '+502 4123-9900',
    accessible_tenants: ['tenant-1']
  },
  {
    id: 'user-erp-accountant',
    tenant_id: 'tenant-1',
    name: 'Carmen Silva',
    email: 'carmen.silva@empresa.com',
    role: 'erp_accountant',
    avatar_color: 'bg-amber-600',
    is_active: true,
    last_active: 'Hace 1 hora',
    phone: '+502 5544-7788',
    accessible_tenants: ['tenant-1']
  }
];

interface AuthContextType {
  currentUser: CRMUser;
  users: CRMUser[];
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRoleKey) => void;
  hasPermission: (permission: PermissionKey) => boolean;
  getRoleLabel: () => string;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isSalesManager: boolean;
  isSalesRep: boolean;
  isAccountant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'crm_active_auth_user_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<CRMUser[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<CRMUser>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(AUTH_USER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const found = DEMO_USERS.find(u => u.id === parsed.id || u.email === parsed.email);
          if (found) return { ...found, role: parsed.role || found.role };
          return parsed;
        }
      } catch {}
    }
    return DEMO_USERS[0]; // Default: Super Admin
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
      } catch {}
    }
  }, [currentUser]);

  const login = (email: string, _password?: string): boolean => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      return true;
    }
    // Create new quick user session if not found
    const newUser: CRMUser = {
      id: `user-${Date.now()}`,
      tenant_id: 'tenant-1',
      name: email.split('@')[0].toUpperCase(),
      email: email.trim(),
      role: 'company_admin',
      avatar_color: 'bg-indigo-600',
      is_active: true,
      last_active: 'Recién ingresado',
      accessible_tenants: ['tenant-1']
    };
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
    }
  };

  const switchRole = (role: UserRoleKey) => {
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
  };

  const checkUserPermission = (permission: PermissionKey): boolean => {
    return checkPermission(currentUser.role, permission);
  };

  const getRoleLabel = (): string => {
    return getRoleName(currentUser.role);
  };

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isCompanyAdmin = currentUser.role === 'company_admin';
  const isSalesManager = currentUser.role === 'sales_manager';
  const isSalesRep = currentUser.role === 'sales_rep';
  const isAccountant = currentUser.role === 'erp_accountant';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated,
        login,
        logout,
        switchUser,
        switchRole,
        hasPermission: checkUserPermission,
        getRoleLabel,
        isSuperAdmin,
        isCompanyAdmin,
        isSalesManager,
        isSalesRep,
        isAccountant
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
