'use client';

import React, { useState } from 'react';
import { ShieldCheck, Users, Plus, Trash2, Key, Check, ToggleLeft, ToggleRight, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { CRMUser, UserRoleKey, RoleDefinition } from '@/types/enterprise';

export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    key: 'super_admin',
    name: 'Super Administrador',
    description: 'Acceso total sin restricciones a todos los módulos, ajustes del sistema y facturación ERP.',
    permissions: ['Ver Todo', 'Editar Todo', 'Eliminar Registros', 'Gestionar Usuarios & RBAC', 'Facturación ERP', 'Configuración Global']
  },
  {
    key: 'sales_manager',
    name: 'Gerente de Ventas',
    description: 'Supervisión completa del embudo comercial, reasignación de negocios y analítica de rendimiento.',
    permissions: ['Ver Todo el Embudo', 'Editar Etapas', 'Asignar Vendedores', 'Ver Analítica & Pronóstico', 'Aprobar Cotizaciones']
  },
  {
    key: 'sales_rep',
    name: 'Ejecutivo de Ventas',
    description: 'Gestión de negocios asignados, tareas de seguimiento, minutas y comunicación con clientes.',
    permissions: ['Ver Mis Negocios', 'Crear/Mover Negocios', 'Agendar Tareas', 'Enviar Plantillas WhatsApp', 'Generar Cotizaciones']
  },
  {
    key: 'erp_accountant',
    name: 'Contador / Facturación ERP',
    description: 'Gestión del catálogo de productos, emisión de facturas electrónicas y control de cobros.',
    permissions: ['Ver Facturas', 'Emitir Facturas FEL', 'Registrar Pagos', 'Control de Stock', 'Exportar Reportes']
  }
];

export const INITIAL_USERS: CRMUser[] = [
  {
    id: 'user-1',
    name: 'Gabriel Palma',
    email: 'gabriel.palma@empresa.com',
    role: 'super_admin',
    avatar_color: 'bg-indigo-600',
    is_active: true,
    last_active: 'Hace 2 minutos'
  },
  {
    id: 'user-2',
    name: 'Valeria Morales',
    email: 'valeria.morales@empresa.com',
    role: 'sales_manager',
    avatar_color: 'bg-purple-600',
    is_active: true,
    last_active: 'Hace 1 hora'
  },
  {
    id: 'user-3',
    name: 'Roberto Gómez',
    email: 'roberto.gomez@empresa.com',
    role: 'sales_rep',
    avatar_color: 'bg-emerald-600',
    is_active: true,
    last_active: 'Ayer a las 17:45'
  },
  {
    id: 'user-4',
    name: 'Carmen Silva',
    email: 'carmen.silva@empresa.com',
    role: 'erp_accountant',
    avatar_color: 'bg-amber-600',
    is_active: true,
    last_active: 'Hace 3 horas'
  }
];

export function TeamRolesManager() {
  const [users, setUsers] = useState<CRMUser[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRoleKey>('sales_rep');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newUser: CRMUser = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      avatar_color: 'bg-blue-600',
      is_active: true,
      last_active: 'Recién agregado'
    };

    setUsers(prev => [newUser, ...prev]);
    setNewName('');
    setNewEmail('');
    setIsAddUserOpen(false);
  };

  const toggleUserActive = (id: string) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, is_active: !u.is_active } : u)));
  };

  const updateUserRole = (id: string, role: UserRoleKey) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, role } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> Gestión de Usuarios, Equipos & Permisos (RBAC)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Control de acceso basado en roles para vendedores, gerentes y administradores
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios del Equipo ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Matriz de Roles ({SYSTEM_ROLES.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GESTIÓN DE USUARIOS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Directorio de Usuarios del CRM/ERP ({users.length})
            </h3>

            <button
              onClick={() => setIsAddUserOpen(!isAddUserOpen)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddUserOpen ? 'Cancelar' : 'Invitar Nuevo Usuario'}</span>
            </button>
          </div>

          {/* Form Add User */}
          {isAddUserOpen && (
            <form onSubmit={handleAddUser} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-slate-900 animate-fade-in">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" /> Invitar Colaborador al CRM
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: María Fernando López..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="maria@empresa.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Rol Asignado (RBAC)</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                  >
                    {SYSTEM_ROLES.map(r => (
                      <option key={r.key} value={r.key}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl"
                >
                  + Enviar Invitación / Registrar
                </button>
              </div>
            </form>
          )}

          {/* User List Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Rol RBAC</th>
                  <th className="p-3">Última Actividad</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-900">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${u.avatar_color} text-white font-bold text-xs flex items-center justify-center`}>
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-bold">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 font-mono">{u.email}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={e => updateUserRole(u.id, e.target.value as any)}
                        className="bg-white border border-slate-300 text-slate-900 font-bold text-[11px] px-2 py-1 rounded-lg cursor-pointer focus:outline-none"
                      >
                        {SYSTEM_ROLES.map(r => (
                          <option key={r.key} value={r.key}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-slate-500">{u.last_active}</td>
                    <td className="p-3">
                      <button onClick={() => toggleUserActive(u.id)} className="flex items-center gap-1.5">
                        {u.is_active ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                            ACTIVO
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-slate-300">
                            INACTIVO
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => deleteUser(u.id)} className="text-slate-400 hover:text-red-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIZ DE ROLES & PERMISOS */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_ROLES.map(role => (
              <div key={role.key} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{role.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{role.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Permisos Asignados ({role.permissions.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map(perm => (
                      <span key={perm} className="bg-white border border-slate-200 text-indigo-700 font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 text-emerald-600" /> {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
