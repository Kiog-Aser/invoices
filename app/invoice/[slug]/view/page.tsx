'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

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

export default function InvoiceViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    customerInfo: ''
  });
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [needsConnectPermission, setNeedsConnectPermission] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setError('Invalid access link. Please request a new link.');
      setLoading(false);
      return;
    }

    fetchInvoices();
  }, [email, token, slug]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(
        `/api/invoice/${slug}/list?email=${encodeURIComponent(email!)}&token=${token}`
      );

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices);
        setProject(data.project);
        
        // Fetch company data from Stripe Account
        fetchCompanyData();

        // Initialize customer data from first invoice if available
        if (data.invoices.length > 0) {
          const firstInvoice = data.invoices[0];
          setCustomerData({
            customerInfo: `${firstInvoice.customerName || 'Customer Name'}\n${firstInvoice.customerEmail || email || ''}\nCountry\nVAT Number (optional)\nAddress Line 1 (optional)\nCity, Postal Code\nPhone Number (optional)`
          });
        }
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to load invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    try {
      const response = await fetch(`/api/invoice/${slug}/account-info`);
      if (response.ok) {
        const data = await response.json();
        setCompanyData(data.companyData);
      } else {
        const errorData = await response.json();
        console.error('Error fetching company data:', errorData);
        
        // Check if it's a permissions error
        if (response.status === 403) {
          setNeedsConnectPermission(true);
        }
        
        // Use basic fallback data
        setCompanyData({
          name: project?.name || 'Your Company',
          address: {
            line1: "Your Address",
            city: "Your City",
            postal_code: "Postal Code",
            country: "Country"
          },
          email: "your-email@company.com",
          phone: "Your Phone"
        });
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      // Use basic fallback data
      setCompanyData({
        name: project?.name || 'Your Company',
        address: {
          line1: "Your Address",
          city: "Your City",
          postal_code: "Postal Code",
          country: "Country"
        },
        email: "your-email@company.com",
        phone: "Your Phone"
      });
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCustomerData({
      customerInfo: `${invoice.customerName || 'Customer Name'}\n${invoice.customerEmail || email || ''}\nCountry\nVAT Number (optional)\nAddress Line 1 (optional)\nCity, Postal Code\nPhone Number (optional)`
    });
    setIsEditModalOpen(true);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    setIsDownloading(invoice.id);
    
    try {
      const response = await fetch(`/api/invoice/${slug}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          invoiceId: invoice.number,
          customerData,
          invoiceData: invoice
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Detect if response is PDF or HTML based on content type
        const contentType = response.headers.get('content-type');
        const fileExtension = contentType?.includes('pdf') ? 'pdf' : 'html';
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoice.number}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to generate invoice');
      }
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setIsDownloading(null);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Access Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href={`/invoice/${slug}`}
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Request New Link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Edit and download your invoices
          </h1>
          {project && (
            <p className="text-gray-600">
              {email}
            </p>
          )}
        </div>

        {/* Invoices Table */}
        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              No invoices found
            </h2>
            <p className="text-gray-600">
              We couldn&apos;t find any invoices for your email address.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {project?.name || 'Business'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            ${invoice.amount.toFixed(2)}
                          </span>
                          {invoice.paid ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Unpaid
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">
                          {invoice.number}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.created}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-300 transition-colors mr-2"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            This link will expire in 24 hours for security reasons.
          </p>
          <p className="mt-1">
            Need a new link?{' '}
            <a
              href={`/invoice/${slug}`}
              className="text-green-600 hover:text-green-700 underline"
            >
              Request here
            </a>
          </p>
        </div>
      </div>

      {/* Edit Invoice Modal */}
      {isEditModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Invoice</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  disabled={isDownloading === selectedInvoice.id}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400"
                >
                  {isDownloading === selectedInvoice.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-light"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Company Info */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Invoice Details</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Invoice number:</span> {selectedInvoice.number}
                      </div>
                      <div>
                        <span className="font-medium">Date of issue:</span> {selectedInvoice.created}
                      </div>
                      <div>
                        <span className="font-medium">Date due:</span> {selectedInvoice.dueDate || selectedInvoice.created}
                      </div>
                    </div>
                  </div>

                  {companyData && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">From</h3>
                      <div className="text-sm space-y-1">
                        <div className="font-semibold">{companyData.name}</div>
                        <div>{companyData.address.line1}</div>
                        {companyData.address.line2 && <div>{companyData.address.line2}</div>}
                        <div>{companyData.address.city}, {companyData.address.postal_code}</div>
                        <div>{companyData.address.country}</div>
                        <div className="text-blue-600">{companyData.email}</div>
                        {companyData.phone && <div>{companyData.phone}</div>}
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <div className="text-lg font-semibold text-gray-900">
                      ${selectedInvoice.amount.toFixed(2)} due {selectedInvoice.dueDate || selectedInvoice.created}
                    </div>
                  </div>
                </div>

                {/* Right Column - Editable Customer Info */}
                <div className="lg:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Bill to</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Information
                      </label>
                      <textarea
                        value={customerData.customerInfo}
                        onChange={(e) => setCustomerData({customerInfo: e.target.value})}
                        placeholder="Customer Name&#10;Email&#10;Country&#10;VAT Number (optional)&#10;Address Line 1 (optional)&#10;City, Postal Code&#10;Phone Number (optional)"
                        rows={7}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Enter customer information with each field on a separate line
                      </p>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.lines.map((line, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{line.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center">{line.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">${line.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="bg-gray-50 px-4 py-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${selectedInvoice.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Discount</span>
                        <span>-$0.00</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${selectedInvoice.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Amount due</span>
                        <span>${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency}</span>
                      </div>
                    </div>
                  </div>


                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 