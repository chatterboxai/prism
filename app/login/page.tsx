"use client";

import { useState, FormEvent } from "react";
import { signIn, fetchAuthSession} from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
        router.push("/home");
      } else if (
        nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_SMS_CODE" ||
        nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE"
      ) {
        // Handle MFA if needed
        setError(
          "MFA confirmation required. This demo doesn't handle MFA yet."
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
