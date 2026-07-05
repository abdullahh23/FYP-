import type { InvoiceTemplateProps } from './invoiceTypes';
import { calcTotals, formatCurrency } from '../lib/calc';
import { getPaymentMethod, getWeekEndingLabel } from './invoiceUtils';
import { CarrierLines, CompanyLines, EmptyLoadsRow, SectionLabel, rootBaseStyle, standardLoadCells } from './templateShared';

export function CorporateBlackWhiteTemplate({ loads, company, carrier, invoiceNumber, invoiceDate, weekLabel }: InvoiceTemplateProps) {
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, company.dispatchPercentage);
  const paymentMethod = getPaymentMethod(company);

  return (
    <div
      id="invoice-root"
      style={{
        ...rootBaseStyle,
        padding: '42px',
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: '12px',
      }}
    >
      <div style={{ background: '#111111', color: '#ffffff', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#d4d4d4' }}>Dispatch Services</div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px' }}>Invoice</div>
        </div>
        <div style={{ textAlign: 'right', lineHeight: 1.7 }}>
          <div><strong>{invoiceNumber}</strong></div>
          <div>{invoiceDate}</div>
          <div>{getWeekEndingLabel(weekLabel)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px', border: '1px solid #111111', borderTop: 'none' }}>
        <div style={{ padding: '18px', borderRight: '1px solid #111111', lineHeight: 1.65 }}>
          <SectionLabel>From</SectionLabel>
          <CompanyLines company={company} />
        </div>
        <div style={{ padding: '18px', borderRight: '1px solid #111111', lineHeight: 1.65 }}>
          <SectionLabel>Bill To</SectionLabel>
          <CarrierLines carrier={carrier} />
        </div>
        <div style={{ padding: '18px', lineHeight: 1.65 }}>
          <SectionLabel>Terms</SectionLabel>
          <div>Due on receipt</div>
          <div>Fee: {company.dispatchPercentage}%</div>
          <div>Loads: {loads.length}</div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '28px', fontSize: '12px' }}>
        <thead>
          <tr>
            {['Load', 'Pickup', 'Broker', 'Route', 'Gross'].map((label, index) => (
              <th key={label} style={{
                padding: '10px 12px',
                textAlign: index === 4 ? 'right' : 'left',
                border: '1px solid #111111',
                background: '#f5f5f5',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.7px',
              }}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loads.length === 0 ? <EmptyLoadsRow colSpan={5} borderColor="#111111" /> : loads.map(load => {
            const cells = standardLoadCells(load);
            return (
              <tr key={load.id}>
                <td style={{ padding: '10px 12px', border: '1px solid #111111', fontWeight: 700 }}>{cells.number}</td>
                <td style={{ padding: '10px 12px', border: '1px solid #111111' }}>{cells.pickupDate}</td>
                <td style={{ padding: '10px 12px', border: '1px solid #111111' }}>{cells.broker}</td>
                <td style={{ padding: '10px 12px', border: '1px solid #111111' }}>{cells.route}</td>
                <td style={{ padding: '10px 12px', border: '1px solid #111111', textAlign: 'right', fontWeight: 700 }}>{cells.amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', marginTop: '28px' }}>
        <div style={{ border: '1px solid #111111', padding: '16px', minHeight: '86px', lineHeight: 1.6 }}>
          <SectionLabel>Payment</SectionLabel>
          <div>{paymentMethod || 'Payment information on file.'}</div>
        </div>
        <div style={{ border: '2px solid #111111' }}>
          <SummaryRow label="Total Gross" value={formatCurrency(totalGrossRevenue)} />
          <SummaryRow label={`Dispatch Fee @ ${company.dispatchPercentage}%`} value={formatCurrency(dispatchFee)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: '#111111', color: '#ffffff', fontWeight: 800 }}>
            <span>Total Due</span>
            <span>{formatCurrency(dispatchFee)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid #111111' }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

