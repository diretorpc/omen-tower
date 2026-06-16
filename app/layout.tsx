import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OMEN Tower",
  description: "Talk your way past the rogue AI. Extract the shutdown code.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
