'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Paper, TextInput, PasswordInput, Button, Title, Text, Stack, Center,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLock } from '@tabler/icons-react';
import { COMPANY } from '../../lib/constants';

export default function SignInPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      notifications.show({ title: 'รหัสผ่านไม่ถูกต้อง', message: '', color: 'red' });
      setPassword('');
    }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper shadow="xl" p="xl" radius="md" w={360}>
        <Stack align="center" mb="lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="logo" style={{ height: 64, objectFit: 'contain' }} />
          <Title order={4} ta="center">{COMPANY.name}</Title>
          <Text size="sm" c="dimmed" ta="center">ระบบออกใบแจ้งหนี้</Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <PasswordInput
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่าน"
              leftSection={<IconLock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
            <Button type="submit" fullWidth loading={loading}>
              เข้าสู่ระบบ
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
