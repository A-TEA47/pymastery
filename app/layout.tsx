import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Layout/Navbar";

export const metadata: Metadata = {
  title: "PyMastery — Learn Python from Beginner to Expert",
  description:
    "A self-hosted Python learning platform with in-browser code execution, auto-graded problems, and progress tracking. From variables to advanced algorithms.",
  keywords: "python, learn python, python tutorial, coding, programming, algorithms, data structures",
  openGraph: {
    title: "PyMastery",
    description: "Master Python from beginner to interview-ready",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 64px)" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
