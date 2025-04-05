"use client";

import { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { fetchAuthSession, signIn as awsSignIn, signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

// Define types for the AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setIsAuthenticated: (authStatus: boolean) => void;
  checkSession: () => Promise<void>; // Add method to check session
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap app with context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Function to check if the user is authenticated
  const checkSession = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken;
    } catch (error) {
      console.error("Error checking session:", error);
      return false;
    }
  };
  

  // Login function: Authenticate user using AWS Amplify signIn
  const login = async (username: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await awsSignIn({ username, password });

      if (isSignedIn) {
        setIsAuthenticated(true); // Set authentication state
        router.push("/home"); // Redirect to home page on success
      } else {
        handleNextSteps(nextStep);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsAuthenticated(false); // In case of error, set auth status to false
    }
  };

  const handleNextSteps = (nextStep: any) => {
    if (!nextStep) return;
    switch (nextStep.signInStep) {
      case "CONFIRM_SIGN_IN_WITH_SMS_CODE":
      case "CONFIRM_SIGN_IN_WITH_TOTP_CODE":
        // Handle MFA if necessary
        break;
      case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
        router.push("/reset-password");
        break;
      case "CONFIRM_SIGN_UP":
        // Handle email verification step
        break;
      default:
        console.error("Unexpected authentication step.");
    }
  };

  // Logout function: Sign out the user and redirect to login
  const logout = async () => {
    try {
      await signOut(); // Sign out the user using AWS Amplify
      setIsAuthenticated(false); // Update the authentication status
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  useEffect(() => {
    checkSession(); // Check session status on app load
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, setIsAuthenticated, checkSession }}>
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
