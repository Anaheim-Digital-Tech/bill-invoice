'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Group,
  Title,
  Button,
  Table,
  Badge,
  ActionIcon,
  Menu,
  Text,
  Stack,
  SimpleGrid,
  Paper,
  TextInput,
  Select,
  Box,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconDots,
  IconPrinter,
  IconEdit,
  IconTrash,
  IconSearch,
  IconFileInvoice,
  IconCurrencyBaht,
  IconClock,
} from '@tabler/icons-react';
import type { InvoiceDoc, DocStatus } from '../lib/types';
import { getAllDocs, deleteDoc } from '../lib/store';
import { DOC_TYPE_LABELS, DOC_STATUS_LABELS, DOC_STATUS_COLORS, COMPANY } from '../lib/constants';
import { formatDate, formatMoney, calcTotals } from '../lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [docs, setDocs] = useState<InvoiceDoc[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const reload = () => { getAllDocs().then(setDocs); };

  useEffect(() => {
    reload();
  }, []);

  const filtered = docs.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.docNumber.toLowerCase().includes(q) ||
      d.customerName.toLowerCase().includes(q);
    const matchStatus = !filterStatus || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบเอกสารนี้?')) return;
    await deleteDoc(id);
    reload();
    notifications.show({ title: 'ลบเอกสารแล้ว', message: '', color: 'red' });
  };

  const totalPending = docs
    .filter((d) => d.status === 'sent' || d.status === 'overdue')
    .reduce((s, d) => s + calcTotals(d.items, d.discountPercent, d.taxMode).total, 0);

  const totalPaid = docs
    .filter((d) => d.status === 'paid')
    .reduce((s, d) => s + calcTotals(d.items, d.discountPercent, d.taxMode).total, 0);

  return (
    <Box>
      {/* Header */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          backgroundColor: '#1a1a2e',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
        className="no-print"
      >
        <Container size="xl" py="sm">
          <Group justify="space-between">
            <Group gap="xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-dark.png"
                alt="logo"
                style={{ height: 40, width: 'auto', objectFit: 'contain' }}
              />
              <Box>
                <Text fw={700} size="sm" c="white" lh={1.2}>
                  {COMPANY.name}
                </Text>
                <Text size="xs" c="gray.4" lh={1.2}>
                  {COMPANY.nameEn}
                </Text>
              </Box>
            </Group>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push('/invoices/new')}
              variant="white"
              color="dark"
              size="sm"
            >
              สร้างเอกสารใหม่
            </Button>
          </Group>
        </Container>
      </Box>

      <Container size="xl" py="lg">
        <Stack gap="lg">
          {/* Stats */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Paper withBorder p="md" radius="md">
              <Group gap="sm">
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    backgroundColor: 'var(--mantine-color-blue-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconFileInvoice size={24} color="var(--mantine-color-blue-6)" />
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">
                    เอกสารทั้งหมด
                  </Text>
                  <Text size="xl" fw={700}>
                    {docs.length}
                  </Text>
                </Box>
              </Group>
            </Paper>
            <Paper withBorder p="md" radius="md">
              <Group gap="sm">
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    backgroundColor: 'var(--mantine-color-orange-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconClock size={24} color="var(--mantine-color-orange-6)" />
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">
                    รอชำระ
                  </Text>
                  <Text size="xl" fw={700}>
                    ฿{formatMoney(totalPending)}
                  </Text>
                </Box>
              </Group>
            </Paper>
            <Paper withBorder p="md" radius="md">
              <Group gap="sm">
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    backgroundColor: 'var(--mantine-color-green-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconCurrencyBaht size={24} color="var(--mantine-color-green-6)" />
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">
                    ชำระแล้ว
                  </Text>
                  <Text size="xl" fw={700}>
                    ฿{formatMoney(totalPaid)}
                  </Text>
                </Box>
              </Group>
            </Paper>
          </SimpleGrid>

          {/* Title + Filters */}
          <Group justify="space-between" align="flex-end">
            <Title order={4}>รายการเอกสารทั้งหมด</Title>
            <Group>
              <TextInput
                placeholder="ค้นหาเลขที่ / ชื่อลูกค้า..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="sm"
                w={220}
              />
              <Select
                placeholder="สถานะทั้งหมด"
                clearable
                size="sm"
                data={Object.entries(DOC_STATUS_LABELS).map(([v, l]) => ({
                  value: v,
                  label: l,
                }))}
                value={filterStatus}
                onChange={setFilterStatus}
                w={150}
              />
            </Group>
          </Group>

          {/* Table */}
          <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>เลขที่</Table.Th>
                  <Table.Th>ประเภท</Table.Th>
                  <Table.Th>ลูกค้า</Table.Th>
                  <Table.Th>วันที่ออก</Table.Th>
                  <Table.Th>ครบกำหนด</Table.Th>
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
                      <Table.Tr key={doc.id}>
                        <Table.Td>
                          <Text fw={600} size="sm">
                            {doc.docNumber}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{DOC_TYPE_LABELS[doc.docType]}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{doc.customerName}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatDate(doc.issueDate)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatDate(doc.dueDate)}</Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Text size="sm" fw={600}>
                            {formatMoney(total)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={DOC_STATUS_COLORS[doc.status]}
                            variant="light"
                            size="sm"
                          >
                            {DOC_STATUS_LABELS[doc.status]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Menu shadow="md" width={160} position="bottom-end">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray" size="sm">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => router.push(`/invoices/${doc.id}`)}
                              >
                                แก้ไข
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconPrinter size={14} />}
                                onClick={() => router.push(`/invoices/${doc.id}/print`)}
                              >
                                พิมพ์ / PDF
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={14} />}
                                onClick={() => handleDelete(doc.id)}
                              >
                                ลบ
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
          </Paper>

          {/* Footer info */}
          <Text size="xs" c="dimmed" ta="center">
            {COMPANY.name} | เลขที่ผู้เสียภาษี {COMPANY.taxId} | บัญชี{' '}
            {COMPANY.bank.bankName} {COMPANY.bank.accountNumber}
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
