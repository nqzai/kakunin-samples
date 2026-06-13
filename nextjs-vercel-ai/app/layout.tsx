import React from 'react';

export const metadata = {
  title: 'Kakunin + Vercel AI SDK Demo',
  description: 'Enforce cryptographic scopes and certificates in Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
