import { formatDate } from '../../utils/dateFormatter';

export default function InvoicePreview({ invoice, contractor = {} }) {
  if (!invoice) return null;

  const {
    date,
    customerName = '',
    customerAddress = '',
    customerPan = '',
    customerMobile = '',
    billNumber = '',
    items = [],
    totalAmount = 0,
    grandTotal = 0,
    gstEnabled = false,
    gstPercent = 18,
    gstAmount = 0,
  } = invoice;

  const displayTotal = gstEnabled ? grandTotal : totalAmount;

  // Format numbers for Indian currency standard
  const formatAmount = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatTotal = (val) => {
    const num = parseFloat(val || 0);
    if (isNaN(num)) return '0.00';
    // Matches the exact format in the template (e.g. 200000.00)
    return num.toFixed(2);
  };

  // Company details with exact fallbacks from the provided template
  const companyName = contractor.companyName || 'GLOBAL ENTERPRISE';
  const contractorMobile = contractor.mobile || '8200172009';
  const accountNumber = contractor.accountNumber || '93610200001314';
  const ifscCode = contractor.ifsc || 'BARB0DBVANG';
  const bankName = contractor.bankName || 'BANK OF BARODA ( VANGAD )';
  const branchName = contractor.branchName || 'VANGAD';

  // Company address lines (split or fallback)
  const companyAddressLines = contractor.address
    ? contractor.address.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean)
    : ['ZALOD RAOD,', 'FATEPURA, DAHOD', 'PINCODE-389172'];

  // Customer address lines
  const customerAddressLines = customerAddress
    ? customerAddress.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean)
    : (customerName.toUpperCase().includes('BHOJELA') ? ['FATEPURA', 'PINCODE 389190'] : []);

  // Ensure table fills full height matching the exact template layout (at least 16 rows)
  const MIN_ROWS = 16;
  const totalRowsCount = Math.max(items.length, MIN_ROWS);
  const rows = [];
  for (let i = 0; i < totalRowsCount; i++) {
    rows.push(items[i] || null);
  }

  return (
    <div
      id="invoice-preview"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '12mm 16mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        fontFamily: 'Calibri, Arial, "Segoe UI", sans-serif',
        color: '#000000',
        fontSize: '12.5px',
        lineHeight: '1.3'
      }}
    >
      {/* ================= TOP SECTION ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        {/* Left: Company Name & Contact Info */}
        <div style={{ maxWidth: '60%' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#366092',
              textDecoration: 'underline',
              textDecorationColor: '#366092',
              textUnderlineOffset: '3px',
              letterSpacing: '0.5px',
              marginBottom: '6px',
              textTransform: 'uppercase'
            }}
          >
            {companyName}
          </div>

          <div style={{ fontSize: '12.5px', color: '#000000', lineHeight: '1.4' }}>
            {companyAddressLines.map((line, idx) => (
              <div key={idx} style={{ textTransform: 'uppercase' }}>{line}</div>
            ))}
            <div>Phone: {contractorMobile}</div>
          </div>
        </div>

        {/* Right: INVOICE title + DATE box */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div
            style={{
              fontSize: '32px',
              fontWeight: '700',
              letterSpacing: '2.5px',
              color: '#95B3D7',
              fontFamily: 'Georgia, "Times New Roman", Cambria, serif',
              marginBottom: '10px',
              lineHeight: '1'
            }}
          >
            INVOICE
          </div>

          {/* DATE Row */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#000000', marginRight: '10px' }}>
              DATE
            </span>
            <div
              style={{
                width: '110px',
                height: '22px',
                border: '1px solid #000000',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: '#000000'
              }}
            >
              {date ? formatDate(date) : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ================= CUSTOMER SECTION ================= */}
      <div style={{ marginBottom: '14px' }}>
        <div
          style={{
            backgroundColor: '#4F81BD',
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '12.5px',
            padding: '3px 8px',
            width: '240px',
            boxSizing: 'border-box'
          }}
        >
          CUSTOMER
        </div>
        <div style={{ padding: '4px 2px 0 2px', fontSize: '12.5px', color: '#000000', lineHeight: '1.4' }}>
          <div style={{ fontWeight: '700', textTransform: 'uppercase' }}>
            {customerName}
          </div>
          {customerAddressLines.map((line, idx) => (
            <div key={idx} style={{ textTransform: 'uppercase' }}>{line}</div>
          ))}
          {customerPan && (
            <div style={{ textTransform: 'uppercase' }}>PAN: {customerPan}</div>
          )}
          {customerMobile && (
            <div>PHONE: {customerMobile}</div>
          )}
        </div>
      </div>

      {/* ================= MAIN TABLE (ITEMS + LOWER SECTION) ================= */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed'
        }}
      >
        <colgroup>
          <col style={{ width: '68%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>

        {/* Table Header */}
        <thead>
          <tr style={{ backgroundColor: '#4F81BD', height: '28px', color: '#ffffff' }}>
            <th
              style={{
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000',
                borderTop: '1px solid #000000',
                borderBottom: '1px solid #000000',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '12.5px',
                padding: '3px 6px'
              }}
            >
              <u style={{ textUnderlineOffset: '2px' }}>DESCRIPTION</u>
            </th>
            <th
              style={{
                borderRight: '1px solid #000000',
                borderTop: '1px solid #000000',
                borderBottom: '1px solid #000000',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '12.5px',
                padding: '3px 6px'
              }}
            >
              <u style={{ textUnderlineOffset: '2px' }}>QTY</u>
            </th>
            <th
              style={{
                borderRight: '1px solid #000000',
                borderTop: '1px solid #000000',
                borderBottom: '1px solid #000000',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '12.5px',
                padding: '3px 6px'
              }}
            >
              <u style={{ textUnderlineOffset: '2px' }}>AMOUNT</u>
            </th>
          </tr>
        </thead>

        {/* Table Body (Zebra striped items & padded rows) */}
        <tbody>
          {rows.map((item, idx) => {
            const rowBg = idx % 2 === 0 ? '#F2F2F2' : '#FFFFFF';
            const hasQty = item && item.quantity !== undefined && item.quantity !== null && item.quantity !== '' && Number(item.quantity) > 0;
            const hasAmount = item && item.amount !== undefined && item.amount !== null && item.amount !== '';

            return (
              <tr key={idx} style={{ backgroundColor: rowBg, height: '24px' }}>
                <td
                  style={{
                    borderLeft: '1px solid #000000',
                    borderRight: '1px solid #000000',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '12px',
                    color: '#000000',
                    padding: '2px 6px',
                    textTransform: 'uppercase'
                  }}
                >
                  {item ? item.description : '\u00A0'}
                </td>
                <td
                  style={{
                    borderRight: '1px solid #000000',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#000000',
                    padding: '2px 4px'
                  }}
                >
                  {hasQty ? (Number.isInteger(Number(item.quantity)) ? Number(item.quantity) : Number(item.quantity).toLocaleString('en-IN')) : '\u00A0'}
                </td>
                <td
                  style={{
                    borderRight: '1px solid #000000',
                    textAlign: 'right',
                    fontSize: '12px',
                    color: '#000000',
                    padding: '2px 8px',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {hasAmount ? formatAmount(item.amount) : '\u00A0'}
                </td>
              </tr>
            );
          })}

          {/* ================= LOWER SECTION INTEGRATED ================= */}
          {/* Row 1: BANK DETAILS Banner (Left) + Subtotal (Right) */}
          <tr style={{ height: '24px' }}>
            <td
              style={{
                backgroundColor: '#4F81BD',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '12.5px',
                padding: '3px 8px',
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000'
              }}
            >
              BANK DETAILS
            </td>
            <td
              style={{
                borderTop: '1.5px solid #000000',
                fontWeight: '700',
                fontSize: '12px',
                color: '#000000',
                padding: '3px 6px'
              }}
            >
              Subtotal
            </td>
            <td
              style={{
                borderTop: '1.5px solid #000000',
                borderRight: '1px solid #000000',
                textAlign: 'right',
                fontSize: '12px',
                color: '#000000',
                padding: '3px 8px',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {formatAmount(totalAmount)}
            </td>
          </tr>

          {/* Row 2: Bank Name + Taxable */}
          <tr style={{ height: '22px' }}>
            <td
              style={{
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000',
                fontSize: '11.5px',
                color: '#000000',
                padding: '2px 8px',
                textTransform: 'uppercase'
              }}
            >
              BANK NAME : {bankName}
            </td>
            <td
              style={{
                fontSize: '12px',
                color: '#000000',
                padding: '2px 6px'
              }}
            >
              Taxable
            </td>
            <td
              style={{
                borderRight: '1px solid #000000',
                textAlign: 'right',
                fontSize: '12px',
                color: '#000000',
                padding: '2px 8px'
              }}
            >
              {gstEnabled ? formatAmount(totalAmount) : '-'}
            </td>
          </tr>

          {/* Row 3: Branch Name + Tax rate */}
          <tr style={{ height: '22px' }}>
            <td
              style={{
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000',
                fontSize: '11.5px',
                color: '#000000',
                padding: '2px 8px',
                textTransform: 'uppercase'
              }}
            >
              BRANCH NAME : {branchName}
            </td>
            <td
              style={{
                fontSize: '12px',
                color: '#000000',
                padding: '2px 6px'
              }}
            >
              Tax rate
            </td>
            <td
              style={{
                borderRight: '1px solid #000000',
                textAlign: 'right',
                padding: '2px 8px'
              }}
            >
              <div
                style={{
                  width: '75px',
                  height: '18px',
                  border: '1px solid #000000',
                  backgroundColor: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11.5px',
                  color: '#000000'
                }}
              >
                {gstEnabled ? `${gstPercent}%` : ''}
              </div>
            </td>
          </tr>

          {/* Row 4: IFSC Code + Tax due */}
          <tr style={{ height: '22px' }}>
            <td
              style={{
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000',
                fontSize: '11.5px',
                color: '#000000',
                padding: '2px 8px',
                textTransform: 'uppercase'
              }}
            >
              IFSC CODE : {ifscCode}
            </td>
            <td
              style={{
                fontSize: '12px',
                color: '#000000',
                padding: '2px 6px'
              }}
            >
              Tax due
            </td>
            <td
              style={{
                borderRight: '1px solid #000000',
                textAlign: 'right',
                fontSize: '12px',
                color: '#000000',
                padding: '2px 8px'
              }}
            >
              {gstEnabled ? formatAmount(gstAmount) : '-'}
            </td>
          </tr>

          {/* Row 5: Bank Account Number + Other */}
          <tr style={{ height: '22px' }}>
            <td
              style={{
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000',
                fontSize: '11.5px',
                color: '#000000',
                padding: '2px 8px',
                textTransform: 'uppercase'
              }}
            >
              BANK ACCOUNT NUMBER :{accountNumber}
            </td>
            <td
              style={{
                fontSize: '12px',
                color: '#000000',
                padding: '2px 6px'
              }}
            >
              Other
            </td>
            <td
              style={{
                borderRight: '1px solid #000000',
                textAlign: 'right',
                padding: '2px 8px'
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '55px',
                    height: '18px',
                    border: '1px solid #000000',
                    backgroundColor: '#ffffff'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#000000' }}>-</span>
              </div>
            </td>
          </tr>

          {/* Row 6: TOTAL */}
          <tr style={{ height: '26px' }}>
            <td
              style={{
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000',
                fontSize: '11.5px',
                color: '#000000',
                padding: '2px 8px'
              }}
            >
              {'\u00A0'}
            </td>
            <td
              style={{
                borderTop: '2px solid #000000',
                borderBottom: '2px solid #000000',
                fontWeight: '700',
                fontSize: '14px',
                color: '#000000',
                padding: '3px 6px'
              }}
            >
              TOTAL
            </td>
            <td
              style={{
                borderTop: '2px solid #000000',
                borderBottom: '2px solid #000000',
                borderRight: '1px solid #000000',
                backgroundColor: '#DCE6F1',
                textAlign: 'right',
                fontWeight: '700',
                fontSize: '14px',
                color: '#000000',
                padding: '3px 8px',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {formatTotal(displayTotal)}
            </td>
          </tr>

          {/* Row 7: Questions Contact Line */}
          <tr>
            <td
              style={{
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000',
                fontSize: '11.5px',
                color: '#000000',
                padding: '8px 8px 1px 8px',
                textAlign: 'center'
              }}
            >
              If you have any questions about this price, please contact
            </td>
            <td colSpan={2} rowSpan={3} style={{ verticalAlign: 'middle', textAlign: 'center', padding: '8px' }}>
              {contractor.signature && (
                <div>
                  <img
                    src={contractor.signature}
                    alt="Signature"
                    style={{ maxHeight: '42px', maxWidth: '140px', objectFit: 'contain', margin: '0 auto 4px auto' }}
                  />
                  <div style={{ borderTop: '1px solid #000000', width: '140px', margin: '0 auto 2px auto' }} />
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#000000' }}>
                    {contractor.contractorName || 'Vishal Chandrakant Panchal'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#4b5563' }}>Authorized Signatory</div>
                </div>
              )}
            </td>
          </tr>

          {/* Row 8: Contact Phone Number */}
          <tr>
            <td
              style={{
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000',
                fontSize: '12px',
                fontWeight: '700',
                color: '#000000',
                padding: '0 8px 2px 8px',
                textAlign: 'center'
              }}
            >
              {contractorMobile}
            </td>
          </tr>

          {/* Row 9: Thank You Note */}
          <tr>
            <td
              style={{
                borderLeft: '1px solid #000000',
                borderRight: '1px solid #000000',
                borderBottom: '1px solid #000000',
                fontStyle: 'italic',
                fontWeight: '700',
                fontSize: '13px',
                color: '#1F497D',
                padding: '4px 8px 10px 8px',
                textAlign: 'center'
              }}
            >
              Thank You For Your Business!
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
