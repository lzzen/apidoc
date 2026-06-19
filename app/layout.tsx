import { RootProvider } from 'fumadocs-ui/provider/next';
import { JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site.config';
import './global.css';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: siteConfig.description,
    template: `%s - ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={`${mono.variable} antialiased`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-[#fafafa] font-mono text-foreground">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
