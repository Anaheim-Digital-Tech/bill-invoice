'use client';

import { useState, useEffect, use } from 'react';
import { Button, Group, Text, Container } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { IconPrinter, IconArrowLeft } from '@tabler/icons-react';
import { PrintView } from '../../../../components/PrintView';
import { getDoc } from '../../../../lib/store';
import type { InvoiceDoc } from '../../../../lib/types';

export default function PrintPage({ params }: { params: Promise<{ id: string }> }) {
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
        <Text>ไม่พบเอกสาร</Text>
        <Button mt="md" onClick={() => router.push('/')}>
          กลับหน้าหลัก
        </Button>
      </Container>
    );
  }

  return (
    <div>
      {/* Toolbar — hidden when printing */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          padding: '8px 16px',
        }}
      >
        <Group>
          <Button
            variant="subtle"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            กลับ
          </Button>
          <Button
            size="sm"
            leftSection={<IconPrinter size={16} />}
            onClick={() => window.print()}
          >
            พิมพ์ / บันทึก PDF
          </Button>
        </Group>
      </div>

      {/* Print content */}
      <PrintView doc={doc} />
    </div>
  );
}
