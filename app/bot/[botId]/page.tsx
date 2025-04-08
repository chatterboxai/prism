'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/authcontext';
import { useParams } from 'next/navigation';
// import { threadId } from 'worker_threads';
import { v4 as uuidv4 } from "uuid"


export default function BotDetailsPage() {
  const params = useParams();
  const bot_id = params.botId;
  const { isAuthenticated, checkSession } = useAuth();
  const [botDetails, setBotDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedBot, setUpdatedBot] = useState({ name: "", description: "" });
  const [accessToken, setAccessToken] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    const fetchBotDetails = async () => {
      // Ensure user is authenticated before fetching bot details
      const token = await checkSession();
  
      if (!token) {
        setError("User not authenticated.");
        router.push("/login");
        return;
      }

      setAccessToken(token);
      
      try {
        // Fetch bot details from the API
        const response = await fetch(`http://127.0.0.1:8000/api/v1/chatbots/${bot_id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch bot details: ${response.statusText}`);
        }

        const jsonData = await response.json();
        console.log("API Response is:", jsonData);

        // Set the bot details if available
        if (jsonData) {
          setBotDetails(jsonData);
          setUpdatedBot({ name: jsonData.name, description: jsonData.description });
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
  }, [isAuthenticated, bot_id, router]);

  const handleOpenChat = () => {
    const threadId = uuidv4()
    // Navigate to chat with this bot
    router.push(`/chat/${bot_id}/${threadId}`);
  };

  const handleSearchDialogue = () => {
    // Navigate to dialogues search page
    router.push(`/bot/${bot_id}/dialogues`);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      console.log('Selected file:', file);
    } else {
      alert('Please select a valid PDF file.');
      setSelectedFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    if (!accessToken) {
      setError("No access token available.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Upload PDF to the bot
      const response = await fetch(`http://127.0.0.1:8000/api/v1/chatbots/${bot_id}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Do not set Content-Type header when using FormData
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      alert(`File ${selectedFile.name} uploaded successfully!`);
      setSelectedFile(null);
      
      // Refresh bot details to include the new file
      const refreshResponse = await fetch(`http://127.0.0.1:8000/api/v1/chatbots/${bot_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setBotDetails(refreshedData);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file.");
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
          {/* Bot details section */}
          <div className="border p-6 rounded-lg shadow-lg bg-white text-lg mb-6 w-full max-w-md">
            <h1 className="font-bold text-2xl">{botDetails.name}</h1>
            <p className="text-gray-700">{botDetails.description}</p>
            <p>Date created: <strong>{botDetails.created_at}</strong></p>
            <p>Last updated: <strong>{botDetails.updated_at}</strong></p>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handleOpenChat}
                className="px-4 py-2 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700"
              >
                Chat
              </button>
              <button
                onClick={handleSearchDialogue}
                className="px-4 py-2 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700"
              >
                Search dialogue
              </button>
            </div>
          </div>

          {/* Sources section */}
          {botDetails.sources && (
            <div className="border p-4 rounded-lg bg-white w-full max-w-md mb-6">
              <h2 className="font-bold text-xl">Sources</h2>
              <ul className="list-disc list-inside">
                {botDetails.sources.map((source, index) => (
                  <li key={index} className="text-lg">{source}</li>
                ))}
              </ul>
            </div>
          )}

          {/* File upload section */}
          <div className="flex flex-col items-center mt-6 w-full max-w-md">
            <h2 className="font-bold text-xl mb-4">Upload New Source</h2>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              className="hidden" 
              ref={fileInputRef} 
            />
            <button 
              onClick={() => fileInputRef.current.click()} 
              className="px-4 py-2 bg-gray-300 text-lg rounded-lg shadow-md hover:bg-gray-400 mb-4"
            >
              Choose File
            </button>
            {selectedFile && (
              <p className="text-lg text-gray-700 mb-4">Selected file: <strong>{selectedFile.name}</strong></p>
            )}
            <button 
              onClick={handleFileUpload} 
              className="px-4 py-2 bg-green-600 text-white text-lg rounded-lg shadow-md hover:bg-green-700"
            >
              Upload PDF
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-600">Bot not found.</p>
      )}
    </div>
  );
}