type Chatbot = {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  settings: ChatbotSettings;
  created_at: string;
  updated_at: string;
};

type ChatbotSettings = {
  embedding_model: EmbeddingModel;
};

type EmbeddingModel = {
  provider: string;
  name: string;
  dimensions: number;
};

type ChatbotDocument = {
  id: string;
  chatbot_id: string;
  title: string;
  file_url: string;
  mime_type: string;
  sync_status: string;
  created_at: string;
  updated_at: string;
};

type Dialogue = {
  id: string;
  name: string;
  questions: string[];
  answer: string;
  sync_status: string;
  created_at: string;
  updated_at: string;
};
