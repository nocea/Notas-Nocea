import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getFileTree } from "@/lib/fs";
import { ThemeProvider } from "@/components/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notas Nocea",
  description: "Editor y Visor de Markdown Personal",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tree = await getFileTree();

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <ThemeProvider>
          <Sidebar initialTree={tree} />
          <main style={{ flex: 1, overflow: 'auto', position: 'relative', backgroundColor: 'var(--background)' }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
