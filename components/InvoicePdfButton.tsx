import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePdfDocument } from './InvoicePdfDocument';

interface Invoice {
  id: string;
  number: string;
  customerId?: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  dueDate?: string;
  description: string;
  customerName: string;
  customerEmail: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  paid: boolean;
  lines: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
}

interface Project {
  name: string;
  slug: string;
  stripeAccountName?: string;
  description?: string;
}

interface CustomerData {
  customerInfo: string;
}

interface CompanyData {
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  email: string;
  phone?: string;
}

interface InvoicePdfButtonProps {
  invoice: Invoice;
  project: Project;
  customerData: CustomerData;
  companyData: CompanyData;
}

export function InvoicePdfButton({ invoice, project, customerData, companyData }: InvoicePdfButtonProps) {
  // Parse customerData.customerInfo into fields
  const [name, email, country, vat, address, cityPostal, phone] = (customerData.customerInfo || '').split('\n');
  const parsedCustomer = {
    name: name || '',
    email: email || '',
    address: address || '',
    cityPostal: cityPostal || '',
    country: country || '',
    vat: vat || '',
    phone: phone || '',
  };

  return (
    <PDFDownloadLink
      document={
        <InvoicePdfDocument
          invoice={invoice}
          project={{ ...project, companyData }}
          customerData={parsedCustomer}
        />
      }
      fileName={`invoice-${invoice.number}.pdf`}
      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
    >
      {({ loading }) =>
        loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Preparing PDF...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </>
        )
      }
    </PDFDownloadLink>
  );
}
