"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { FileIcon } from "lucide-react"
import Link from 'next/link';

// Mock data - replace with actual API call
const mockBots: Record<string, {
    name: string
    description: string
    dateCreated: string
    lastUpdated: string
    isPublic: boolean
    pdfSources: string[]
  }> = {
    bot1: {
      name: "Bot1",
      description: "This is a smart assistant for answering questions",
      dateCreated: "2023-10-15",
      lastUpdated: "2023-11-20",
      isPublic: true,
      pdfSources: ["Research Paper.pdf", "User Manual.pdf", "Technical Documentation.pdf"],
    },
    bot2: {
      name: "Bot2",
      description: "A specialized bot for data analysis",
      dateCreated: "2023-09-05",
      lastUpdated: "2023-11-18",
      isPublic: false,
      pdfSources: ["Data Dictionary.pdf", "Analysis Guidelines.pdf"],
    },
  }
  

export default function BotPage() {
  const params = useParams()
  const botId = params.botId as string
  const [bot, setBot] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const fetchBot = () => {
      setLoading(true)
      // In a real app, replace with actual API call
      setTimeout(() => {
        setBot(mockBots[botId] || null)
        setLoading(false)
      }, 500)
    }

    fetchBot()
  }, [botId])

  if (loading) {
    return (
      <div className="p-10 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="p-10 min-h-screen flex items-center justify-center">
        <div className="text-xl">Bot not found</div>
      </div>
    )
  }

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Section - Bot Details */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{bot.name}</h1>
              <p className="text-gray-700">{bot.description}</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Date Created: {bot.dateCreated}</p>
                <p>Last Updated: {bot.lastUpdated}</p>
                <div className="flex items-center mt-2">
                    <span className="mr-2">Public:</span>
                    <button
                        onClick={() => setBot({ ...bot, isPublic: !bot.isPublic })}
                        className={`w-10 h-5 rounded-full flex items-center transition-colors duration-200 ${bot.isPublic ? "bg-green-500" : "bg-gray-300"}`}
                    >
                        <div
                        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${bot.isPublic ? "translate-x-5" : "translate-x-1"}`}
                        ></div>
                    </button>
                    </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href={`/chat/${botId}/default`}>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Chat
                </button>
              </Link>
              <Link href={`/bot/${botId}/dialogues`}>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Search dialogue
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Middle Section - PDF Sources */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Sources (Not clickable, just display)</h2>
          <div className="flex flex-wrap gap-3">
            {bot.pdfSources.map((pdf: string, index: number) => (
              <div key={index} className="flex items-center px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                <FileIcon className="w-4 h-4 mr-2 text-gray-500" />
                <span>{pdf}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section - Browse File Button */}
        <div className="flex justify-center mt-8">
          <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
            Browse file
          </button>
        </div>
      </div>
    </div>
  )
}

