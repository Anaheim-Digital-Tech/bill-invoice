'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Group, Title, Button, Table, Badge, ActionIcon,
  Menu, Text, Stack, SimpleGrid, Paper, TextInput, Select, Box,
  ScrollArea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconDots, IconPrinter, IconEdit, IconTrash, IconSearch,
  IconFileInvoice, IconCurrencyBaht, IconClock, IconCopy, IconDownload,
} from '@tabler/icons-react';
import type { InvoiceDoc, DocStatus } from '../lib/types';
import { getAllDocs, deleteDoc, saveDoc } from '../lib/store';
import {
  DOC_TYPE_LABELS, DOC_STATUS_LABELS, DOC_STATUS_COLORS, DOC_TYPE_PREFIX, COMPANY,
} from '../lib/constants';
import { formatDate, formatMoney, calcTotals, uid, todayISO } from '../lib/utils';
import { AppHeader } from '../components/AppHeader';

export default function HomePage() {
  const router = useRouter();
  const [docs, setDocs] = useState<InvoiceDoc[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const reload = () => { getAllDocs().then(setDocs); };
  useEffect(() => { reload(); }, []);

  const filtered = docs.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || d.docNumber.toLowerCase().includes(q) || d.customerName.toLowerCase().includes(q);
    return matchSearch && (!filterStatus || d.status === filterStatus);
  });

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบเอกสารนี้?')) return;
    const ok = await deleteDoc(id);
    if (ok) {
      reload();
      notifications.show({ title: 'ลบเอกสารแล้ว', message: '', color: 'red' });
    } else {
      notifications.show({ title: 'ลบไม่สำเร็จ', message: 'กรุณาลองใหม่', color: 'red' });
    }
  };

  const handleDuplicate = async (doc: InvoiceDoc) => {
    const now = new Date();
    const header = `${DOC_TYPE_PREFIX[doc.docType]}${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const count = docs.filter((d) => d.docNumber.startsWith(header)).length;
    const newDoc: InvoiceDoc = {
      ...doc,
      id: uid(),
      docNumber: `${header}${String(count + 1).padStart(3, '0')}`,
      issueDate: todayISO(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const ok = await saveDoc(newDoc);
    if (ok) {
      reload();
      notifications.show({ title: 'คัดลอกเอกสารแล้ว', message: newDoc.docNumber, color: 'blue' });
    }
  };

  const handleStatusChange = async (doc: InvoiceDoc, status: DocStatus) => {
    const ok = await saveDoc({ ...doc, status });
    if (ok) {
      reload();
      notifications.show({
        title: 'เปลี่ยนสถานะแล้ว',
        message: `${doc.docNumber} → ${DOC_STATUS_LABELS[status]}`,
        color: 'green',
      });
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['เลขที่', 'ประเภท', 'ลูกค้า', 'วันที่ออก', 'ครบกำหนด', 'ยอดสุทธิ (บาท)', 'สถานะ'],
      ...filtered.map((d) => {
        const { total } = calcTotals(d.items, d.discountPercent, d.taxMode);
        return [d.docNumber, DOC_TYPE_LABELS[d.docType], d.customerName, d.issueDate, d.dueDate, total.toFixed(2), DOC_STATUS_LABELS[d.status]];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `invoices_${todayISO()}.csv`;
    a.click();
  };

  const totalPending = docs.filter((d) => d.status === 'sent' || d.status === 'overdue')
    .reduce((s, d) => s + calcTotals(d.items, d.discountPercent, d.taxMode).total, 0);
  const totalPaid = docs.filter((d) => d.status === 'paid')
    .reduce((s, d) => s + calcTotals(d.items, d.discountPercent, d.taxMode).total, 0);

  return (
    <Box>
      <AppHeader />

      <Container size="xl" py="lg">
        <Stack gap="lg">
          {/* Stats */}
          <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md">
            {[
              { icon: <IconFileInvoice size={24} color="var(--mantine-color-blue-6)" />, bg: 'var(--mantine-color-blue-1)', label: 'เอกสารทั้งหมด', value: String(docs.length) },
              { icon: <IconClock size={24} color="var(--mantine-color-orange-6)" />, bg: 'var(--mantine-color-orange-1)', label: 'รอชำระ', value: `฿${formatMoney(totalPending)}` },
              { icon: <IconCurrencyBaht size={24} color="var(--mantine-color-green-6)" />, bg: 'var(--mantine-color-green-1)', label: 'ชำระแล้ว', value: `฿${formatMoney(totalPaid)}` },
            ].map(({ icon, bg, label, value }) => (
              <Paper key={label} withBorder p="md" radius="md">
                <Group gap="sm">
                  <Box style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {icon}
                  </Box>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="xs" c="dimmed">{label}</Text>
                    <Text size="xl" fw={700} truncate>{value}</Text>
                  </Box>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>

          {/* Filters + Export */}
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Title order={4}>รายการเอกสารทั้งหมด</Title>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconDownload size={16} />}
                onClick={handleExportCSV}
                visibleFrom="sm"
              >
                Export CSV
              </Button>
            </Group>
            <Group gap="xs" wrap="wrap">
              <TextInput
                placeholder="ค้นหาเลขที่ / ชื่อลูกค้า..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="sm"
                style={{ flex: '1 1 180px' }}
              />
              <Select
                placeholder="สถานะทั้งหมด"
                clearable
                size="sm"
                data={Object.entries(DOC_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ flex: '0 0 160px' }}
              />
              <Button
                variant="light"
                size="sm"
                leftSection={<IconDownload size={16} />}
                onClick={handleExportCSV}
                hiddenFrom="sm"
              >
                CSV
              </Button>
            </Group>
          </Stack>

          {/* Invoice Table — horizontal scroll on mobile */}
          <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <ScrollArea>
              <Table highlightOnHover miw={640}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>เลขที่</Table.Th>
                    <Table.Th visibleFrom="sm">ประเภท</Table.Th>
                    <Table.Th>ลูกค้า</Table.Th>
                    <Table.Th visibleFrom="md">วันที่ออก</Table.Th>
                    <Table.Th visibleFrom="md">ครบกำหนด</Table.Th>
                    <Table.Th ta="right">ยอดสุทธิ (฿)</Table.Th>
                    <Table.Th>สถานะ</Table.Th>
                    <Table.Th w={40}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <Text ta="center" c="dimmed" py="xl" size="sm">
                          {docs.length === 0
                            ? 'ยังไม่มีเอกสาร — กดปุ่ม "สร้างเอกสารใหม่" เพื่อเริ่มต้น'
                            : 'ไม่พบเอกสารที่ตรงกับการค้นหา'}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filtered.map((doc) => {
                      const { total } = calcTotals(doc.items, doc.discountPercent, doc.taxMode);
                      return (
                        <Table.Tr
                          key={doc.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => router.push(`/invoices/${doc.id}`)}
                        >
                          <Table.Td><Text fw={600} size="sm">{doc.docNumber}</Text></Table.Td>
                          <Table.Td visibleFrom="sm"><Text size="sm">{DOC_TYPE_LABELS[doc.docType]}</Text></Table.Td>
                          <Table.Td>
                            <Text size="sm" lineClamp={1}>{doc.customerName}</Text>
                          </Table.Td>
                          <Table.Td visibleFrom="md"><Text size="sm">{formatDate(doc.issueDate)}</Text></Table.Td>
                          <Table.Td visibleFrom="md"><Text size="sm">{formatDate(doc.dueDate)}</Text></Table.Td>
                          <Table.Td ta="right"><Text size="sm" fw={600}>{formatMoney(total)}</Text></Table.Td>
                          <Table.Td onClick={(e) => e.stopPropagation()}>
                            <Menu shadow="sm" width={160}>
                              <Menu.Target>
                                <Badge color={DOC_STATUS_COLORS[doc.status]} variant="light" size="sm" style={{ cursor: 'pointer' }}>
                                  {DOC_STATUS_LABELS[doc.status]} ▾
                                </Badge>
                              </Menu.Target>
                              <Menu.Dropdown>
                                {Object.entries(DOC_STATUS_LABELS).map(([v, l]) => (
                                  <Menu.Item key={v} fw={doc.status === v ? 700 : 400} onClick={() => handleStatusChange(doc, v as DocStatus)}>
                                    {l}
                                  </Menu.Item>
                                ))}
                              </Menu.Dropdown>
                            </Menu>
                          </Table.Td>
                          <Table.Td onClick={(e) => e.stopPropagation()}>
                            <Menu shadow="md" width={160} position="bottom-end">
                              <Menu.Target>
                                <ActionIcon variant="subtle" color="gray" size="sm">
                                  <IconDots size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => router.push(`/invoices/${doc.id}`)}>แก้ไข</Menu.Item>
                                <Menu.Item leftSection={<IconPrinter size={14} />} onClick={() => router.push(`/invoices/${doc.id}/print`)}>พิมพ์ / PDF</Menu.Item>
                                <Menu.Item leftSection={<IconCopy size={14} />} onClick={() => handleDuplicate(doc)}>คัดลอก</Menu.Item>
                                <Menu.Divider />
                                <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDelete(doc.id)}>ลบ</Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>

          <Text size="xs" c="dimmed" ta="center">
            {COMPANY.name} | เลขที่ผู้เสียภาษี {COMPANY.taxId} | บัญชี {COMPANY.bank.bankName} {COMPANY.bank.accountNumber}
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
