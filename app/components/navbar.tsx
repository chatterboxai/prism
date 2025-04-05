// components/Navbar.tsx
"use client";

import { useRouter } from "next/navigation";
import { signOut } from 'aws-amplify/auth';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("User logged out");
      router.push("/login"); // Redirect to the login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="flex justify-between items-center">
        <div className="text-white text-2xl">Chatterbox Ai</div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
