"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authcontext";

type ChatbotCreateRequest = {
  name: string;
  description: string;
};

type ChatbotGetAllResponse = {
  chatbots: Chatbot[];
};

export default function HomePage() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBot, setNewBot] = useState<ChatbotCreateRequest>({
    name: "",
    description: "",
  });

  const { accessToken, isAuthReady } = useAuth();
  const router = useRouter();

  // Handle authentication check and redirect
  useEffect(() => {
    if (isAuthReady && !accessToken) {
      router.push("/login");
    }
  }, [isAuthReady, accessToken, router]);

  // Fetch chatbots only when auth is confirmed
  // Separate effect to prevent loops with updateSession
  useEffect(() => {
    // Skip if auth is not ready or no token
    if (!isAuthReady || !accessToken) return;
    
    // Add guard to prevent multiple fetches
    let isMounted = true;
    
    const fetchChatbots = async () => {
      try {
        console.log("Fetching chatbots...");
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatbots`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken.toString()}`,
            },
          }
        );

        // Skip processing if component unmounted
        if (!isMounted) return;

        if (!response.ok) {
          console.error("Failed to fetch chatbots:", response.statusText);
          setError("Failed to fetch chatbots.");
          return;
        }

        const jsonData: ChatbotGetAllResponse = await response.json();
        console.log("Received chatbots:", jsonData.chatbots.length);
        setBots(jsonData.chatbots);
      } catch (err) {
        // Skip error handling if component unmounted
        if (!isMounted) return;
        
        console.error("Error fetching chatbots:", err);
        setError("Failed to load chatbots.");
      } finally {
        // Only update loading state if still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchChatbots();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [accessToken, isAuthReady]); // Minimal dependencies

  const handleCreateBot = async () => {
    if (!newBot.name || !newBot.description) {
      setError("Please provide both name and description.");
      return;
    }

    if (!accessToken) {
      setError("No access token available.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatbots`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken.toString()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newBot),
        }
      );

      if (!response.ok) {
        console.error("Failed to create chatbot:", response.statusText);
        setError("Failed to create chatbot.");
        return;
      }

      const createdBot: Chatbot = await response.json();
      setBots((prev) => [...prev, createdBot]);
      setNewBot({ name: "", description: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating chatbot:", err);
      setError("Failed to create chatbot.");
    }
  };

  // Show loading state while checking authentication
  if (!isAuthReady) {
    return (
      <div className="p-10 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // If auth is ready but no token, the first useEffect will handle redirect
  if (isAuthReady && !accessToken) {
    return (
      <div className="p-10 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="p-10 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Home Page</h1>

      {loading ? (
        <p className="text-lg text-gray-600">Loading chatbots...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : bots.length === 0 ? (
        <p className="text-gray-600">No chatbots found.</p>
      ) : (
        <div className="w-full max-w-2xl">
          {bots.map((bot) => (
            <Link key={bot.id} href={`/bot/${bot.id}`}>
              <div className="cursor-pointer border p-6 rounded-lg shadow-lg bg-white mb-6 hover:shadow-xl transition">
                <h2 className="font-bold text-xl">{bot.name}</h2>
                <p className="text-gray-700">{bot.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700"
        >
          Create a new bot
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-90 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Create a New Bot
            </h2>
            <input
              type="text"
              placeholder="Name"
              value={newBot.name}
              onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
              className="w-full border p-3 mb-4 text-lg rounded-md"
            />
            <input
              type="text"
              placeholder="Description"
              value={newBot.description}
              onChange={(e) =>
                setNewBot({ ...newBot, description: e.target.value })
              }
              className="w-full border p-3 mb-4 text-lg rounded-md"
            />
            <button
              onClick={handleCreateBot}
              className="w-full px-4 py-3 bg-green-600 text-white text-lg rounded-lg shadow-md hover:bg-green-700"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}