import { getInvoiceTemplateComponent } from './invoiceRegistry';
import type { InvoiceTemplateProps } from './invoiceTypes';

interface InvoiceRendererProps extends InvoiceTemplateProps {
  templateId?: string;
}

export function InvoiceRenderer({ templateId, ...props }: InvoiceRendererProps) {
  const Template = getInvoiceTemplateComponent(templateId);
  return <Template {...props} />;
}

