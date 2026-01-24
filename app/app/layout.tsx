import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "vault",
  description: "Track your crypto portfolio across all chains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable} data-theme="cypher">
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased noise-overlay">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
