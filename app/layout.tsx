import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AKSchool | Community, Learning & Academy Platform",
  description: "The premier AI-native community, video classroom, and membership platform for builders, creators, and engineers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
