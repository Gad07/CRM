import { IndustryPreset } from '@/types/crm';

export const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: 'real-estate',
    name: 'Inmobiliaria & Bienes Raíces',
    description: 'Diseñado para agentes e inmobiliarias: captación de propiedades, visitas, créditos hipotecarios y escrituración.',
    icon: 'Building2',
    pipeline_name: 'Embudo Inmobiliario',
    stages: [
      { name: 'Captación de Lead', color: '#3b82f6', win_probability: 20 },
      { name: 'Visita Programada', color: '#06b6d4', win_probability: 40 },
      { name: 'Oferta / Reserva', color: '#eab308', win_probability: 60 },
      { name: 'Estudio de Crédito', color: '#a855f7', win_probability: 80 },
      { name: 'Escrituración y Entrega', color: '#10b981', win_probability: 100 }
    ],
    custom_fields: [
      { entity_type: 'deal', name: 'property_type', label: 'Tipo de Inmueble', field_type: 'select', options: ['Apartamento', 'Casa', 'Terreno', 'Oficina / Local', 'Bodega'] },
      { entity_type: 'deal', name: 'area_sqm', label: 'Superficie (m²)', field_type: 'number' },
      { entity_type: 'deal', name: 'bedrooms', label: 'N° de Habitaciones', field_type: 'number' },
      { entity_type: 'deal', name: 'location_zone', label: 'Zona / Ubicación', field_type: 'text' },
      { entity_type: 'contact', name: 'financing_type', label: 'Tipo de Financiamiento', field_type: 'select', options: ['Contado', 'Crédito Hipotecario', 'FHA / Subsidio', 'Mixto'] }
    ]
  },
  {
    id: 'b2b-saas',
    name: 'Ventas B2B & Software SaaS',
    description: 'Ideal para empresas de tecnología: prospectos, demos, evaluaciones técnicas y contratos corporativos.',
    icon: 'Laptop',
    pipeline_name: 'Pipeline B2B Enterprise',
    stages: [
      { name: 'Prospecto Calificado (MQL)', color: '#6366f1', win_probability: 15 },
      { name: 'Demo Realizada (SQL)', color: '#0284c7', win_probability: 35 },
      { name: 'Evaluación Técnica / POC', color: '#8b5cf6', win_probability: 55 },
      { name: 'Propuesta / Cotización', color: '#f59e0b', win_probability: 75 },
      { name: 'Negociación Legal', color: '#ec4899', win_probability: 90 },
      { name: 'Cerrado Ganado', color: '#10b981', win_probability: 100 }
    ],
    custom_fields: [
      { entity_type: 'deal', name: 'mrr_value', label: 'Ingreso Mensual (MRR)', field_type: 'number' },
      { entity_type: 'deal', name: 'seat_count', label: 'Número de Licencias/Usuarios', field_type: 'number' },
      { entity_type: 'deal', name: 'tech_stack', label: 'Stack / ERP Actual', field_type: 'text' },
      { entity_type: 'company', name: 'employee_range', label: 'Rango de Empleados', field_type: 'select', options: ['1-10', '11-50', '51-200', '201-500', '500+'] }
    ]
  },
  {
    id: 'services-agency',
    name: 'Agencias & Servicios Profesionales',
    description: 'Para agencias de marketing, consultoras, abogados y contadores: briefing, cotización y contratos.',
    icon: 'Briefcase',
    pipeline_name: 'Flujo de Proyectos y Clientes',
    stages: [
      { name: 'Solicitud Recibida', color: '#64748b', win_probability: 20 },
      { name: 'Sesión de Briefing / Discovery', color: '#3b82f6', win_probability: 40 },
      { name: 'Propuesta de Servicio', color: '#8b5cf6', win_probability: 60 },
      { name: 'Ajuste de Alcance y Precio', color: '#f59e0b', win_probability: 80 },
      { name: 'Firma de Contrato / Anticipo', color: '#10b981', win_probability: 100 }
    ],
    custom_fields: [
      { entity_type: 'deal', name: 'service_category', label: 'Categoría de Servicio', field_type: 'select', options: ['Marketing Digital', 'Desarrollo Web/App', 'Consultoría Estratégica', 'Diseño / Branding', 'Auditoría'] },
      { entity_type: 'deal', name: 'estimated_hours', label: 'Horas Estimadas', field_type: 'number' },
      { entity_type: 'deal', name: 'delivery_deadline', label: 'Fecha Límite Estimada', field_type: 'date' }
    ]
  },
  {
    id: 'recruiting-hr',
    name: 'Reclutamiento & Recursos Humanos',
    description: 'Adaptado a headhunters y departamentos de RRHH: entrevistas, evaluaciones y ofertas laborales.',
    icon: 'Users',
    pipeline_name: 'Embudo de Selección de Talentos',
    stages: [
      { name: 'Candidatos Postulados', color: '#3b82f6', win_probability: 10 },
      { name: 'Filtro Inicial / Screening', color: '#06b6d4', win_probability: 30 },
      { name: 'Entrevista Técnica / Prueba', color: '#8b5cf6', win_probability: 60 },
      { name: 'Oferta Laboral Presentada', color: '#f59e0b', win_probability: 85 },
      { name: 'Contratado / Onboarding', color: '#10b981', win_probability: 100 }
    ],
    custom_fields: [
      { entity_type: 'deal', name: 'salary_expectation', label: 'Pretensión Salarial Mensual', field_type: 'number' },
      { entity_type: 'deal', name: 'years_experience', label: 'Años de Experiencia', field_type: 'number' },
      { entity_type: 'contact', name: 'english_level', label: 'Nivel de Inglés', field_type: 'select', options: ['Básico (A1-A2)', 'Intermedio (B1-B2)', 'Avanzado / Bilingüe (C1-C2)'] }
    ]
  },
  {
    id: 'auto-dealership',
    name: 'Vehículos & Concesionarios',
    description: 'Para venta de autos, motos y maquinarias: cotizaciones, test drives y créditos automotrices.',
    icon: 'Car',
    pipeline_name: 'Embudo Automotriz',
    stages: [
      { name: 'Interesado / Prospecto', color: '#3b82f6', win_probability: 15 },
      { name: 'Prueba de Manejo (Test Drive)', color: '#06b6d4', win_probability: 45 },
      { name: 'Solicitud de Crédito Auto', color: '#a855f7', win_probability: 70 },
      { name: 'Aprobación & Facturación', color: '#f59e0b', win_probability: 90 },
      { name: 'Vehículo Entregado', color: '#10b981', win_probability: 100 }
    ],
    custom_fields: [
      { entity_type: 'deal', name: 'vehicle_model', label: 'Modelo / Marca de Interés', field_type: 'text' },
      { entity_type: 'deal', name: 'vehicle_year', label: 'Año del Modelo', field_type: 'number' },
      { entity_type: 'deal', name: 'trade_in_vehicle', label: '¿Deja auto a cambio?', field_type: 'boolean' }
    ]
  }
];
