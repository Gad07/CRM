import { UserRoleKey, PermissionKey, RoleDefinition } from '@/types/enterprise';

export const SYSTEM_ROLE_DEFINITIONS: Record<UserRoleKey, RoleDefinition> = {
  super_admin: {
    key: 'super_admin',
    name: 'Super Administrador (Plataforma)',
    description: 'Control total de la infraestructura multi-empresa, creación de tenants, planes SaaS y auditoría global.',
    permissions: [
      'platform_super_admin',
      'manage_company',
      'manage_team',
      'manage_billing',
      'manage_pipelines',
      'view_all_deals',
      'edit_all_deals',
      'delete_deals',
      'view_own_deals',
      'view_analytics',
      'view_forecasting',
      'manage_erp_invoices',
      'manage_products',
      'manage_automations',
      'manage_whatsapp',
      'access_ai_copilot'
    ]
  },
  company_admin: {
    key: 'company_admin',
    name: 'Director / Administrador de Empresa',
    description: 'Gestión integral del ecosistema de la empresa: embudos, usuarios, facturación ERP, WhatsApp y configuraciones.',
    permissions: [
      'manage_company',
      'manage_team',
      'manage_billing',
      'manage_pipelines',
      'view_all_deals',
      'edit_all_deals',
      'delete_deals',
      'view_own_deals',
      'view_analytics',
      'view_forecasting',
      'manage_erp_invoices',
      'manage_products',
      'manage_automations',
      'manage_whatsapp',
      'access_ai_copilot'
    ]
  },
  sales_manager: {
    key: 'sales_manager',
    name: 'Gerente de Ventas',
    description: 'Supervisión completa del embudo comercial, asignación de prospectos, analítica de cuotas y aprobación de cotizaciones.',
    permissions: [
      'manage_pipelines',
      'view_all_deals',
      'edit_all_deals',
      'view_own_deals',
      'view_analytics',
      'view_forecasting',
      'manage_products',
      'manage_automations',
      'manage_whatsapp',
      'access_ai_copilot'
    ]
  },
  sales_rep: {
    key: 'sales_rep',
    name: 'Ejecutivo de Ventas',
    description: 'Gestión enfocada en sus propios negocios asignados, contactos, tareas de agenda, WhatsApp y cotizaciones.',
    permissions: [
      'view_own_deals',
      'access_ai_copilot'
    ]
  },
  erp_accountant: {
    key: 'erp_accountant',
    name: 'Contador / Facturación ERP',
    description: 'Gestión contable de facturas electrónicas FEL, catálogo de productos, control de inventario y cobros.',
    permissions: [
      'manage_erp_invoices',
      'manage_products',
      'view_analytics'
    ]
  }
};

/**
 * Checks if a specific role has a permission.
 */
export function hasPermission(role: UserRoleKey, permission: PermissionKey): boolean {
  const roleDef = SYSTEM_ROLE_DEFINITIONS[role];
  if (!roleDef) return false;
  return roleDef.permissions.includes(permission);
}

/**
 * Returns human-readable label for a role key.
 */
export function getRoleName(role: UserRoleKey): string {
  return SYSTEM_ROLE_DEFINITIONS[role]?.name || role;
}

/**
 * Route protection rules based on user role and permissions.
 */
export function canAccessRoute(role: UserRoleKey, pathname: string): { allowed: boolean; reason?: string } {
  // Super admin can access everything
  if (role === 'super_admin') return { allowed: true };

  // Platform admin portal is restricted to super_admin only
  if (pathname.startsWith('/admin')) {
    return {
      allowed: false,
      reason: 'El Panel de Plataforma está reservado exclusivamente para Super Administradores.'
    };
  }

  // Settings Team / Billing / Global Company
  if (pathname.startsWith('/settings/team') || pathname.startsWith('/settings/company')) {
    if (!hasPermission(role, 'manage_company') && !hasPermission(role, 'manage_team')) {
      return {
        allowed: false,
        reason: 'No tienes permisos de Administrador de Empresa para gestionar el equipo o la configuración global.'
      };
    }
  }

  // Workflows / Automations
  if (pathname.startsWith('/settings/workflows') || pathname.startsWith('/settings/lead-routing')) {
    if (!hasPermission(role, 'manage_automations')) {
      return {
        allowed: false,
        reason: 'Se requiere permiso de Gerencia de Ventas o Administración para configurar flujos y enrutadores.'
      };
    }
  }

  // Analytics & Forecast
  if (pathname.startsWith('/analytics')) {
    if (!hasPermission(role, 'view_analytics')) {
      return {
        allowed: false,
        reason: 'Acceso a métricas ejecutivas y pronósticos restringido para tu rol.'
      };
    }
  }

  return { allowed: true };
}
