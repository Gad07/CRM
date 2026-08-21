import { Product, AutomationRule, ERPInvoice, SalesRepLeaderboardItem } from '@/types/enterprise';

export const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'SAAS-ENT-01',
    name: 'Licencia Software Enterprise (Anual)',
    description: 'Acceso completo para hasta 50 usuarios con soporte prioritario 24/7.',
    unit_price: 12000,
    cost_price: 4500,
    stock_quantity: 45,
    min_stock_alert: 10,
    category: 'Software / Licencias',
    tax_rate: 12
  },
  {
    id: 'prod-2',
    sku: 'SERV-CONS-02',
    name: 'Paquete de Consultoría e Implementación (100 hrs)',
    description: 'Servicios profesionales de migración de datos y capacitación de equipo.',
    unit_price: 8500,
    cost_price: 3200,
    stock_quantity: 28,
    min_stock_alert: 5,
    category: 'Servicios Profesionales',
    tax_rate: 12
  },
  {
    id: 'prod-3',
    sku: 'REAL-COMM-03',
    name: 'Honorarios de Intermediación Inmobiliaria',
    description: 'Comisión por servicios de gestión de compraventa o arrendamiento.',
    unit_price: 15000,
    cost_price: 2000,
    stock_quantity: 12,
    min_stock_alert: 3,
    category: 'Bienes Raíces',
    tax_rate: 12
  },
  {
    id: 'prod-4',
    sku: 'MKT-CAMP-04',
    name: 'Campaña de Posicionamiento Digital & Leads',
    description: 'Estrategia multicanal de 3 meses para captación de prospectos calificados.',
    unit_price: 4500,
    cost_price: 1800,
    stock_quantity: 60,
    min_stock_alert: 15,
    category: 'Marketing',
    tax_rate: 12
  }
];

export const defaultAutomationRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Auto-Crear Tarea al Mover a Propuesta',
    is_active: true,
    trigger_type: 'stage_changed',
    action_type: 'create_task',
    action_task_title: 'Enviar Cotización Oficial y Agendar Llamada de Seguimiento',
    action_task_type: 'email'
  },
  {
    id: 'rule-2',
    name: 'Prioridad URGENTE si el negocio supera $50,000',
    is_active: true,
    trigger_type: 'value_exceeded',
    trigger_min_value: 50000,
    action_type: 'change_priority',
    action_new_priority: 'urgent'
  },
  {
    id: 'rule-3',
    name: 'Etiqueta VIP a Negocios de Alta Prioridad',
    is_active: true,
    trigger_type: 'priority_assigned',
    trigger_priority: 'urgent',
    action_type: 'add_tag',
    action_tag_name: 'VIP'
  }
];

export const defaultInvoices: ERPInvoice[] = [
  {
    id: 'inv-1',
    invoice_number: 'FEL-2026-00101',
    deal_id: 'deal-2',
    deal_title: 'Local Comercial Plaza Financiera',
    customer_name: 'Ana Sofía Rodríguez',
    customer_company: 'Grupo Inversor Alfa',
    date_issued: '2026-08-15',
    due_date: '2026-08-30',
    status: 'paid',
    payment_method: 'transfer',
    subtotal: 160714.29,
    tax_total: 19285.71,
    grand_total: 180000,
    line_items: [
      {
        id: 'li-1',
        product_name: 'Local Comercial Plaza Financiera - Anticipo',
        quantity: 1,
        unit_price: 160714.29,
        discount_percent: 0,
        tax_percent: 12,
        subtotal: 160714.29,
        total: 180000
      }
    ],
    notes: 'Factura Serie A emitida con IVA acreditable.'
  }
];

export const defaultSalesReps: SalesRepLeaderboardItem[] = [
  {
    id: 'rep-1',
    rep_name: 'Mariana Cruz',
    role: 'Vendedora Senior - Zona 10',
    avatar_color: 'bg-indigo-600',
    deals_won_count: 8,
    revenue_closed: 245000,
    commission_rate_percent: 5,
    commission_earned: 12250,
    monthly_target: 300000,
    target_completion_percent: 81.6
  },
  {
    id: 'rep-2',
    rep_name: 'Elena Rostro',
    role: 'Vendedora Senior - Proyectos',
    avatar_color: 'bg-purple-600',
    deals_won_count: 5,
    revenue_closed: 190000,
    commission_rate_percent: 5,
    commission_earned: 9500,
    monthly_target: 200000,
    target_completion_percent: 95.0
  },
  {
    id: 'rep-3',
    rep_name: 'Sofía Morales',
    role: 'Ejecutiva B2B - Corporativo',
    avatar_color: 'bg-emerald-600',
    deals_won_count: 6,
    revenue_closed: 140000,
    commission_rate_percent: 4,
    commission_earned: 5600,
    monthly_target: 150000,
    target_completion_percent: 93.3
  },
  {
    id: 'rep-4',
    rep_name: 'Gabriel Palma',
    role: 'Director Comercial & Cuentas VIP',
    avatar_color: 'bg-blue-600',
    deals_won_count: 10,
    revenue_closed: 420000,
    commission_rate_percent: 6,
    commission_earned: 25200,
    monthly_target: 400000,
    target_completion_percent: 105.0
  },
  {
    id: 'rep-5',
    rep_name: 'Lucía Méndez',
    role: 'Vendedora - Comercial',
    avatar_color: 'bg-amber-600',
    deals_won_count: 4,
    revenue_closed: 110000,
    commission_rate_percent: 5,
    commission_earned: 5500,
    monthly_target: 150000,
    target_completion_percent: 73.3
  },
  {
    id: 'rep-6',
    rep_name: 'Carlos Méndez',
    role: 'Gerente de Ventas Regional',
    avatar_color: 'bg-rose-600',
    deals_won_count: 7,
    revenue_closed: 280000,
    commission_rate_percent: 5,
    commission_earned: 140000,
    monthly_target: 300000,
    target_completion_percent: 93.3
  },
  {
    id: 'rep-7',
    rep_name: 'Valentina Soto',
    role: 'Vendedora - Residencial',
    avatar_color: 'bg-pink-600',
    deals_won_count: 5,
    revenue_closed: 135000,
    commission_rate_percent: 5,
    commission_earned: 6750,
    monthly_target: 160000,
    target_completion_percent: 84.3
  },
  {
    id: 'rep-8',
    rep_name: 'Camila Ríos',
    role: 'Ejecutiva de Cierre Rápido',
    avatar_color: 'bg-teal-600',
    deals_won_count: 9,
    revenue_closed: 175000,
    commission_rate_percent: 5,
    commission_earned: 8750,
    monthly_target: 180000,
    target_completion_percent: 97.2
  },
  {
    id: 'rep-9',
    rep_name: 'Isabella Vargas',
    role: 'Vendedora - Bodegas & Industria',
    avatar_color: 'bg-cyan-600',
    deals_won_count: 3,
    revenue_closed: 290000,
    commission_rate_percent: 4,
    commission_earned: 11600,
    monthly_target: 250000,
    target_completion_percent: 116.0
  },
  {
    id: 'rep-10',
    rep_name: 'Andrea Castillo',
    role: 'Vendedora - Desarrollo Urbano',
    avatar_color: 'bg-violet-600',
    deals_won_count: 4,
    revenue_closed: 95000,
    commission_rate_percent: 5,
    commission_earned: 4750,
    monthly_target: 120000,
    target_completion_percent: 79.1
  }
];
