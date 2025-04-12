import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchAuthSession, JWT } from "aws-amplify/auth";

// Define the shape of the context
type AuthContextType = {
  accessToken: JWT | null;
  updateSession: () => Promise<void>;
  isAuthReady: boolean; // Flag to indicate if auth check is complete
};

// Create the context with an initial value
const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  updateSession: async () => {},
  isAuthReady: false,
});

// AuthProvider component to wrap around the app and manage the authentication state
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<JWT | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Function to update the session and fetch the access token
  const updateSession = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken;
      if (token) {
        setAccessToken(token); // Update the accessToken state with the fetched token
      } else {
        setAccessToken(null); // Set to null if no token found
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      setAccessToken(null); // Handle errors and clear the access token
    } finally {
      setIsAuthReady(true); // Mark auth check as complete regardless of outcome
    }
  };

  // Initialize session on component mount
  useEffect(() => {
    updateSession();
  }, []); // Only runs once when the component mounts

  return (
    <AuthContext.Provider value={{ accessToken, updateSession, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the authentication context
export const useAuth = () => useContext(AuthContext);