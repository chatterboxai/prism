"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authcontext";
import { useParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

type ChatbotDocuments = {
  documents: ChatbotDocument[];
};

export default function BotDetailsPage() {
  const params = useParams();
  const bot_id = params.botId;

  const [botDetails, setBotDetails] = useState<Chatbot>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State to store documents
  const [documents, setDocuments] = useState<ChatbotDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const { accessToken } = useAuth();
  const router = useRouter();

  // Function to fetch bot documents
  const fetchBotDocuments = useCallback(async () => {
    setLoadingDocuments(true);
    setError("");

    if (!accessToken) {
      setError("No access token available.");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/documents/${bot_id}`,
        {
          method: "GET",
          headers: {
            Authorization: accessToken
              ? `Bearer ${accessToken.toString()}`
              : "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch documents:", response.statusText);
        return;
      }

      const responseData: ChatbotDocuments = await response.json();
      console.log("Documents API Response:", responseData);

      // Check if the documents are nested in a 'documents' field
      if (responseData) {
        setDocuments(responseData.documents);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents.");
    } finally {
      setLoadingDocuments(false);
    }
  }, [bot_id, accessToken, router]);

  useEffect(() => {
    const fetchBotDetails = async () => {
      // Ensure user is authenticated before fetching bot details
      if (!accessToken) {
        setError("User not authenticated.");
        router.push("/login");
        return;
      }

      try {
        // Fetch bot details from the API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatbots/${bot_id}`,
          {
            method: "GET",
            headers: {
              Authorization: accessToken
                ? `Bearer ${accessToken.toString()}`
                : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch bot details:", response.statusText);
          return;
        }

        const jsonData: Chatbot = await response.json();
        console.log("API Response is:", jsonData);

        // Set the bot details if available
        if (jsonData) {
          setBotDetails(jsonData);
          // After getting bot details, fetch its documents
          fetchBotDocuments();
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
  }, [accessToken, bot_id, router, fetchBotDocuments]);

  const handleOpenChat = () => {
    const threadId = uuidv4();
    // Navigate to chat with this bot
    router.push(`/chat/${bot_id}/${threadId}`);
  };

  const handleSearchDialogue = () => {
    // Navigate to dialogues search page
    router.push(`/bot/${bot_id}/dialogues`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      // Set the default filename to the selected file's name, without the extension
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setFileName(nameWithoutExtension);
      console.log("Selected file:", file);
    } else {
      alert("Please select a valid PDF file.");
      setSelectedFile(undefined);
      setFileName("");
    }
  };

  const handleFileUpload = async () => {
    if (!accessToken) {
      setError("No access token available.");
      router.push("/login");
      return;
    }

    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    if (!fileName.trim()) {
      alert("Please enter a title for the file.");
      return;
    }

    if (!bot_id) {
      setError("Bot ID not found.");
      return;
    }

    try {
      // Create FormData instance
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", fileName);
      formData.append("chatbot_id", bot_id.toString());

      console.log("Form data prepared:", {
        file: selectedFile.name,
        title: fileName,
        chatbot_id: bot_id,
      });

      // Upload PDF to the documents endpoint using FormData
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/documents`,
        {
          method: "POST",
          headers: {
            Authorization: accessToken
              ? `Bearer ${accessToken.toString()}`
              : "",
            // Don't set Content-Type when using FormData - the browser will set it
          },
          body: formData,
        }
      );

      // For debugging: log the raw response
      const rawResponse = await response.text();
      console.log("Raw server response:", rawResponse);

      if (!response.ok) {
        console.error("Failed to upload file:", response.statusText);
        return;
      }

      alert(`File "${fileName}" uploaded successfully!`);
      setSelectedFile(undefined);
      setFileName("");

      // Refresh bot details to include the new file
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatbots/${bot_id}`,
        {
          method: "GET",
          headers: {
            Authorization: accessToken
              ? `Bearer ${accessToken.toString()}`
              : "",
            "Content-Type": "application/json",
          },
        }
      );

      if (refreshResponse.ok) {
        const refreshedData: Chatbot = await refreshResponse.json();
        setBotDetails(refreshedData);

        // Also refresh the documents list
        fetchBotDocuments();
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file");
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
            <p>
              Date created: <strong>{botDetails.created_at}</strong>
            </p>
            <p>
              Last updated: <strong>{botDetails.updated_at}</strong>
            </p>

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
                Dialogues
              </button>
            </div>
          </div>

          {/* Documents section */}
          <div className="border p-4 rounded-lg bg-white w-full max-w-md mb-6">
            <h2 className="font-bold text-xl mb-4">Bot Documents</h2>

            {loadingDocuments ? (
              <p className="text-gray-600">Loading documents...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : documents && documents.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {documents.map((doc, index) => (
                  <li key={index} className="py-4">
                    <div className="flex flex-col space-y-2 ">
                      <div className="flex flex-row space-x-2">
                        <h3 className="font-semibold text-lg">{doc.title}</h3>
                        <span
                          className={`px-2 py-1 text-sm font-medium rounded-full ${
                            doc.sync_status === "SYNCED"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {doc.sync_status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        File: {doc.file_url}
                      </p>
                      <div className="flex space-x-2">
                        {/* <a 
                          href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/documents/download/${doc.id}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Download
                        </a> */}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No documents found for this bot.</p>
            )}
          </div>

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
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-300 text-lg rounded-lg shadow-md hover:bg-gray-400 mb-4"
            >
              Choose File
            </button>
            {selectedFile && (
              <>
                <p className="text-lg text-gray-700 mb-4">
                  Selected file: <strong>{selectedFile.name}</strong>
                </p>
                <div className="w-full mb-4">
                  <label
                    htmlFor="fileName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Document label:
                  </label>
                  <input
                    type="text"
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter document title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 w-full">
              <button
                onClick={handleFileUpload}
                className="px-4 py-2 bg-green-600 text-white text-lg rounded-lg shadow-md hover:bg-green-700"
                disabled={!selectedFile || !fileName.trim()}
              >
                Upload
              </button>
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </>
      ) : (
        <p className="text-gray-600">Bot not found.</p>
      )}
    </div>
  );
}
