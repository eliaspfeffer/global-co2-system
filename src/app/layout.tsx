import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Tailwind directives are usually in here

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CO2 Visualization App',
  description: 'Conceptual model for global CO2 management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-800 text-white`}>
        {children}
      </body>
    </html>
  );
}
