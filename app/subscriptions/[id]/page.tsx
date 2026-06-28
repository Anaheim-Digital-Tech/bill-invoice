'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container, Stack, Group, Button, Title, Text, Paper, Table, Badge, Loader, Center,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlayerPlay, IconPrinter } from '@tabler/icons-react';
import type { Subscription, InvoiceDoc } from '../../../lib/types';
import {
  getSubscription, getSubscriptionInvoices, generateBilling,
} from '../../../lib/subscriptions';
import { DOC_STATUS_LABELS, DOC_STATUS_COLORS } from '../../../lib/constants';
import { formatDate, formatMoney, calcTotals } from '../../../lib/utils';
import { thaiPeriodLabel, periodFromDate } from '../../../lib/subscriptionBilling';
import { SubscriptionForm } from '../../../components/SubscriptionForm';
import { AppHeader } from '../../../components/AppHeader';

export default function SubscriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [sub, setSub] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<InvoiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const reload = useCallback(async () => {
    const [s, invs] = await Promise.all([
      getSubscription(id),
      getSubscriptionInvoices(id),
    ]);
    setSub(s);
    setInvoices(invs);
    setLoading(false);
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateBilling({ subscriptionId: id, force: true });
      if (result.generated > 0) {
        notifications.show({
          title: `ออกบิล ${result.invoices[0].docNumber}`,
          message: '',
          color: 'green',
        });
        await reload();
      } else {
        notifications.show({ title: 'ออกบิลงวดนี้แล้ว', message: '', color: 'blue' });
      }
    } catch {
      notifications.show({ title: 'ออกบิลไม่สำเร็จ', message: '', color: 'red' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader backTo="/subscriptions" backLabel="กลับรายการสัญญา" />
        <Center py="xl"><Loader /></Center>
      </>
    );
  }

  if (!sub) {
    return (
      <>
        <AppHeader backTo="/subscriptions" backLabel="กลับรายการสัญญา" />
        <Container py="lg"><Text>ไม่พบสัญญา</Text></Container>
      </>
    );
  }

  const currentPeriod = periodFromDate();
  const billedThisPeriod = sub.lastBilledPeriod === currentPeriod;

  return (
    <>
      <AppHeader backTo="/subscriptions" backLabel="กลับรายการสัญญา" />
      <Container size="md" py="lg">
        <Stack gap="lg">
          <Group justify="space-between">
            <div>
              <Title order={3}>{sub.name}</Title>
              <Text c="dimmed" size="sm">{sub.customerName}</Text>
            </div>
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              onClick={handleGenerate}
              loading={generating}
              disabled={sub.status !== 'active' || billedThisPeriod}
            >
              {billedThisPeriod ? 'ออกบิลงวดนี้แล้ว' : `ออกบิล ${thaiPeriodLabel(currentPeriod)}`}
            </Button>
          </Group>

          <SubscriptionForm initial={sub} />

          <Paper withBorder p="md">
            <Title order={5} mb="md">ประวัติใบแจ้งหนี้ ({invoices.length})</Title>
            {invoices.length === 0 ? (
              <Text c="dimmed" size="sm">ยังไม่มีใบแจ้งหนี้จากสัญญานี้</Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>เลขที่</Table.Th>
                    <Table.Th>งวด</Table.Th>
                    <Table.Th>วันที่ออก</Table.Th>
                    <Table.Th>ยอด</Table.Th>
                    <Table.Th>สถานะ</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {invoices.map((inv) => {
                    const { total } = calcTotals(inv.items, inv.discountPercent, inv.taxMode);
                    return (
                      <Table.Tr key={inv.id}>
                        <Table.Td fw={500}>{inv.docNumber}</Table.Td>
                        <Table.Td>
                          {inv.billingPeriod ? thaiPeriodLabel(inv.billingPeriod) : '-'}
                        </Table.Td>
                        <Table.Td>{formatDate(inv.issueDate)}</Table.Td>
                        <Table.Td>{formatMoney(total)}</Table.Td>
                        <Table.Td>
                          <Badge color={DOC_STATUS_COLORS[inv.status]} variant="light">
                            {DOC_STATUS_LABELS[inv.status]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Button
                            size="xs"
                            variant="light"
                            leftSection={<IconPrinter size={14} />}
                            onClick={() => router.push(`/invoices/${inv.id}/print`)}
                          >
                            พิมพ์
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
