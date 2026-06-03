const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const tens = ['', 'สิบ', 'ยี่สิบ', 'สามสิบ', 'สี่สิบ', 'ห้าสิบ', 'หกสิบ', 'เจ็ดสิบ', 'แปดสิบ', 'เก้าสิบ'];
const millions = ['', 'ล้าน'];

function thaiHundreds(n: number): string {
  if (n === 0) return '';
  let s = '';
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  if (h > 0) s += ones[h] + 'ร้อย';
  if (t > 0) {
    s += tens[t];
    if (t === 1 && o > 0) s += ones[o] === 'หนึ่ง' ? 'เอ็ด' : ones[o];
    else if (o > 0) s += ones[o];
  } else if (o > 0) {
    s += ones[o];
  }
  return s;
}

function thaiThousands(n: number): string {
  if (n === 0) return '';
  const millions_part = Math.floor(n / 1_000_000);
  const rest = n % 1_000_000;
  const thousands = Math.floor(rest / 1000);
  const hundreds = rest % 1000;
  let s = '';
  if (millions_part > 0) s += thaiThousands(millions_part) + 'ล้าน';
  if (thousands > 0) s += thaiHundreds(thousands) + 'พัน';
  if (hundreds > 0) s += thaiHundreds(hundreds);
  return s;
}

export function bahtText(amount: number): string {
  if (amount === 0) return 'ศูนย์บาทถ้วน';
  const rounded = Math.round(amount * 100) / 100;
  const baht = Math.floor(rounded);
  const satang = Math.round((rounded - baht) * 100);

  let text = '';
  if (baht > 0) text += thaiThousands(baht) + 'บาท';
  if (satang > 0) text += thaiHundreds(satang) + 'สตางค์';
  else text += 'ถ้วน';
  return text;
}
