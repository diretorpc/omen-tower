import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OMEN Tower",
  description: "Convença a IA-vilã na conversa. Extraia o código de desligamento.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
