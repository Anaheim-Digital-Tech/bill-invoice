'use client';

import { useRouter } from 'next/navigation';
import { Container, Group, Button, Text, Box } from '@mantine/core';
import { IconArrowLeft, IconChartBar, IconPlus, IconLogout } from '@tabler/icons-react';
import { COMPANY } from '../lib/constants';

interface Props {
  /** ปุ่มเพิ่มเติมทางขวา (optional) */
  rightSection?: React.ReactNode;
  /** แสดงปุ่ม "กลับ" แทน nav ปกติ */
  backTo?: string;
  backLabel?: string;
}

export function AppHeader({ rightSection, backTo, backLabel = 'กลับ Dashboard' }: Props) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/signin');
  };

  return (
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
          {/* Logo + Company */}
          <Group gap="xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-dark.png"
              alt="logo"
              style={{ height: 40, objectFit: 'contain', cursor: 'pointer' }}
              onClick={() => router.push('/')}
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

          {/* Right section */}
          <Group gap="xs">
            {backTo ? (
              <Button
                variant="subtle"
                color="gray.3"
                size="sm"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => router.push(backTo)}
              >
                {backLabel}
              </Button>
            ) : (
              <>
                <Button
                  variant="subtle"
                  color="gray.3"
                  size="sm"
                  leftSection={<IconChartBar size={16} />}
                  onClick={() => router.push('/reports')}
                >
                  รายงาน
                </Button>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => router.push('/invoices/new')}
                  variant="white"
                  color="dark"
                  size="sm"
                >
                  สร้างเอกสารใหม่
                </Button>
              </>
            )}

            {rightSection}

            <Button
              variant="subtle"
              color="gray.4"
              size="sm"
              leftSection={<IconLogout size={16} />}
              onClick={handleSignOut}
            >
              ออกจากระบบ
            </Button>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
