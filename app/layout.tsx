import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CRMProvider } from '@/context/CRMContext';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: 'CRM Adaptable Enterprise | Sistema de Ventas & Embudos',
  description: 'Sistema CRM 100% adaptable para cualquier tipo de empresa con embudos de venta y etapas editables, campos personalizados e inteligencia de datos.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`light ${jakarta.variable}`}>
      <body className={`${jakarta.className} bg-slate-50 text-slate-900 min-h-screen antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-900`}>
        <CRMProvider>
          <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
            {children}
          </main>
        </CRMProvider>
      </body>
    </html>
  );
}
