export interface Contact {
  id: string;
  name: string;
  address: string;
  taxId: string;
  phone: string;
  email: string;
}

const BASE = '/api/contacts';

function checkAuth(res: Response) {
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/signin';
    throw new Error('Unauthorized');
  }
}

export async function getAllContacts(): Promise<Contact[]> {
  try {
    const res = await fetch(BASE, { cache: 'no-store' });
    checkAuth(res);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function saveContact(c: Contact): Promise<boolean> {
  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });
    checkAuth(res);
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteContact(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    checkAuth(res);
    return res.ok;
  } catch {
    return false;
  }
}
