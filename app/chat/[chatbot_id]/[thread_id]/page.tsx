"use client"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { useParams } from "next/navigation"
import { Send } from "lucide-react"

interface Message {
  role: "user" | "bot"
  content: string
}

export default function ChatPage() {
  const params = useParams()
  const chatbotId = params.chatbot_id as string
  const threadId = params.thread_id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const generateBotResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase()
    if (lower.includes("where"))
      return "Singapore Management University is located at 81 Victoria St, Singapore 188065"
    if (lower.includes("class participation") || lower.includes("smu"))
      return "Yes, SMU makes class participation a mandatory requirement in each module, but the weightage differs for each class."
    return "Let me get back to you on that!"
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const botMessage: Message = {
        role: "bot",
        content: generateBotResponse(userMessage.content),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* If no messages yet - display clean centered prompt */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center px-4">
          <h1 className="text-2xl font-semibold mb-4 text-center">What can I help with?</h1>
          <form onSubmit={handleSubmit} className="w-full max-w-2xl relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything"
              className="w-full p-4 pr-12 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:text-gray-300"
              disabled={isLoading || !input.trim()}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Messages & Conversation */}
          <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50">
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg shadow-sm ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg shadow-sm rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Sticky Bottom Input */}
          <div className="p-4 bg-white border-t shadow-inner">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question here"
                  className="w-full p-4 pr-12 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:text-gray-300"
                  disabled={isLoading || !input.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
