"use client";

import { useState, FormEvent } from "react";
import { signIn, fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Function to check session when user navigates to /login

  const checkAuthenticatedUser = async () => {
    try {
      const session = await fetchAuthSession(); // Check if the user has an active session
      //console.log(session.tokens.idToken & session.tokens.accessToken)
      console.log(session.tokens.accessToken)
      if (session.tokens.accessToken) {
        router.push("/home"); // Redirect to /home if the user is already signed in
      }
    } catch (error) {
      console.log("No authenticated session found, continuing to login");
    }
  };

  useEffect(() => {
    // Run session check only when the component is mounted
    checkAuthenticatedUser();
  }, []); // Empty dependency array ensures the check runs only once


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      // Connect to Cognito for sign in
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });

      console.log("Sign in result:", { isSignedIn, nextStep });

      if (isSignedIn) {
        // Redirect to home page or dashboard after successful login
        const { username, userId, signInDetails } = await getCurrentUser();
        console.log("username", username);
        console.log("userId", userId);
        console.log("password", password);
        console.log("sign-in details", signInDetails);
    
        // Access environment variables (Bun supports this syntax)
        const cognitoClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
        console.log("COGNITO_CLIENT_ID:", cognitoClientId);
        console.log("COGNITO_USER_POOL_ID:", process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID);
        const region = 'ap-southeast-1';
        // Initiate Cognito auth before redirecting
        try {
          const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-amz-json-1.1',
                    'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
                },
                body: JSON.stringify({
                    AuthFlow: 'USER_PASSWORD_AUTH',
                    ClientId: cognitoClientId,
                    AuthParameters: {
                        USERNAME: username,
                        PASSWORD: password
                    }
                })
            });
            
            const authResult = await response.json();
            const accessToken = authResult.AuthenticationResult?.AccessToken;
            console.log("Access Token:", accessToken);
            
            if (accessToken) {
              try {
                  const profileResponse = await fetch('http://127.0.0.1:8000/api/v1/users/profile', {
                      method: 'GET',
                      headers: {
                          'Authorization': `Bearer ${accessToken}`,
                          'Content-Type': 'application/json'
                      }
                  });
                  
                  if (profileResponse.ok) {
                      const profileData = await profileResponse.json();
                      console.log("User Profile Data:", profileData);
                      
                      // You might want to store this profile data in state/context
                      // For example:
                      // setUserProfile(profileData);
                      // or
                      // localStorage.setItem('userProfile', JSON.stringify(profileData));
                      
                      // Now redirect to home page
                      router.push("/home");
                  } else {
                      console.error("Error fetching profile:", profileResponse.status, await profileResponse.text());
                  }
              } catch (profileError) {
                  console.error("Profile fetch error:", profileError);
              }
          } else {
              console.error("No access token received");
          }
        } catch (error) {
            console.error("Authentication error:", error);
        }
    } else if (
        nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_SMS_CODE" ||
        nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE"
      ) {
        // Handle MFA if needed
        setError(
          "MFA confirmation required. This demo doesn't ha  ndle MFA yet."
        );
      } else if (
        nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        // Handle password reset
        router.push("/reset-password");
      } else if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
        // User needs to confirm registration
        setError("Please verify your email before signing in.");
      }
    } catch (err) {
      console.error("Error signing in:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-2 text-red-600">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block font-medium">
              Email
            </label>
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
            <label htmlFor="password" className="mb-2 block font-medium">
              Password
            </label>
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
