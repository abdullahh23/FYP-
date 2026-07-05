import { Printer } from 'lucide-react';
import { InvoiceRenderer } from '../templates/InvoiceRenderer';
import type { Load, CompanySettings, CarrierSettings } from '../types';

interface InvoicePageProps {
  loads: Load[];
  company: CompanySettings;
  carrier: CarrierSettings;
  invoiceNumber: string;
  invoiceDate: string;
  weekLabel: string;
  onPrint: () => void;
}

export function InvoicePage({ loads, company, carrier, invoiceNumber, invoiceDate, weekLabel, onPrint }: InvoicePageProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
      <div className="no-print">
  <h1 className="text-2xl font-bold text-ink">Invoice Preview</h1>
  <p className="text-steel text-sm mt-1">Review before printing or saving as PDF.</p>
</div>
        <button
          onClick={onPrint}
          className="flex items-center gap-2 bg-signal text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-signal/90 transition-colors no-print"
        >
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-panel overflow-x-auto">
        <InvoiceRenderer
          templateId={company.invoiceTemplateId}
          loads={loads}
          company={company}
          carrier={carrier}
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          weekLabel={weekLabel}
        />
      </div>
    </div>
  );
}
