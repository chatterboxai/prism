"use client";

import { usePathname } from "next/navigation"; // To get the current page path
import Navbar from "./components/navbar"; // Import your Navbar component
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
  const pathname = usePathname(); // Get the current route

  // Check if the current route is /login or /signup
  const hideNavbar = pathname === "/login" || pathname === "/signup";

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {/* Only render the Navbar if not on /login or /signup */}
        {!hideNavbar && <Navbar />}
        {children}
      </body>
    </html>
  );
}
