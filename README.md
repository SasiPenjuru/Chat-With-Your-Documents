# 📄 Document Insight AI

> AI-Powered Document Intelligence Platform using RAG (Retrieval-Augmented Generation) + FAISS

A full-stack application that allows users to upload PDF documents and chat with them using AI. Built with FastAPI backend and React frontend.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)
![React](https://img.shields.io/badge/react-18+-61dafb.svg)

---

## ✨ Features

- 📤 **Document Upload** - Upload PDF documents for processing
- 🔍 **Semantic Search** - Find relevant content using vector embeddings
- 💬 **AI Chat** - Ask questions about your documents
- 🎨 **Dark/Light Mode** - Toggle between themes
- 📊 **Multiple LLM Support** - OpenAI & HuggingFace models
- 🔧 **Configurable** - Customize embedding models, top-k results, and more
- 📱 **Responsive UI** - Works on desktop and mobile

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **FAISS** - Facebook AI Similarity Search for vector storage
- **Sentence Transformers** - Text embedding models
- **LangChain** - LLM orchestration
- **PyPDF** - PDF text extraction

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **Shadcn/ui** - UI component library
- **Framer Motion** - Animations
- **Zustand** - State management

---

## 📁 Project Structure

```
├── Backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── RAG/
│   │   ├── pdf_text.py      # PDF text extraction
│   │   ├── chunking.py      # Text chunking logic
│   │   ├── embed_store.py   # FAISS embedding storage
│   │   └── rag_answer.py    # RAG query & answer
│   ├── uploads/             # Uploaded documents
│   └── indexes/             # FAISS vector indexes
│
├── Frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── components/      # Reusable components
│   │   ├── layouts/         # Layout components
│   │   ├── lib/             # Utilities & API
│   │   └── hooks/           # Custom hooks
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or bun

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the Backend directory:

```env
# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key

# HuggingFace (optional)
HUGGINGFACE_API_TOKEN=your_huggingface_token
```

> **Note**: API keys can also be configured through the application's Config page.

### Supported Models

#### LLM Models
| Provider | Models |
|----------|--------|
| OpenAI | gpt-3.5-turbo, gpt-4, gpt-4-turbo |
| HuggingFace | mistralai/Mistral-7B-Instruct-v0.2, meta-llama/Llama-2-7b-chat-hf |

#### Embedding Models
| Model | Description |
|-------|-------------|
| sentence-transformers/all-MiniLM-L6-v2 | Fast, lightweight |
| sentence-transformers/all-mpnet-base-v2 | Balanced performance |
| BAAI/bge-small-en-v1.5 | High quality |

---

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/config` | Get available models and configuration |
| POST | `/upload` | Upload a PDF document |
| GET | `/documents` | List all uploaded documents |
| DELETE | `/documents/{id}` | Delete a document |
| POST | `/chat` | Chat with a document |

### Example: Chat Request

```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "your-document-id",
    "question": "What is this document about?",
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "api_key": "your-api-key",
    "top_k": 5
  }'
```

---

## 🎯 Usage

1. **Upload Document** - Go to Upload page and drag/drop a PDF
2. **Select Document** - Choose the document from the sidebar
3. **Configure Settings** - Set your API key and preferred model
4. **Start Chatting** - Ask questions about your document!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [FAISS](https://github.com/facebookresearch/faiss)
- [LangChain](https://www.langchain.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Sentence Transformers](https://www.sbert.net/)

---


