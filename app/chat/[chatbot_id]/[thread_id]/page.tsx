"use client"

import { useState, useRef, useEffect, FormEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { useAuth } from '../../../context/authcontext';

interface Message {
  role: "user" | "bot"
  content: string
}

export default function ChatPage() {
  const params = useParams()
  const chatbotId = params.chatbot_id as string
  const threadId = params.thread_id as string
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentBotMessage, setCurrentBotMessage] = useState("")
  const [error, setError] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { checkSession } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      const token = await checkSession()

      if (!token) {
        setError("User not authenticated.")
        router.push("/login")
        return
      }

      setAccessToken(token)
    }

    fetchToken()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const token = await checkSession()
    if (!token) {
      setError("User not authenticated.")
      router.push("/login")
      return
    }

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/v1/chatbots/public/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify({ chatbot_id: chatbotId, thread_id: threadId, message: userMessage.content }),
      })

      if (response.status === 429) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "Limit has been reached. Please wait for awhile." },
        ])
        setIsLoading(false)
        return
      }

      if (!response.ok || !response.body) throw new Error("Streaming failed.")

      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")

      let fullBotMessage = ""; // Store the current bot message
      let currentWordIndex = 0; // Index to track the current word being revealed
      let botMessageWords = []; // Array of words in the message to reveal one by one

      // Read the response stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const messageData = line.replace("data: ", "").trim()
            try {
              const parsedMessage = JSON.parse(messageData)
              const botMessage = parsedMessage.message // Extract the complete message from the response

              // Split the bot message into words for word-by-word animation
              botMessageWords = botMessage.split(" ")

              // Reveal the message word by word
              setInterval(() => {
                if (currentWordIndex < botMessageWords.length) {
                  fullBotMessage += " " + botMessageWords[currentWordIndex]
                  setCurrentBotMessage(fullBotMessage)
                  currentWordIndex++
                }
              }, 100) // Adjust speed of word reveal (100ms)

            } catch (error) {
              console.error("Error parsing message:", error)
            }
          }
        }
      }

      // Once streaming is complete, add the full bot message to the conversation
      setMessages((prev) => [...prev, { role: "bot", content: fullBotMessage }])

      // Reset currentBotMessage after the message is added to state
      setTimeout(() => setCurrentBotMessage(""), 0) // Reset it after the message is added

    } catch (err) {
      console.error("Streaming error:", err)
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Something went wrong." },
      ])
    } finally {
      setIsLoading(false)
    }
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

              {currentBotMessage && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-lg shadow-sm rounded-bl-none text-gray-800 max-w-[80%]">
                    {currentBotMessage}
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
                  ref={inputRef}
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
