import { Deal, Activity } from '@/types/crm';
import { AutomationRule, DealTimelineEvent } from '@/types/enterprise';

export interface AutomationResult {
  updatedDeal?: Partial<Deal>;
  newTasks: Omit<Activity, 'id' | 'created_at'>[];
  newTimelineEvents: Omit<DealTimelineEvent, 'id'>[];
  triggeredRuleNames: string[];
}

export function processAutomations(
  deal: Deal,
  previousStageId: string | undefined,
  targetStageId: string,
  rules: AutomationRule[]
): AutomationResult {
  const result: AutomationResult = {
    newTasks: [],
    newTimelineEvents: [],
    triggeredRuleNames: []
  };

  const updatedDeal: Partial<Deal> = {};
  const activeRules = rules.filter(r => r.is_active);

  for (const rule of activeRules) {
    let triggered = false;

    // Trigger Evaluation
    if (rule.trigger_type === 'stage_changed') {
      if (previousStageId !== targetStageId) {
        if (!rule.trigger_stage_id || rule.trigger_stage_id === targetStageId) {
          triggered = true;
        }
      }
    } else if (rule.trigger_type === 'value_exceeded') {
      if (rule.trigger_min_value && deal.value >= rule.trigger_min_value) {
        triggered = true;
      }
    } else if (rule.trigger_type === 'priority_assigned') {
      if (rule.trigger_priority && deal.priority === rule.trigger_priority) {
        triggered = true;
      }
    } else if (rule.trigger_type === 'deal_created') {
      triggered = true;
    }

    if (triggered) {
      result.triggeredRuleNames.push(rule.name);

      // Execute Action
      if (rule.action_type === 'create_task' && rule.action_task_title) {
        result.newTasks.push({
          deal_id: deal.id,
          deal_title: deal.title,
          title: `🤖 [Auto-Workflow] ${rule.action_task_title}`,
          type: rule.action_task_type || 'task',
          status: 'pending',
          due_date: new Date(Date.now() + 24 * 3600000).toISOString(),
          notes: `Generado automáticamente por regla de automatización: "${rule.name}"`
        });
      } else if (rule.action_type === 'change_priority' && rule.action_new_priority) {
        updatedDeal.priority = rule.action_new_priority;
      } else if (rule.action_type === 'add_tag' && rule.action_tag_name) {
        const currentTags = updatedDeal.tags || deal.tags;
        if (!currentTags.includes(rule.action_tag_name)) {
          updatedDeal.tags = [...currentTags, rule.action_tag_name];
        }
      }

      result.newTimelineEvents.push({
        deal_id: deal.id,
        type: 'stage_change',
        title: `Ejecución de Automatización: ${rule.name}`,
        description: `Regla disparada automáticamente por evento en el negocio.`,
        timestamp: new Date().toISOString()
      });
    }
  }

  if (Object.keys(updatedDeal).length > 0) {
    result.updatedDeal = updatedDeal;
  }

  return result;
}
