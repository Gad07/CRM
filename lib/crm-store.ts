import {
  Pipeline,
  CustomFieldDefinition,
  Deal,
  Contact,
  Company,
  Activity,
  SystemSettings
} from '@/types/crm';
import { INDUSTRY_PRESETS } from './presets';
import { isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'crm_adaptable_data_v1';

const defaultPreset = INDUSTRY_PRESETS[0];

const defaultPipelines: Pipeline[] = [
  {
    id: 'pipe-1',
    name: defaultPreset.pipeline_name,
    description: defaultPreset.description,
    is_default: true,
    industry_preset: defaultPreset.id,
    stages: defaultPreset.stages.map((st, idx) => ({
      id: `stage-${idx + 1}`,
      pipeline_id: 'pipe-1',
      name: st.name,
      color: st.color,
      order_index: idx,
      win_probability: st.win_probability
    }))
  }
];

const defaultCustomFields: CustomFieldDefinition[] = defaultPreset.custom_fields.map((cf, idx) => ({
  id: `cf-${idx + 1}`,
  entity_type: cf.entity_type,
  name: cf.name,
  label: cf.label,
  field_type: cf.field_type,
  options: cf.options || [],
  required: false,
  order_index: idx
}));

const defaultCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'Corporación Inmobiliaria Metrópolis',
    industry: 'Bienes Raíces',
    website: 'https://metropolis.com',
    size: '50-200',
    address: 'Av. Las Américas 15-42, Z. 14',
    custom_fields: {},
    created_at: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'comp-2',
    name: 'Grupo Inversor Alfa',
    industry: 'Finanzas & Capital',
    website: 'https://grupoalfa.io',
    size: '10-50',
    address: 'Edificio Reforma 10, Nivel 8',
    custom_fields: {},
    created_at: '2026-08-01T00:00:00.000Z'
  }
];

const defaultContacts: Contact[] = [
  {
    id: 'cont-1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@metropolis.com',
    phone: '+502 5544-8899',
    role: 'Director de Inversiones',
    company_id: 'comp-1',
    company_name: 'Corporación Inmobiliaria Metrópolis',
    notes: 'Interesado en proyectos comerciales y edificios corporativos.',
    custom_fields: { financing_type: 'Crédito Hipotecario' },
    created_at: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'cont-2',
    name: 'Ana Sofía Rodríguez',
    email: 'ana.rodriguez@grupoalfa.io',
    phone: '+502 4123-9900',
    role: 'Gerente de Adquisiciones',
    company_id: 'comp-2',
    company_name: 'Grupo Inversor Alfa',
    notes: 'Busca oportunidades con alto retorno de inversión.',
    custom_fields: {},
    created_at: '2026-08-01T00:00:00.000Z'
  }
];

const defaultDeals: Deal[] = [
  {
    id: 'deal-1',
    title: 'Adquisición Penthouse Las Luces',
    value: 350000,
    currency: 'USD',
    pipeline_id: 'pipe-1',
    stage_id: 'stage-2',
    contact_id: 'cont-1',
    contact_name: 'Carlos Mendoza',
    company_id: 'comp-1',
    company_name: 'Corporación Inmobiliaria Metrópolis',
    priority: 'high',
    tags: ['VIP', 'Residencial'],
    expected_close_date: '2026-09-05',
    custom_fields: { property_type: 'Apartamento', area_sqm: 240, bedrooms: 3, location_zone: 'Zona 14' },
    order_index: 0,
    status: 'open',
    created_at: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'deal-2',
    title: 'Local Comercial Plaza Financiera',
    value: 180000,
    currency: 'USD',
    pipeline_id: 'pipe-1',
    stage_id: 'stage-3',
    contact_id: 'cont-2',
    contact_name: 'Ana Sofía Rodríguez',
    company_id: 'comp-2',
    company_name: 'Grupo Inversor Alfa',
    priority: 'urgent',
    tags: ['Comercial', 'Alta Rentabilidad'],
    expected_close_date: '2026-08-28',
    custom_fields: { property_type: 'Oficina / Local', area_sqm: 110, location_zone: 'Zona 10' },
    order_index: 0,
    status: 'open',
    created_at: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'deal-3',
    title: 'Terreno Industrial Amatitlán',
    value: 520000,
    currency: 'USD',
    pipeline_id: 'pipe-1',
    stage_id: 'stage-1',
    contact_id: 'cont-1',
    contact_name: 'Carlos Mendoza',
    company_id: 'comp-1',
    company_name: 'Corporación Inmobiliaria Metrópolis',
    priority: 'medium',
    tags: ['Industrial', 'Gran Escala'],
    expected_close_date: '2026-10-05',
    custom_fields: { property_type: 'Terreno', area_sqm: 5000, location_zone: 'Amatitlán' },
    order_index: 1,
    status: 'open',
    created_at: '2026-08-01T00:00:00.000Z'
  }
];

const defaultActivities: Activity[] = [
  {
    id: 'act-1',
    deal_id: 'deal-1',
    deal_title: 'Adquisición Penthouse Las Luces',
    title: 'Llamada de confirmación de visita guiada',
    type: 'call',
    status: 'pending',
    due_date: '2026-08-22T15:00:00.000Z',
    notes: 'Confirmar si asistirá con el arquitecto.',
    created_at: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'act-2',
    deal_id: 'deal-2',
    deal_title: 'Local Comercial Plaza Financiera',
    title: 'Reunión presencial para revisión de carta de oferta',
    type: 'meeting',
    status: 'completed',
    due_date: '2026-08-20T10:00:00.000Z',
    notes: 'La oferta inicial fue de $175,000. Se acordó subir a $180,000.',
    created_at: '2026-08-01T00:00:00.000Z'
  }
];

const defaultSettings: SystemSettings = {
  company_name: 'Mi Empresa Adaptable',
  currency_symbol: '$',
  currency_code: 'USD',
  theme: 'dark',
  supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  is_supabase_connected: isSupabaseConfigured
};

export interface CRMData {
  pipelines: Pipeline[];
  active_pipeline_id: string;
  deals: Deal[];
  contacts: Contact[];
  companies: Company[];
  custom_fields: CustomFieldDefinition[];
  activities: Activity[];
  settings: SystemSettings;
}

export function getDefaultCRMData(): CRMData {
  return {
    pipelines: defaultPipelines,
    active_pipeline_id: 'pipe-1',
    deals: defaultDeals,
    contacts: defaultContacts,
    companies: defaultCompanies,
    custom_fields: defaultCustomFields,
    activities: defaultActivities,
    settings: defaultSettings
  };
}

export function loadCRMData(): CRMData {
  if (typeof window === 'undefined') {
    return getDefaultCRMData();
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        pipelines: parsed.pipelines || defaultPipelines,
        active_pipeline_id: parsed.active_pipeline_id || parsed.pipelines?.[0]?.id || 'pipe-1',
        deals: parsed.deals || defaultDeals,
        contacts: parsed.contacts || defaultContacts,
        companies: parsed.companies || defaultCompanies,
        custom_fields: parsed.custom_fields || defaultCustomFields,
        activities: parsed.activities || defaultActivities,
        settings: { ...defaultSettings, ...parsed.settings }
      };
    }
  } catch (err) {
    console.error('Error loading CRM data from LocalStorage', err);
  }

  return getDefaultCRMData();
}

export function saveCRMData(data: CRMData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving CRM data to LocalStorage', err);
  }
}
