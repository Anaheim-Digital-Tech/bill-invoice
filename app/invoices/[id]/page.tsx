'use client';

import { useState, useEffect, use } from 'react';
import { Container, Title, Text, Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { InvoiceForm } from '../../../components/InvoiceForm';
import { getDoc } from '../../../lib/store';
import type { InvoiceDoc } from '../../../lib/types';

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<InvoiceDoc | null | undefined>(undefined);

  useEffect(() => {
    getDoc(id).then((d) => setDoc(d ?? null));
  }, [id]);

  if (doc === undefined) return null;

  if (doc === null) {
    return (
      <Container py="xl">
        <Title order={3}>ไม่พบเอกสาร</Title>
        <Text c="dimmed" mt="sm">
          เอกสารที่คุณต้องการอาจถูกลบไปแล้ว
        </Text>
        <Button mt="md" onClick={() => router.push('/')}>
          กลับหน้าหลัก
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Title order={3} mb="lg">
        แก้ไขเอกสาร
      </Title>
      <InvoiceForm initial={doc} />
    </Container>
  );
}
