import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';
import React from 'react';
import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';

export const metadata = {
  title: 'Invoice — Anaheim Digital Tech',
  description: 'ระบบออกใบแจ้งหนี้ บริษัท อนาไฮม์ ดิจิทัล เทค จำกัด',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
