'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // To handle redirection
import { useAuth } from '../../context/authcontext'; // Import useAuth hook
import { useParams } from 'next/navigation'; // To extract dynamic URL parameters

export default function BotDetailsPage() {
  const params = useParams();
  const bot_id  =params.botId;
  //const { bot_id } = useParams().botId; // Extract bot_id from the URL
  const { isAuthenticated, checkSession } = useAuth(); // Use Auth context
  const [botDetails, setBotDetails] = useState<any>(null); // State to store bot details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);  // State for modal visibility
  const [updatedBot, setUpdatedBot] = useState({ name: "", description: "" });  // State for bot editing inputs
  const [accessToken, setAccessToken] = useState<string | null>(null); // State to store access token

  const router = useRouter();
  useEffect(() => {
    const fetchBotDetails = async () => {
      // Ensure user is authenticated before fetching bot details
      const token = await checkSession(); // Ensure session is checked before proceeding
  
      if (!token) {
        setError("User not authenticated.");
        router.push("/login"); // Redirect to login if not authenticated
        return;
      }

      setAccessToken(token); // Set the access token in the state
      console.log(token)
      try {
        // Fetch bot details from the API
        const response = await fetch(`http://127.0.0.1:8000/api/v1/chatbots/${bot_id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,  // Use the access token from the state
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch bot details: ${response.statusText}`);
        }

        const jsonData = await response.json();
        console.log("API Response is :", jsonData); // Debugging

        // Set the bot details if available
        if (jsonData) {
          setBotDetails(jsonData);
          setUpdatedBot({ name: jsonData.name, description: jsonData.description }); // Pre-fill the modal with current details
        } else {
          setError("Bot not found.");
        }
      } catch (err) {
        console.error("Error fetching bot details:", err);
        setError("Failed to load bot details.");
      } finally {
        setLoading(false);
      }
    };
    
    if (bot_id) {
      fetchBotDetails();
    }
  }, [isAuthenticated, bot_id, router]); // Fetch bot details when bot_id changes


  const handleUpdateBot = async () => {
    if (!updatedBot.name || !updatedBot.description) {
      setError("Please provide both name and description.");
      return;
    }

    if (!accessToken) {
      setError("No access token available.");
      return;
    }

    try {
      // Update bot details via PUT request
      const response = await fetch(`http://127.0.0.1:8000/api/v1/chatbots/${bot_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,  // Use the access token from the state
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: updatedBot.name,
          description: updatedBot.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update chatbot: ${response.statusText}`);
      }

      const updatedBotDetails = await response.json();
      console.log("Bot Updated:", updatedBotDetails);

      // Update the UI with the newly updated bot details
      setBotDetails(updatedBotDetails);
      setUpdatedBot({ name: updatedBotDetails.name, description: updatedBotDetails.description }); // Reset modal inputs
      setIsModalOpen(false);  // Close the modal
    } catch (err) {
      console.error("Error updating chatbot:", err);
      setError("Failed to update chatbot.");
    }
  };

  const handleDeleteBot = async () => {
    if (!accessToken) {
      setError("No access token available.");
      return;
    }

    try {
      // Delete the bot via DELETE request
      const response = await fetch(`http://127.0.0.1:8000/api/v1/chatbots/${bot_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,  // Use the access token from the state
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete chatbot: ${response.statusText}`);
      }

      console.log("Bot Deleted");

      // Redirect back to the home page after deletion
      router.push("/");
    } catch (err) {
      console.error("Error deleting chatbot:", err);
      setError("Failed to delete chatbot.");
    }
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Bot Details</h1>

      {loading ? (
        <p className="text-lg text-gray-600">Loading bot details...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : botDetails ? (
        <>
          <div className="w-full max-w-2xl">
            <div className="border p-6 rounded-lg shadow-lg bg-white mb-6">
              <h2 className="font-bold text-xl">{botDetails.name}</h2>
              <p className="text-gray-700">{botDetails.description}</p>
              <p>Date created: <strong>{botDetails.created_at}</strong></p>
              <p>Last updated: <strong>{botDetails.updated_at}</strong></p>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => setIsModalOpen(true)}  // Open modal to edit bot details
              className="px-4 py-2 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteBot}  // Delete bot
              className="px-4 py-2 bg-red-600 text-white text-lg rounded-lg shadow-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-600">Bot not found.</p>
      )}

      {/* Modal for editing bot details */}
      {isModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-90 transition-all duration-300 ease-in-out">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}  // Close modal
              className="absolute top-3 right-3 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">Edit Bot</h2>
            <input
              type="text"
              placeholder="Name"
              value={updatedBot.name}
              onChange={(e) => setUpdatedBot({ ...updatedBot, name: e.target.value })}
              className="w-full border p-3 mb-4 text-lg rounded-md"
            />
            <input
              type="text"
              placeholder="Description"
              value={updatedBot.description}
              onChange={(e) => setUpdatedBot({ ...updatedBot, description: e.target.value })}
              className="w-full border p-3 mb-4 text-lg rounded-md"
            />
            <button
              onClick={handleUpdateBot}  // Update bot details
              className="w-full px-4 py-3 bg-green-600 text-white text-lg rounded-lg shadow-md hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
