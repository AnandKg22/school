import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AKStack CommunityOS | No-Code Community, Learning & Membership Platform",
  description: "An AI-powered, no-code community, learning and membership platform for creators, educators, and enterprise AI builders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
