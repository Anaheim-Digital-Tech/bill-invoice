'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stack, Grid, TextInput, Textarea, Select, NumberInput,
  Button, Group, Table, ActionIcon, Text, Divider, Paper,
  Title, SimpleGrid, Box, Tooltip, Anchor,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPlus, IconTrash, IconDeviceFloppy, IconPrinter,
  IconArrowLeft, IconAddressBook, IconUserPlus, IconLink, IconFileInvoice,
} from '@tabler/icons-react';
import type { Contact } from '../lib/contacts';
import { getAllContacts, saveContact } from '../lib/contacts';
import type { InvoiceDoc, LineItem, DocType, TaxMode, DocStatus } from '../lib/types';
import {
  DOC_TYPE_LABELS, DOC_STATUS_LABELS, TAX_MODE_LABELS,
  STATUS_BY_TYPE, DUE_DATE_LABEL, PAYMENT_METHODS, COMPANY,
  isOperationalDocType,
} from '../lib/constants';
import { saveDoc, generateDocNumber, getReceiptForInvoice, createReceiptFromInvoiceId } from '../lib/store';
import { calcTotals, formatMoney, uid, todayISO, addDaysISO } from '../lib/utils';
import { ContactPickerModal } from './ContactPickerModal';

interface Props {
  initial?: InvoiceDoc;
  isNew?: boolean;
}

const newItem = (): LineItem => ({
  id: uid(),
  description: '',
  qty: 1,
  unit: 'ชิ้น',
  unitPrice: 0,
});

