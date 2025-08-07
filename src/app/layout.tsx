import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';
import { AuthInitializer } from '@/components/auth/auth-initializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EcoCollect - Waste Management System',
  description: 'Modern waste collection and management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ReactQueryProvider>
            <AuthInitializer>
              {children}
              <Toaster />
              <SonnerToaster />
            </AuthInitializer>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}