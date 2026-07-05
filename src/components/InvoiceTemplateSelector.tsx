import { CheckCircle } from 'lucide-react';
import type { CarrierSettings, CompanySettings, InvoiceTemplateId } from '../types';
import { InvoiceRenderer } from '../templates/InvoiceRenderer';
import { getPreviewInvoiceProps } from '../templates/invoiceUtils';
import { invoiceTemplateDefinitions, normalizeInvoiceTemplateId } from '../templates/invoiceRegistry';

interface InvoiceTemplateSelectorProps {
  company: CompanySettings;
  carrier: CarrierSettings;
  value?: InvoiceTemplateId;
  onChange: (templateId: InvoiceTemplateId) => void;
}

export function InvoiceTemplateSelector({ company, carrier, value, onChange }: InvoiceTemplateSelectorProps) {
  const selectedId = normalizeInvoiceTemplateId(value);
  const previewProps = getPreviewInvoiceProps(company, carrier);

  return (
    <section className="bg-white rounded-2xl shadow-panel p-6 space-y-5">
      <div className="border-b border-steel/10 pb-3">
        <h2 className="text-base font-bold text-ink">Invoice Template</h2>
      </div>

      <div className="grid gap-2">
        {invoiceTemplateDefinitions.map(template => {
          const selected = template.id === selectedId;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={`w-full text-left border px-4 py-3 rounded-lg transition-colors ${
                selected
                  ? 'border-signal bg-signal/5 text-ink'
                  : 'border-steel/20 hover:border-signal/50 hover:bg-lane/60 text-road'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold">{template.name}</div>
                  <div className="text-xs text-steel mt-1">{template.description}</div>
                </div>
                {selected && <CheckCircle size={18} className="text-signal shrink-0 mt-0.5" />}
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <div className="text-xs font-semibold text-steel uppercase tracking-wide mb-2">Preview</div>
        <div className="border border-steel/15 rounded-lg bg-lane/70 overflow-hidden">
          <div className="overflow-x-auto p-3">
            <div style={{ width: '820px', height: '780px', overflow: 'hidden' }}>
              <div style={{ transform: 'scale(0.72)', transformOrigin: 'top left', width: '820px' }}>
                <InvoiceRenderer
                  templateId={selectedId}
                  loads={previewProps.loads}
                  company={previewProps.company}
                  carrier={previewProps.carrier}
                  invoiceNumber={previewProps.invoiceNumber}
                  invoiceDate={previewProps.invoiceDate}
                  weekLabel={previewProps.weekLabel}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

