"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { signOut} from "aws-amplify/auth";
import { useRouter } from "next/navigation";

// Define types for the AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (authStatus: boolean) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap your app with context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if the user is authenticated by verifying the current user
        await Auth.currentAuthenticatedUser();  // AWS Amplify method to check authentication
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();  // Check the authentication status on initial load
  }, []);

  // Logout function
  const logout = async () => {
    try {
      await signOut();  // Sign out the user using AWS Amplify
      setIsAuthenticated(false);  // Update the authentication status
      router.push("/login");  // Redirect to login page after logout
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
