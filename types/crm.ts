export type FieldType = 'text' | 'number' | 'select' | 'date' | 'boolean';
export type EntityType = 'deal' | 'contact' | 'company';
export type PriorityType = 'low' | 'medium' | 'high' | 'urgent';
export type DealStatus = 'open' | 'won' | 'lost';
export type ActivityType = 'call' | 'meeting' | 'email' | 'task' | 'note';
export type ActivityStatus = 'pending' | 'completed';

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  order_index: number;
  win_probability: number; // 0-100%
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  industry_preset?: string;
  stages: PipelineStage[];
}

export interface CustomFieldDefinition {
  id: string;
  entity_type: EntityType;
  name: string; // Key in custom_fields JSON
  label: string; // User-facing label
  field_type: FieldType;
  options?: string[]; // For select dropdowns
  required?: boolean;
  order_index: number;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  size?: string;
  address?: string;
  custom_fields: Record<string, any>;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  company_id?: string;
  company_name?: string;
  notes?: string;
  custom_fields: Record<string, any>;
  created_at: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  pipeline_id: string;
  stage_id: string;
  contact_id?: string;
  contact_name?: string;
  company_id?: string;
  company_name?: string;
  priority: PriorityType;
  tags: string[];
  expected_close_date?: string;
  custom_fields: Record<string, any>;
  order_index: number;
  status: DealStatus;
  created_at: string;
  updated_at?: string;
}

export interface Activity {
  id: string;
  deal_id?: string;
  deal_title?: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  due_date?: string;
  notes?: string;
  created_at: string;
}

export interface SystemSettings {
  company_name: string;
  currency_symbol: string;
  currency_code: string;
  theme: 'dark' | 'light';
  supabase_url: string;
  supabase_anon_key: string;
  is_supabase_connected: boolean;
}

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

export interface IndustryPreset {

  id: string;
  name: string;
  description: string;
  icon: string;
  pipeline_name: string;
  stages: Array<{ name: string; color: string; win_probability: number }>;
  custom_fields: Array<{
    entity_type: EntityType;
    name: string;
    label: string;
    field_type: FieldType;
    options?: string[];
  }>;
}
