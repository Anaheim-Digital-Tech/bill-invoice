import type { DocType } from './types';
import { DOC_TYPE_PREFIX } from './constants';
import { InvoiceModel } from '../models/Invoice';

export async function generateDocNumber(docType: DocType): Promise<string> {
  const prefix = DOC_TYPE_PREFIX[docType];
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const header = `${prefix}${yy}${mm}`;
  const count = await InvoiceModel.countDocuments({
    docNumber: { $regex: `^${header}` },
  });
  return `${header}${String(count + 1).padStart(3, '0')}`;
}
