import type { DocType, DocStatus, TaxMode } from './types';

export const STATUS_BY_TYPE: Record<DocType, DocStatus[]> = {
  salesorder: ['draft', 'sent', 'paid', 'cancelled'],
  quotation: ['draft', 'sent', 'cancelled'],
  invoice: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
  receipt: ['paid', 'cancelled'],
};

export const DUE_DATE_LABEL: Record<DocType, string> = {
  salesorder: 'วันที่ต้องการสินค้า',
  quotation: 'ใช้ได้ถึง',
  invoice: 'วันครบกำหนด',
  receipt: 'วันที่รับชำระ',
};

export const PAYMENT_METHODS = [
  { value: 'transfer', label: 'โอนเงิน' },
  { value: 'cash', label: 'เงินสด' },
  { value: 'cheque', label: 'เช็ค' },
  { value: 'creditcard', label: 'บัตรเครดิต' },
];

export const COMPANY = {
  name: 'บริษัท อนาไฮม์ ดิจิทัล เทค จำกัด',
  nameEn: 'ANAHEIM DIGITAL TECH CO.,LTD.',
  taxId: '0125569013554',
  address:
    'เลขที่ 119/17 หมู่ 8 หมู่บ้านพลีโน่ บางใหญ่\nตำบลเสาธงหิน อำเภอบางใหญ่ จังหวัดนนทบุรี 11140',
  contacts: [
    { name: 'พีรวัส สายเกษม', idCard: '1103700435824', phone: '063-881-6168' },
    { name: '', idCard: '1147500000691', phone: '084-585-0770' },
  ],
  bank: {
    bankName: 'ธนาคารกสิกรไทย (KBank)',
    accountName: 'บริษัท อนาไฮม์ ดิจิทัล เทค จำกัด',
    accountNumber: '213-8-28190-7',
    accountType: 'ออมทรัพย์',
    logoPath: '/kbank.svg',
  },
} as const;

export const TAX_RATE = 0.07;

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  salesorder: 'ใบสั่งขาย',
  quotation: 'ใบเสนอราคา',
  invoice: 'ใบแจ้งหนี้',
  receipt: 'ใบเสร็จรับเงิน / ใบกำกับภาษี',
};

export const DOC_TYPE_PREFIX: Record<DocType, string> = {
  salesorder: 'SO',
  quotation: 'QT',
  invoice: 'IV',
  receipt: 'RC',
};

export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  draft: 'ร่าง',
  sent: 'ส่งแล้ว',
  paid: 'ชำระแล้ว',
  overdue: 'เกินกำหนด',
  cancelled: 'ยกเลิก',
};

export const DOC_STATUS_COLORS: Record<DocStatus, string> = {
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
  cancelled: 'dark',
};

export const TAX_MODE_LABELS: Record<TaxMode, string> = {
  excluded: 'ภาษี 7% (แยก)',
  included: 'ภาษี 7% (รวม)',
  none: 'ไม่มีภาษี',
};
