import { useEffect, useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import type { CompanySettings, CarrierSettings } from '../types';
import { InvoiceTemplateSelector } from '../components/InvoiceTemplateSelector';
import { normalizeInvoiceTemplateId } from '../templates/invoiceRegistry';

interface SettingsPageProps {
  company: CompanySettings;
  carrier: CarrierSettings;
  onSave: (company: CompanySettings, carrier: CarrierSettings) => void | Promise<void>;
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-steel uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-steel/25 rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-steel uppercase tracking-wide mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full border border-steel/25 rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal resize-none"
      />
    </div>
  );
}

export function SettingsPage({ company, carrier, onSave }: SettingsPageProps) {
  const [comp, setComp] = useState<CompanySettings>(company);
  const [carr, setCarr] = useState<CarrierSettings>(carrier);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setComp(company);
  }, [company]);

  useEffect(() => {
    setCarr(carrier);
  }, [carrier]);

  const handleSave = async () => {
    await onSave(comp, carr);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const setC = (k: keyof CompanySettings) => (v: string) => setComp(prev => ({ ...prev, [k]: k === 'dispatchPercentage' ? Number(v) : v }));
  const setK = (k: keyof CarrierSettings) => (v: string) => setCarr(prev => ({ ...prev, [k]: v }));

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-steel text-sm mt-1">Configure your dispatch company details, carrier defaults, and payment info.</p>
      </div>

      {/* Company */}
      <section className="bg-white rounded-2xl shadow-panel p-6 space-y-4">
        <h2 className="text-base font-bold text-ink border-b border-steel/10 pb-3">Dispatch Company</h2>
        <Field label="Company Name" value={comp.companyName} onChange={setC('companyName')} placeholder="Your Dispatch Co." />
        <Field label="Company Address" value={comp.companyAddress} onChange={setC('companyAddress')} placeholder="123 Main St, City, State ZIP" />
        <Field label="Phone" value={comp.companyPhone} onChange={setC('companyPhone')} placeholder="(555) 000-0000" />
        <Field label="Email" value={comp.companyEmail} onChange={setC('companyEmail')} type="email" placeholder="billing@yourdispatch.com" />
      </section>

      {/* Carrier Defaults */}
      <section className="bg-white rounded-2xl shadow-panel p-6 space-y-4">
        <h2 className="text-base font-bold text-ink border-b border-steel/10 pb-3">Carrier Information</h2>
        <p className="text-xs text-steel -mt-2">These are manually entered — never pulled from rate confirmations.</p>
        <Field label="Carrier Name" value={carr.carrierName} onChange={setK('carrierName')} placeholder="Carrier LLC" />
        <Field label="Carrier Address" value={carr.carrierAddress} onChange={setK('carrierAddress')} placeholder="456 Freight Rd, City, State ZIP" />
        <Field label="MC Number" value={carr.mcNumber} onChange={setK('mcNumber')} placeholder="MC-000000" />
        <Field label="Carrier Phone" value={carr.carrierPhone} onChange={setK('carrierPhone')} placeholder="(555) 111-2222" />
      </section>

      {/* Dispatch Percentage */}
      <section className="bg-white rounded-2xl shadow-panel p-6 space-y-4">
        <h2 className="text-base font-bold text-ink border-b border-steel/10 pb-3">Dispatch Percentage</h2>
        <div>
          <label className="block text-xs font-semibold text-steel uppercase tracking-wide mb-1">Dispatch Fee %</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={50}
              step={0.5}
              value={comp.dispatchPercentage}
              onChange={e => setComp(prev => ({ ...prev, dispatchPercentage: Number(e.target.value) }))}
              className="w-24 border border-steel/25 rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal"
            />
            <span className="text-steel text-sm">% of Total Gross Revenue</span>
          </div>
        </div>
      </section>

      {/* Payment */}
      <section className="bg-white rounded-2xl shadow-panel p-6 space-y-4">
        <h2 className="text-base font-bold text-ink border-b border-steel/10 pb-3">Payment Information</h2>
        <TextArea label="Payment Instructions" value={comp.paymentInstructions} onChange={setC('paymentInstructions')} placeholder="Please remit payment within 5 business days." />
        <Field label="Zelle" value={comp.zelle} onChange={setC('zelle')} placeholder="email@example.com or phone" />
        <Field label="Payoneer" value={comp.payoneer} onChange={setC('payoneer')} placeholder="Payoneer account email" />
        <TextArea label="Bank Information" value={comp.bankInformation} onChange={setC('bankInformation')} placeholder="Bank Name, Routing #, Account #" />
      </section>

      <InvoiceTemplateSelector
        company={comp}
        carrier={carr}
        value={normalizeInvoiceTemplateId(comp.invoiceTemplateId)}
        onChange={invoiceTemplateId => setComp(prev => ({ ...prev, invoiceTemplateId }))}
      />

      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-signal text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-signal/90 transition-colors"
        >
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
