"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation"; // To handle redirection

export default function HomePage() {
  const [bots, setBots] = useState<{ id: number; name: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);  // State for modal visibility
  const [newBot, setNewBot] = useState({ name: "", description: "" });  // State for new bot inputs
  const router = useRouter();

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        // Fetch session and check if the user is authenticated
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken;

        // If the user is not authenticated, redirect to login page
        if (!accessToken) {
          setError("User not authenticated.");
          router.push("/login"); // Redirect to login page
          return;
        }

        // Fetch chatbots from the API
        const response = await fetch("http://127.0.0.1:8000/api/v1/chatbots", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch chatbots: ${response.statusText}`);
        }

        const jsonData = await response.json();
        console.log("API Response:", jsonData); // Debugging

        // Extract the correct field from the JSON response
        if (jsonData && Array.isArray(jsonData.chatbots)) {
          setBots(jsonData.chatbots);
        } else {
          setBots([]);
          setError("Unexpected API response format.");
        }
      } catch (err) {
        console.error("Error fetching chatbots:", err);
        setError("Failed to load chatbots.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatbots();
  }, [router]); // Add router as a dependency to trigger effect properly

  const handleCreateBot = () => {
    if (newBot.name && newBot.description) {
      // Simulating creating a new bot by adding it to the list (you should send a POST request to the backend)
      setBots([...bots, newBot]);
      setNewBot({ name: "", description: "" });  // Reset inputs
      setIsModalOpen(false);  // Close the modal
    }
  };

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
            <Link key={bot.id} href={`/bot/${bot.name.toLowerCase()}`}>
              <div className="cursor-pointer border p-6 rounded-lg shadow-lg bg-white mb-6 hover:shadow-xl transition">
                <h2 className="font-bold text-xl">{bot.name}</h2>
                <p className="text-gray-700">{bot.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Button to open the modal */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsModalOpen(true)}  // Open modal
          className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700"
        >
          Create a new bot
        </button>
      </div>

      {/* Modal for creating new bot */}
      {isModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-90 transition-all duration-300 ease-in-out">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}  // Close modal
              className="absolute top-3 right-3 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">Create a New Bot</h2>
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
              onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
              className="w-full border p-3 mb-4 text-lg rounded-md"
            />
            <button
              onClick={handleCreateBot}  // Create bot
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
