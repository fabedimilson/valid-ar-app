
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";
import { AuthProvider } from "@/components/AuthProvider";
import { getDb } from "@/lib/db";
import { DataHydrator } from "@/components/DataHydrator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VOS - Validação de Ordem de Serviços",
  description: "Plataforma de validação visual para serviços de ar-condicionado em órgãos públicos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("Critical Auth Error in RootLayout:", error);
  }

  const db = await getDb();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider session={session}>
          <DataHydrator initialData={db.data} />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
