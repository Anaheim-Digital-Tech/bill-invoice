export interface Contact {
  id: string;
  name: string;
  address: string;
  taxId: string;
  phone: string;
  email: string;
}

const BASE = '/api/contacts';

export async function getAllContacts(): Promise<Contact[]> {
  const res = await fetch(BASE, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function saveContact(c: Contact): Promise<void> {
  await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c),
  });
}

export async function deleteContact(id: string): Promise<void> {
  await fetch(`${BASE}/${id}`, { method: 'DELETE' });
}
