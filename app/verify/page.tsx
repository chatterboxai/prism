"use client";

import { useState, FormEvent } from "react";
import { confirmSignUp } from "aws-amplify/auth";
import { useRouter, useSearchParams } from "next/navigation";

export default function Verify() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!code) {
      setError("Please enter verification code");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email is missing. Please go back to sign up page.");
      setLoading(false);
      return;
    }

    try {
      // Connect to Cognito for verification
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      console.log("Verification result:", { isSignUpComplete, nextStep });

      if (isSignUpComplete) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Error verifying code:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during verification"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Verify Your Account
        </h1>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-2 text-red-600">{error}</p>
        )}
        {success && (
          <p className="mb-4 rounded bg-green-100 p-2 text-green-600">
            Account verified successfully! Redirecting to login...
          </p>
        )}

        <p className="mb-4 text-gray-600">
          We&apos;ve sent a verification code to {email || "your email address"}
          . Please enter it below to verify your account.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="code" className="mb-2 block font-medium">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Enter verification code"
              disabled={loading || success}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
            disabled={loading || success}
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="/signup" className="text-blue-600 hover:underline">
            Back to Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
