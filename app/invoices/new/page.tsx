import { Container, Title } from '@mantine/core';
import { InvoiceForm } from '../../../components/InvoiceForm';

export default function NewInvoicePage() {
  return (
    <Container size="xl" py="md">
      <Title order={3} mb="lg">
        สร้างเอกสารใหม่
      </Title>
      <InvoiceForm isNew />
    </Container>
  );
}
