"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { signOut } from "aws-amplify/auth";
import { useAuth } from "@/app/context/authcontext";

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { accessToken, isAuthReady, updateSession } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      await updateSession();
      console.log("User logged out");
      router.push("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Navigate to home and handle any potential issues
  const navigateToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/home");
  };

  // Conditionally render the Log Out button based on accessToken and isAuthReady
  const isLoggedIn = isAuthReady && accessToken;

  return (
    <nav className="bg-blue-600 p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo and Brand Name */}
          <a
            href="/home"
            onClick={navigateToHome}
            className="text-white text-2xl font-bold flex items-center"
          >
            Chatterbox
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white hover:text-blue-200 transition px-3 py-2 rounded-md border border-blue-500 hover:border-white"
                aria-label="Log Out"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-blue-700 rounded-lg p-4">
            {isLoggedIn && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-white hover:text-blue-200 px-3 py-2 rounded-md border border-blue-500 hover:border-white transition text-center justify-center"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
