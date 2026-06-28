'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stack, Grid, TextInput, Textarea, Select, NumberInput,
  Button, Group, Text, Divider, Paper, Title, SimpleGrid, Box, Switch,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconArrowLeft, IconAddressBook } from '@tabler/icons-react';
import type { Contact } from '../lib/contacts';
import { getAllContacts } from '../lib/contacts';
import type { Subscription, SubscriptionStatus, TaxMode } from '../lib/types';
import { TAX_MODE_LABELS, SUBSCRIPTION_STATUS_LABELS, WHT_RATE_OPTIONS } from '../lib/constants';
import { saveSubscription } from '../lib/subscriptions';
import { formatMoney, uid, todayISO } from '../lib/utils';
import { ContactPickerModal } from './ContactPickerModal';

interface Props {
  initial?: Subscription;
  isNew?: boolean;
}

const defaultSub = (): Subscription => ({
  id: uid(),
  name: '',
  customerName: '',
  customerAddress: '',
  customerTaxId: '',
  customerPhone: '',
  customerEmail: '',
  description: 'ค่าเช่ารายเดือน {period}',
  monthlyAmount: 0,
  qty: 1,
  unit: 'เดือน',
  taxMode: 'excluded',
  discountPercent: 0,
  billingDay: 1,
  dueDays: 7,
  startDate: todayISO(),
  status: 'active',
  notes: '',
  withholdingTaxPercent: 0,
  isRentalIncome: false,
  autoCreateReceipt: true,
  proRataEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function SubscriptionForm({ initial, isNew = false }: Props) {
  const router = useRouter();
  const [sub, setSub] = useState<Subscription>(() => ({ ...defaultSub(), ...initial }));
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contactPickerOpen) getAllContacts().then(setContacts);
  }, [contactPickerOpen]);

  const set = <K extends keyof Subscription>(key: K, value: Subscription[K]) => {
    setSub((p) => ({ ...p, [key]: value, updatedAt: new Date().toISOString() }));
  };

  const applyContact = (c: Contact) => {
    setSub((p) => ({
      ...p,
      customerName: c.name,
      customerAddress: c.address ?? '',
      customerTaxId: c.taxId ?? '',
      customerPhone: c.phone ?? '',
      customerEmail: c.email ?? '',
    }));
    setContactPickerOpen(false);
  };

  const handleSave = async () => {
    if (!sub.name.trim()) {
      notifications.show({ title: 'กรุณาระบุชื่อสัญญา', message: '', color: 'red' });
      return;
    }
    if (!sub.customerName.trim()) {
      notifications.show({ title: 'กรุณาระบุชื่อลูกค้า', message: '', color: 'red' });
      return;
    }
    setSaving(true);
    try {
      await saveSubscription(sub);
      notifications.show({ title: 'บันทึกแล้ว', message: '', color: 'green' });
      router.push(`/subscriptions/${sub.id}`);
    } catch {
      notifications.show({ title: 'บันทึกไม่สำเร็จ', message: '', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const billingDayOptions = Array.from({ length: 28 }, (_, i) => ({
    value: String(i + 1),
    label: `วันที่ ${i + 1} ของเดือน`,
  }));

  return (
    <Stack gap="md">
      <Group>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/subscriptions')}
        >
          กลับรายการสัญญา
        </Button>
      </Group>

      <Paper p="md" withBorder>
        <Title order={4} mb="md">{isNew ? 'สร้างสัญญาเช่ารายเดือน' : 'แก้ไขสัญญาเช่ารายเดือน'}</Title>

        <Stack gap="md">
          <TextInput
            label="ชื่อสัญญา / รายการ"
            placeholder="เช่น ค่าเช่าระบบ POS"
            value={sub.name}
            onChange={(e) => set('name', e.currentTarget.value)}
            required
          />

          <Divider label="ข้อมูลลูกค้า" labelPosition="left" />

          <Group align="flex-end">
            <TextInput
              label="ชื่อลูกค้า"
              value={sub.customerName}
              onChange={(e) => set('customerName', e.currentTarget.value)}
              style={{ flex: 1 }}
              required
            />
            <Button
              variant="light"
              leftSection={<IconAddressBook size={16} />}
              onClick={() => setContactPickerOpen(true)}
            >
              เลือกจากสมุดรายชื่อ
            </Button>
          </Group>

          <Textarea
            label="ที่อยู่"
            value={sub.customerAddress}
            onChange={(e) => set('customerAddress', e.currentTarget.value)}
            minRows={2}
          />
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <TextInput
              label="เลขประจำตัวผู้เสียภาษี"
              value={sub.customerTaxId}
              onChange={(e) => set('customerTaxId', e.currentTarget.value)}
            />
            <TextInput
              label="โทรศัพท์"
              value={sub.customerPhone}
              onChange={(e) => set('customerPhone', e.currentTarget.value)}
            />
            <TextInput
              label="อีเมล"
              value={sub.customerEmail}
              onChange={(e) => set('customerEmail', e.currentTarget.value)}
            />
          </SimpleGrid>

          <Divider label="ยอดค่าเช่า" labelPosition="left" />

          <TextInput
            label="รายละเอียดในใบแจ้งหนี้"
            description="ใส่ {period} เพื่อแทนที่ด้วยเดือน/ปีอัตโนมัติ เช่น ค่าเช่ารายเดือน {period}"
            value={sub.description}
            onChange={(e) => set('description', e.currentTarget.value)}
          />
          <SimpleGrid cols={{ base: 1, sm: 4 }}>
            <NumberInput
              label="จำนวน"
              value={sub.qty}
              onChange={(v) => set('qty', Number(v) || 1)}
              min={1}
            />
            <TextInput
              label="หน่วย"
              value={sub.unit}
              onChange={(e) => set('unit', e.currentTarget.value)}
            />
            <NumberInput
              label="ราคาต่อหน่วย (บาท)"
              value={sub.monthlyAmount}
              onChange={(v) => set('monthlyAmount', Number(v) || 0)}
              min={0}
              decimalScale={2}
              thousandSeparator=","
            />
            <Box pt={28}>
              <Text size="sm" c="dimmed">รวมต่อเดือน</Text>
              <Text fw={700}>{formatMoney(sub.qty * sub.monthlyAmount)} บาท</Text>
            </Box>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Select
              label="ภาษี"
              data={Object.entries(TAX_MODE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              value={sub.taxMode}
              onChange={(v) => set('taxMode', (v ?? 'excluded') as TaxMode)}
            />
            <NumberInput
              label="ส่วนลด (%)"
              value={sub.discountPercent}
              onChange={(v) => set('discountPercent', Number(v) || 0)}
              min={0}
              max={100}
            />
          </SimpleGrid>

          <Divider label="รอบบิล" labelPosition="left" />

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            <Select
              label="วันตัดรอบ (ออกบิลอัตโนมัติ)"
              data={billingDayOptions}
              value={String(sub.billingDay)}
              onChange={(v) => set('billingDay', Number(v) || 1)}
            />
            <NumberInput
              label="ครบกำหนดชำระ (วันหลังออกบิล)"
              value={sub.dueDays}
              onChange={(v) => set('dueDays', Number(v) || 7)}
              min={1}
            />
            <TextInput
              label="วันเริ่มสัญญา"
              type="date"
              value={sub.startDate}
              onChange={(e) => set('startDate', e.currentTarget.value)}
            />
            <TextInput
              label="วันสิ้นสุดสัญญา (ไม่บังคับ)"
              type="date"
              value={sub.endDate ?? ''}
              onChange={(e) => set('endDate', e.currentTarget.value || undefined)}
            />
          </SimpleGrid>

          <Select
            label="สถานะ"
            data={Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            value={sub.status}
            onChange={(v) => set('status', (v ?? 'active') as SubscriptionStatus)}
          />

          <Divider label="ภาษี / การชำระ" labelPosition="left" />

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Switch
              label="รายได้ค่าเช่า (แนะนำหัก 5%)"
              checked={sub.isRentalIncome}
              onChange={(e) => {
                const on = e.currentTarget.checked;
                setSub((p) => ({
                  ...p,
                  isRentalIncome: on,
                  withholdingTaxPercent: on ? 5 : p.withholdingTaxPercent,
                  updatedAt: new Date().toISOString(),
                }));
              }}
            />
            <Select
              label="หัก ณ ที่จ่าย"
              data={WHT_RATE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              value={String(sub.withholdingTaxPercent)}
              onChange={(v) => set('withholdingTaxPercent', Number(v) || 0)}
            />
          </SimpleGrid>

          <Switch
            label="สร้างใบเสร็จ (RC) อัตโนมัติเมื่อ IV ชำระแล้ว"
            checked={sub.autoCreateReceipt}
            onChange={(e) => set('autoCreateReceipt', e.currentTarget.checked)}
          />

          <Switch
            label="คิดเงินแบบ pro-rata (ตามวันในเดือน)"
            description="ปิด = คิดเต็มยอดรายเดือนเสมอ | เปิด = เริ่ม/จบกลางเดือนคิดตามวันจริง"
            checked={sub.proRataEnabled}
            onChange={(e) => set('proRataEnabled', e.currentTarget.checked)}
          />

          <Text size="xs" c="dimmed">
            บิลจากสัญญาจะออกเป็นร่าง (draft) — ตรวจแล้วเปลี่ยนเป็น sent ก่อนส่งลูกค้า
          </Text>

          <Textarea
            label="หมายเหตุ (แสดงในใบแจ้งหนี้)"
            value={sub.notes}
            onChange={(e) => set('notes', e.currentTarget.value)}
            minRows={2}
          />

          <Group justify="flex-end">
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
              loading={saving}
            >
              บันทึก
            </Button>
          </Group>
        </Stack>
      </Paper>

      <ContactPickerModal
        opened={contactPickerOpen}
        onClose={() => setContactPickerOpen(false)}
        contacts={contacts}
        onSelect={applyContact}
        onContactsChange={setContacts}
      />
    </Stack>
  );
}
