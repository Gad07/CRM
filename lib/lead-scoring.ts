import { Deal, Contact, Company, PipelineStage } from '@/types/crm';
import { LeadScoreInfo } from '@/types/enterprise';

export function calculateLeadScore(
  deal: Deal,
  contact?: Contact,
  company?: Company,
  stage?: PipelineStage
): LeadScoreInfo {
  let score = 0;
  const reasons: string[] = [];

  // Financial Value Scoring
  if (deal.value >= 100000) {
    score += 30;
    reasons.push('Alto valor financiero (> $100k)');
  } else if (deal.value >= 25000) {
    score += 20;
    reasons.push('Valor financiero significativo (> $25k)');
  } else if (deal.value > 0) {
    score += 10;
  }

  // Priority Scoring
  if (deal.priority === 'urgent') {
    score += 20;
    reasons.push('Prioridad declarada como URGENTE');
  } else if (deal.priority === 'high') {
    score += 15;
    reasons.push('Prioridad ALTA');
  }

  // Contact Completeness
  if (contact) {
    score += 15;
    if (contact.email && contact.phone) {
      score += 10;
      reasons.push('Contacto con correo y teléfono verificados');
    }
  }

  // Company Completeness
  if (company || deal.company_name) {
    score += 10;
    reasons.push('Empresa corporativa vinculada');
  }

  // Stage Win Probability
  if (stage) {
    if (stage.win_probability >= 75) {
      score += 15;
      reasons.push(`Etapa avanzada (${stage.win_probability}% éxito)`);
    } else if (stage.win_probability >= 50) {
      score += 10;
    }
  }

  const finalScore = Math.min(100, Math.max(0, score));

  let rating: 'hot' | 'warm' | 'cold' = 'cold';
  if (finalScore >= 65) {
    rating = 'hot';
  } else if (finalScore >= 35) {
    rating = 'warm';
  }

  return {
    score: finalScore,
    rating,
    reasons
  };
}
