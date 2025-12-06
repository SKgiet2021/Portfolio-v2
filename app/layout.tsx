import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swadhin Kumar | Full-Stack Developer & AI Engineer",
  description: "Portfolio showcasing full-stack web development, AI integration, and modern UI/UX design with interactive projects and RAG-powered chatbot.",
  keywords: ["Full-Stack Developer", "React", "Next.js", "AI Engineer", "TypeScript", "Portfolio"],
  authors: [{ name: "Swadhin Kumar" }],
  creator: "Swadhin Kumar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
