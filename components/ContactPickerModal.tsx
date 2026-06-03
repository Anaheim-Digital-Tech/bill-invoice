'use client';

import {
  Modal, ScrollArea, Stack, UnstyledButton, Box, Text, ActionIcon, Group,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import type { Contact } from '../lib/contacts';
import { getAllContacts, deleteContact } from '../lib/contacts';

interface Props {
  opened: boolean;
  onClose: () => void;
  onSelect: (contact: Contact) => void;
  contacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
}

export function ContactPickerModal({
  opened, onClose, onSelect, contacts, onContactsChange,
}: Props) {
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteContact(id);
    const updated = await getAllContacts();
    onContactsChange(updated);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="เลือกลูกค้า / ผู้รับบิล" size="md">
      <ScrollArea h={360}>
        <Stack gap="xs">
          {contacts.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="lg">
              ยังไม่มีรายชื่อที่บันทึกไว้
            </Text>
          )}
          {contacts.map((c) => (
            <UnstyledButton
              key={c.id}
              onClick={() => onSelect(c)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--mantine-color-gray-3)',
                display: 'block',
                width: '100%',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  'var(--mantine-color-blue-0)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = '')
              }
            >
              <Group justify="space-between" wrap="nowrap">
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={600} size="sm" truncate>
                    {c.name}
                  </Text>
                  {c.taxId && (
                    <Text size="xs" c="dimmed">
                      เลขภาษี: {c.taxId}
                    </Text>
                  )}
                  {c.phone && (
                    <Text size="xs" c="dimmed">
                      โทร: {c.phone}
                    </Text>
                  )}
                </Box>
                <ActionIcon
                  size="xs"
                  color="red"
                  variant="subtle"
                  onClick={(e) => handleDelete(e, c.id)}
                >
                  <IconX size={12} />
                </ActionIcon>
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      </ScrollArea>
    </Modal>
  );
}
