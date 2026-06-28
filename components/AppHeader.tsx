'use client';

import { useRouter } from 'next/navigation';
import {
  Container, Group, Button, Text, Box, Burger, Drawer, Stack, Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconChartBar, IconPlus, IconLogout, IconBook, IconRepeat } from '@tabler/icons-react';
import { COMPANY } from '../lib/constants';

interface Props {
  backTo?: string;
  backLabel?: string;
}

export function AppHeader({ backTo, backLabel = 'กลับ Dashboard' }: Props) {
  const router = useRouter();
  const [menuOpen, { open: openMenu, close: closeMenu }] = useDisclosure(false);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/signin');
  };

  const navActions = backTo ? (
    <Button
      variant="subtle"
      color="gray.3"
      size="sm"
      leftSection={<IconArrowLeft size={16} />}
      onClick={() => { router.push(backTo); closeMenu(); }}
    >
      {backLabel}
    </Button>
  ) : (
    <>
      <Button
        variant="subtle"
        color="gray.3"
        size="sm"
        leftSection={<IconRepeat size={16} />}
        onClick={() => { router.push('/subscriptions'); closeMenu(); }}
      >
        เช่ารายเดือน
      </Button>
      <Button
        variant="subtle"
        color="gray.3"
        size="sm"
        leftSection={<IconBook size={16} />}
        onClick={() => { router.push('/guide'); closeMenu(); }}
      >
        คู่มือ
      </Button>
      <Button
        variant="subtle"
        color="gray.3"
        size="sm"
        leftSection={<IconChartBar size={16} />}
        onClick={() => { router.push('/reports'); closeMenu(); }}
      >
        รายงาน
      </Button>
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={() => { router.push('/invoices/new'); closeMenu(); }}
        variant="white"
        color="dark"
        size="sm"
      >
        สร้างเอกสารใหม่
      </Button>
    </>
  );

  return (
    <>
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
            <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-dark.png" alt="logo" style={{ height: 36, objectFit: 'contain' }} />
              <Box visibleFrom="sm">
                <Text fw={700} size="sm" c="white" lh={1.2}>{COMPANY.name}</Text>
                <Text size="xs" c="gray.4" lh={1.2}>{COMPANY.nameEn}</Text>
              </Box>
            </Group>

            {/* Desktop nav */}
            <Group gap="xs" visibleFrom="sm">
              {navActions}
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

            {/* Mobile burger */}
            <Burger
              opened={menuOpen}
              onClick={openMenu}
              color="white"
              hiddenFrom="sm"
              size="sm"
            />
          </Group>
        </Container>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        opened={menuOpen}
        onClose={closeMenu}
        position="right"
        size="xs"
        title={<Text fw={700}>{COMPANY.name}</Text>}
        hiddenFrom="sm"
        className="no-print"
      >
        <Stack gap="sm">
          {navActions}
          <Divider />
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconLogout size={16} />}
            onClick={handleSignOut}
            justify="start"
          >
            ออกจากระบบ
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
