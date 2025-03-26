'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Dialogue {
  id: string;
  questions: string[];
  answer: string;
}

const initialDialogues: Dialogue[] = [
  {
    id: uuidv4(),
    questions: ['Where did Nolan graduate?', 'What was Nolan\'s university?'],
    answer: 'Singapore Management University',
  },
  {
    id: uuidv4(),
    questions: ['Where is SMU located?'],
    answer: 'Singapore',
  },
];

export default function DialoguesPage() {
  const params = useParams();
  const botId = params.botId as string;
  const [dialogues, setDialogues] = useState<Dialogue[]>(initialDialogues);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDialogues = useMemo(() => {
    return dialogues.filter(d =>
      d.questions.some(q => q.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dialogues, searchTerm]);

  const addDialogue = () => {
    setDialogues([...dialogues, { id: uuidv4(), questions: [], answer: '' }]);
  };

  const updateQuestion = (id: string, value: string) => {
    setDialogues(dialogues.map(d => d.id === id
      ? { ...d, questions: [...d.questions, value] }
      : d
    ));
  };

  const removeQuestion = (id: string, qIndex: number) => {
    setDialogues(dialogues.map(d => d.id === id
      ? { ...d, questions: d.questions.filter((_, i) => i !== qIndex) }
      : d
    ));
  };

  const updateAnswer = (id: string, value: string) => {
    setDialogues(dialogues.map(d => d.id === id
      ? { ...d, answer: value }
      : d
    ));
  };

  const deleteDialogue = (id: string) => {
    setDialogues(dialogues.filter(d => d.id !== id));
  };

  const handleSave = () => {
    console.log('Saving dialogues:', dialogues);
    alert('Dialogues saved! (Check console)');
    // TODO: send to backend
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-500 hover:underline">Bots</Link> &gt; 
        <Link href={`/bot/${botId}`} className="text-blue-500 hover:underline ml-1">{botId}</Link> &gt; 
        <span className="ml-1">Dialogues</span>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Chatterbox</h1>

      <div className="max-w-3xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search questions or answers..."
          className="w-full border p-3 rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {filteredDialogues.map(dialogue => (
          <div key={dialogue.id} className="p-4 bg-white rounded-lg shadow-md relative">
            <button
              onClick={() => deleteDialogue(dialogue.id)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
            >
              <X size={20} />
            </button>

            <div className="flex flex-wrap gap-2 mb-2">
              {dialogue.questions.map((q, index) => (
                <span key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center text-sm">
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
                const input = (e.currentTarget.elements.namedItem('newQuestion') as HTMLInputElement);
                if (input?.value.trim()) {
                  updateQuestion(dialogue.id, input.value.trim());
                  input.value = '';
                }
              }}
              className="flex gap-2 mb-3"
            >
              <input
                name="newQuestion"
                placeholder="Enter your question..."
                className="flex-1 border p-2 rounded-md"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 rounded-md">Enter</button>
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

      <div className="flex justify-between max-w-3xl mx-auto mt-8">
        <button
          onClick={addDialogue}
          className="bg-gray-200 px-6 py-2 rounded-md hover:bg-gray-300"
        >
          Add dialogue
        </button>

        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
