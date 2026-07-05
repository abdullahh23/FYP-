import type { ReactNode } from 'react';
import type { InvoiceTemplateProps } from './invoiceTypes';
import { calcTotals, formatCurrency } from '../lib/calc';
import { getPaymentMethod } from './invoiceUtils';
import { CarrierLines, CompanyLines, EmptyLoadsRow, SectionLabel, rootBaseStyle, standardLoadCells } from './templateShared';

const INK = '#151923';
const MUTED = '#697386';
const CHAMPAGNE = '#b68b45';
const SOFT = '#f7f3ed';
const LINE = '#e5ded2';

export function ExecutivePremiumTemplate({ loads, company, carrier, invoiceNumber, invoiceDate, weekLabel }: InvoiceTemplateProps) {
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, company.dispatchPercentage);
  const paymentMethod = getPaymentMethod(company);

  return (
    <div
      id="invoice-root"
      style={{
        ...rootBaseStyle,
        padding: '46px 48px',
        fontFamily: "'Aptos', 'Segoe UI', Arial, sans-serif",
        fontSize: '12px',
        background: '#fffdf9',
      }}
    >
      <header style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: '28px', alignItems: 'stretch' }}>
        <div style={{ borderBottom: `4px solid ${CHAMPAGNE}`, paddingBottom: '22px' }}>
          <div style={{ fontSize: '12px', color: CHAMPAGNE, letterSpacing: '2.4px', textTransform: 'uppercase', fontWeight: 900 }}>Executive Premium</div>
          <div style={{ fontSize: '34px', lineHeight: 1.05, color: INK, fontWeight: 900, marginTop: '8px' }}>Dispatch Fee Invoice</div>
          <div style={{ color: MUTED, marginTop: '12px', fontSize: '13px' }}>{weekLabel}</div>
        </div>
        <div style={{ background: INK, color: '#ffffff', padding: '20px', display: 'grid', gap: '12px' }}>
          <Meta label="Invoice" value={invoiceNumber} />
          <Meta label="Issued" value={invoiceDate} />
          <Meta label="Due" value={invoiceDate} />
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: '30px' }}>
        <PremiumCard title="Prepared By">
          <CompanyLines company={company} color={MUTED} />
        </PremiumCard>
        <PremiumCard title="Prepared For">
          <CarrierLines carrier={carrier} color={MUTED} />
        </PremiumCard>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.15fr', gap: '14px', marginTop: '22px' }}>
        <AmountCard label="Total Weekly Gross" value={formatCurrency(totalGrossRevenue)} />
        <AmountCard label={`Dispatch Fee ${company.dispatchPercentage}%`} value={formatCurrency(dispatchFee)} />
        <AmountCard label="Balance Due" value={formatCurrency(dispatchFee)} dark />
      </section>

      <section style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '10px' }}>
          <SectionLabel color={CHAMPAGNE}>Revenue Detail</SectionLabel>
          <div style={{ color: MUTED, fontSize: '11px' }}>{loads.length} {loads.length === 1 ? 'load' : 'loads'}</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '12px', overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={headCell}>Load</th>
              <th style={headCell}>Broker</th>
              <th style={headCell}>Pickup</th>
              <th style={headCell}>Lane</th>
              <th style={{ ...headCell, textAlign: 'right' }}>Gross</th>
            </tr>
          </thead>
          <tbody>
            {loads.length === 0 ? <EmptyLoadsRow colSpan={5} borderColor={LINE} /> : loads.map(load => {
              const cells = standardLoadCells(load);
              return (
                <tr key={load.id}>
                  <td style={bodyStrong}>{cells.number}</td>
                  <td style={bodyCell}>{cells.broker}</td>
                  <td style={bodyCell}>{cells.pickupDate}</td>
                  <td style={bodyCell}>{cells.route}</td>
                  <td style={{ ...bodyStrong, textAlign: 'right' }}>{cells.amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginTop: '28px', alignItems: 'start' }}>
        <div style={{ background: SOFT, border: `1px solid ${LINE}`, padding: '16px 18px', lineHeight: 1.6 }}>
          <SectionLabel color={CHAMPAGNE}>Payment Notes</SectionLabel>
          <div style={{ color: MUTED }}>{paymentMethod || 'Payment information on file.'}</div>
        </div>
        <div style={{ borderTop: `3px solid ${CHAMPAGNE}` }}>
          <SummaryLine label="Gross Revenue" value={formatCurrency(totalGrossRevenue)} />
          <SummaryLine label="Dispatch Fee" value={formatCurrency(dispatchFee)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: INK, color: '#ffffff', padding: '15px 16px', fontWeight: 900 }}>
            <span>Total Due</span>
            <span style={{ color: '#f4d59e', fontSize: '17px' }}>{formatCurrency(dispatchFee)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

const headCell = {
  background: SOFT,
  color: INK,
  padding: '11px 12px',
  textAlign: 'left' as const,
  borderTop: `1px solid ${LINE}`,
  borderBottom: `1px solid ${LINE}`,
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.8px',
};

const bodyCell = { padding: '11px 12px', borderBottom: `1px solid ${LINE}`, color: MUTED };
const bodyStrong = { ...bodyCell, color: INK, fontWeight: 800 };

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '9px', color: '#b8c0cc', textTransform: 'uppercase', letterSpacing: '1.2px' }}>{label}</div>
      <div style={{ fontWeight: 800, marginTop: '2px' }}>{value}</div>
    </div>
  );
}

function PremiumCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, background: '#ffffff', padding: '18px', lineHeight: 1.65 }}>
      <SectionLabel color={CHAMPAGNE}>{title}</SectionLabel>
      {children}
    </div>
  );
}

function AmountCard({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div style={{ background: dark ? INK : '#ffffff', color: dark ? '#ffffff' : INK, border: `1px solid ${dark ? INK : LINE}`, padding: '18px' }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: dark ? '#f4d59e' : MUTED, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 900, marginTop: '7px' }}>{value}</div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${LINE}`, background: '#ffffff' }}>
      <span style={{ color: MUTED }}>{label}</span>
      <strong style={{ color: INK }}>{value}</strong>
    </div>
  );
}
