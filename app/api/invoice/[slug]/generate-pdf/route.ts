import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";
import Stripe from "stripe";

// POST /api/invoice/[slug]/generate-pdf - Generate PDF invoice
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  // Dynamic require to avoid Vercel/Next.js bundling issues
  const chromium = require('chrome-aws-lambda');
  const puppeteer = require('puppeteer-core');
  try {
    const body = await req.json();
    const { email, token, invoiceId, customerData, invoiceData } = body;

    if (!email || !token || !invoiceId) {
      return NextResponse.json({ error: "Email, token, and invoice ID are required" }, { status: 400 });
    }

    await connectMongo();

    // Find the project by slug
    const project = await Project.findOne({ 
      slug: params.slug,
      isActive: true 
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch company data from Stripe with robust fallback
    let companyData = null;
    try {
      const stripe = new Stripe(project.stripeApiKey, {
        apiVersion: "2025-02-24.acacia",
      });
      
      // Try to get account information first
      try {
        const account = await stripe.accounts.retrieve();
        
        // More robust data extraction
        let companyName = project.name;
        let companyEmail = '';
        let companyPhone = '';
        let companyAddress = {
          line1: '',
          line2: '',
          city: '',
          postal_code: '',
          country: account.country || ''
        };

        // Extract from business profile if available
        if (account.business_profile) {
          companyName = account.business_profile.name || companyName;
          companyEmail = account.business_profile.support_email || companyEmail;
          companyPhone = account.business_profile.support_phone || companyPhone;
          
          if (account.business_profile.support_address) {
            const addr = account.business_profile.support_address;
            companyAddress = {
              line1: addr.line1 || '',
              line2: addr.line2 || '',
              city: addr.city || '',
              postal_code: addr.postal_code || '',
              country: addr.country || account.country || ''
            };
          }
        }

        // Fallback to settings or account-level data
        if (!companyName || companyName === project.name) {
          companyName = account.settings?.dashboard?.display_name || companyName;
        }
        if (!companyEmail) {
          companyEmail = account.email || '';
        }

        companyData = {
          name: companyName,
          email: companyEmail,
          address: companyAddress,
          phone: companyPhone
        };

      } catch (accountError) {
        // If account access fails, try alternative methods
        console.warn('Account access failed, trying alternative methods:', accountError);
        
        // Try to get business info from recent charges
        try {
          const charges = await stripe.charges.list({ limit: 5 });
          if (charges.data.length > 0) {
            const recentCharge = charges.data[0];
            const billing = recentCharge.billing_details;
            
            companyData = {
              name: billing?.name || project.name,
              email: billing?.email || '',
              address: {
                line1: billing?.address?.line1 || '',
                line2: billing?.address?.line2 || '',
                city: billing?.address?.city || '',
                postal_code: billing?.address?.postal_code || '',
                country: billing?.address?.country || ''
              },
              phone: billing?.phone || ''
            };
          } else {
            throw new Error('No charges available for fallback');
          }
        } catch (chargeError) {
          console.warn('Charge fallback also failed:', chargeError);
          throw new Error('All business data retrieval methods failed');
        }
      }

    } catch (error) {
      console.warn('Could not fetch company data from Stripe, using project defaults:', error);
      // Use project name as ultimate fallback
      companyData = {
        name: project.name,
        email: '',
        address: { line1: '', line2: '', city: '', postal_code: '', country: '' },
        phone: ''
      };
    }

    // Add company data to project object
    const projectWithCompanyData = { ...project.toObject(), companyData };

    // In production, you'd validate the token and fetch the actual invoice
    // Generate the HTML invoice
    const html = generateInvoiceHTML(invoiceId, customerData, projectWithCompanyData, invoiceData);

    // Try to use Puppeteer to convert HTML to PDF, fallback to HTML if it fails
    try {
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'a4', // fixed: must be lowercase
        margin: {
          top: '40px',
          right: '40px',
          bottom: '40px',
          left: '40px'
        },
        printBackground: true
      });
      await browser.close();
      const headers = new Headers({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`,
      });
      return new Response(pdfBuffer, { headers });
    } catch (puppeteerError) {
      console.warn('Puppeteer failed, falling back to HTML:', puppeteerError);
      
      // Fallback to HTML download if Puppeteer fails
      const headers = new Headers({
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${invoiceId}.html"`,
      });

      return new Response(html, { headers });
    }

  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

function generateInvoiceHTML(invoiceId: string, customerData: any, project: any, invoiceData?: any) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceId}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .company-info {
            flex: 1;
        }
        .invoice-details {
            text-align: right;
            flex: 1;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .bill-to {
            margin: 40px 0;
        }
        .bill-to h3 {
            margin-bottom: 10px;
            color: #666;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 1px;
        }
        .amount-due {
            font-size: 20px;
            font-weight: bold;
            margin: 30px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        .items-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 1px;
        }
        .items-table .amount {
            text-align: right;
        }
        .totals {
            margin-left: auto;
            width: 300px;
            margin-top: 20px;
        }
        .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .totals .total-row {
            font-weight: bold;
            font-size: 16px;
            border-bottom: 2px solid #333;
        }
        .footer {
            margin-top: 60px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <div class="company-name">${project.companyData?.name || project.name}</div>
            ${project.companyData?.address?.line1 ? `<div>${project.companyData.address.line1}</div>` : ''}
            ${project.companyData?.address?.line2 ? `<div>${project.companyData.address.line2}</div>` : ''}
            ${(() => {
              const city = project.companyData?.address?.city || '';
              const postalCode = project.companyData?.address?.postal_code || '';
              const cityPostal = [city, postalCode].filter(Boolean).join(', ');
              return cityPostal ? `<div>${cityPostal}</div>` : '';
            })()}
            ${project.companyData?.address?.country ? `<div>${project.companyData.address.country}</div>` : ''}
            <div style="margin-top: 10px;">
                ${project.companyData?.email ? `<div>${project.companyData.email}</div>` : ''}
                ${project.companyData?.phone ? `<div>${project.companyData.phone}</div>` : ''}
            </div>
        </div>
        <div class="invoice-details">
            <div class="invoice-title">Invoice</div>
            <div><strong>Invoice number:</strong> ${invoiceData?.number || invoiceId}</div>
            <div><strong>Date of issue:</strong> ${invoiceData?.created || new Date().toLocaleDateString()}</div>
            <div><strong>Date due:</strong> ${invoiceData?.dueDate || invoiceData?.created || new Date().toLocaleDateString()}</div>
        </div>
    </div>

    <div class="bill-to">
        <h3>Bill to</h3>
        ${(() => {
          if (customerData.customerInfo) {
            // Split by both \n and actual newlines and filter out empty lines
            const lines = customerData.customerInfo.split(/\\n|\n/).filter((line: string) => line.trim());
            return lines.map((line: string, index: number) => {
              const trimmedLine = line.trim();
              if (!trimmedLine || trimmedLine.includes('(optional)')) return '';
              if (index === 0) return `<div><strong>${trimmedLine}</strong></div>`;
              return `<div>${trimmedLine}</div>`;
            }).join('');
          }
          return '';
        })()}
    </div>

    <div class="amount-due">Amount due: ${invoiceData?.amount_due / 100} ${invoiceData?.currency?.toUpperCase()}</div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th class="amount">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${(() => {
              if (invoiceData?.lines?.data) {
                return invoiceData.lines.data.map((item: any) => {
                  return `
                    <tr>
                      <td>${item.description || ''}</td>
                      <td>${item.quantity || 0}</td>
                      <td>${(item.price?.unit_amount / 100) || 0} ${invoiceData.currency?.toUpperCase()}</td>
                      <td class="amount">${(item.amount_total / 100) || 0} ${invoiceData.currency?.toUpperCase()}</td>
                    </tr>
                  `;
                }).join('');
              }
              return '<tr><td colspan="4">No items found</td></tr>';
            })()}
        </tbody>
    </table>

    <div class="totals">
        <div class="row">
            <div>Subtotal</div>
            <div class="amount">${(invoiceData?.amount_subtotal / 100) || 0} ${invoiceData.currency?.toUpperCase()}</div>
        </div>
        <div class="row">
            <div>Tax</div>
            <div class="amount">${(invoiceData?.tax / 100) || 0} ${invoiceData.currency?.toUpperCase()}</div>
        </div>
        <div class="total-row row">
            <div>Total</div>
            <div class="amount">${(invoiceData?.amount_total / 100) || 0} ${invoiceData.currency?.toUpperCase()}</div>
        </div>
    </div>

    <div class="footer">
        Thank you for your business! If you have any questions about this invoice, please contact us at ${project.companyData?.email || 'support@example.com'}.
    </div>
</body>
</html>
`;
}