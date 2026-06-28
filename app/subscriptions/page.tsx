'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Group, Title, Button, Table, Badge, Text, Stack,
  Paper, TextInput, SimpleGrid, ActionIcon, Menu,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPlus, IconSearch, IconRefresh, IconDots, IconEdit,
  IconFileInvoice, IconPlayerPlay,
} from '@tabler/icons-react';
import type { Subscription } from '../../lib/types';
import { getAllSubscriptions, generateBilling } from '../../lib/subscriptions';
import {
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
} from '../../lib/constants';
import { formatMoney, calcTotals } from '../../lib/utils';
import { thaiPeriodLabel, periodFromDate } from '../../lib/subscriptionBilling';
import { AppHeader } from '../../components/AppHeader';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState(false);

  const reload = useCallback(async () => {
    const data = await getAllSubscriptions();
    setSubs(data);
  }, []);

  const runAutoBilling = useCallback(async () => {
    try {
      const result = await generateBilling();
      if (result.generated > 0) {
        notifications.show({
          title: `ออกบิลอัตโนมัติ ${result.generated} รายการ`,
          message: result.invoices.map((i) => i.docNumber).join(', '),
          color: 'green',
        });
        await reload();
      }
    } catch {
      /* silent on auto-run */
    }
  }, [reload]);

  useEffect(() => {
    reload().then(() => runAutoBilling());
  }, [reload, runAutoBilling]);

  const filtered = subs.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q);
  });

  const activeCount = subs.filter((s) => s.status === 'active').length;
  const currentPeriod = periodFromDate();
  const monthlyTotal = subs
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.qty * s.monthlyAmount, 0);

  const handleGenerateAll = async () => {
    setGenerating(true);
    try {
      const result = await generateBilling({ force: true, period: currentPeriod });
      if (result.generated === 0) {
        notifications.show({ title: 'ไม่มีบิลที่ต้องออก', message: 'ออกครบงวดนี้แล้ว', color: 'blue' });
      } else {
        notifications.show({
          title: `ออกบิล ${result.generated} รายการ`,
          message: result.invoices.map((i) => i.docNumber).join(', '),
          color: 'green',
        });
        await reload();
      }
    } catch {
      notifications.show({ title: 'ออกบิลไม่สำเร็จ', message: '', color: 'red' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <AppHeader backTo="/" backLabel="กลับ Dashboard" />
      <Container size="xl" py="lg">
        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Title order={2}>สัญญาเช่ารายเดือน</Title>
              <Text c="dimmed" size="sm">ออกใบแจ้งหนี้อัตโนมัติตามรอบบิล — งวดปัจจุบัน {thaiPeriodLabel(currentPeriod)}</Text>
            </div>
            <Group>
              <Button
                variant="light"
                leftSection={<IconPlayerPlay size={16} />}
                onClick={handleGenerateAll}
                loading={generating}
              >
                ออกบิลงวดนี้ทั้งหมด
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push('/subscriptions/new')}
              >
                สร้างสัญญาใหม่
              </Button>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Paper p="md" withBorder>
              <Text size="sm" c="dimmed">สัญญาที่ใช้งาน</Text>
              <Text size="xl" fw={700}>{activeCount}</Text>
            </Paper>
            <Paper p="md" withBorder>
              <Text size="sm" c="dimmed">รายได้รายเดือน (ก่อนภาษี)</Text>
              <Text size="xl" fw={700}>{formatMoney(monthlyTotal)}</Text>
            </Paper>
            <Paper p="md" withBorder>
              <Text size="sm" c="dimmed">สัญญาทั้งหมด</Text>
              <Text size="xl" fw={700}>{subs.length}</Text>
            </Paper>
          </SimpleGrid>

          <Group>
            <TextInput
              placeholder="ค้นหาชื่อสัญญา / ลูกค้า"
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <ActionIcon variant="light" size="lg" onClick={reload} aria-label="รีเฟรช">
              <IconRefresh size={18} />
            </ActionIcon>
          </Group>

          <Paper withBorder>
            <Table.ScrollContainer minWidth={700}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ชื่อสัญญา</Table.Th>
                    <Table.Th>ลูกค้า</Table.Th>
                    <Table.Th>ยอด/เดือน</Table.Th>
                    <Table.Th>ตัดรอบ</Table.Th>
                    <Table.Th>งวดล่าสุด</Table.Th>
                    <Table.Th>สถานะ</Table.Th>
                    <Table.Th w={50} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Text ta="center" c="dimmed" py="lg">ยังไม่มีสัญญาเช่ารายเดือน</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filtered.map((s) => {
                      const monthly = s.qty * s.monthlyAmount;
                      const { total } = calcTotals(
                        [{ id: '1', description: '', qty: s.qty, unit: s.unit, unitPrice: s.monthlyAmount }],
                        s.discountPercent,
                        s.taxMode
                      );
                      return (
                        <Table.Tr
                          key={s.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => router.push(`/subscriptions/${s.id}`)}
                        >
                          <Table.Td fw={500}>{s.name}</Table.Td>
                          <Table.Td>{s.customerName}</Table.Td>
                          <Table.Td>
                            <Text size="sm">{formatMoney(monthly)}</Text>
                            <Text size="xs" c="dimmed">รวม {formatMoney(total)}</Text>
                          </Table.Td>
                          <Table.Td>วันที่ {s.billingDay}</Table.Td>
                          <Table.Td>
                            {s.lastBilledPeriod
                              ? thaiPeriodLabel(s.lastBilledPeriod)
                              : <Text c="dimmed" size="sm">ยังไม่ออก</Text>}
                          </Table.Td>
                          <Table.Td>
                            <Badge color={SUBSCRIPTION_STATUS_COLORS[s.status]} variant="light">
                              {SUBSCRIPTION_STATUS_LABELS[s.status]}
                            </Badge>
                          </Table.Td>
                          <Table.Td onClick={(e) => e.stopPropagation()}>
                            <Menu position="bottom-end">
                              <Menu.Target>
                                <ActionIcon variant="subtle"><IconDots size={16} /></ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconEdit size={14} />}
                                  onClick={() => router.push(`/subscriptions/${s.id}`)}
                                >
                                  แก้ไข
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconFileInvoice size={14} />}
                                  onClick={async () => {
                                    try {
                                      const r = await generateBilling({ subscriptionId: s.id, force: true });
                                      if (r.generated > 0) {
                                        notifications.show({ title: `ออกบิล ${r.invoices[0].docNumber}`, message: '', color: 'green' });
                                        reload();
                                      } else {
                                        notifications.show({ title: 'ออกบิลงวดนี้แล้ว', message: '', color: 'blue' });
                                      }
                                    } catch {
                                      notifications.show({ title: 'ออกบิลไม่สำเร็จ', message: '', color: 'red' });
                                    }
                                  }}
                                >
                                  ออกบิลงวดนี้
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
