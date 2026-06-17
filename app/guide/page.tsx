'use client';

import {
  Container, Title, Text, Paper, Stack, List, ThemeIcon, Badge,
  Table, Divider, SimpleGrid, Box, Accordion, Group,
} from '@mantine/core';
import {
  IconBook, IconLogin, IconFilePlus, IconPrinter, IconArrowRight,
  IconCircleCheck, IconPackage, IconTools, IconHandStop,
} from '@tabler/icons-react';
import { AppHeader } from '../../components/AppHeader';
import { DOC_TYPE_LABELS } from '../../lib/constants';

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <Group gap="sm" align="flex-start" wrap="nowrap">
      <ThemeIcon size={28} radius="xl" variant="filled" color="blue">
        <Text size="sm" fw={700}>{n}</Text>
      </ThemeIcon>
      <Text size="sm" style={{ flex: 1 }}>{children}</Text>
    </Group>
  );
}

export default function GuidePage() {
  return (
    <Box>
      <AppHeader backTo="/" backLabel="กลับ Dashboard" />

      <Container size="md" py="lg">
        <Stack gap="lg">
          <Group gap="sm">
            <ThemeIcon size={40} radius="md" variant="light" color="blue">
              <IconBook size={22} />
            </ThemeIcon>
            <Box>
              <Title order={2}>คู่มือการใช้งาน</Title>
              <Text c="dimmed" size="sm">ระบบออกเอกสาร — Anaheim Digital Tech</Text>
            </Box>
          </Group>

          <Accordion variant="separated" defaultValue="start">
            <Accordion.Item value="start">
              <Accordion.Control icon={<IconLogin size={18} />}>เริ่มต้นใช้งาน</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Step n={1}>เข้า https://factura.anaheimdigitaltech.com แล้วลงชื่อเข้าใช้</Step>
                  <Step n={2}>หน้า Dashboard แสดงรายการเอกสารทั้งหมด ค้นหา กรอง และดูสถิติยอดเงิน</Step>
                  <Step n={3}>กด <strong>สร้างเอกสารใหม่</strong> เพื่อเริ่มออกเอกสาร</Step>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="types">
              <Accordion.Control icon={<IconFilePlus size={18} />}>ประเภทเอกสาร</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" mb="md" c="dimmed">แบ่งเป็น 2 กลุ่มหลัก</Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Paper withBorder p="md" radius="md">
                    <Badge color="blue" mb="sm">การเงิน</Badge>
                    <List size="sm" spacing={4}>
                      <List.Item>{DOC_TYPE_LABELS.quotation}</List.Item>
                      <List.Item>{DOC_TYPE_LABELS.salesorder}</List.Item>
                      <List.Item>{DOC_TYPE_LABELS.invoice}</List.Item>
                      <List.Item>{DOC_TYPE_LABELS.receipt}</List.Item>
                    </List>
                    <Text size="xs" c="dimmed" mt="sm">มีราคา ภาษี ยอดเงิน — ใช้ขายและเก็บเงิน</Text>
                  </Paper>
                  <Paper withBorder p="md" radius="md">
                    <Badge color="teal" mb="sm">ปฏิบัติการ</Badge>
                    <List size="sm" spacing={4}>
                      <List.Item>{DOC_TYPE_LABELS.goodsreceipt}</List.Item>
                      <List.Item>{DOC_TYPE_LABELS.equipmentcheck}</List.Item>
                      <List.Item>{DOC_TYPE_LABELS.equipmentloan}</List.Item>
                    </List>
                    <Text size="xs" c="dimmed" mt="sm">ไม่มีราคา — ใช้รับของ ตรวจอุปกรณ์ ส่งมอบ-รับมอบ</Text>
                  </Paper>
                </SimpleGrid>
                <Paper withBorder p="sm" mt="md" bg="gray.0">
                  <Text size="sm">
                    <strong>เลขที่เอกสาร</strong> สร้างอัตโนมัติโดยระบบ (เช่น QT2606001, EL2606001) — แก้ไขไม่ได้
                  </Text>
                </Paper>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="sales">
              <Accordion.Control icon={<IconArrowRight size={18} />}>Flow การขาย (การเงิน)</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Paper withBorder p="md" radius="md">
                    <Text fw={600} mb="sm">เสนอราคา → แจ้งหนี้ → ใบเสร็จ</Text>
                    <Group gap="xs" wrap="wrap">
                      <Badge variant="outline">QT ใบเสนอราคา</Badge>
                      <Text size="sm">→</Text>
                      <Badge variant="outline">IV ใบแจ้งหนี้</Badge>
                      <Text size="sm">→</Text>
                      <Badge variant="outline">RC ใบเสร็จ</Badge>
                    </Group>
                    <Text size="sm" c="dimmed" mt="sm">
                      หรือเริ่มจาก SO ใบสั่งขาย แล้วแปลงเป็นใบแจ้งหนี้ได้
                    </Text>
                  </Paper>
                  <List size="sm" spacing="xs">
                    <List.Item>สร้าง QT → สถานะ <Badge size="xs" color="gray">ร่าง</Badge> → <Badge size="xs" color="blue">ส่งแล้ว</Badge></List.Item>
                    <List.Item>เมนู ⋮ → <strong>สร้างใบแจ้งหนี้จากนี้</strong> (เลขที่ใหม่ + อ้างอิงเอกสารเดิม)</List.Item>
                    <List.Item>ลูกค้าชำระเงิน → แปลงเป็น RC → กรอกวันที่รับชำระและวิธีชำระ</List.Item>
                  </List>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="ops">
              <Accordion.Control icon={<IconTools size={18} />}>Flow ปฏิบัติการ (อุปกรณ์ / รับของ)</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Paper withBorder p="md" radius="md">
                    <Group gap="xs" mb="xs">
                      <IconPackage size={18} />
                      <Text fw={600}>{DOC_TYPE_LABELS.goodsreceipt}</Text>
                    </Group>
                    <Text size="sm">บันทึกการรับสินค้า → พิมพ์ให้เซ็นรับ</Text>
                  </Paper>
                  <Paper withBorder p="md" radius="md">
                    <Group gap="xs" mb="xs">
                      <IconCircleCheck size={18} />
                      <Text fw={600}>{DOC_TYPE_LABELS.equipmentcheck}</Text>
                    </Group>
                    <Text size="sm">บันทึกรายการอุปกรณ์ + เลขเครื่อง/S/N + สภาพ → พิมพ์ให้เซ็นตรวจรับ</Text>
                  </Paper>
                  <Paper withBorder p="md" radius="md">
                    <Group gap="xs" mb="xs">
                      <IconHandStop size={18} />
                      <Text fw={600}>{DOC_TYPE_LABELS.equipmentloan}</Text>
                    </Group>
                    <Text size="sm" mb="xs">
                      บันทึกข้อตกลงส่งมอบ-รับมอบ ระบุผู้ส่งมอบ (เรา) และผู้รับมอบ (ลูกค้า) วันเริ่ม-สิ้นสุดสัญญา
                    </Text>
                    <Text size="sm" c="dimmed">
                      บนกระดาษพิมพ์มีช่องเขียนมือสำหรับสาย/อุปกรณ์เสริม เงื่อนไขท้ายกระดาษ และลายเซ็น 2 ฝั่ง
                    </Text>
                  </Paper>
                  <List size="sm" spacing="xs">
                    <List.Item>สถานะ: ร่าง → ส่งแล้ว → <Badge size="xs" color="teal">เสร็จสิ้น</Badge></List.Item>
                    <List.Item>เอกสารปฏิบัติการ <strong>ลบไม่ได้</strong></List.Item>
                    <List.Item>ครบ 1 ปี ระบบเก็บถาวรอัตโนมัติ — ดูได้จากปุ่ม <strong>เอกสารเก็บถาวร</strong> บน Dashboard</List.Item>
                  </List>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="create">
              <Accordion.Control icon={<IconFilePlus size={18} />}>วิธีสร้างเอกสาร</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Step n={1}>กด <strong>สร้างเอกสารใหม่</strong></Step>
                  <Step n={2}>เลือกประเภทเอกสาร — เลขที่จะถูกสร้างให้อัตโนมัติ</Step>
                  <Step n={3}>กรอกข้อมูลลูกค้า (พิมพ์เอง หรือกด <strong>เลือกลูกค้า</strong> จากสมุดรายชื่อ)</Step>
                  <Step n={4}>เพิ่มรายการสินค้า/อุปกรณ์</Step>
                  <Step n={5}>กด <strong>บันทึก</strong> หรือ <strong>บันทึกและพิมพ์</strong></Step>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="print">
              <Accordion.Control icon={<IconPrinter size={18} />}>การพิมพ์ให้ลูกค้า</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text size="sm">เข้าหน้าพิมพ์ได้จาก:</Text>
                  <List size="sm">
                    <List.Item>กด <strong>บันทึกและพิมพ์</strong> ตอนสร้างเอกสาร</List.Item>
                    <List.Item>Dashboard → เมนู ⋮ → <strong>พิมพ์ / PDF</strong></List.Item>
                  </List>
                  <Divider label="ตัวเลือกบนหน้าพิมพ์" labelPosition="center" />
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                    <Paper withBorder p="sm" radius="md" ta="center">
                      <Text fw={600} size="sm">ต้นฉบับ</Text>
                      <Text size="xs" c="dimmed">ส่งให้ลูกค้าเซ็น</Text>
                    </Paper>
                    <Paper withBorder p="sm" radius="md" ta="center">
                      <Text fw={600} size="sm">สำเนา</Text>
                      <Text size="xs" c="dimmed">เก็บไว้ฝั่งเรา</Text>
                    </Paper>
                    <Paper withBorder p="sm" radius="md" ta="center">
                      <Text fw={600} size="sm">ทั้งสอง (2 หน้า)</Text>
                      <Text size="xs" c="dimmed">พิมพ์ครบชุด</Text>
                    </Paper>
                  </SimpleGrid>
                  <Text size="sm">กด <strong>พิมพ์ / บันทึก PDF</strong> แล้วเลือกเครื่องพิมพ์ หรือ Save as PDF ส่งลูกค้าทางไลน์/อีเมล</Text>
                  <Table withTableBorder withColumnBorders striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>ประเภท</Table.Th>
                        <Table.Th>แนะนำ</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td>ใบเสนอราคา / ใบแจ้งหนี้</Table.Td>
                        <Table.Td>ต้นฉบับ หรือ PDF ส่งลูกค้า (ใบแจ้งหนี้มีข้อมูลบัญชี KBank)</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td>ใบเสร็จ</Table.Td>
                        <Table.Td>ต้นฉบับ หลังรับเงินแล้ว</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td>ส่งมอบ-รับมอบ</Table.Td>
                        <Table.Td>ต้นฉบับ → ให้ลูกค้าเซ็น + เขียนสาย/อุปกรณ์เสริมด้วยมือ</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td>ใบรับของ / ตรวจรับ</Table.Td>
                        <Table.Td>ต้นฉบับ → ให้เซ็นรับ</Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="dashboard">
              <Accordion.Control icon={<IconCircleCheck size={18} />}>จัดการจาก Dashboard</Accordion.Control>
              <Accordion.Panel>
                <Table withTableBorder striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>การกระทำ</Table.Th>
                      <Table.Th>วิธีทำ</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    <Table.Tr><Table.Td>แก้ไข</Table.Td><Table.Td>คลิกแถว หรือเมนู ⋮ → แก้ไข</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td>เปลี่ยนสถานะ</Table.Td><Table.Td>คลิก Badge สถานะบนแถว</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td>คัดลอก</Table.Td><Table.Td>เมนู ⋮ → คัดลอก (ได้เลขที่ใหม่)</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td>แปลงเอกสาร</Table.Td><Table.Td>เมนู ⋮ → สร้าง IV/RC จากนี้ (เฉพาะเอกสารการเงิน)</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td>ลบ</Table.Td><Table.Td>ได้เฉพาะเอกสารการเงิน (ปฏิบัติการลบไม่ได้)</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td>ดูเอกสารเก่า</Table.Td><Table.Td>ปุ่ม เอกสารเก็บถาวร บน Dashboard</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td>Export</Table.Td><Table.Td>ปุ่ม Export CSV</Table.Td></Table.Tr>
                  </Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Paper withBorder p="md" radius="md" bg="blue.0">
            <Title order={5} mb="xs">สรุปวันทำงานจริง</Title>
            <List size="sm" spacing="xs">
              <List.Item>
                <strong>ขายของ:</strong> QT → ส่งลูกค้า → แปลง IV → รับเงิน → แปลง RC → พิมพ์ใบเสร็จ
              </List.Item>
              <List.Item>
                <strong>ยืมอุปกรณ์:</strong> สร้าง EL → พิมพ์ต้นฉบับ → ลูกค้าเซ็น + เขียนสายเพิ่ม → เก็บสำเนา
              </List.Item>
              <List.Item>
                <strong>รับของ:</strong> สร้าง GR → พิมพ์ → เซ็นรับ
              </List.Item>
            </List>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
