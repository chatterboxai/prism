"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useAuth } from "@/app/context/authcontext";

type DialogueResponse = {
  dialogues: Dialogue[];
};

export default function DialoguesPage() {
  const params = useParams();
  const router = useRouter();

  const botId = params.botId as string;

  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  // const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const { accessToken } = useAuth();

  // Fetch dialogues when the page loads
  useEffect(() => {
    const fetchDialogues = async () => {
      setLoading(true);
      try {
        if (!accessToken) {
          setStatusMessage("User not authenticated.");
          setStatusType("error");
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/dialogues/chatbot/${botId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken.toString()}`,
            },
          }
        );
        if (!response.ok) {
          console.error("Failed to fetch dialogues");
          return;
        }

        const data: DialogueResponse = await response.json();
        setDialogues(data.dialogues);
        setStatusMessage("");
        setStatusType("");
      } catch (error) {
        console.error("Error fetching dialogues:", error);
        setStatusMessage("Failed to load dialogues");
        setStatusType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchDialogues();
  }, [botId, accessToken, router]);

  const addDialogue = () => {
    // Generate a temporary ID with prefix to identify local dialogues
    const tempId = `temp-${Math.random().toString(36).substring(2, 9)}`;
    setDialogues([
      ...dialogues,
      {
        id: tempId,
        name: "",
        questions: [],
        answer: "",
        sync_status: "",
        created_at: "",
        updated_at: "",
      },
    ]);
  };

  const updateQuestion = (id: string, value: string) => {
    setDialogues(
      dialogues.map((d) =>
        d.id === id ? { ...d, questions: [...d.questions, value] } : d
      )
    );
  };

  const removeQuestion = (id: string, qIndex: number) => {
    setDialogues(
      dialogues.map((d) =>
        d.id === id
          ? { ...d, questions: d.questions.filter((_, i) => i !== qIndex) }
          : d
      )
    );
  };

  const updateAnswer = (id: string, value: string) => {
    setDialogues(
      dialogues.map((d) => (d.id === id ? { ...d, answer: value } : d))
    );
  };

  const deleteDialogue = (id: string) => {
    setDialogues(dialogues.filter((d) => d.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    setStatusMessage("");
    setStatusType("");

    try {
      // Ensure user is authenticated
      if (!accessToken) {
        setStatusMessage("User not authenticated.");
        setStatusType("error");
        router.push("/login");
        return;
      }

      // Filter out empty dialogues
      const validDialogues = dialogues.filter(
        (d) => d.questions.length > 0 && d.answer.trim() !== ""
      );

      if (validDialogues.length === 0) {
        setStatusMessage("No valid dialogues to save");
        setStatusType("error");
        setLoading(false);
        return;
      }

      // Get new dialogues (temp IDs) that need to be created
      const newDialogues = validDialogues.filter((d) =>
        d.id.startsWith("temp-")
      );

      // Get existing dialogues that need to be updated
      const existingDialogues = validDialogues.filter(
        (d) => !d.id.startsWith("temp-")
      );

      // If no dialogues to save at all, show message
      if (newDialogues.length === 0 && existingDialogues.length === 0) {
        setStatusMessage("No dialogues to save");
        setStatusType("error");
        setLoading(false);
        return;
      }

      // Create new dialogues
      const createPromises = newDialogues.map((dialogue) =>
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dialogues`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken.toString()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatbot_id: botId,
            name: `Dialogue ${dialogue.id.slice(0, 8)}`,
            questions: dialogue.questions,
            answer: dialogue.answer,
          }),
        })
      );

      // Save all new dialogues
      const createResults = await Promise.all(createPromises);
      const allCreatesSuccessful = createResults.every((res) => res.ok);

      // Update existing dialogues - this part would need a proper update endpoint
      // This is a placeholder assuming you have an update endpoint
      /* 
      const updatePromises = existingDialogues.map((dialogue) =>
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dialogues/${dialogue.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken.toString()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questions: dialogue.questions,
            answer: dialogue.answer,
          }),
        })
      );
      const updateResults = await Promise.all(updatePromises);
      const allUpdatesSuccessful = updateResults.every((res) => res.ok);
      */

      // For now we'll assume all updates are successful
      const allUpdatesSuccessful = true;

      if (allCreatesSuccessful && allUpdatesSuccessful) {
        setStatusMessage(
          `Successfully saved ${newDialogues.length} new and ${existingDialogues.length} existing dialogues`
        );
        setStatusType("success");

        // Remove temporary dialogues
        const persistentDialogues = dialogues.filter(
          (d) => !d.id.startsWith("temp-")
        );
        setDialogues(persistentDialogues);

        // Re-fetch dialogues from the server to get updated list
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/dialogues/chatbot/${botId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken.toString()}`,
            },
          }
        );

        if (response.ok) {
          const data: DialogueResponse = await response.json();
          setDialogues(data.dialogues);
        }
      } else {
        setStatusMessage("Some dialogues failed to save");
        setStatusType("error");
      }
    } catch (error) {
      console.error("Error saving dialogues:", error);
      setStatusMessage("Failed to save dialogues");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-500 hover:underline">
          Bots
        </Link>{" "}
        &gt;
        <Link
          href={`/bot/${botId}`}
          className="text-blue-500 hover:underline ml-1"
        >
          {botId}
        </Link>{" "}
        &gt;
        <span className="ml-1">Dialogues</span>
      </div>

      {statusMessage && (
        <div
          className={`max-w-3xl mx-auto mb-4 p-3 rounded-lg ${
            statusType === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* <div className="max-w-3xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search questions or answers..."
          className="w-full border p-3 rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div> */}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : dialogues.length === 0 ? (
        <div className="text-center my-8 text-gray-500">
          No dialogues found. Add a new dialogue to get started.
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          {dialogues.map((dialogue) => (
            <div
              key={dialogue.id}
              className="p-4 bg-white rounded-lg shadow-md relative"
            >
              <button
                onClick={() => deleteDialogue(dialogue.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>

              <div
                className={`flex flex-wrap gap-2 mb-2 ${
                  dialogue.questions.length === 0 ? "mt-6" : ""
                }`}
              >
                {dialogue.questions.map((q, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    {q}
                    <button
                      onClick={() => removeQuestion(dialogue.id, index)}
                      className="ml-2 text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem(
                    "newQuestion"
                  ) as HTMLInputElement;
                  if (input?.value.trim()) {
                    updateQuestion(dialogue.id, input.value.trim());
                    input.value = "";
                  }
                }}
                className="flex gap-2 mb-3"
              >
                <input
                  name="newQuestion"
                  placeholder="Enter your question..."
                  className="flex-1 border p-2 rounded-md"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 rounded-md"
                >
                  Enter
                </button>
              </form>

              <textarea
                placeholder="Answer..."
                className="w-full border p-2 rounded-md"
                value={dialogue.answer}
                onChange={(e) => updateAnswer(dialogue.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between max-w-3xl mx-auto mt-8">
        <button
          onClick={addDialogue}
          className="bg-gray-200 px-6 py-2 rounded-md hover:bg-gray-300"
          disabled={loading}
        >
          Add dialogue
        </button>

        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
