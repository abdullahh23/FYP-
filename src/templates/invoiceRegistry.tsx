import type { ComponentType } from 'react';
import type { InvoiceTemplateId } from '../types';
import { CorporateBlackWhiteTemplate } from './CorporateBlackWhiteTemplate';
import { ExecutivePremiumTemplate } from './ExecutivePremiumTemplate';
import { FleetOperationsTemplate } from './FleetOperationsTemplate';
import { FreightLogisticsTemplate } from './FreightLogisticsTemplate';
import { InvoiceTemplate as BlueProfessionalTemplate } from './InvoiceTemplate';
import type { InvoiceTemplateDefinition, InvoiceTemplateProps } from './invoiceTypes';

export const DEFAULT_INVOICE_TEMPLATE_ID: InvoiceTemplateId = 'blue-professional';

export const invoiceTemplateDefinitions: InvoiceTemplateDefinition[] = [
  {
    id: 'blue-professional',
    name: 'Blue Professional (Existing Template)',
    shortName: 'Blue Professional',
    description: 'Original built-in invoice template.',
  },
  {
    id: 'corporate-black-white',
    name: 'Corporate Black & White',
    shortName: 'Corporate B/W',
    description: 'Minimal accounting style with boxed sections.',
  },
  {
    id: 'freight-logistics',
    name: 'Freight Logistics',
    shortName: 'Freight Logistics',
    description: 'Trucking-focused layout with logistics branding.',
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    shortName: 'Executive Premium',
    description: 'Premium business statement for larger fleets.',
  },
  {
    id: 'fleet-operations',
    name: 'Fleet Operations',
    shortName: 'Fleet Operations',
    description: 'Dispatch operations style with summary cards.',
  },
];

const templateComponents: Record<InvoiceTemplateId, ComponentType<InvoiceTemplateProps>> = {
  'blue-professional': BlueProfessionalTemplate,
  'corporate-black-white': CorporateBlackWhiteTemplate,
  'freight-logistics': FreightLogisticsTemplate,
  'executive-premium': ExecutivePremiumTemplate,
  'fleet-operations': FleetOperationsTemplate,
};

export function normalizeInvoiceTemplateId(templateId?: string): InvoiceTemplateId {
  return invoiceTemplateDefinitions.some(template => template.id === templateId)
    ? (templateId as InvoiceTemplateId)
    : DEFAULT_INVOICE_TEMPLATE_ID;
}

export function getInvoiceTemplateComponent(templateId?: string) {
  return templateComponents[normalizeInvoiceTemplateId(templateId)];
}

