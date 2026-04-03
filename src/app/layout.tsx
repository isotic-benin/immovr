import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImmoVR | L'immobilier en Réalité Virtuelle",
  description: "Visitez et réservez des appartements de luxe en réalité virtuelle 360°.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
