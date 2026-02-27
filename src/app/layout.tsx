import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server';
import { ConvexClientProvider } from '@/components/providers/ConvexClientProvider';
import { Toaster } from '@/components/ui/Toast';
import './globals.css';

// Inter variable font — covers all weights 100-900
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  // Optical size adjustments for Inter
  axes: ['opsz'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | ProblemHunt',
    default: 'ProblemHunt — Problems worth solving',
  },
  description:
    'The community for people who share real-world problems worth solving. Find what to build next.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'ProblemHunt',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={inter.variable}>
        <body className="bg-bg-primary text-text-primary antialiased">
          <ConvexClientProvider>
            <Toaster>
              {children}
            </Toaster>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
