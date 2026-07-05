import type { CarrierSettings, CompanySettings, Load } from '../types';
import type { InvoiceTemplateProps } from './invoiceTypes';

export const INVOICE_WIDTH = '820px';

export function getRoute(load: Load, fallback = '-'): string {
  if (load.originCity && load.destinationCity) {
    return `${load.originCity}, ${load.originState} -> ${load.destinationCity}, ${load.destinationState}`;
  }
  return fallback;
}

export function getWeekEndingLabel(weekLabel: string): string {
  return weekLabel.replace('Week of ', 'W/E ').split('–')[1]?.trim() ?? weekLabel;
}

export function getPaymentMethod(company: CompanySettings): string {
  if (company.zelle) return `Payment via Zelle: ${company.zelle}`;
  if (company.payoneer) return `Payment via Payoneer: ${company.payoneer}`;
  if (company.bankInformation) return `Bank Transfer: ${company.bankInformation}`;
  return company.paymentInstructions || '';
}

export function getCompanyName(company: CompanySettings): string {
  return company.companyName || 'Your Company';
}

export function getCarrierName(carrier: CarrierSettings): string {
  return carrier.carrierName || '-';
}

export function getPreviewInvoiceProps(
  company: CompanySettings,
  carrier: CarrierSettings
): InvoiceTemplateProps {
  return {
    company,
    carrier,
    invoiceNumber: 'INV-20260614-128',
    invoiceDate: '06/14/2026',
    weekLabel: 'Week of 06/08/2026 – 06/14/2026',
    loads: [
      {
        id: 'preview-1',
        loadNumber: 'LT-48291',
        brokerName: 'Summit Freight Partners',
        pickupDate: '2026-06-09',
        grossAmount: 2650,
        originCity: 'Chicago',
        originState: 'IL',
        destinationCity: 'Dallas',
        destinationState: 'TX',
      },
      {
        id: 'preview-2',
        loadNumber: 'LT-48308',
        brokerName: 'Northline Logistics',
        pickupDate: '2026-06-12',
        grossAmount: 3125,
        originCity: 'Memphis',
        originState: 'TN',
        destinationCity: 'Phoenix',
        destinationState: 'AZ',
      },
    ],
  };
}

