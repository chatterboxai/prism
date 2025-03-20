"use client";

import { configureAmplify } from "@/lib/amplify";
import "./globals.css";

// Configure Amplify on the client side
if (typeof window !== "undefined") {
  configureAmplify();
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
