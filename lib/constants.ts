import type { DocType, DocStatus, TaxMode } from './types';

export const OPERATIONAL_DOC_TYPES: DocType[] = [
  'goodsreceipt',
  'equipmentcheck',
  'equipmentloan',
];

export function isOperationalDocType(t: DocType): boolean {
  return OPERATIONAL_DOC_TYPES.includes(t);
}

export const STATUS_BY_TYPE: Record<DocType, DocStatus[]> = {
  salesorder: ['draft', 'sent', 'paid', 'cancelled'],
  quotation: ['draft', 'sent', 'cancelled'],
  invoice: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
  receipt: ['paid', 'cancelled'],
  goodsreceipt: ['draft', 'sent', 'completed', 'cancelled'],
  equipmentcheck: ['draft', 'sent', 'completed', 'cancelled'],
  equipmentloan: ['draft', 'sent', 'completed', 'cancelled'],
};

export const DUE_DATE_LABEL: Record<DocType, string> = {
  salesorder: 'วันที่ต้องการสินค้า',
  quotation: 'ใช้ได้ถึง',
  invoice: 'วันครบกำหนด',
  receipt: 'วันที่รับชำระ',
  goodsreceipt: 'วันที่รับของ',
  equipmentcheck: 'วันที่ตรวจรับ',
  equipmentloan: 'วันที่สิ้นสุดสัญญา',
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
  goodsreceipt: 'ใบรับของ',
  equipmentcheck: 'ใบตรวจรับอุปกรณ์ / ใบบันทึกสภาพอุปกรณ์',
  equipmentloan: 'บันทึกข้อตกลงการยืม/ใช้งานอุปกรณ์ (ส่งมอบ-รับมอบ)',
};

export const DOC_TYPE_PREFIX: Record<DocType, string> = {
  salesorder: 'SO',
  quotation: 'QT',
  invoice: 'IV',
  receipt: 'RC',
  goodsreceipt: 'GR',
  equipmentcheck: 'EC',
  equipmentloan: 'EL',
};

export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  draft: 'ร่าง',
  sent: 'ส่งแล้ว',
  paid: 'ชำระแล้ว',
  overdue: 'เกินกำหนด',
  cancelled: 'ยกเลิก',
  completed: 'เสร็จสิ้น',
};

export const DOC_STATUS_COLORS: Record<DocStatus, string> = {
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
  cancelled: 'dark',
  completed: 'teal',
};

export const TAX_MODE_LABELS: Record<TaxMode, string> = {
  excluded: 'ภาษี 7% (แยก)',
  included: 'ภาษี 7% (รวม)',
  none: 'ไม่มีภาษี',
};

/** เอกสาร operational ที่ครบ 1 ปีจะถูก archive อัตโนมัติ */
export const ARCHIVE_AFTER_YEARS = 1;

/** เงื่อนไขมาตรฐานท้ายใบส่งมอบ-รับมอบ (พิมพ์อัตโนมัติ) */
export const EQUIPMENT_LOAN_DEFAULT_TERMS = [
  'ผู้รับมอบรับทราบและยอมรับสภาพอุปกรณ์ตามที่ระบุในเอกสารนี้ รวมถึงรายการที่เขียนเพิ่มเติมด้วยลายมือ',
  'ผู้รับมอบตกลงใช้งานอุปกรณ์เพื่อวัตถุประสงค์ตามที่ตกลงเท่านั้น ห้ามนำไปให้บุคคลอื่นใช้งานหรือจำหน่ายโดยไม่ได้รับอนุญาต',
  'ผู้รับมอบรับผิดชอบดูแลรักษาอุปกรณ์ สายไฟ อุปกรณ์เสริม และอะไหล่ที่ได้รับมอบให้อยู่ในสภาพสมบูรณ์ใช้งานได้',
  'หากอุปกรณ์ สาย หรืออุปกรณ์เสริมสูญหาย ชำรุด หรือเสียหายจากการใช้งาน ผู้รับมอบตกลงชดใช้ค่าเสียหายตามมูลค่าจริงหรือตามที่ผู้ส่งมอบกำหนด',
  'เมื่อครบกำหนดหรือเมื่อสิ้นสุดการใช้งาน ผู้รับมอบตกลงส่งคืนอุปกรณ์พร้อมอุปกรณ์เสริมทั้งหมดภายในระยะเวลาที่กำหนด',
  'การส่งมอบ-รับมอบครั้งนี้มีผลสมบูรณ์เมื่อทั้งสองฝ่ายลงลายมือชื่อและระบุวันที่ครบถ้วน',
];
