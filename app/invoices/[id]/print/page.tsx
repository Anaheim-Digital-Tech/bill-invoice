'use client';

import { useState, useEffect, use } from 'react';
import { Button, Group, Text, Container, Center, Loader, SegmentedControl } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { IconPrinter, IconArrowLeft } from '@tabler/icons-react';
import { PrintView } from '../../../../components/PrintView';
import { getDoc } from '../../../../lib/store';
import { getSubscription } from '../../../../lib/subscriptions';
import { thaiPeriodLabel } from '../../../../lib/subscriptionBilling';
import type { InvoiceDoc } from '../../../../lib/types';

type PrintMode = 'original' | 'copy' | 'both';

export default function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<InvoiceDoc | null | undefined>(undefined);
  const [subscriptionLabel, setSubscriptionLabel] = useState<string | undefined>();
  const [printMode, setPrintMode] = useState<PrintMode>('original');

  useEffect(() => {
    getDoc(id).then(async (d) => {
      setDoc(d ?? null);
      if (!d?.subscriptionId) {
        setSubscriptionLabel(undefined);
        return;
      }
      const name = d.subscriptionName
        ?? (await getSubscription(d.subscriptionId).catch(() => null))?.name;
      if (!name) {
        setSubscriptionLabel(undefined);
        return;
      }
      const period = d.billingPeriod ? ` · งวด ${thaiPeriodLabel(d.billingPeriod)}` : '';
      setSubscriptionLabel(`${name}${period}`);
    });
  }, [id]);

  if (doc === undefined) return <Center py={80}><Loader /></Center>;

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
        <Group wrap="wrap" gap="sm">
          <Button
            variant="subtle"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            กลับ
          </Button>
          <SegmentedControl
            size="sm"
            value={printMode}
            onChange={(v) => setPrintMode(v as PrintMode)}
            data={[
              { label: 'ต้นฉบับ', value: 'original' },
              { label: 'สำเนา', value: 'copy' },
              { label: 'ทั้งสอง (2 หน้า)', value: 'both' },
            ]}
          />
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
      {printMode === 'both' ? (
        <>
          <PrintView doc={doc} copy={false} subscriptionLabel={subscriptionLabel} />
          <div style={{ pageBreakAfter: 'always', height: 0 }} />
          <PrintView doc={doc} copy={true} subscriptionLabel={subscriptionLabel} />
        </>
      ) : (
        <PrintView doc={doc} copy={printMode === 'copy'} subscriptionLabel={subscriptionLabel} />
      )}
    </div>
  );
}
