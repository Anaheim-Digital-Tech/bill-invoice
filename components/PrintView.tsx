'use client';

import type { InvoiceDoc } from '../lib/types';
import { COMPANY, DOC_TYPE_LABELS } from '../lib/constants';
import { calcTotals, formatDate, formatMoney } from '../lib/utils';
import { bahtText } from '../lib/thaiText';

interface Props {
  doc: InvoiceDoc;
  copy?: boolean;
}

const BORDER = '1px solid #333';
const FONT = "'Sarabun', 'TH Sarabun New', 'Arial', sans-serif";

const th = (label: string, style?: React.CSSProperties): React.ReactNode => (
  <th
    style={{
      border: BORDER,
      padding: '5px 8px',
      backgroundColor: '#1a1a2e',
      color: '#fff',
      fontWeight: 600,
      fontSize: '10.5pt',
      ...style,
    }}
  >
    {label}
  </th>
);

const td = (content: React.ReactNode, style?: React.CSSProperties): React.ReactNode => (
  <td
    style={{
      border: BORDER,
      padding: '4px 7px',
      fontSize: '10pt',
      verticalAlign: 'middle',
      ...style,
    }}
  >
    {content}
  </td>
);

export function PrintView({ doc, copy = false }: Props) {
  const totals = calcTotals(doc.items, doc.discountPercent, doc.taxMode);
  const PAD_ROWS = Math.max(0, 5 - doc.items.length);

  return (
    <div
      id="print-area"
      style={{
        width: '210mm',
        height: '297mm',
        margin: '0 auto',
        padding: '7mm 12mm 5mm',
        overflow: 'hidden',
        backgroundColor: '#fff',
        color: '#111',
        fontFamily: FONT,
        fontSize: '10.5pt',
        lineHeight: 1.55,
        boxSizing: 'border-box',
      }}
    >
      {/* ══════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3mm' }}>
        <tbody>
          <tr>
            {/* Logo + Company */}
            <td style={{ width: '60%', verticalAlign: 'middle', paddingRight: '6mm' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-light.png"
                  alt="logo"
                  style={{ height: '58px', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13pt', lineHeight: 1.3 }}>
                    {COMPANY.name}
                  </div>
                  <div style={{ fontSize: '9.5pt', color: '#555', letterSpacing: '0.3px' }}>
                    {COMPANY.nameEn}
                  </div>
                  <div style={{ fontSize: '9pt', marginTop: '3px', whiteSpace: 'pre-line', color: '#333' }}>
                    {COMPANY.address}
                  </div>
                  <div style={{ fontSize: '9pt', color: '#333' }}>
                    โทร: {COMPANY.contacts[0].phone} &nbsp;|&nbsp; เลขประจำตัวผู้เสียภาษี:{' '}
                    <strong>{COMPANY.taxId}</strong>
                  </div>
                </div>
              </div>
            </td>

            {/* Document title + info */}
            <td style={{ width: '40%', verticalAlign: 'top' }}>
              {/* Document type badge */}
              <div
                style={{
                  border: '2px solid #1a1a2e',
                  textAlign: 'center',
                  padding: '4px 0',
                  marginBottom: '4px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: '16pt',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    color: '#1a1a2e',
                  }}
                >
                  {DOC_TYPE_LABELS[doc.docType]}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    right: '6px',
                    fontSize: '8pt',
                    fontWeight: 700,
                    color: copy ? '#888' : '#1a1a2e',
                    border: copy ? '1px solid #aaa' : '1px solid #1a1a2e',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {copy ? 'สำเนา' : 'ต้นฉบับ'}
                </div>
              </div>
              {/* Doc number/date table */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '10pt',
                  border: BORDER,
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: BORDER,
                        padding: '4px 8px',
                        backgroundColor: '#f5f5f5',
                        width: '40%',
                        fontWeight: 600,
                      }}
                    >
                      เลขที่
                    </td>
                    <td style={{ border: BORDER, padding: '4px 8px', fontWeight: 700 }}>
                      {doc.docNumber}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: BORDER,
                        padding: '4px 8px',
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                      }}
                    >
                      วันที่
                    </td>
                    <td style={{ border: BORDER, padding: '4px 8px' }}>
                      {formatDate(doc.issueDate)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: BORDER,
                        padding: '4px 8px',
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                      }}
                    >
                      ครบกำหนด
                    </td>
                    <td style={{ border: BORDER, padding: '4px 8px' }}>
                      {formatDate(doc.dueDate)}
                    </td>
                  </tr>
                  {doc.refDocNumber && (
                    <tr>
                      <td
                        style={{
                          border: BORDER,
                          padding: '4px 8px',
                          backgroundColor: '#f5f5f5',
                          fontWeight: 600,
                        }}
                      >
                        อ้างอิง
                      </td>
                      <td style={{ border: BORDER, padding: '4px 8px', fontSize: '9.5pt', color: '#555' }}>
                        {doc.refDocNumber}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Double rule */}
      <div style={{ borderTop: '3px solid #1a1a2e', borderBottom: '1px solid #1a1a2e', margin: '0 0 3mm' }} />

      {/* ══════════════════════════════════════════════
          CUSTOMER INFO
      ══════════════════════════════════════════════ */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '3mm',
          border: BORDER,
          fontSize: '10pt',
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: BORDER,
                padding: '4px 8px',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                fontWeight: 600,
                width: '12%',
                verticalAlign: 'top',
                whiteSpace: 'nowrap',
              }}
            >
              เรียน /
              <br />
              ลูกค้า
            </td>
            <td style={{ border: BORDER, padding: '4px 10px', width: '44%', verticalAlign: 'top' }}>
              <div style={{ fontWeight: 700, fontSize: '11pt' }}>{doc.customerName}</div>
              {doc.customerAddress && (
                <div style={{ whiteSpace: 'pre-line', color: '#333', fontSize: '9.5pt' }}>
                  {doc.customerAddress}
                </div>
              )}
              {doc.customerEmail && (
                <div style={{ color: '#333', fontSize: '9.5pt' }}>
                  อีเมล: {doc.customerEmail}
                </div>
              )}
            </td>
            <td
              style={{
                border: BORDER,
                padding: '4px 8px',
                backgroundColor: '#f5f5f5',
                fontWeight: 600,
                width: '16%',
                verticalAlign: 'top',
                whiteSpace: 'nowrap',
              }}
            >
              เลขผู้เสียภาษี
            </td>
            <td style={{ border: BORDER, padding: '4px 8px', width: '28%', verticalAlign: 'top' }}>
              <div>{doc.customerTaxId || '—'}</div>
              {doc.customerPhone && (
                <div style={{ marginTop: '2px', color: '#333' }}>โทร: {doc.customerPhone}</div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══════════════════════════════════════════════
          ITEMS TABLE
      ══════════════════════════════════════════════ */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '3mm',
        }}
      >
        <thead>
          <tr>
            {th('ลำดับ', { width: '6%', textAlign: 'center' })}
            {th('รายการสินค้า / บริการ', { width: '43%', textAlign: 'left' })}
            {th('จำนวน', { width: '10%', textAlign: 'center' })}
            {th('หน่วย', { width: '9%', textAlign: 'center' })}
            {th('ราคา/หน่วย (บาท)', { width: '16%', textAlign: 'right' })}
            {th('จำนวนเงิน (บาท)', { width: '16%', textAlign: 'right' })}
          </tr>
        </thead>
        <tbody>
          {doc.items.map((item, idx) => (
            <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
              {td(idx + 1, { textAlign: 'center' })}
              {td(item.description)}
              {td(item.qty, { textAlign: 'center' })}
              {td(item.unit, { textAlign: 'center' })}
              {td(formatMoney(item.unitPrice), { textAlign: 'right' })}
              {td(formatMoney(item.qty * item.unitPrice), {
                textAlign: 'right',
                fontWeight: 600,
              })}
            </tr>
          ))}
          {Array.from({ length: PAD_ROWS }).map((_, i) => (
            <tr key={`pad-${i}`} style={{ height: '18px' }}>
              {[...Array(6)].map((__, j) => (
                <td key={j} style={{ border: BORDER }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ══════════════════════════════════════════════
          SUMMARY SECTION (payment left, totals right)
      ══════════════════════════════════════════════ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3mm' }}>
        <tbody>
          <tr style={{ verticalAlign: 'top' }}>
            {/* Payment info */}
            <td style={{ width: '52%', paddingRight: '4mm' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: BORDER,
                  fontSize: '10pt',
                }}
              >
                <thead>
                  <tr>
                    <th
                      colSpan={2}
                      style={{
                        border: BORDER,
                        padding: '4px 8px',
                        backgroundColor: '#1a1a2e',
                        color: '#fff',
                        fontWeight: 600,
                        textAlign: 'left',
                      }}
                    >
                      ข้อมูลการชำระเงิน / Payment Info
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: BORDER,
                        padding: '4px 8px',
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                        width: '36%',
                      }}
                    >
                      ธนาคาร
                    </td>
                    <td style={{ border: BORDER, padding: '4px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          backgroundColor: '#138f2d',
                          borderRadius: '4px',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={COMPANY.bank.logoPath}
                            alt={COMPANY.bank.bankName}
                            style={{ height: '20px', width: '20px', objectFit: 'contain' }}
                          />
                        </div>
                        <span>{COMPANY.bank.bankName}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: BORDER,
                        padding: '4px 8px',
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                      }}
                    >
                      เลขที่บัญชี
                    </td>
                    <td style={{ border: BORDER, padding: '4px 8px', fontWeight: 700, fontSize: '11pt' }}>
                      {COMPANY.bank.accountNumber}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: BORDER,
                        padding: '4px 8px',
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                      }}
                    >
                      ชื่อบัญชี
                    </td>
                    <td style={{ border: BORDER, padding: '4px 8px' }}>
                      {COMPANY.bank.accountName}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: BORDER,
                        padding: '4px 8px',
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                      }}
                    >
                      ประเภท
                    </td>
                    <td style={{ border: BORDER, padding: '4px 8px' }}>
                      {COMPANY.bank.accountType}
                    </td>
                  </tr>
                  {doc.notes && (
                    <tr>
                      <td
                        colSpan={2}
                        style={{ border: BORDER, padding: '4px 8px', color: '#444', fontSize: '9.5pt' }}
                      >
                        <strong>หมายเหตุ:</strong> {doc.notes}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>

            {/* Totals */}
            <td style={{ width: '48%' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: BORDER,
                  fontSize: '10.5pt',
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: BORDER,
                        padding: '5px 10px',
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                      }}
                    >
                      ยอดรวม (บาท)
                    </td>
                    <td
                      style={{
                        border: BORDER,
                        padding: '5px 10px',
                        textAlign: 'right',
                        width: '42%',
                      }}
                    >
                      {formatMoney(totals.subtotal)}
                    </td>
                  </tr>
                  {doc.discountPercent > 0 && (
                    <tr>
                      <td
                        style={{
                          border: BORDER,
                          padding: '5px 10px',
                          backgroundColor: '#f5f5f5',
                          fontWeight: 600,
                          color: '#c0392b',
                        }}
                      >
                        ส่วนลด {doc.discountPercent}%
                      </td>
                      <td
                        style={{
                          border: BORDER,
                          padding: '5px 10px',
                          textAlign: 'right',
                          color: '#c0392b',
                        }}
                      >
                        -{formatMoney(totals.discount)}
                      </td>
                    </tr>
                  )}
                  {doc.taxMode !== 'none' && (
                    <>
                      <tr>
                        <td
                          style={{
                            border: BORDER,
                            padding: '5px 10px',
                            backgroundColor: '#f5f5f5',
                            fontWeight: 600,
                          }}
                        >
                          ยอดก่อนภาษี (บาท)
                        </td>
                        <td style={{ border: BORDER, padding: '5px 10px', textAlign: 'right' }}>
                          {formatMoney(totals.beforeTax)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            border: BORDER,
                            padding: '5px 10px',
                            backgroundColor: '#f5f5f5',
                            fontWeight: 600,
                          }}
                        >
                          ภาษีมูลค่าเพิ่ม 7%
                        </td>
                        <td style={{ border: BORDER, padding: '5px 10px', textAlign: 'right' }}>
                          {formatMoney(totals.tax)}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr style={{ backgroundColor: '#1a1a2e', color: '#fff' }}>
                    <td
                      style={{
                        border: '1px solid #1a1a2e',
                        padding: '7px 10px',
                        fontWeight: 700,
                        fontSize: '12pt',
                      }}
                    >
                      ยอดสุทธิ (บาท)
                    </td>
                    <td
                      style={{
                        border: '1px solid #1a1a2e',
                        padding: '7px 10px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontSize: '13pt',
                      }}
                    >
                      {formatMoney(totals.total)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        border: BORDER,
                        padding: '4px 8px',
                        fontSize: '10pt',
                        fontStyle: 'italic',
                        color: '#333',
                        textAlign: 'center',
                      }}
                    >
                      ({bahtText(totals.total)})
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══════════════════════════════════════════════
          SIGNATURE BLOCK
      ══════════════════════════════════════════════ */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: BORDER,
          marginBottom: '3mm',
          fontSize: '10pt',
        }}
      >
        <tbody>
          <tr>
            {/* Customer confirmation */}
            <td
              style={{
                border: BORDER,
                padding: '6px 10px',
                width: '50%',
                textAlign: 'center',
                verticalAlign: 'bottom',
              }}
            >
              <div style={{ minHeight: '14mm' }} />
              <div
                style={{ borderTop: '1px solid #333', paddingTop: '4px', fontSize: '10pt' }}
              >
                <div>ลายมือชื่อผู้รับสินค้า / บริการ</div>
                <div style={{ color: '#555', fontSize: '9.5pt' }}>
                  Authorized Signature (Customer)
                </div>
                <div style={{ marginTop: '2px', fontSize: '9pt', color: '#555' }}>
                  วันที่ ............................................
                </div>
              </div>
            </td>
            {/* Company authorized */}
            <td
              style={{
                border: BORDER,
                padding: '6px 10px',
                width: '50%',
                textAlign: 'center',
                verticalAlign: 'bottom',
              }}
            >
              <div style={{ minHeight: '14mm' }} />
              <div
                style={{ borderTop: '1px solid #333', paddingTop: '4px', fontSize: '10pt' }}
              >
                <div>ในนาม {COMPANY.name}</div>
                <div style={{ color: '#555', fontSize: '9.5pt' }}>
                  Authorized Signature (Issuer)
                </div>
                <div style={{ marginTop: '4px', fontSize: '9pt', color: '#555' }}>
                  วันที่ ............................................
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══════════════════════════════════════════════
          DOCUMENT FOOTER
      ══════════════════════════════════════════════ */}
      <div
        style={{
          borderTop: '2px solid #1a1a2e',
          paddingTop: '3px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '8.5pt',
          color: '#555',
        }}
      >
        <span>
          {COMPANY.name} | เลขประจำตัวผู้เสียภาษี {COMPANY.taxId} |{' '}
          {COMPANY.bank.bankName} เลขที่ {COMPANY.bank.accountNumber}
        </span>
        <span style={{ whiteSpace: 'nowrap', marginLeft: '4mm' }}>
          เอกสารออกโดยระบบคอมพิวเตอร์ — เลขที่ {doc.docNumber}
        </span>
      </div>
    </div>
  );
}
