# RAG FAISS API

A FastAPI-based Retrieval-Augmented Generation (RAG) API that allows users to upload PDF documents, create embeddings, and chat with documents using configurable LLM providers.

## Features

- **PDF Upload & Processing**: Extract text, chunk, and create FAISS embeddings
- **Configurable Embedding Models**: Choose from multiple sentence-transformers models
- **Multi-Provider LLM Support**: HuggingFace Inference API and OpenAI
- **Vector Search**: FAISS-based similarity search for relevant context retrieval
- **REST API**: Clean FastAPI endpoints with Swagger documentation

## Project Structure

```
Backend/
├── main.py              # FastAPI application and endpoints
├── requirements.txt     # Python dependencies
├── README.md
├── uploads/             # Uploaded PDF files
├── indexes/             # FAISS indexes and metadata
└── RAG/
    ├── pdf_text.py      # PDF text extraction
    ├── chunking.py      # Text chunking with tiktoken
    ├── embed_store.py   # Embedding generation with sentence-transformers
    └── rag_answer.py    # Retrieval and answer generation
```

## Installation

```bash
# Clone the repository
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Running the Server

```bash
uvicorn main:app --reload
```

Server runs at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## API Endpoints

### GET `/`
Health check endpoint.

### GET `/config`
Get available models and providers.

**Response:**
```json
{
  "supported_providers": ["huggingface", "openai"],
  "embedding_models": [...],
  "llm_models": {...}
}
```

### POST `/upload`
Upload a PDF document and create embeddings.

**Request (Form Data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | PDF file |
| `embedding_model` | string | Yes | Embedding model name |

**Example:**
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@document.pdf" \
  -F "embedding_model=sentence-transformers/all-MiniLM-L6-v2"
```

**Response:**
```json
{
  "document_id": "uuid-string",
  "filename": "document.pdf",
  "num_chunks": 42,
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
  "message": "Document uploaded and indexed successfully"
}
```

### POST `/chat`
Chat with an uploaded document.

**Request Body:**
```json
{
  "document_id": "uuid-from-upload",
  "query": "What is this document about?",
  "top_k": 5,
  "provider": "huggingface",
  "llm_model": "Qwen/Qwen2.5-Coder-32B-Instruct",
  "api_key": "your-api-key"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `document_id` | string | Yes | Document ID from upload |
| `query` | string | Yes | Your question |
| `top_k` | int | No | Number of chunks to retrieve (default: 5) |
| `provider` | string | Yes | `huggingface` or `openai` |
| `llm_model` | string | Yes | LLM model name |
| `api_key` | string | Yes | API key for the provider |

**Response:**
```json
{
  "answer": "The document is about...",
  "sources": ["chunk1...", "chunk2..."],
  "model_used": "Qwen/Qwen2.5-Coder-32B-Instruct",
  "provider": "huggingface"
}
```

### GET `/documents`
List all uploaded documents.

### DELETE `/documents/{document_id}`
Delete a document and its index.

## Supported Models

### Embedding Models
| Model | Description |
|-------|-------------|
| `sentence-transformers/all-MiniLM-L6-v2` | Fast, lightweight |
| `sentence-transformers/all-mpnet-base-v2` | Better quality |
| `BAAI/bge-small-en-v1.5` | High quality, small |
| `BAAI/bge-base-en-v1.5` | High quality, medium |

### LLM Models

**HuggingFace:**
| Model | Description |
|-------|-------------|
| `Qwen/Qwen2.5-Coder-32B-Instruct` | Good for code |
| `meta-llama/Llama-3.2-3B-Instruct` | Fast, lightweight |
| `mistralai/Mistral-Nemo-Instruct-2407` | High quality |
| `microsoft/Phi-3.5-mini-instruct` | Compact, efficient |

**OpenAI:**
| Model | Description |
|-------|-------------|
| `gpt-4o-mini` | Fast, affordable |
| `gpt-4o` | Most capable |
| `gpt-3.5-turbo` | Legacy, fast |

## API Keys

### HuggingFace
Get your free token at: https://huggingface.co/settings/tokens

### OpenAI
Get your API key at: https://platform.openai.com/api-keys

## Example Usage

```python
import requests

# 1. Upload document
with open("document.pdf", "rb") as f:
    response = requests.post(
        "http://localhost:8000/upload",
        files={"file": f},
        data={"embedding_model": "sentence-transformers/all-MiniLM-L6-v2"}
    )
doc_id = response.json()["document_id"]

# 2. Chat with document
response = requests.post(
    "http://localhost:8000/chat",
    json={
        "document_id": doc_id,
        "query": "Summarize this document",
        "provider": "huggingface",
        "llm_model": "Qwen/Qwen2.5-Coder-32B-Instruct",
        "api_key": "hf_xxxxxxxxxxxxx"
    }
)
print(response.json()["answer"])
```

## Tech Stack

- **FastAPI** - Web framework
- **FAISS** - Vector similarity search
- **Sentence-Transformers** - Embedding models
- **HuggingFace Hub** - LLM inference
- **OpenAI** - LLM inference
- **PyPDF** - PDF text extraction
- **Tiktoken** - Text tokenization

## License

MIT
