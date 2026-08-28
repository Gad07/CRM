import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CRMProvider } from '@/context/CRMContext';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: 'CRM Adaptable Enterprise | Sistema Multi-Empresa & Embudos',
  description: 'Plataforma SaaS CRM multi-empresa con aislamiento de tenants, control de acceso por roles (RBAC), embudos inteligentes, ERP y WhatsApp oficial.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`light ${jakarta.variable}`}>
      <body className={`${jakarta.className} bg-slate-50 text-slate-900 min-h-screen antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-900`}>
        <AuthProvider>
          <CRMProvider>
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
              {children}
            </main>
          </CRMProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
