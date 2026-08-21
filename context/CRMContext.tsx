'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CRMData,
  Pipeline,
  PipelineStage,
  Deal,
  Contact,
  Company,
  CustomFieldDefinition,
  Activity,
  SystemSettings
} from '@/types/crm';
import {
  Product,
  Quotation,
  ERPInvoice,
  SalesRepLeaderboardItem,
  AutomationRule,
  DealTimelineEvent,
  LeadScoreInfo,
  MessageTemplate,
  BotSequence,
  DealAttachment,
  CRMCompanyTenant
} from '@/types/enterprise';
import { defaultTenants } from '@/lib/multi-tenant-defaults';
import { getDefaultCRMData, loadCRMData, saveCRMData } from '@/lib/crm-store';
import { INDUSTRY_PRESETS } from '@/lib/presets';
import { defaultProducts, defaultAutomationRules, defaultInvoices, defaultSalesReps } from '@/lib/enterprise-defaults';
import { defaultTemplates, defaultBotSequences } from '@/lib/templates-and-bots-defaults';
import { processAutomations } from '@/lib/automation-engine';
import { calculateLeadScore } from '@/lib/lead-scoring';

const LOCAL_STORAGE_KEY = 'crm_adaptable_data_v1';
const ENTERPRISE_STORAGE_KEY = 'crm_enterprise_data_v1';

interface CRMContextType {
  data: CRMData;
  activePipeline: Pipeline | undefined;
  setActivePipelineId: (id: string) => void;
  // Pipelines & Stages
  addPipeline: (name: string, description?: string) => void;
  updatePipeline: (pipeline: Pipeline) => void;
  deletePipeline: (id: string) => void;
  addStage: (pipelineId: string, name: string, color: string, winProbability: number) => void;
  updateStage: (stage: PipelineStage) => void;
  deleteStage: (stageId: string) => void;
  reorderStages: (pipelineId: string, stageIds: string[]) => void;
  // Deals
  addDeal: (deal: Omit<Deal, 'id' | 'created_at'>) => void;
  updateDeal: (deal: Deal) => void;
  moveDealStage: (dealId: string, newStageId: string) => void;
  deleteDeal: (dealId: string) => void;
  // Contacts & Companies
  addContact: (contact: Omit<Contact, 'id' | 'created_at'>) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  addCompany: (company: Omit<Company, 'id' | 'created_at'>) => void;
  updateCompany: (company: Company) => void;
  deleteCompany: (id: string) => void;
  // Custom Fields
  addCustomField: (field: Omit<CustomFieldDefinition, 'id'>) => void;
  deleteCustomField: (id: string) => void;
  // Activities
  addActivity: (activity: Omit<Activity, 'id' | 'created_at'>) => void;
  toggleActivityStatus: (id: string) => void;
  // Enterprise ERP: Products, Quotes & Invoices
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  quotations: Quotation[];
  saveQuotation: (quotation: Omit<Quotation, 'id'> | Quotation) => void;
  invoices: ERPInvoice[];
  createInvoiceFromQuote: (quotation: Quotation) => void;
  updateInvoiceStatus: (id: string, status: ERPInvoice['status']) => void;
  deleteInvoice: (id: string) => void;
  salesReps: SalesRepLeaderboardItem[];
  // Automation Rules & Workflows
  automationRules: AutomationRule[];
  addAutomationRule: (rule: Omit<AutomationRule, 'id'>) => void;
  toggleAutomationRule: (id: string) => void;
  deleteAutomationRule: (id: string) => void;
  // Message Templates & Bot Sequences
  templates: MessageTemplate[];
  addTemplate: (template: Omit<MessageTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  botSequences: BotSequence[];
  addBotSequence: (sequence: Omit<BotSequence, 'id'>) => void;
  toggleBotSequence: (id: string) => void;
  deleteBotSequence: (id: string) => void;
  enrollDealInBot: (dealId: string, sequenceId: string) => void;
  renderTemplateText: (templateText: string, deal: Deal) => string;
  // Timeline Events & Attachments
  attachments: DealAttachment[];
  addAttachment: (att: Omit<DealAttachment, 'id' | 'uploaded_at'>) => void;
  deleteAttachment: (id: string) => void;
  timelineEvents: DealTimelineEvent[];
  addTimelineEvent: (event: Omit<DealTimelineEvent, 'id' | 'timestamp'>) => void;
  getLeadScoreInfo: (deal: Deal) => LeadScoreInfo;
  // Presets & Config
  // Multi-Company Tenants
  tenants: CRMCompanyTenant[];
  activeTenantId: string;
  activeTenant: CRMCompanyTenant;
  switchTenant: (tenantId: string) => void;
  addTenant: (tenant: Omit<CRMCompanyTenant, 'id' | 'created_at'>) => void;
  importContacts: (newContacts: Omit<Contact, 'id' | 'created_at'>[]) => void;
  importDeals: (newDeals: Omit<Deal, 'id' | 'created_at'>[]) => void;
  applyIndustryPreset: (presetId: string) => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  resetToDefaultData: () => void;
  formatCurrency: (amount: number) => string;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CRMData>(getDefaultCRMData);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<ERPInvoice[]>(defaultInvoices);
  const [salesReps, setSalesReps] = useState<SalesRepLeaderboardItem[]>(defaultSalesReps);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(defaultAutomationRules);
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates);
  const [botSequences, setBotSequences] = useState<BotSequence[]>(defaultBotSequences);
  const [timelineEvents, setTimelineEvents] = useState<DealTimelineEvent[]>([]);
  const [attachments, setAttachments] = useState<DealAttachment[]>([]);
  const [tenants, setTenants] = useState<CRMCompanyTenant[]>(defaultTenants);
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant-1');
  const [isMounted, setIsMounted] = useState(false);

