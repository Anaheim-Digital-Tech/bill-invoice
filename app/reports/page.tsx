'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Group, Title, Button, Paper, Text, Box,
  SimpleGrid, Select, Table, Badge, Stack,
} from '@mantine/core';
import { IconArrowLeft, IconFileInvoice, IconCurrencyBaht, IconClock, IconX } from '@tabler/icons-react';
import type { InvoiceDoc } from '../../lib/types';
import { getAllDocs } from '../../lib/store';
import { DOC_STATUS_LABELS, DOC_STATUS_COLORS, COMPANY } from '../../lib/constants';
import { calcTotals, formatMoney, formatDate } from '../../lib/utils';

const MONTHS = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
];

export default function ReportsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<InvoiceDoc[]>([]);
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));

  useEffect(() => { getAllDocs().then(setDocs); }, []);

  const filtered = docs.filter((d) => {
    const [y, m] = d.issueDate.split('-');
    return y === year && (month === '0' || m === month.padStart(2, '0'));
  });

  const years = Array.from(
    new Set(docs.map((d) => d.issueDate.split('-')[0]))
  ).sort((a, b) => Number(b) - Number(a));
  if (!years.includes(year)) years.unshift(year);

  const totalAll = filtered.reduce((s, d) => s + calcTotals(d.items, d.discountPercent, d.taxMode).total, 0);
  const totalPaid = filtered.filter(d => d.status === 'paid').reduce((s, d) => s + calcTotals(d.items, d.discountPercent, d.taxMode).total, 0);
  const totalPending = filtered.filter(d => d.status === 'sent' || d.status === 'overdue').reduce((s, d) => s + calcTotals(d.items, d.discountPercent, d.taxMode).total, 0);
  const totalCancelled = filtered.filter(d => d.status === 'cancelled').reduce((s, d) => s + calcTotals(d.items, d.discountPercent, d.taxMode).total, 0);

  // Monthly summary for the selected year
  const monthlySummary = MONTHS.map((name, idx) => {
    const m = String(idx + 1).padStart(2, '0');
    const monthDocs = docs.filter((d) => {
      const [y, dm] = d.issueDate.split('-');
      return y === year && dm === m;
    });
    const total = monthDocs.reduce((s, d) => s + calcTotals(d.items, d.discountPercent, d.taxMode).total, 0);
    const paid = monthDocs.filter(d => d.status === 'paid').reduce((s, d) => s + calcTotals(d.items, d.discountPercent, d.taxMode).total, 0);
    return { name, count: monthDocs.length, total, paid };
  });

  const maxTotal = Math.max(...monthlySummary.map(m => m.total), 1);

  return (
    <Box>
      <Box style={{ position: 'sticky', top: 0, zIndex: 200, backgroundColor: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="no-print">
        <Container size="xl" py="sm">
          <Group justify="space-between">
            <Group gap="xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-dark.png" alt="logo" style={{ height: 40, objectFit: 'contain' }} />
              <Text fw={700} size="sm" c="white">รายงานสรุปยอด</Text>
            </Group>
            <Button variant="subtle" color="gray.3" size="sm" leftSection={<IconArrowLeft size={16} />} onClick={() => router.push('/')}>
              กลับ Dashboard
            </Button>
          </Group>
        </Container>
      </Box>

      <Container size="xl" py="lg">
        <Stack gap="lg">
          {/* Filters */}
          <Group>
            <Select
              label="ปี"
              data={years.map(y => ({ value: y, label: y }))}
              value={year}
              onChange={v => v && setYear(v)}
              w={100}
            />
            <Select
              label="เดือน"
              data={[{ value: '0', label: 'ทั้งหมด' }, ...MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))]}
              value={month}
              onChange={v => v && setMonth(v)}
              w={160}
            />
          </Group>

          {/* Summary cards */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <Paper withBorder p="md" radius="md">
              <Group gap="xs" mb={4}>
                <IconFileInvoice size={18} color="var(--mantine-color-blue-6)" />
                <Text size="xs" c="dimmed">เอกสาร</Text>
              </Group>
              <Text size="xl" fw={700}>{filtered.length} ฉบับ</Text>
            </Paper>
            <Paper withBorder p="md" radius="md">
              <Group gap="xs" mb={4}>
                <IconCurrencyBaht size={18} color="var(--mantine-color-blue-6)" />
                <Text size="xs" c="dimmed">ยอดรวมทั้งหมด</Text>
              </Group>
              <Text size="xl" fw={700} c="blue">฿{formatMoney(totalAll)}</Text>
            </Paper>
            <Paper withBorder p="md" radius="md">
              <Group gap="xs" mb={4}>
                <IconCurrencyBaht size={18} color="var(--mantine-color-green-6)" />
                <Text size="xs" c="dimmed">ชำระแล้ว</Text>
              </Group>
              <Text size="xl" fw={700} c="green">฿{formatMoney(totalPaid)}</Text>
            </Paper>
            <Paper withBorder p="md" radius="md">
              <Group gap="xs" mb={4}>
                <IconClock size={18} color="var(--mantine-color-orange-6)" />
                <Text size="xs" c="dimmed">รอชำระ</Text>
              </Group>
              <Text size="xl" fw={700} c="orange">฿{formatMoney(totalPending)}</Text>
            </Paper>
          </SimpleGrid>

          {/* Bar chart (CSS-based) */}
          <Paper withBorder p="md" radius="md">
            <Title order={5} mb="md">ยอดรายเดือน — ปี {year}</Title>
            <Box style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, padding: '0 4px' }}>
              {monthlySummary.map((m, i) => (
                <Box key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Text size="9px" c="dimmed" ta="center" style={{ whiteSpace: 'nowrap' }}>
                    {m.total > 0 ? `฿${(m.total / 1000).toFixed(0)}K` : ''}
                  </Text>
                  <Box style={{ width: '100%', position: 'relative', height: 120, display: 'flex', alignItems: 'flex-end', flexDirection: 'column', gap: 1 }}>
                    {/* Paid bar */}
                    <Box style={{
                      width: '100%',
                      height: `${(m.paid / maxTotal) * 120}px`,
                      backgroundColor: 'var(--mantine-color-green-5)',
                      borderRadius: '3px 3px 0 0',
                      minHeight: m.paid > 0 ? 2 : 0,
                    }} />
                    {/* Total bar */}
                    <Box style={{
                      width: '100%',
                      height: `${((m.total - m.paid) / maxTotal) * 120}px`,
                      backgroundColor: 'var(--mantine-color-blue-3)',
                      minHeight: (m.total - m.paid) > 0 ? 2 : 0,
                    }} />
                  </Box>
                  <Text size="9px" c="dimmed" ta="center">{m.name.slice(0, 3)}</Text>
                </Box>
              ))}
            </Box>
            <Group gap="md" mt="xs">
              <Group gap={4}><Box style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--mantine-color-green-5)' }} /><Text size="xs">ชำระแล้ว</Text></Group>
              <Group gap={4}><Box style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--mantine-color-blue-3)' }} /><Text size="xs">รอชำระ</Text></Group>
            </Group>
          </Paper>

          {/* Monthly table */}
          <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>เดือน</Table.Th>
                  <Table.Th ta="center">จำนวนเอกสาร</Table.Th>
                  <Table.Th ta="right">ยอดรวม (฿)</Table.Th>
                  <Table.Th ta="right">ชำระแล้ว (฿)</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {monthlySummary.filter(m => m.count > 0).map((m, i) => (
                  <Table.Tr key={i}>
                    <Table.Td><Text size="sm">{m.name}</Text></Table.Td>
                    <Table.Td ta="center"><Text size="sm">{m.count}</Text></Table.Td>
                    <Table.Td ta="right"><Text size="sm" fw={500}>{formatMoney(m.total)}</Text></Table.Td>
                    <Table.Td ta="right"><Text size="sm" c="green">{formatMoney(m.paid)}</Text></Table.Td>
                  </Table.Tr>
                ))}
                {monthlySummary.every(m => m.count === 0) && (
                  <Table.Tr><Table.Td colSpan={4}><Text ta="center" c="dimmed" py="md" size="sm">ไม่มีข้อมูลในช่วงที่เลือก</Text></Table.Td></Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>

          {/* Detail table */}
          {filtered.length > 0 && (
            <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
              <Title order={5} p="md" pb={0}>รายการเอกสาร {month !== '0' ? MONTHS[Number(month) - 1] : ''} {year}</Title>
              <Table highlightOnHover mt="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>เลขที่</Table.Th>
                    <Table.Th>ลูกค้า</Table.Th>
                    <Table.Th>วันที่</Table.Th>
                    <Table.Th ta="right">ยอด (฿)</Table.Th>
                    <Table.Th>สถานะ</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((doc) => {
                    const { total } = calcTotals(doc.items, doc.discountPercent, doc.taxMode);
                    return (
                      <Table.Tr key={doc.id}>
                        <Table.Td><Text size="sm" fw={500}>{doc.docNumber}</Text></Table.Td>
                        <Table.Td><Text size="sm">{doc.customerName}</Text></Table.Td>
                        <Table.Td><Text size="sm">{formatDate(doc.issueDate)}</Text></Table.Td>
                        <Table.Td ta="right"><Text size="sm" fw={500}>{formatMoney(total)}</Text></Table.Td>
                        <Table.Td>
                          <Badge color={DOC_STATUS_COLORS[doc.status]} variant="light" size="sm">
                            {DOC_STATUS_LABELS[doc.status]}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
