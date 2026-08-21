import { CRMCompanyTenant } from '@/types/enterprise';

export const defaultTenants: CRMCompanyTenant[] = [
  {
    id: 'tenant-1',
    name: 'Mi Empresa Adaptable S.A.',
    tax_id: 'NIT 1029384-5',
    industry: 'Inmobiliaria & Desarrollo',
    currency_symbol: '$',
    currency_code: 'USD',
    address: 'Zona 10, Ciudad de Guatemala',
    phone: '+502 2200 4400',
    email: 'contacto@adaptablecrm.com',
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 'tenant-2',
    name: 'Grupo Corporativo Alfa',
    tax_id: 'NIT 9876543-2',
    industry: 'Finanzas & Inversiones',
    currency_symbol: '$',
    currency_code: 'USD',
    address: 'Av. Reforma 12-01, Nivel 15',
    phone: '+502 2300 8800',
    email: 'info@grupoalfa.com',
    is_active: true,
    created_at: '2026-01-15'
  },
  {
    id: 'tenant-3',
    name: 'Tech Solutions Latam',
    tax_id: 'NIT 4567891-0',
    industry: 'Software & Consultoría B2B',
    currency_symbol: '$',
    currency_code: 'USD',
    address: 'Blvd. Los Próceres 24-69',
    phone: '+502 2400 9900',
    email: 'soporte@techlatam.com',
    is_active: true,
    created_at: '2026-02-01'
  }
];
