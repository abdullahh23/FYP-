import type { CarrierSettings, CompanySettings, InvoiceTemplateId, Load } from '../types';

export interface InvoiceTemplateProps {
  loads: Load[];
  company: CompanySettings;
  carrier: CarrierSettings;
  invoiceNumber: string;
  invoiceDate: string;
  weekLabel: string;
}

export interface InvoiceTemplateDefinition {
  id: InvoiceTemplateId;
  name: string;
  shortName: string;
  description: string;
}

