'use client';

import { Container } from '@mantine/core';
import { SubscriptionForm } from '../../../components/SubscriptionForm';
import { AppHeader } from '../../../components/AppHeader';

export default function NewSubscriptionPage() {
  return (
    <>
      <AppHeader backTo="/subscriptions" backLabel="กลับรายการสัญญา" />
      <Container size="md" py="lg">
        <SubscriptionForm isNew />
      </Container>
    </>
  );
}
