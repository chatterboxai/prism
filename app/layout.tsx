"use client";

import { usePathname } from "next/navigation"; // To get the current page path
import Navbar from "@/app/components/navbar"; // Import Navbar component
import { configureAmplify } from "@/lib/amplify";
import "@/app/globals.css";
import { AuthProvider } from "@/app/context/authcontext"; //Import state component

// Configure Amplify only on the client side
if (typeof window !== "undefined") {
  configureAmplify();
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname(); // Get the current route
  const hideNavbar = pathname === "/login" || pathname === "/signup";

  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {!hideNavbar && <Navbar />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
