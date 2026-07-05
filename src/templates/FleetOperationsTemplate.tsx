import type { ReactNode } from 'react';
import { BarChart3, CircleDollarSign, ClipboardList, Truck } from 'lucide-react';
import type { InvoiceTemplateProps } from './invoiceTypes';
import { calcTotals, formatCurrency } from '../lib/calc';
import { getPaymentMethod } from './invoiceUtils';
import { CarrierLines, CompanyLines, EmptyLoadsRow, SectionLabel, rootBaseStyle, standardLoadCells } from './templateShared';

const BLUE = '#1d4ed8';
const NAV = '#0f172a';
const CYAN = '#0891b2';
const BG = '#f8fafc';
const LINE = '#dbe4ef';

export function FleetOperationsTemplate({ loads, company, carrier, invoiceNumber, invoiceDate, weekLabel }: InvoiceTemplateProps) {
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, company.dispatchPercentage);
  const paymentMethod = getPaymentMethod(company);

  return (
    <div
      id="invoice-root"
      style={{
        ...rootBaseStyle,
        position: 'relative',
        padding: '38px 42px',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: '12px',
        background: BG,
        overflow: 'hidden',
      }}
    >
      <Truck
        size={250}
        strokeWidth={1}
        style={{ position: 'absolute', right: '-44px', top: '160px', color: '#d8e6f7', opacity: 0.45, zIndex: 0 }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ display: 'grid', gridTemplateColumns: '1fr 245px', gap: '22px', alignItems: 'stretch' }}>
          <div style={{ background: NAV, color: '#ffffff', padding: '24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardList size={23} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>Fleet Operations</div>
                <div style={{ fontSize: '11px', color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '1.6px' }}>Dispatch Invoice</div>
              </div>
            </div>
          </div>
          <div style={{ background: '#ffffff', border: `1px solid ${LINE}`, padding: '18px', lineHeight: 1.7 }}>
            <SectionLabel color={BLUE}>Invoice Control</SectionLabel>
            <ControlLine label="Invoice" value={invoiceNumber} />
            <ControlLine label="Date" value={invoiceDate} />
            <ControlLine label="Week" value={weekLabel.replace('Week of ', '')} />
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '18px' }}>
          <div style={opsPanel}>
            <SectionLabel color={BLUE}>Dispatch Desk</SectionLabel>
            <CompanyLines company={company} color="#475569" />
          </div>
          <div style={opsPanel}>
            <SectionLabel color={CYAN}>Carrier Account</SectionLabel>
            <CarrierLines carrier={carrier} color="#475569" />
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '18px' }}>
          <OpsTile icon={<Truck size={18} />} label="Loads" value={String(loads.length)} />
          <OpsTile icon={<BarChart3 size={18} />} label="Gross" value={formatCurrency(totalGrossRevenue)} />
          <OpsTile icon={<CircleDollarSign size={18} />} label="Rate" value={`${company.dispatchPercentage}%`} />
          <OpsTile icon={<CircleDollarSign size={18} />} label="Due" value={formatCurrency(dispatchFee)} active />
        </section>

        <section style={{ marginTop: '22px', background: '#ffffff', border: `1px solid ${LINE}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: `1px solid ${LINE}` }}>
            <SectionLabel color={NAV}>Operations Manifest</SectionLabel>
            <div style={{ color: '#64748b', fontSize: '11px' }}>Gross revenue basis</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#eaf2ff', color: NAV }}>
                <th style={th}>Load</th>
                <th style={th}>Broker</th>
                <th style={th}>Pickup</th>
                <th style={th}>Route</th>
                <th style={{ ...th, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loads.length === 0 ? <EmptyLoadsRow colSpan={5} borderColor={LINE} /> : loads.map((load, index) => {
                const cells = standardLoadCells(load);
                return (
                  <tr key={load.id} style={{ background: index % 2 === 0 ? '#ffffff' : '#fbfdff' }}>
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
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '18px', marginTop: '20px' }}>
          <div style={{ background: '#ffffff', border: `1px solid ${LINE}`, padding: '16px', lineHeight: 1.65 }}>
            <SectionLabel color={CYAN}>Payment Routing</SectionLabel>
            <div style={{ color: '#475569' }}>{paymentMethod || 'Payment information on file.'}</div>
          </div>
          <div style={{ background: NAV, color: '#ffffff', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#cbd5e1' }}>
              <span>Total Gross</span>
              <span>{formatCurrency(totalGrossRevenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', color: '#cbd5e1' }}>
              <span>Dispatch Fee</span>
              <span>{formatCurrency(dispatchFee)}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '16px' }}>
              <span>Total Due</span>
              <span style={{ color: '#67e8f9' }}>{formatCurrency(dispatchFee)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const opsPanel = { background: '#ffffff', border: `1px solid ${LINE}`, padding: '16px', lineHeight: 1.65 };
const th = { padding: '10px 12px', textAlign: 'left' as const, fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.7px', borderBottom: `1px solid ${LINE}` };
const td = { padding: '10px 12px', color: '#475569', borderBottom: `1px solid ${LINE}` };
const tdStrong = { ...td, color: NAV, fontWeight: 800 };

function ControlLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <strong style={{ color: NAV, textAlign: 'right' }}>{value}</strong>
    </div>
  );
}

function OpsTile({ icon, label, value, active = false }: { icon: ReactNode; label: string; value: string; active?: boolean }) {
  return (
    <div style={{ background: active ? BLUE : '#ffffff', color: active ? '#ffffff' : NAV, border: `1px solid ${active ? BLUE : LINE}`, padding: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: active ? '#bfdbfe' : BLUE, marginBottom: '8px' }}>
        {icon}
        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800 }}>{label}</span>
      </div>
      <div style={{ fontSize: '17px', fontWeight: 900 }}>{value}</div>
    </div>
  );
}
