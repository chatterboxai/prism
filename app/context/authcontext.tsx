import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchAuthSession, JWT } from "aws-amplify/auth";

type AuthContextType = {
  accessToken: JWT | null;
};

const AuthContext = createContext<AuthContextType>({ accessToken: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<JWT | null>(null);

  const updateSession = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken;
      if (!token) {
        return;
      }
      setAccessToken(token);
    } catch (err) {
      console.error(err);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    updateSession();
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
