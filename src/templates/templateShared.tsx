import type { CSSProperties, ReactNode } from 'react';
import type { CarrierSettings, CompanySettings, Load } from '../types';
import { formatCurrency, formatDate } from '../lib/calc';
import { getCarrierName, getCompanyName, getRoute } from './invoiceUtils';

export const rootBaseStyle: CSSProperties = {
  width: '820px',
  margin: '0 auto',
  boxSizing: 'border-box',
  background: '#ffffff',
  color: '#111827',
  printColorAdjust: 'exact',
  WebkitPrintColorAdjust: 'exact',
};

export function CompanyLines({ company, color = '#374151' }: { company: CompanySettings; color?: string }) {
  return (
    <>
      <div style={{ fontWeight: 800, color: '#111827' }}>{getCompanyName(company)}</div>
      {company.companyAddress && <div style={{ color }}>{company.companyAddress}</div>}
      {company.companyPhone && <div style={{ color }}>Phone: {company.companyPhone}</div>}
      {company.companyEmail && <div style={{ color }}>Email: {company.companyEmail}</div>}
    </>
  );
}

export function CarrierLines({ carrier, color = '#374151' }: { carrier: CarrierSettings; color?: string }) {
  return (
    <>
      <div style={{ fontWeight: 800, color: '#111827' }}>{getCarrierName(carrier)}</div>
      {carrier.carrierAddress && <div style={{ color }}>{carrier.carrierAddress}</div>}
      {carrier.carrierPhone && <div style={{ color }}>Phone: {carrier.carrierPhone}</div>}
      {carrier.mcNumber && <div style={{ color }}>MC: {carrier.mcNumber}</div>}
    </>
  );
}

export function SectionLabel({ children, color = '#111827' }: { children: ReactNode; color?: string }) {
  return (
    <div style={{
      fontSize: '10px',
      fontWeight: 800,
      color,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: '8px',
    }}>
      {children}
    </div>
  );
}

export function standardLoadCells(load: Load) {
  return {
    number: load.loadNumber || '-',
    broker: load.brokerName || '-',
    pickupDate: formatDate(load.pickupDate) || '-',
    route: getRoute(load),
    amount: formatCurrency(load.grossAmount),
  };
}

export function EmptyLoadsRow({ colSpan, borderColor = '#d1d5db' }: { colSpan: number; borderColor?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: '22px', textAlign: 'center', color: '#6b7280', border: `1px solid ${borderColor}` }}>
        No loads added yet
      </td>
    </tr>
  );
}
