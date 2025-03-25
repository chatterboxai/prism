'use client';

import { useState } from 'react';

export default function HomePage() {
  const [bots, setBots] = useState([
    { name: 'Bot1', description: 'Bot description' },
    { name: 'Bot2', description: 'Bot description' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBot, setNewBot] = useState({ name: '', description: '' });

  const handleCreateBot = () => {
    if (newBot.name && newBot.description) {
      setBots([...bots, newBot]);
      setNewBot({ name: '', description: '' });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen relative">
      <h1 className="text-3xl font-bold mb-6 text-center">Home Page</h1>
      <div className="space-y-6 max-w-2xl mx-auto">
        {bots.map((bot, index) => (
          <div key={index} className="border p-6 rounded-lg shadow-lg bg-white text-lg">
            <h2 className="font-bold text-xl">{bot.name}</h2>
            <p className="text-gray-700 text-lg">{bot.description}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700"
        >
          Create a new bot
        </button>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-90 transition-all duration-300 ease-in-out">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}
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