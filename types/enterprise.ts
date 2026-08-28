export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock_alert?: number;
  category: string;
  tax_rate: number; // e.g. 12 for 12% IVA
}

export interface QuoteLineItem {
  id: string;
  product_id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number; // 0 - 100%
  tax_percent: number;
  subtotal: number;
  total: number;
}

export interface Quotation {
  id: string;
  quote_number: string;
  deal_id: string;
  deal_title: string;
  customer_name: string;
  customer_company?: string;
  date_issued: string;
  valid_until: string;
  line_items: QuoteLineItem[];
  subtotal: number;
  tax_total: number;
  discount_total: number;
  grand_total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
}

export interface ERPInvoice {
  id: string;
  invoice_number: string;
  deal_id: string;
  deal_title: string;
  customer_name: string;
  customer_company?: string;
  date_issued: string;
  due_date: string;
  line_items: QuoteLineItem[];
  subtotal: number;
  tax_total: number;
  grand_total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: 'transfer' | 'credit_card' | 'cash' | 'check';
  notes?: string;
}

export type TriggerType = 'stage_changed' | 'value_exceeded' | 'priority_assigned' | 'deal_created' | 'inactive_days_exceeded';
export type ActionType = 'create_task' | 'change_priority' | 'add_tag' | 'add_note' | 'enroll_in_bot';

export interface AutomationRule {
  id: string;
  name: string;
  is_active: boolean;
  trigger_type: TriggerType;
  trigger_stage_id?: string;
  trigger_min_value?: number;
  trigger_priority?: string;
  action_type: ActionType;
  action_task_title?: string;
  action_task_type?: 'call' | 'meeting' | 'email' | 'task';
  action_new_priority?: 'low' | 'medium' | 'high' | 'urgent';
  action_tag_name?: string;
  action_note_text?: string;
}

export interface DealTimelineEvent {
  id: string;
  deal_id: string;
  type: 'stage_change' | 'note_added' | 'task_created' | 'task_completed' | 'quote_generated' | 'invoice_generated' | 'field_updated' | 'bot_sequence_started' | 'message_sent' | 'whatsapp_received' | 'whatsapp_sent';
  title: string;
  description?: string;
  timestamp: string;
}

export interface WhatsAppIncomingMessage {
  id: string;
  thread_id: string;       // número de teléfono del contacto
  direction: 'inbound' | 'outbound';
  from_phone: string;
  to_phone: string;
  contact_name: string;
  text: string;
  timestamp: string;
  meta_message_id?: string;
  status: 'received' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WhatsAppCredentials {
  provider: 'meta' | 'twilio';
  // Meta
  phone_number_id?: string;
  business_account_id?: string;
  access_token?: string;
  verify_token?: string;
  // Twilio
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_from_number?: string;
  // Status
  is_connected: boolean;
  connected_phone?: string;
}

export interface LeadScoreInfo {
  score: number; // 0 - 100
  rating: 'hot' | 'warm' | 'cold';
  reasons: string[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'welcome' | 'proposal' | 'followup' | 'closing' | 'reengagement';
  channel: 'whatsapp' | 'email' | 'both';
  subject?: string;
  body: string;
}

export interface BotSequenceStep {
  id: string;
  delay_days: number;
  channel: 'whatsapp' | 'email';
  template_id?: string;
  subject?: string;
  message_body: string;
}

export interface BotSequence {
  id: string;
  name: string;
  description: string;
  channel: 'whatsapp' | 'email' | 'omnichannel';
  is_active: boolean;
  trigger_event: 'on_deal_created' | 'on_stage_entered' | 'manual';
  trigger_stage_id?: string;
  steps: BotSequenceStep[];
  enrolled_deals_count: number;
}

export interface SalesRepLeaderboardItem {
  id: string;
  rep_name: string;
  role: string;
  avatar_color: string;
  deals_won_count: number;
  revenue_closed: number;
  commission_rate_percent: number;
  commission_earned: number;
  monthly_target: number;
  target_completion_percent: number;
}

export type UserRoleKey = 'super_admin' | 'company_admin' | 'sales_manager' | 'sales_rep' | 'erp_accountant';

export type PermissionKey =
  | 'platform_super_admin'
  | 'manage_company'
  | 'manage_team'
  | 'manage_billing'
  | 'manage_pipelines'
  | 'view_all_deals'
  | 'edit_all_deals'
  | 'delete_deals'
  | 'view_own_deals'
  | 'view_analytics'
  | 'view_forecasting'
  | 'manage_erp_invoices'
  | 'manage_products'
  | 'manage_automations'
  | 'manage_whatsapp'
  | 'access_ai_copilot';

export interface RoleDefinition {
  key: UserRoleKey;
  name: string;
  description: string;
  permissions: PermissionKey[];
}

export interface CRMUser {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: UserRoleKey;
  avatar_color: string;
  is_active: boolean;
  last_active: string;
  phone?: string;
  accessible_tenants?: string[];
}

export interface DealAttachment {
  id: string;
  deal_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_at: string;
}

export type SubscriptionPlanKey = 'starter' | 'pro' | 'enterprise';

export interface CRMCompanyTenant {
  id: string;
  name: string;
  tax_id: string; // NIT / RUC / RFC
  industry: string;
  currency_symbol: string;
  currency_code: string;
  plan: SubscriptionPlanKey;
  plan_status: 'active' | 'trial' | 'past_due' | 'suspended';
  max_users: number;
  max_deals: number;
  features: string[];
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}
