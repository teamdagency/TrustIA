import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'TrustIA - Gestion de reputation en ligne',
  description: 'Collectez, analysez et repondez a vos avis clients. Developpez votre reputation en ligne avec TrustIA.',
  keywords: ['avis clients', 'reputation en ligne', 'gestion des avis', 'SaaS'],
  authors: [{ name: 'TrustIA' }],
  openGraph: {
    title: 'TrustIA - Gestion de reputation en ligne',
    description: 'Collectez, analysez et repondez a vos avis clients.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'TrustIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrustIA - Gestion de reputation en ligne',
    description: 'Collectez, analysez et repondez a vos avis clients.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
