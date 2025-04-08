'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/authcontext';
import { useParams } from 'next/navigation';

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
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  // State to store documents
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState("");

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
          
          // After getting bot details, fetch its documents
          fetchBotDocuments(token);
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

  // Function to fetch bot documents
  const fetchBotDocuments = async (token) => {
    setLoadingDocuments(true);
    setDocumentsError("");
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/documents/${bot_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Documents API Response:", responseData);
      
      // Check if the documents are nested in a 'documents' field
      if (responseData.documents) {
        setDocuments(responseData.documents);
      } else {
        // Fallback in case the format changes
        setDocuments(Array.isArray(responseData) ? responseData : []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocumentsError("Failed to load documents.");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleOpenChat = () => {
    // Navigate to chat with this bot
    router.push(`/chat/${bot_id}`);
  };

  const handleSearchDialogue = () => {
    // Navigate to dialogues search page
    router.push(`/bot/${bot_id}/dialogues`);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      // Set the default filename to the selected file's name, without the extension
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setFileName(nameWithoutExtension);
      console.log('Selected file:', file);
    } else {
      alert('Please select a valid PDF file.');
      setSelectedFile(null);
      setFileName('');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    if (!fileName.trim()) {
      alert('Please enter a title for the file.');
      return;
    }

    if (!accessToken) {
      setError("No access token available.");
      return;
    }

    try {
      // Create FormData instance
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', fileName);
      formData.append('chatbot_id', bot_id);
      
      console.log('Form data prepared:', {
        file: selectedFile.name,
        title: fileName,
        chatbot_id: bot_id
      });

      // Upload PDF to the documents endpoint using FormData
      const response = await fetch('http://127.0.0.1:8000/api/v1/documents', {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Don't set Content-Type when using FormData - the browser will set it with the correct boundary
        },
        body: formData,
      });

      // For debugging: log the raw response
      const rawResponse = await response.text();
      console.log('Raw server response:', rawResponse);
      
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      alert(`File "${fileName}" uploaded successfully!`);
      setSelectedFile(null);
      setFileName('');
      
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
        
        // Also refresh the documents list
        fetchBotDocuments(accessToken);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(`Failed to upload file: ${err.message}`);
    }
  };

  // Let's try a direct upload to the chatbot's upload endpoint as a fallback
  const handleDirectUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    if (!accessToken) {
      setError("No access token available.");
      return;
    }

    try {
      // Create FormData instance
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Use the original chatbot upload endpoint
      const response = await fetch(`http://127.0.0.1:8000/api/v1/chatbots/${bot_id}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const rawResponse = await response.text();
        console.error('Raw server response:', rawResponse);
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      alert(`File uploaded successfully using direct upload!`);
      setSelectedFile(null);
      setFileName('');
      
      // Refresh bot details
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
        
        // Also refresh the documents list
        fetchBotDocuments(accessToken);
      }
    } catch (err) {
      console.error("Error with direct upload:", err);
      setError(`Failed with direct upload: ${err.message}`);
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
          
          {/* Documents section */}
          <div className="border p-4 rounded-lg bg-white w-full max-w-md mb-6">
            <h2 className="font-bold text-xl mb-4">Bot Documents</h2>
            
            {loadingDocuments ? (
              <p className="text-gray-600">Loading documents...</p>
            ) : documentsError ? (
              <p className="text-red-500">{documentsError}</p>
            ) : documents && documents.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {documents.map((doc, index) => (
                  <li key={index} className="py-4">
                    <div className="flex flex-col space-y-2">
                      <h3 className="font-semibold text-lg">{doc.title}</h3>
                      <p className="text-sm text-gray-500">File: {doc.file_url}</p>
                      <div className="flex space-x-2">
                        {/* <a 
                          href={`http://127.0.0.1:8000/api/v1/documents/download/${doc.id}`}
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
              onClick={() => fileInputRef.current.click()} 
              className="px-4 py-2 bg-gray-300 text-lg rounded-lg shadow-md hover:bg-gray-400 mb-4"
            >
              Choose File
            </button>
            {selectedFile && (
              <>
                <p className="text-lg text-gray-700 mb-4">Selected file: <strong>{selectedFile.name}</strong></p>
                <div className="w-full mb-4">
                  <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title:
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
                Upload to Documents
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