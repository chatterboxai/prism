'use client';

import { useState, useRef } from 'react';

export default function BotPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const botDetails = {
    name: 'BotName',
    description: 'Bot description',
    dateCreated: '2023-03-25',
    isPublic: true,
    lastUpdated: '2023-03-25',
    sources: ['pdf file A', 'pdf file B'],
  };

  const handleOpenChat = () => {
    // Handle chat functionality
  };

  const handleSearchDialogue = () => {
    // Handle search dialogue functionality
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file); // Store the entire file object
      console.log('Selected file:', file); // Log the file object
    } else {
      alert('Please select a valid PDF file.');
      setSelectedFile(null); // Clear the file if invalid
    }
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      // Implement the file upload logic here using selectedFile
      alert(`File ${selectedFile.name} uploaded successfully!`);
      setSelectedFile(null); // Clear the selected file
    } else {
      alert('Please select a file to upload.');
    }
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="border p-6 rounded-lg shadow-lg bg-white text-lg mb-6 w-full max-w-md">
        <h1 className="font-bold text-2xl">{botDetails.name}</h1>
        <p className="text-gray-700">{botDetails.description}</p>
        <p>Date created: <strong>{botDetails.dateCreated}</strong></p>
        <p>Is public: <strong>{botDetails.isPublic ? 'Yes' : 'No'}</strong></p>
        <p>Last updated: <strong>{botDetails.lastUpdated}</strong></p>

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

      <div className="border p-4 rounded-lg bg-white w-full max-w-md">
        <h2 className="font-bold text-xl">Sources</h2>
        <ul className="list-disc list-inside">
          {botDetails.sources.map((source, index) => (
            <li key={index} className="text-lg">{source}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center mt-6">
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
    </div>
  );
}