export function InvoiceForm({ initial, isNew = false }: Props) {
  const router = useRouter();

  // Document metadata
  const [docType, setDocType] = useState<DocType>(initial?.docType ?? 'invoice');
  const [docNumber, setDocNumber] = useState(initial?.docNumber ?? '');
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? todayISO());
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? addDaysISO(todayISO(), 30));
  const [status, setStatus] = useState<DocStatus>(initial?.status ?? 'draft');

  // Customer info
  const [customerName, setCustomerName] = useState(initial?.customerName ?? '');
  const [customerAddress, setCustomerAddress] = useState(initial?.customerAddress ?? '');
  const [customerTaxId, setCustomerTaxId] = useState(initial?.customerTaxId ?? '');
  const [customerPhone, setCustomerPhone] = useState(initial?.customerPhone ?? '');
  const [customerEmail, setCustomerEmail] = useState(initial?.customerEmail ?? '');

  // Contact picker
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [linkedReceipt, setLinkedReceipt] = useState<InvoiceDoc | null>(null);
  const [creatingReceipt, setCreatingReceipt] = useState(false);

  useEffect(() => {
    if (initial?.id && initial.docType === 'invoice') {
      getReceiptForInvoice(initial.id).then(setLinkedReceipt);
    }
  }, [initial?.id, initial?.docType]);

  useEffect(() => {
    if (contactPickerOpen) getAllContacts().then(setContacts);
  }, [contactPickerOpen]);

  useEffect(() => {
    if (isNew) generateDocNumber(docType).then(setDocNumber);
  }, [docType, isNew]);

  const handleDocTypeChange = (v: string) => {
    const next = v as DocType;
    setDocType(next);
    if (!STATUS_BY_TYPE[next].includes(status)) {
      if (next === 'receipt') setStatus('paid');
      else if (isOperationalDocType(next)) setStatus('draft');
      else setStatus('draft');
    }
    if (isOperationalDocType(next)) {
      setTaxMode('none');
      setDiscountPercent(0);
    }
  };

  // Receipt-specific fields
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod ?? 'transfer');
  const [paymentDate, setPaymentDate] = useState(initial?.paymentDate ?? todayISO());

  // Line items
  const [items, setItems] = useState<LineItem[]>(initial?.items ?? [newItem()]);
  const [discountPercent, setDiscountPercent] = useState(initial?.discountPercent ?? 0);
  const [taxMode, setTaxMode] = useState<TaxMode>(initial?.taxMode ?? 'excluded');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const isOperational = isOperationalDocType(docType);
  const isEquipmentCheck = docType === 'equipmentcheck';
  const isEquipmentLoan = docType === 'equipmentloan';

  const [handoverSenderName, setHandoverSenderName] = useState(
    initial?.handoverSenderName ?? COMPANY.contacts[0].name
  );
  const [handoverReceiverName, setHandoverReceiverName] = useState(initial?.handoverReceiverName ?? '');
  const [loanStartDate, setLoanStartDate] = useState(initial?.loanStartDate ?? todayISO());
  const [loanEndDate, setLoanEndDate] = useState(initial?.loanEndDate ?? addDaysISO(todayISO(), 365));

  useEffect(() => {
    if (isEquipmentLoan && customerName && !handoverReceiverName) {
      setHandoverReceiverName(customerName);
    }
  }, [customerName, isEquipmentLoan, handoverReceiverName]);

  const addItem = useCallback(() => setItems((p) => [...p, newItem()]), []);
  const removeItem = useCallback((id: string) => setItems((p) => p.filter((i) => i.id !== id)), []);
  const updateItem = useCallback(
    (id: string, field: keyof LineItem, value: string | number) =>
      setItems((p) => p.map((i) => (i.id === id ? { ...i, [field]: value } : i))),
    []
  );

  const totals = calcTotals(items, discountPercent, taxMode);

  const applyContact = (c: Contact) => {
    setCustomerName(c.name);
    setCustomerAddress(c.address);
    setCustomerTaxId(c.taxId);
    setCustomerPhone(c.phone);
    setCustomerEmail(c.email);
    if (isEquipmentLoan) setHandoverReceiverName(c.name);
    setContactPickerOpen(false);
    notifications.show({ title: 'กรอกข้อมูลแล้ว', message: c.name, color: 'blue' });
  };

  const saveCurrentAsContact = async () => {
    if (!customerName.trim()) {
      notifications.show({ title: 'กรุณาระบุชื่อก่อน', message: '', color: 'orange' });
      return;
    }
    await saveContact({ id: uid(), name: customerName, address: customerAddress, taxId: customerTaxId, phone: customerPhone, email: customerEmail });
    const updated = await getAllContacts();
    setContacts(updated);
    notifications.show({ title: 'บันทึกลูกค้าแล้ว', message: customerName, color: 'green' });
  };

  const buildDoc = (): InvoiceDoc => ({
    id: initial?.id ?? uid(),
    docNumber, docType, issueDate,
    dueDate: docType === 'receipt' ? paymentDate : isEquipmentLoan ? loanEndDate : dueDate,
    status,
    customerName, customerAddress, customerTaxId, customerPhone, customerEmail,
    items, discountPercent, taxMode: isOperational ? 'none' : taxMode, notes,
    paymentMethod: docType === 'receipt' ? paymentMethod : undefined,
    paymentDate: docType === 'receipt' ? paymentDate : undefined,
    refDocId: initial?.refDocId,
    refDocNumber: initial?.refDocNumber,
    isArchive: initial?.isArchive ?? false,
    handoverSenderName: isEquipmentLoan ? handoverSenderName : undefined,
    handoverReceiverName: isEquipmentLoan ? handoverReceiverName : undefined,
    loanStartDate: isEquipmentLoan ? loanStartDate : undefined,
    loanEndDate: isEquipmentLoan ? loanEndDate : undefined,
    createdAt: initial?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const validate = () => {
    if (!docNumber.trim()) { notifications.show({ title: 'กรุณาระบุเลขที่เอกสาร', message: '', color: 'red' }); return false; }
    if (!customerName.trim()) { notifications.show({ title: 'กรุณาระบุชื่อลูกค้า', message: '', color: 'red' }); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const result = await saveDoc(buildDoc());
    if (result.ok) {
      notifications.show({ title: 'บันทึกสำเร็จ', message: `${DOC_TYPE_LABELS[docType]} ${docNumber}`, color: 'green' });
      router.push('/');
    } else {
      notifications.show({ title: 'บันทึกไม่สำเร็จ', message: 'กรุณาลองใหม่', color: 'red' });
    }
  };

  const handleSaveAndPrint = async () => {
    if (!validate()) return;
    const doc = buildDoc();
    const result = await saveDoc(doc);
    if (result.ok) router.push(`/invoices/${doc.id}/print`);
    else notifications.show({ title: 'บันทึกไม่สำเร็จ', message: 'กรุณาลองใหม่', color: 'red' });
  };

  const handleCreateReceipt = async () => {
    if (!initial?.id) return;
    setCreatingReceipt(true);
    try {
      const { receipt, error } = await createReceiptFromInvoiceId(initial.id);
      if (receipt) {
        setLinkedReceipt(receipt);
        notifications.show({
          title: 'สร้างใบเสร็จแล้ว',
          message: receipt.docNumber,
          color: 'green',
        });
        router.push(`/invoices/${receipt.id}`);
      } else {
        notifications.show({
          title: 'สร้างใบเสร็จไม่สำเร็จ',
          message: error ?? '',
          color: 'red',
        });
      }
    } finally {
      setCreatingReceipt(false);
    }
  };

  return (
    <Stack gap="md">
      {/* Top actions */}
      <Group justify="space-between" mb="xs" wrap="wrap" gap="xs">
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => router.push('/')}>
          กลับ
        </Button>
        <Group gap="xs" wrap="nowrap">
          {docType === 'invoice' && initial?.id && (
            linkedReceipt ? (
              <Button
                variant="light"
                color="teal"
                leftSection={<IconFileInvoice size={16} />}
                size="sm"
                onClick={() => router.push(`/invoices/${linkedReceipt.id}`)}
              >
                ใบเสร็จ {linkedReceipt.docNumber}
              </Button>
            ) : (
              <Button
                variant="light"
                color="teal"
                leftSection={<IconFileInvoice size={16} />}
                size="sm"
                loading={creatingReceipt}
                onClick={handleCreateReceipt}
              >
                สร้างใบเสร็จจากบิลนี้
              </Button>
            )
          )}
          <Button variant="outline" leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} size="sm">
            บันทึก
          </Button>
          <Button leftSection={<IconPrinter size={16} />} onClick={handleSaveAndPrint} size="sm">
            บันทึกและพิมพ์
          </Button>
        </Group>
      </Group>

      {/* Reference Doc */}
      {initial?.refDocNumber && (
        <Paper withBorder p="sm" radius="md" style={{ backgroundColor: 'var(--mantine-color-teal-0)', borderColor: 'var(--mantine-color-teal-3)' }}>
          <Group gap="xs">
            <IconLink size={16} color="var(--mantine-color-teal-7)" />
            <Text size="sm">อ้างอิงจากเอกสาร: <strong>{initial.refDocNumber}</strong></Text>
            {initial.refDocId && (
              <Anchor size="sm" c="teal" onClick={() => router.push(`/invoices/${initial.refDocId}`)}>
                ดูเอกสารต้นทาง →
              </Anchor>
            )}
          </Group>
        </Paper>
      )}

      {/* Document Info */}
      <Paper withBorder p="md" radius="md">
        <Title order={5} mb="md">ข้อมูลเอกสาร</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          <Select
            label="ประเภทเอกสาร"
            data={Object.entries(DOC_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            value={docType}
            onChange={(v) => v && handleDocTypeChange(v)}
          />
          <TextInput
            label="เลขที่เอกสาร"
            description="สร้างอัตโนมัติโดยระบบ — แก้ไขไม่ได้"
            value={docNumber}
            disabled
            styles={{
              input: {
                backgroundColor: 'var(--mantine-color-gray-1)',
                color: 'var(--mantine-color-text)',
                opacity: 1,
                cursor: 'not-allowed',
              },
            }}
            required
          />
          <Select
            label="สถานะ"
            data={STATUS_BY_TYPE[docType].map((v) => ({ value: v, label: DOC_STATUS_LABELS[v] }))}
            value={status}
            onChange={(v) => v && setStatus(v as DocStatus)}
            disabled={docType === 'receipt'}
          />
          <TextInput
            label="วันที่ออก"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
          {docType === 'receipt' ? (
            <>
              <TextInput
                label="วันที่รับชำระ"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
              <Select
                label="วิธีชำระเงิน"
                data={PAYMENT_METHODS}
                value={paymentMethod}
                onChange={(v) => v && setPaymentMethod(v)}
              />
            </>
          ) : isEquipmentLoan ? (
            <>
              <TextInput
                label="วันเริ่มสัญญา"
                type="date"
                value={loanStartDate}
                onChange={(e) => setLoanStartDate(e.target.value)}
              />
              <TextInput
                label="วันสิ้นสุดสัญญา"
                type="date"
                value={loanEndDate}
                onChange={(e) => setLoanEndDate(e.target.value)}
              />
            </>
          ) : (
            <TextInput
              label={DUE_DATE_LABEL[docType]}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          )}
        </SimpleGrid>
      </Paper>

      {/* Contact Picker Modal */}
      <ContactPickerModal
        opened={contactPickerOpen}
        onClose={() => setContactPickerOpen(false)}
        onSelect={applyContact}
        contacts={contacts}
        onContactsChange={setContacts}
      />

      {/* Customer Info */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={5}>
            {isEquipmentLoan ? 'ข้อมูลผู้รับมอบ (ลูกค้า)' : 'ข้อมูลลูกค้า / ผู้รับบิล'}
          </Title>
          <Group gap="xs">
            <Tooltip label="บันทึกลูกค้าปัจจุบัน">
              <Button size="xs" variant="light" color="green" leftSection={<IconUserPlus size={14} />} onClick={saveCurrentAsContact}>
                บันทึก
              </Button>
            </Tooltip>
            <Button size="xs" variant="light" leftSection={<IconAddressBook size={14} />} onClick={() => setContactPickerOpen(true)}>
              เลือกลูกค้า
            </Button>
          </Group>
        </Group>
        <Stack gap="sm">
          <TextInput label="ชื่อลูกค้า / บริษัท" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          <Textarea label="ที่อยู่" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} rows={3} />
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <TextInput label="เลขผู้เสียภาษี" value={customerTaxId} onChange={(e) => setCustomerTaxId(e.target.value)} />
            <TextInput label="เบอร์โทรศัพท์" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            <TextInput label="อีเมล" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          </SimpleGrid>
        </Stack>
      </Paper>

      {isEquipmentLoan && (
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">ข้อมูลผู้ส่งมอบ (ฝั่งเรา)</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="ชื่อผู้ส่งมอบ"
              value={handoverSenderName}
              onChange={(e) => setHandoverSenderName(e.target.value)}
              placeholder={COMPANY.contacts[0].name}
            />
            <TextInput
              label="ชื่อผู้รับมอบ"
              value={handoverReceiverName}
              onChange={(e) => setHandoverReceiverName(e.target.value)}
              placeholder="ชื่อผู้รับมอบฝั่งลูกค้า"
            />
          </SimpleGrid>
          <Text size="xs" c="dimmed" mt="sm">
            ในนาม {COMPANY.name}
          </Text>
        </Paper>
      )}

      {/* Line Items */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={5}>
            {isEquipmentCheck
              ? 'รายการอุปกรณ์ / สภาพ'
              : isEquipmentLoan
                ? 'รายการอุปกรณ์ที่ส่งมอบ'
                : isOperational
                  ? 'รายการสินค้า'
                  : 'รายการสินค้า / บริการ'}
          </Title>
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={addItem}>
            เพิ่มรายการ
          </Button>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table miw={640}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={36}>#</Table.Th>
                <Table.Th>รายการ</Table.Th>
                {(isEquipmentCheck || isEquipmentLoan) && <Table.Th w={110}>เลขเครื่อง/S/N</Table.Th>}
                {isEquipmentCheck && <Table.Th w={120}>สภาพ</Table.Th>}
                <Table.Th w={90}>จำนวน</Table.Th>
                <Table.Th w={90}>หน่วย</Table.Th>
                {!isOperational && (
                  <>
                    <Table.Th w={130}>ราคา/หน่วย (฿)</Table.Th>
                    <Table.Th w={130} ta="right">รวม (฿)</Table.Th>
                  </>
                )}
                <Table.Th w={40}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item, idx) => (
                <Table.Tr key={item.id}>
                  <Table.Td><Text size="sm" c="dimmed">{idx + 1}</Text></Table.Td>
                  <Table.Td>
                    <TextInput size="xs" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="ระบุรายการ..." />
                  </Table.Td>
                  {(isEquipmentCheck || isEquipmentLoan) && (
                    <Table.Td>
                      <TextInput size="xs" value={item.serialNo ?? ''} onChange={(e) => updateItem(item.id, 'serialNo', e.target.value)} placeholder="S/N" />
                    </Table.Td>
                  )}
                  {isEquipmentCheck && (
                    <Table.Td>
                      <TextInput size="xs" value={item.condition ?? ''} onChange={(e) => updateItem(item.id, 'condition', e.target.value)} placeholder="ดี/พอใช้/ชำรุด" />
                    </Table.Td>
                  )}
                  <Table.Td>
                    <NumberInput size="xs" value={item.qty} onChange={(v) => updateItem(item.id, 'qty', Number(v) || 0)} min={0} decimalScale={2} hideControls />
                  </Table.Td>
                  <Table.Td>
                    <TextInput size="xs" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} />
                  </Table.Td>
                  {!isOperational && (
                    <>
                      <Table.Td>
                        <NumberInput size="xs" value={item.unitPrice} onChange={(v) => updateItem(item.id, 'unitPrice', Number(v) || 0)} min={0} decimalScale={2} thousandSeparator="," hideControls />
                      </Table.Td>
                      <Table.Td ta="right"><Text size="sm" fw={500}>{formatMoney(item.qty * item.unitPrice)}</Text></Table.Td>
                    </>
                  )}
                  <Table.Td>
                    <ActionIcon color="red" variant="subtle" size="sm" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>

      {/* Tax/Discount + Summary */}
      {isOperational ? (
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">{isEquipmentLoan ? 'เงื่อนไขเพิ่มเติม (ถ้ามี)' : 'หมายเหตุ / เงื่อนไข'}</Title>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={isEquipmentLoan ? 3 : 4}
            placeholder={
              isEquipmentLoan
                ? 'เงื่อนไขพิเศษเพิ่มจากมาตรฐาน (ถ้ามี) — เงื่อนไขหลักจะพิมพ์ท้ายกระดาษอัตโนมัติ'
                : isEquipmentCheck
                  ? 'หมายเหตุการตรวจรับ สภาพอุปกรณ์เพิ่มเติม...'
                  : 'หมายเหตุการรับของ...'
            }
          />
          {isEquipmentLoan && (
            <Text size="xs" c="dimmed" mt="xs">
              บนกระดาษพิมพ์มีแถวว่างใต้รายการสำหรับเขียนเพิ่มเติมด้วยมือ และเงื่อนไขมาตรฐานท้ายเอกสาร
            </Text>
          )}
          {initial?.isArchive && (
            <Text size="sm" c="orange" mt="sm">เอกสารนี้ถูกเก็บถาวร (อายุเกิน 1 ปี)</Text>
          )}
        </Paper>
      ) : (
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <Title order={5} mb="md">ภาษีและส่วนลด</Title>
            <Stack gap="sm">
              <Select
                label="ภาษีมูลค่าเพิ่ม"
                data={Object.entries(TAX_MODE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                value={taxMode}
                onChange={(v) => v && setTaxMode(v as TaxMode)}
              />
              <NumberInput label="ส่วนลด (%)" value={discountPercent} onChange={(v) => setDiscountPercent(Number(v) || 0)} min={0} max={100} decimalScale={2} />
              <Textarea label="หมายเหตุ" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="เงื่อนไขการชำระเงิน, หมายเหตุเพิ่มเติม..." />
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={5} mb="md">สรุปยอด</Title>
            <Stack gap={6}>
              <Group justify="space-between">
                <Text size="sm">ยอดรวม</Text>
                <Text size="sm">{formatMoney(totals.subtotal)} บาท</Text>
              </Group>
              {discountPercent > 0 && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">ส่วนลด ({discountPercent}%)</Text>
                  <Text size="sm" c="red">-{formatMoney(totals.discount)} บาท</Text>
                </Group>
              )}
              {taxMode !== 'none' && (
                <>
                  <Group justify="space-between">
                    <Text size="sm">ยอดก่อน VAT</Text>
                    <Text size="sm">{formatMoney(totals.beforeTax)} บาท</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">ภาษีมูลค่าเพิ่ม 7%</Text>
                    <Text size="sm">{formatMoney(totals.tax)} บาท</Text>
                  </Group>
                </>
              )}
              <Divider my={4} />
              <Group justify="space-between">
                <Text fw={700} size="md">ยอดสุทธิ</Text>
                <Text fw={700} size="lg" c="blue">{formatMoney(totals.total)} บาท</Text>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
      )}

      {/* Bottom actions */}
      <Group justify="flex-end" mt="xs" wrap="wrap" gap="xs">
        <Button variant="subtle" onClick={() => router.push('/')}>ยกเลิก</Button>
        <Button variant="outline" leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} size="sm">บันทึก</Button>
        <Button leftSection={<IconPrinter size={16} />} onClick={handleSaveAndPrint} size="sm">บันทึกและพิมพ์</Button>
      </Group>
    </Stack>
  );
}