  // Sync state from LocalStorage after client mount
  useEffect(() => {
    setIsMounted(true);
    const loadedData = loadCRMData();

    // Sanitize pipeline & stage names from any residual emojis
    const cleanPipelines = loadedData.pipelines.map((p: any) => ({
      ...p,
      name: p.name.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim(),
      stages: p.stages.map((s: any) => ({
        ...s,
        name: s.name.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim()
      }))
    }));
    setData({ ...loadedData, pipelines: cleanPipelines });

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(ENTERPRISE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.products) setProducts(parsed.products);
          if (parsed.quotations) setQuotations(parsed.quotations);
          if (parsed.invoices) setInvoices(parsed.invoices);
          if (parsed.salesReps) setSalesReps(parsed.salesReps);
          if (parsed.automationRules) setAutomationRules(parsed.automationRules);
          if (parsed.templates) {
            setTemplates(parsed.templates.map((t: any) => ({
              ...t,
              name: t.name.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim()
            })));
          }
          if (parsed.botSequences) {
            setBotSequences(parsed.botSequences.map((b: any) => ({
              ...b,
              name: b.name.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim()
            })));
          }
          if (parsed.timelineEvents) setTimelineEvents(parsed.timelineEvents);
          if (parsed.attachments) setAttachments(parsed.attachments);
        }
      } catch (e) {
        console.error('Error loading enterprise state', e);
      }
    }
  }, []);

  // Save Enterprise state
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          ENTERPRISE_STORAGE_KEY,
          JSON.stringify({ products, quotations, invoices, salesReps, automationRules, templates, botSequences, timelineEvents, attachments })
        );
      } catch (e) {
        console.error('Error saving enterprise state', e);
      }
    }
  }, [products, quotations, invoices, salesReps, automationRules, templates, botSequences, timelineEvents, attachments, isMounted]);

  useEffect(() => {
    if (isMounted) {
      saveCRMData(data);
    }
  }, [data, isMounted]);

  const activePipeline = data.pipelines.find((p: Pipeline) => p.id === data.active_pipeline_id) || data.pipelines[0];

  const setActivePipelineId = (id: string) => {
    setData((prev: CRMData) => ({ ...prev, active_pipeline_id: id }));
  };

  // Pipeline Management
  const addPipeline = (name: string, description?: string) => {
    const newId = `pipe-${Date.now()}`;
    const newPipe: Pipeline = {
      id: newId,
      name,
      description,
      is_default: false,
      stages: [
        { id: `stage-${Date.now()}-1`, pipeline_id: newId, name: 'Primer Contacto', color: '#3b82f6', order_index: 0, win_probability: 25 },
        { id: `stage-${Date.now()}-2`, pipeline_id: newId, name: 'Propuesta', color: '#8b5cf6', order_index: 1, win_probability: 60 },
        { id: `stage-${Date.now()}-3`, pipeline_id: newId, name: 'Cerrado Ganado', color: '#10b981', order_index: 2, win_probability: 100 }
      ]
    };

    setData((prev: CRMData) => ({
      ...prev,
      pipelines: [...prev.pipelines, newPipe],
      active_pipeline_id: newId
    }));
  };

  const updatePipeline = (pipeline: Pipeline) => {
    setData((prev: CRMData) => ({
      ...prev,
      pipelines: prev.pipelines.map((p: Pipeline) => (p.id === pipeline.id ? pipeline : p))
    }));
  };

  const deletePipeline = (id: string) => {
    if (data.pipelines.length <= 1) return;
    const remaining = data.pipelines.filter((p: Pipeline) => p.id !== id);
    setData((prev: CRMData) => ({
      ...prev,
      pipelines: remaining,
      active_pipeline_id: remaining[0].id
    }));
  };

  // Stage Management
  const addStage = (pipelineId: string, name: string, color: string, winProbability: number) => {
    setData((prev: CRMData) => {
      const pipelines = prev.pipelines.map((p: Pipeline) => {
        if (p.id !== pipelineId) return p;
        const newStage: PipelineStage = {
          id: `stage-${Date.now()}`,
          pipeline_id: pipelineId,
          name,
          color,
          order_index: p.stages.length,
          win_probability: winProbability
        };
        return {
          ...p,
          stages: [...p.stages, newStage]
        };
      });
      return { ...prev, pipelines };
    });
  };

  const updateStage = (stage: PipelineStage) => {
    setData((prev: CRMData) => {
      const pipelines = prev.pipelines.map((p: Pipeline) => {
        if (p.id !== stage.pipeline_id) return p;
        return {
          ...p,
          stages: p.stages.map((st: PipelineStage) => (st.id === stage.id ? stage : st))
        };
      });
      return { ...prev, pipelines };
    });
  };

  const deleteStage = (stageId: string) => {
    setData((prev: CRMData) => {
      const pipelines = prev.pipelines.map((p: Pipeline) => {
        const hasStage = p.stages.some((st: PipelineStage) => st.id === stageId);
        if (!hasStage) return p;
        const filteredStages = p.stages.filter((st: PipelineStage) => st.id !== stageId);
        return {
          ...p,
          stages: filteredStages.map((st: PipelineStage, idx: number) => ({ ...st, order_index: idx }))
        };
      });
      return { ...prev, pipelines };
    });
  };

  const reorderStages = (pipelineId: string, stageIds: string[]) => {
    setData((prev: CRMData) => {
      const pipelines = prev.pipelines.map((p: Pipeline) => {
        if (p.id !== pipelineId) return p;
        const stageMap = new Map(p.stages.map((st: PipelineStage) => [st.id, st]));
        const reordered = stageIds
          .map((id, idx) => {
            const st = stageMap.get(id);
            return st ? { ...st, order_index: idx } : null;
          })
          .filter(Boolean) as PipelineStage[];

        return { ...p, stages: reordered };
      });
      return { ...prev, pipelines };
    });
  };

  // Deals
  const addDeal = (dealData: Omit<Deal, 'id' | 'created_at'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    // Run Automations
    const autoResult = processAutomations(newDeal, undefined, newDeal.stage_id, automationRules);
    const finalDeal = autoResult.updatedDeal ? { ...newDeal, ...autoResult.updatedDeal } : newDeal;

    setData((prev: CRMData) => ({
      ...prev,
      deals: [finalDeal, ...prev.deals],
      activities: [...autoResult.newTasks.map(t => ({ ...t, id: `act-${Date.now()}-${Math.random()}`, created_at: new Date().toISOString() })), ...prev.activities]
    }));

    if (autoResult.newTimelineEvents.length > 0) {
      setTimelineEvents(prev => [
        ...autoResult.newTimelineEvents.map(e => ({ ...e, id: `tl-${Date.now()}-${Math.random()}` })),
        ...prev
      ]);
    }
  };

  const updateDeal = (deal: Deal) => {
    setData((prev: CRMData) => ({
      ...prev,
      deals: prev.deals.map((d: Deal) => (d.id === deal.id ? deal : d))
    }));
  };

  const moveDealStage = (dealId: string, newStageId: string) => {
    const currentDeal = data.deals.find((d: Deal) => d.id === dealId);
    if (!currentDeal) return;

    const oldStageId = currentDeal.stage_id;
    const oldStage = activePipeline?.stages.find(s => s.id === oldStageId);
    const newStage = activePipeline?.stages.find(s => s.id === newStageId);

    const updated = {
      ...currentDeal,
      stage_id: newStageId,
      updated_at: new Date().toISOString()
    };

    // Run Automations Engine
    const autoResult = processAutomations(updated, oldStageId, newStageId, automationRules);
    const finalDeal = autoResult.updatedDeal ? { ...updated, ...autoResult.updatedDeal } : updated;

    setData((prev: CRMData) => ({
      ...prev,
      deals: prev.deals.map((d: Deal) => (d.id === dealId ? finalDeal : d)),
      activities: [...autoResult.newTasks.map(t => ({ ...t, id: `act-${Date.now()}-${Math.random()}`, created_at: new Date().toISOString() })), ...prev.activities]
    }));

    // Add Timeline Event
    const stageChangeEvent: DealTimelineEvent = {
      id: `tl-${Date.now()}`,
      deal_id: dealId,
      type: 'stage_change',
      title: `Cambio de Etapa: de ${oldStage?.name || 'Anterior'} a ${newStage?.name || 'Nueva'}`,
      timestamp: new Date().toISOString()
    };

    setTimelineEvents(prev => [
      stageChangeEvent,
      ...autoResult.newTimelineEvents.map(e => ({ ...e, id: `tl-${Date.now()}-${Math.random()}` })),
      ...prev
    ]);
  };

  const deleteDeal = (dealId: string) => {
    setData((prev: CRMData) => ({
      ...prev,
      deals: prev.deals.filter((d: Deal) => d.id !== dealId)
    }));
  };

  // Contacts & Companies
  const addContact = (contactData: Omit<Contact, 'id' | 'created_at'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `cont-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setData((prev: CRMData) => ({
      ...prev,
      contacts: [newContact, ...prev.contacts]
    }));
  };

  const updateContact = (contact: Contact) => {
    setData((prev: CRMData) => ({
      ...prev,
      contacts: prev.contacts.map((c: Contact) => (c.id === contact.id ? contact : c))
    }));
  };

  const deleteContact = (id: string) => {
    setData((prev: CRMData) => ({
      ...prev,
      contacts: prev.contacts.filter((c: Contact) => c.id !== id)
    }));
  };

  const addCompany = (companyData: Omit<Company, 'id' | 'created_at'>) => {
    const newCompany: Company = {
      ...companyData,
      id: `comp-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setData((prev: CRMData) => ({
      ...prev,
      companies: [newCompany, ...prev.companies]
    }));
  };

  const updateCompany = (company: Company) => {
    setData((prev: CRMData) => ({
      ...prev,
      companies: prev.companies.map((c: Company) => (c.id === company.id ? company : c))
    }));
  };

  const deleteCompany = (id: string) => {
    setData((prev: CRMData) => ({
      ...prev,
      companies: prev.companies.filter((c: Company) => c.id !== id)
    }));
  };

  // Custom Fields
  const addCustomField = (fieldData: Omit<CustomFieldDefinition, 'id'>) => {
    const newField: CustomFieldDefinition = {
      ...fieldData,
      id: `cf-${Date.now()}`
    };
    setData((prev: CRMData) => ({
      ...prev,
      custom_fields: [...prev.custom_fields, newField]
    }));
  };

  const deleteCustomField = (id: string) => {
    setData((prev: CRMData) => ({
      ...prev,
      custom_fields: prev.custom_fields.filter((cf: CustomFieldDefinition) => cf.id !== id)
    }));
  };

  // Activities
  const addActivity = (activityData: Omit<Activity, 'id' | 'created_at'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setData((prev: CRMData) => ({
      ...prev,
      activities: [newActivity, ...prev.activities]
    }));
  };

  const toggleActivityStatus = (id: string) => {
    setData((prev: CRMData) => ({
      ...prev,
      activities: prev.activities.map((a: Activity) =>
        a.id === id ? { ...a, status: a.status === 'completed' ? 'pending' : 'completed' } : a
      )
    }));
  };

  // Enterprise Products & Quotes
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const saveQuotation = (quotationData: Omit<Quotation, 'id'> | Quotation) => {
    if ('id' in quotationData && quotationData.id) {
      setQuotations(prev => prev.map(q => (q.id === quotationData.id ? (quotationData as Quotation) : q)));
    } else {
      const newQuote: Quotation = {
        ...(quotationData as Omit<Quotation, 'id'>),
        id: `quote-${Date.now()}`
      };
      setQuotations(prev => [newQuote, ...prev]);
      
      // Update deal financial value with quotation grand total
      const deal = data.deals.find(d => d.id === newQuote.deal_id);
      if (deal) {
        updateDeal({ ...deal, value: newQuote.grand_total });
      }

      addTimelineEvent({
        deal_id: newQuote.deal_id,
        type: 'quote_generated',
        title: `Cotización Generada: ${newQuote.quote_number}`,
        description: `Monto total: $${newQuote.grand_total.toLocaleString()}`
      });
    }
  };

  // Automation Rules
  const addAutomationRule = (ruleData: Omit<AutomationRule, 'id'>) => {
    const newRule: AutomationRule = {
      ...ruleData,
      id: `rule-${Date.now()}`
    };
    setAutomationRules(prev => [newRule, ...prev]);
  };

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(prev =>
      prev.map(r => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const deleteAutomationRule = (id: string) => {
    setAutomationRules(prev => prev.filter(r => r.id !== id));
  };

  // Timeline Events & Lead Intelligence
  const addTimelineEvent = (eventData: Omit<DealTimelineEvent, 'id' | 'timestamp'>) => {
    const newEvent: DealTimelineEvent = {
      ...eventData,
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setTimelineEvents(prev => [newEvent, ...prev]);
  };

  const getLeadScoreInfo = (deal: Deal): LeadScoreInfo => {
    const contact = data.contacts.find(c => c.id === deal.contact_id);
    const company = data.companies.find(comp => comp.id === deal.company_id);
    const stage = activePipeline?.stages.find(s => s.id === deal.stage_id);
    return calculateLeadScore(deal, contact, company, stage);
  };

  // Industry Preset Application
  const applyIndustryPreset = (presetId: string) => {
    const preset = INDUSTRY_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const newPipeId = `pipe-${Date.now()}`;
    const newPipeline: Pipeline = {
      id: newPipeId,
      name: preset.pipeline_name,
      description: preset.description,
      is_default: true,
      industry_preset: preset.id,
      stages: preset.stages.map((st, idx) => ({
        id: `stage-${Date.now()}-${idx + 1}`,
        pipeline_id: newPipeId,
        name: st.name,
        color: st.color,
        order_index: idx,
        win_probability: st.win_probability
      }))
    };

    const newCustomFields: CustomFieldDefinition[] = preset.custom_fields.map((cf, idx) => ({
      id: `cf-${Date.now()}-${idx + 1}`,
      entity_type: cf.entity_type,
      name: cf.name,
      label: cf.label,
      field_type: cf.field_type,
      options: cf.options || [],
      required: false,
      order_index: idx
    }));

    setData((prev: CRMData) => ({
      ...prev,
      pipelines: [newPipeline, ...prev.pipelines],
      active_pipeline_id: newPipeId,
      custom_fields: [...prev.custom_fields, ...newCustomFields]
    }));
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setData((prev: CRMData) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const resetToDefaultData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(ENTERPRISE_STORAGE_KEY);
    }
    setData(loadCRMData());
    setProducts(defaultProducts);
    setQuotations([]);
    setAutomationRules(defaultAutomationRules);
    setTimelineEvents([]);
  };

  const formatCurrency = (amount: number) => {
    const sym = data.settings.currency_symbol || '$';
    return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const importContacts = (newContacts: Omit<Contact, 'id' | 'created_at'>[]) => {
    const formatted: Contact[] = newContacts.map((c, idx) => ({
      ...c,
      id: `contact-imp-${Date.now()}-${idx}`,
      created_at: new Date().toISOString()
    }));
    setData(prev => ({
      ...prev,
      contacts: [...formatted, ...prev.contacts]
    }));
  };

  const importDeals = (newDeals: Omit<Deal, 'id' | 'created_at'>[]) => {
    const formatted: Deal[] = newDeals.map((d, idx) => ({
      ...d,
      id: `deal-imp-${Date.now()}-${idx}`,
      created_at: new Date().toISOString()
    }));
    setData(prev => ({
      ...prev,
      deals: [...formatted, ...prev.deals]
    }));
  };

  // Templates Management
  const addTemplate = (template: Omit<MessageTemplate, 'id'>) => {
    const newTmpl: MessageTemplate = { ...template, id: `tmpl-${Date.now()}` };
    setTemplates(prev => [newTmpl, ...prev]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Bot Sequences Management
  const addBotSequence = (sequence: Omit<BotSequence, 'id'>) => {
    const newSeq: BotSequence = { ...sequence, id: `bot-seq-${Date.now()}` };
    setBotSequences(prev => [newSeq, ...prev]);
  };

  const toggleBotSequence = (id: string) => {
    setBotSequences(prev =>
      prev.map(s => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const deleteBotSequence = (id: string) => {
    setBotSequences(prev => prev.filter(s => s.id !== id));
  };

  const enrollDealInBot = (dealId: string, sequenceId: string) => {
    const seq = botSequences.find(s => s.id === sequenceId);
    const deal = data.deals.find(d => d.id === dealId);
    if (!seq || !deal) return;

    setBotSequences(prev =>
      prev.map(s => (s.id === sequenceId ? { ...s, enrolled_deals_count: s.enrolled_deals_count + 1 } : s))
    );

    addTimelineEvent({
      deal_id: dealId,
      type: 'bot_sequence_started',
      title: `Enrolado en Bot: ${seq.name}`,
      description: `Secuencia de ${seq.steps.length} pasos iniciada para el cliente.`
    });
  };

  const renderTemplateText = (text: string, deal: Deal): string => {
    return text
      .replace(/{{contact_name}}/g, deal.contact_name || 'Cliente')
      .replace(/{{company_name}}/g, deal.company_name || 'su empresa')
      .replace(/{{deal_title}}/g, deal.title)
      .replace(/{{deal_value}}/g, formatCurrency(deal.value));
  };

  // ERP Invoicing & Stock Management
  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, stock_quantity: Math.max(0, newStock) } : p)));
  };

  const createInvoiceFromQuote = (quote: Quotation) => {
    const newInv: ERPInvoice = {
      id: `inv-${Date.now()}`,
      invoice_number: `FEL-2026-${Math.floor(100 + Math.random() * 900)}`,
      deal_id: quote.deal_id,
      deal_title: quote.deal_title,
      customer_name: quote.customer_name,
      customer_company: quote.customer_company,
      date_issued: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      line_items: quote.line_items,
      subtotal: quote.subtotal,
      tax_total: quote.tax_total,
      grand_total: quote.grand_total,
      status: 'pending',
      payment_method: 'transfer'
    };

    setInvoices(prev => [newInv, ...prev]);

    addTimelineEvent({
      deal_id: quote.deal_id,
      type: 'invoice_generated',
      title: `Factura Emitida: ${newInv.invoice_number}`,
      description: `Monto total: ${formatCurrency(quote.grand_total)} (Estado: Pendiente de Pago).`
    });
  };

  const updateInvoiceStatus = (id: string, status: ERPInvoice['status']) => {
    setInvoices(prev => prev.map(inv => (inv.id === id ? { ...inv, status } : inv)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const addAttachment = (att: Omit<DealAttachment, 'id' | 'uploaded_at'>) => {
    const newAtt: DealAttachment = {
      ...att,
      id: `att-${Date.now()}`,
      uploaded_at: new Date().toISOString()
    };

    setAttachments(prev => [newAtt, ...prev]);

    // Also log in timeline
    addTimelineEvent({
      deal_id: att.deal_id,
      type: 'field_updated',
      title: `Archivo adjuntado: ${att.file_name}`,
      description: `Tamaño: ${(att.file_size / 1024).toFixed(1)} KB`
    });
  };

  const deleteAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const activeTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];

  const switchTenant = (tenantId: string) => {
    const target = tenants.find(t => t.id === tenantId);
    if (!target) return;
    setActiveTenantId(tenantId);
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        company_name: target.name,
        currency_symbol: target.currency_symbol,
        currency_code: target.currency_code
      }
    }));
  };

  const addTenant = (tenant: Omit<CRMCompanyTenant, 'id' | 'created_at'>) => {
    const newTenant: CRMCompanyTenant = {
      ...tenant,
      id: `tenant-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setTenants(prev => [...prev, newTenant]);
    switchTenant(newTenant.id);
  };

  return (
    <CRMContext.Provider
      value={{
        data,
        activePipeline,
        setActivePipelineId,
        addPipeline,
        updatePipeline,
        deletePipeline,
        addStage,
        updateStage,
        deleteStage,
        reorderStages,
        addDeal,
        updateDeal,
        moveDealStage,
        deleteDeal,
        addContact,
        updateContact,
        deleteContact,
        addCompany,
        updateCompany,
        deleteCompany,
        addCustomField,
        deleteCustomField,
        addActivity,
        toggleActivityStatus,
        products,
        addProduct,
        deleteProduct,
        updateProductStock,
        quotations,
        saveQuotation,
        invoices,
        createInvoiceFromQuote,
        updateInvoiceStatus,
        deleteInvoice,
        salesReps,
        automationRules,
        addAutomationRule,
        toggleAutomationRule,
        deleteAutomationRule,
        templates,
        addTemplate,
        deleteTemplate,
        botSequences,
        addBotSequence,
        toggleBotSequence,
        deleteBotSequence,
        enrollDealInBot,
        renderTemplateText,
        timelineEvents,
        addTimelineEvent,
        attachments,
        addAttachment,
        deleteAttachment,
        tenants,
        activeTenantId,
        activeTenant,
        switchTenant,
        addTenant,
        getLeadScoreInfo,
        importContacts,
        importDeals,
        applyIndustryPreset,
        updateSettings,
        resetToDefaultData,
        formatCurrency
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};
