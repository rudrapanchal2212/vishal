import { formatInvoiceDate } from '../../utils/dateFormatter';

export default function InvoicePreview({ invoice, contractor = {} }) {
  if (!invoice) return null;

  const {
    date, customerName, customerPan,
    items = [], totalAmount, grandTotal,
    gstEnabled, gstPercent, gstAmount, categoryOfService, notes, dueDate
  } = invoice;

  const displayTotal = gstEnabled ? grandTotal : totalAmount;

  return (
    <div
      id="invoice-preview"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '16mm 18mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#111827',
        fontSize: '13px',
        lineHeight: '1.4'
      }}
    >
      {/* Header: Business Info (Left) + Date Box (Right) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '0.8px', color: '#000000', marginBottom: '3px' }}>
            {contractor.companyName || 'GLOBAL ENTERPRISE'}
          </div>
          <div style={{ fontSize: '13px', color: '#374151', marginBottom: '2px' }}>
            Prop. {contractor.contractorName || 'Vishal Chandrakant Panchal'}
          </div>
          <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '2px' }}>
            {contractor.address || 'Fatepura, near Urban Bank, Vangad'}
          </div>
          <div style={{ fontSize: '12.5px', color: '#4b5563' }}>
            GSTIN: {contractor.gstNumber || '24DDYPP4105H1Z9'} &middot; PAN: {contractor.pan || 'DDYPP4105H'}
          </div>
        </div>

        {/* Date Box */}
        <div style={{
          border: '1px solid #111827',
          padding: '8px 18px',
          fontSize: '13px',
          color: '#111827',
          backgroundColor: '#ffffff',
          borderRadius: '1px',
          whiteSpace: 'nowrap'
        }}>
          Date: <strong style={{ fontWeight: '700' }}>{formatInvoiceDate(date)}</strong>
        </div>
      </div>

      {/* Top Divider */}
      <div style={{ borderTop: '1.5px solid #111827', margin: '14px 0 18px 0' }} />

      {/* BILLED TO and SUBJECT Boxes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* BILLED TO */}
        <div style={{
          border: '1px solid #9ca3af',
          padding: '12px 14px',
          borderRadius: '1px',
          minHeight: '75px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#6b7280',
            letterSpacing: '0.6px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '5px',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            BILLED TO
          </div>
          <div style={{ fontWeight: '700', fontSize: '14.5px', color: '#111827' }}>
            {customerName}
          </div>
          {customerPan && (
            <div style={{ fontSize: '12.5px', color: '#374151', marginTop: '3px' }}>
              PAN: {customerPan}
            </div>
          )}
        </div>

        {/* SUBJECT */}
        <div style={{
          border: '1px solid #9ca3af',
          padding: '12px 14px',
          borderRadius: '1px',
          minHeight: '75px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#6b7280',
            letterSpacing: '0.6px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '5px',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            SUBJECT
          </div>
          <div style={{ fontWeight: '700', fontSize: '14.5px', color: '#111827' }}>
            {categoryOfService || 'Civil construction work'}
          </div>
          <div style={{ fontSize: '12.5px', color: '#4b5563', marginTop: '3px' }}>
            {dueDate ? `Due date: ${formatInvoiceDate(dueDate)}` : (notes || 'Due within 15 days')}
          </div>
        </div>
      </div>

      {/* Work Items Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        borderTop: '1.5px solid #111827',
        borderBottom: '1.5px solid #111827'
      }}>
        <thead>
          <tr style={{
            borderBottom: '1.5px solid #111827',
            fontSize: '13px',
            color: '#111827'
          }}>
            <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', width: '6%' }}>Sr.</th>
            <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', width: '44%' }}>Description</th>
            <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', width: '12%' }}>Unit</th>
            <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', width: '10%' }}>Qty</th>
            <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', width: '14%' }}>Rate (₹)</th>
            <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', width: '14%' }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const qty = item.quantity !== undefined && item.quantity !== null && item.quantity !== '' ? item.quantity : 1;
            const rate = item.rate && item.rate > 0
              ? item.rate
              : (item.amount && qty ? item.amount / qty : null);

            return (
              <tr key={idx} style={{
                borderBottom: idx === items.length - 1 ? 'none' : '1px solid #e5e7eb',
                fontSize: '13px',
                color: '#111827'
              }}>
                <td style={{ padding: '12px 8px', verticalAlign: 'top', color: '#111827' }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '12px 8px', verticalAlign: 'top', color: '#111827', lineHeight: '1.45' }}>
                  {item.description}
                </td>
                <td style={{ padding: '12px 8px', verticalAlign: 'top', textAlign: 'center', color: '#374151' }}>
                  {item.unit || '-'}
                </td>
                <td style={{ padding: '12px 8px', verticalAlign: 'top', textAlign: 'center', color: '#111827' }}>
                  {Number(qty).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '12px 8px', verticalAlign: 'top', textAlign: 'right', color: '#111827' }}>
                  {rate ? parseFloat(rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                </td>
                <td style={{ padding: '12px 8px', verticalAlign: 'top', textAlign: 'right', color: '#111827' }}>
                  {item.amount ? parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '16px',
        marginBottom: '26px'
      }}>
        <div style={{ display: 'inline-block', textAlign: 'right' }}>
          {gstEnabled && (
            <div style={{ marginBottom: '8px', fontSize: '13px', color: '#4b5563' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '32px', marginBottom: '3px' }}>
                <span>Subtotal</span>
                <span>₹{parseFloat(totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '32px' }}>
                <span>GST ({gstPercent}%)</span>
                <span>₹{parseFloat(gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'flex-end',
            gap: '32px',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
              Total
            </span>
            <span style={{ fontSize: '17px', fontWeight: '700', color: '#111827' }}>
              ₹{parseFloat(displayTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {/* Heavy black line under amount */}
          <div style={{
            width: '150px',
            height: '2.5px',
            backgroundColor: '#111827',
            marginLeft: 'auto'
          }} />
        </div>
      </div>

      {/* Bottom Section: PAYMENT DETAILS (Left) and SIGNATURE (Right) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: '36px'
      }}>
        {/* PAYMENT DETAILS Box */}
        <div style={{
          border: '1px solid #9ca3af',
          padding: '14px 18px',
          borderRadius: '1px',
          width: '330px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#6b7280',
            letterSpacing: '0.8px',
            marginBottom: '10px',
            textTransform: 'uppercase'
          }}>
            PAYMENT DETAILS
          </div>
          <div style={{ fontSize: '12.5px', lineHeight: '1.8', color: '#374151' }}>
            <div>
              <span>A/c name </span>
              <strong style={{ color: '#111827', fontWeight: '700' }}>
                {contractor.accountName || contractor.companyName || 'GLOBAL ENTERPRISE'}
              </strong>
            </div>
            <div>
              <span>Bank </span>
              <span style={{ color: '#111827' }}>
                {contractor.bankName
                  ? (contractor.bankName.includes('Bank of Baroda')
                      ? contractor.bankName
                      : contractor.bankName.replace(/BOB\s*\(\s*Vangad\s*\)/i, 'Bank of Baroda, Vangad'))
                  : 'Bank of Baroda, Vangad'}
              </span>
            </div>
            <div>
              <span>A/c no. </span>
              <span style={{ color: '#111827' }}>
                {contractor.accountNumber || '93610200001273'}
              </span>
            </div>
            <div>
              <span>IFSC </span>
              <span style={{ color: '#111827' }}>
                {contractor.ifsc || 'BARB0DBVANG'}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div style={{ textAlign: 'center', width: '250px' }}>
          {contractor.signature && (
            <div style={{ marginBottom: '6px' }}>
              <img
                src={contractor.signature}
                alt="Signature"
                style={{ height: '50px', objectFit: 'contain', margin: '0 auto' }}
              />
            </div>
          )}
          <div style={{
            width: '100%',
            borderTop: '1px solid #111827',
            marginBottom: '6px'
          }} />
          <div style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>
            {contractor.contractorName || 'Vishal Chandrakant Panchal'}
          </div>
          <div style={{ fontSize: '11.5px', color: '#4b5563', marginTop: '1px' }}>
            Authorized signatory
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        marginTop: '32px',
        paddingTop: '12px',
        textAlign: 'center',
        fontSize: '11px',
        color: '#6b7280'
      }}>
        This is a computer-generated invoice &middot; Thank you for your business
      </div>
    </div>
  );
}
