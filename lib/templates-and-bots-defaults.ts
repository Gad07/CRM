import { MessageTemplate, BotSequence } from '@/types/enterprise';

export const defaultTemplates: MessageTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Presentación de Cotización Formal',
    category: 'proposal',
    channel: 'both',
    subject: 'Propuesta Comercial y Cotización Oficial - {{deal_title}}',
    body: 'Hola {{contact_name}},\n\nEs un gusto saludarte. Adjunto a este mensaje encontrarás la cotización oficial para {{company_name}} por un total de {{deal_value}} correspondiente al proyecto "{{deal_title}}".\n\nQuedo atento a tus comentarios para resolver cualquier inquietud y agilizar la puesta en marcha.\n\nSaludos cordiales,'
  },
  {
    id: 'tmpl-2',
    name: 'Seguimiento 48 Horas Post-Cotización',
    category: 'followup',
    channel: 'whatsapp',
    subject: 'Seguimiento a Cotización',
    body: 'Hola {{contact_name}}, te escribo para darle seguimiento a la propuesta de {{deal_title}} que enviamos hace unos días.\n\n¿Pudiste revisarla con el equipo de {{company_name}}? Avísame si deseas ajustar algún punto o agendar una breve llamada. Saludos.'
  },
  {
    id: 'tmpl-3',
    name: 'Descuento de Cierre Inmediato (Pronto Pago)',
    category: 'closing',
    channel: 'both',
    subject: 'Condición Especial de Cierre: {{deal_title}}',
    body: 'Estimado/a {{contact_name}},\n\nAnalizando las prioridades de {{company_name}}, hemos habilitado un beneficio exclusivo para concretar nuestro acuerdo por {{deal_value}} este mes.\n\nSi cerramos el contrato esta semana, podemos incluir soporte prioritario durante los primeros 3 meses totalmente sin costo.\n\n¿Agendamos la firma para mañana?'
  },
  {
    id: 'tmpl-4',
    name: 'Re-Enganche de Oportunidad Inactiva',
    category: 'reengagement',
    channel: 'whatsapp',
    subject: '¿Aún están interesados en el proyecto?',
    body: 'Hola {{contact_name}}, espero que estés muy bien.\n\nHace un tiempo conversamos sobre "{{deal_title}}". Quería validar si este proyecto sigue activo para {{company_name}} este trimestre o si prefieres que agendemos para más adelante.\n\nQuedo a la orden.'
  },
  {
    id: 'tmpl-5',
    name: 'Bienvenida y Asignación de Ejecutivo',
    category: 'welcome',
    channel: 'email',
    subject: 'Bienvenido a {{company_name}}! Tu proyecto {{deal_title}} ha sido asignado',
    body: 'Hola {{contact_name}},\n\nGracias por tu interés en nuestros servicios.\n\nConfirmamos la recepción de tu solicitud para "{{deal_title}}". Tu asesor asignado estará en contacto contigo en breve para evaluar los requerimientos exactos.\n\nGracias por confiar en nosotros.'
  }
];

export const defaultBotSequences: BotSequence[] = [
  {
    id: 'bot-seq-1',
    name: 'Secuencia Automática Nutrición de Lead Novo (3 Pasos)',
    description: 'Envia WhatsApp el día 1, correo de seguimiento el día 3 y alerta de re-activación el día 7.',
    channel: 'omnichannel',
    is_active: true,
    trigger_event: 'on_deal_created',
    enrolled_deals_count: 5,
    steps: [
      {
        id: 'step-1',
        delay_days: 1,
        channel: 'whatsapp',
        template_id: 'tmpl-2',
        message_body: 'Hola {{contact_name}}, gracias por contactarnos sobre {{deal_title}}. ¿Cuándo tendrías tiempo para conversar?'
      },
      {
        id: 'step-2',
        delay_days: 3,
        channel: 'email',
        template_id: 'tmpl-1',
        subject: 'Información y Caso de Éxito - {{deal_title}}',
        message_body: 'Hola {{contact_name}}, te compartimos detalles de cómo hemos ayudado a empresas como {{company_name}} a escalar sus resultados.'
      },
      {
        id: 'step-3',
        delay_days: 7,
        channel: 'whatsapp',
        template_id: 'tmpl-4',
        message_body: 'Hola {{contact_name}}, ¿aún siguen interesados en avanzar con {{deal_title}}?'
      }
    ]
  },
  {
    id: 'bot-seq-2',
    name: 'Bot Acelerador de Cierre de Ofertas VIP',
    description: 'Disparador automático al enviar cotización de alto valor (> $25,000).',
    channel: 'email',
    is_active: true,
    trigger_event: 'on_stage_entered',
    enrolled_deals_count: 2,
    steps: [
      {
        id: 'step-b2-1',
        delay_days: 2,
        channel: 'email',
        template_id: 'tmpl-3',
        subject: 'Seguimiento a Propuesta VIP - {{deal_title}}',
        message_body: 'Estimado {{contact_name}}, confirmamos el seguimiento de la propuesta para {{company_name}}.'
      }
    ]
  }
];
