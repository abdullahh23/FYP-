import { MapPin, Truck } from 'lucide-react';
import type { InvoiceTemplateProps } from './invoiceTypes';
import { calcTotals, formatCurrency } from '../lib/calc';
import { getPaymentMethod } from './invoiceUtils';
import { CarrierLines, CompanyLines, EmptyLoadsRow, SectionLabel, rootBaseStyle, standardLoadCells } from './templateShared';

const GREEN = '#0f766e';
const DARK = '#102a2d';
const LINE = '#cfe2df';

export function FreightLogisticsTemplate({ loads, company, carrier, invoiceNumber, invoiceDate, weekLabel }: InvoiceTemplateProps) {
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, company.dispatchPercentage);
  const paymentMethod = getPaymentMethod(company);

  return (
    <div
      id="invoice-root"
      style={{
        ...rootBaseStyle,
        padding: '0',
        fontFamily: "'Inter', 'Arial', sans-serif",
        fontSize: '12px',
        overflow: 'hidden',
        border: `1px solid ${LINE}`,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: '1060px' }}>
        <aside style={{ background: DARK, color: '#ffffff', padding: '34px 26px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
            <div style={{ width: '46px', height: '46px', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={26} />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, lineHeight: 1.1 }}>FREIGHT</div>
              <div style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#9ee1d8' }}>LOGISTICS</div>
            </div>
          </div>

          <InfoBlock label="Invoice #" value={invoiceNumber} />
          <InfoBlock label="Invoice Date" value={invoiceDate} />
          <InfoBlock label="Service Week" value={weekLabel.replace('Week of ', '')} />
          <InfoBlock label="Loads" value={String(loads.length)} />

          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.22)', paddingTop: '20px', lineHeight: 1.7 }}>
            <SectionLabel color="#9ee1d8">Payment</SectionLabel>
            <div style={{ color: '#d8f3ef' }}>{paymentMethod || 'Payment information on file.'}</div>
          </div>
        </aside>

        <main style={{ padding: '34px 36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: GREEN, fontWeight: 800 }}>Dispatch Fee Invoice</div>
              <div style={{ fontSize: '30px', fontWeight: 900, color: DARK, marginTop: '4px' }}>Load-to-Cash Statement</div>
            </div>
            <div style={{ background: '#e8f6f3', color: DARK, padding: '12px 16px', textAlign: 'right', minWidth: '150px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: GREEN, fontWeight: 800 }}>Total Due</div>
              <div style={{ fontSize: '22px', fontWeight: 900 }}>{formatCurrency(dispatchFee)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '26px' }}>
            <div style={{ borderLeft: `5px solid ${GREEN}`, background: '#f8fbfb', padding: '16px', lineHeight: 1.65 }}>
              <SectionLabel color={GREEN}>Dispatch Company</SectionLabel>
              <CompanyLines company={company} color="#405457" />
            </div>
            <div style={{ borderLeft: `5px solid ${DARK}`, background: '#f8fbfb', padding: '16px', lineHeight: 1.65 }}>
              <SectionLabel color={DARK}>Carrier</SectionLabel>
              <CarrierLines carrier={carrier} color="#405457" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <Metric label="Weekly Gross" value={formatCurrency(totalGrossRevenue)} />
            <Metric label="Dispatch Rate" value={`${company.dispatchPercentage}%`} />
            <Metric label="Dispatch Fee" value={formatCurrency(dispatchFee)} strong />
          </div>

          <div style={{ border: `1px solid ${LINE}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', background: '#f0faf8', color: DARK, fontWeight: 900 }}>
              <MapPin size={15} color={GREEN} />
              Weekly Freight Movement
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ color: '#ffffff', background: GREEN }}>
                  <th style={th}>Load</th>
                  <th style={th}>Broker</th>
                  <th style={th}>Pickup</th>
                  <th style={th}>Lane</th>
                  <th style={{ ...th, textAlign: 'right' }}>Gross</th>
                </tr>
              </thead>
              <tbody>
                {loads.length === 0 ? <EmptyLoadsRow colSpan={5} borderColor={LINE} /> : loads.map((load, index) => {
                  const cells = standardLoadCells(load);
                  return (
                    <tr key={load.id} style={{ background: index % 2 === 0 ? '#ffffff' : '#f7fbfa' }}>
                      <td style={tdStrong}>{cells.number}</td>
                      <td style={td}>{cells.broker}</td>
                      <td style={td}>{cells.pickupDate}</td>
                      <td style={td}>{cells.route}</td>
                      <td style={{ ...tdStrong, textAlign: 'right' }}>{cells.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

const th = { padding: '10px 12px', textAlign: 'left' as const, fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.7px' };
const td = { padding: '10px 12px', borderTop: `1px solid ${LINE}`, color: '#314447' };
const tdStrong = { ...td, color: DARK, fontWeight: 800 };

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '10px', color: '#9ee1d8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, padding: '14px', background: strong ? DARK : '#ffffff' }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: strong ? '#9ee1d8' : GREEN, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: '18px', color: strong ? '#ffffff' : DARK, fontWeight: 900, marginTop: '6px' }}>{value}</div>
    </div>
  );
}

