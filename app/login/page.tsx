// pages/login.tsx

"use client";

import { useState, FormEvent, useEffect } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/authcontext';
import { fetchAuthSession } from 'aws-amplify/auth';
import ProtectedRoute from "../components/protectedroute";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {setIsAuthenticated } = useAuth();
 

  useEffect(() => {
    // Check authentication status as soon as the component is mounted
    const checkAuthStatus = async () => {
      try {
        // Check if the user is authenticated (this may depend on your auth provider, e.g., AWS Cognito)
        const session = await fetchAuthSession(); // 
        const accessToken = session.tokens?.accessToken;
  
        if (accessToken) {
          console.log("User is authenticated");
         
          router.push('/home'); // Redirect to home if user is authenticated
        } else {
          console.log("User is not authenticated");
          // Optionally handle unauthenticated case (e.g., show login page)
          router.push('/login'); // Redirect to login if user is not authenticated
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        // Handle error, maybe redirect to login or show an error message
        router.push('/login');
      }
    };
  
    // Call the checkAuthStatus function when the component mounts
    checkAuthStatus();
  }, [router]); // The empty array ensures this only runs on mount
  

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      if (isSignedIn) {
        setIsAuthenticated(true); // Set authentication state
        router.push('/home');
      } else {
        
        handleNextSteps(nextStep);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextSteps = (nextStep: any) => {
    if (!nextStep) return;
    switch (nextStep.signInStep) {
      case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
      case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
        setError('MFA required. This demo does not support MFA.');
        break;
      case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
        router.push('/reset-password');
        break;
      case 'CONFIRM_SIGN_UP':
        setError('Please verify your email before signing in.');
        break;
      default:
        setError('Unexpected authentication step required.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>

        {error && <p className="mb-4 rounded bg-red-100 p-2 text-red-600">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="/signup" className="text-blue-600 hover:underline">
            Don&apos;t have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
