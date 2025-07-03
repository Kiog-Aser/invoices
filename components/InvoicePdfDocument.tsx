import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11, // slightly larger for data
    fontFamily: 'Helvetica',
    backgroundColor: '#fff',
    color: '#222',
    width: '210mm',
    minHeight: '297mm',
    maxWidth: '600px', // ensure not too wide
    margin: '0 auto',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  companyBlock: {
    flex: 1,
  },
  companyName: {
    fontSize: 22, // bigger
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    fontFamily: 'Helvetica',
  },
  companyInfo: {
    fontSize: 11, // bigger
    color: '#444',
    marginBottom: 2,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    fontWeight: 300, // thinner
  },
  invoiceBlock: {
    alignItems: 'flex-end',
    flex: 1,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    textAlign: 'right',
    fontFamily: 'Helvetica',
  },
  invoiceMeta: {
    fontSize: 12, // slightly larger than body, not too big
    color: '#444',
    textAlign: 'right',
    marginTop: 2,
    marginBottom: 4,
    fontFamily: 'Helvetica',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  invoiceMetaLabel: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
  },
  invoiceMetaValue: {
    fontWeight: 400,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 24,
  },
  billToLabel: {
    fontSize: 8,
    color: '#888',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontFamily: 'Helvetica',
  },
  billToName: {
    fontWeight: 'bold',
    fontSize: 12, // bigger
    marginBottom: 2,
    fontFamily: 'Helvetica',
  },
  billToInfo: {
    fontSize: 11, // bigger
    color: '#444',
    marginBottom: 2,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    fontWeight: 300, // thinner
  },
  billToSpacer: {
    height: 12, // reduced by 5px from 24
  },
  amountDue: {
    fontSize: 15, // bigger
    fontWeight: 'bold',
    color: '#222',
    marginTop: 18,
    marginBottom: 8,
    fontFamily: 'Helvetica',
  },
  table: {
    width: '100%',
    marginVertical: 16, // more space
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f7f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 400, // thinner
    paddingVertical: 12, // more vertical space
    paddingHorizontal: 7,
    fontSize: 10, // slightly bigger
    color: '#222',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 12, // more vertical space
    paddingHorizontal: 7,
    fontSize: 10, // slightly bigger
    color: '#222',
    fontFamily: 'Helvetica',
    fontWeight: 300, // thinner
  },
  tableCellRight: {
    textAlign: 'right',
  },
  totalsBlock: {
    marginTop: 18, // more space
    alignItems: 'flex-end',
  },
  totalsTable: {
    width: 240, // slightly wider
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 12, // bigger
    fontFamily: 'Helvetica',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10, // more vertical space
  },
  totalsLabel: {
    color: '#444',
    fontFamily: 'Helvetica',
    fontWeight: 400,
  },
  totalsValue: {
    color: '#222',
    fontFamily: 'Helvetica',
    fontWeight: 400,
  },
  totalsRowBold: {
    fontWeight: 'bold',
    fontSize: 13,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#222',
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    color: '#aaa',
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
});

// Types matching InvoicePdfButton/InvoiceViewPage
interface InvoiceLine {
  description: string;
  amount: number;
  quantity: number;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  created: string;
  dueDate?: string;
  description: string;
  customerName: string;
  customerEmail: string;
  paid: boolean;
  lines: InvoiceLine[];
}

interface Project {
  name: string;
  slug: string;
  stripeAccountName?: string;
  description?: string;
  companyData?: any;
}

interface CustomerData {
  name: string;
  email: string;
  address: string;
  cityPostal?: string;
  country?: string;
  vat?: string;
  phone?: string;
}

export function InvoicePdfDocument({
  invoice,
  project,
  customerData,
}: {
  invoice: Invoice;
  project: Project;
  customerData: CustomerData;
}) {
  const company = project.companyData || {};
  const addressLines = [
    company.address?.line1,
    company.address?.line2,
    company.address?.city && company.address?.postal_code
      ? `${company.address.city}, ${company.address.postal_code}`
      : company.address?.city || company.address?.postal_code,
    company.address?.country,
  ].filter(Boolean);

  // Only show customer fields if filled
  const billToFields = [
    customerData.email,
    customerData.country,
    customerData.address,
    customerData.cityPostal,
    customerData.vat ? `VAT: ${customerData.vat}` : null,
    customerData.phone ? `Phone: ${customerData.phone}` : null,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{company.name || project.name}</Text>
            {addressLines.map((line, i) => (
              <Text style={styles.companyInfo} key={i}>{line}</Text>
            ))}
            {company.email && <Text style={styles.companyInfo}>{company.email}</Text>}
            {company.phone && <Text style={styles.companyInfo}>{company.phone}</Text>}
          </View>
          <View style={styles.invoiceBlock}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceMeta}><Text style={styles.invoiceMetaLabel}>Invoice number:</Text> <Text style={styles.invoiceMetaValue}>{invoice.number}</Text></Text>
            <Text style={styles.invoiceMeta}><Text style={styles.invoiceMetaLabel}>Date of issue:</Text> <Text style={styles.invoiceMetaValue}>{invoice.created}</Text></Text>
            <Text style={styles.invoiceMeta}><Text style={styles.invoiceMetaLabel}>Date due:</Text> <Text style={styles.invoiceMetaValue}>{invoice.dueDate || invoice.created}</Text></Text>
          </View>
        </View>

        {/* Bill To & Amount Due */}
        <View style={styles.section}>
          <Text style={styles.billToLabel}>Bill To</Text>
          <View style={styles.billToSpacer} />
          <Text style={styles.billToName}>{customerData.name}</Text>
          {billToFields.map((field, i) => (
            <Text style={styles.billToInfo} key={i}>{field}</Text>
          ))}
          <Text style={styles.amountDue}>
            ${invoice.amount.toFixed(2)} due {invoice.dueDate || invoice.created}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Description</Text>
            <Text style={styles.tableHeaderCell}>Quantity</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellRight]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellRight]}>Amount</Text>
          </View>
          {Array.isArray(invoice.lines) && invoice.lines.length > 0 ? (
            invoice.lines.map((item, idx) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.tableCell}>{item.description}</Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.tableCellRight]}>
                  ${item.amount.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellRight]}>
                  ${(item.amount * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>No items</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
            </View>
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>${invoice.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.totalsValue}>-${'0.00'}</Text>
            </View>
            <View style={[styles.totalsRow, styles.totalsRowBold]}>
              <Text style={styles.totalsLabel}>Total</Text>
              <Text style={styles.totalsValue}>${invoice.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Amount due</Text>
              <Text style={styles.totalsValue}>${invoice.amount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
  );
}
