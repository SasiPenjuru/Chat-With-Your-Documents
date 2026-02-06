# RAG FAISS - API Integration Guide

## Overview

This document describes the API integration between the FastAPI backend and React frontend.

## Backend API Endpoints

The backend runs on `http://localhost:8000` by default.

### 1. Health Check
```
GET /
```
Returns API status.

### 2. Configuration
```
GET /config
```
Returns available providers, embedding models, and LLM models.

**Response:**
```json
{
  "supported_providers": ["huggingface", "openai"],
  "embedding_models": [
    {"name": "sentence-transformers/all-MiniLM-L6-v2", "description": "Fast, lightweight"},
    ...
  ],
  "llm_models": {
    "huggingface": [...],
    "openai": [...]
  }
}
```

### 3. Upload Document
```
POST /upload
```
Upload a PDF document and create embeddings.

**Form Data:**
- `file`: PDF file
- `embedding_model`: Name of the embedding model

**Response:**
```json
{
  "document_id": "uuid",
  "filename": "document.pdf",
  "num_chunks": 42,
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
  "message": "Document uploaded and indexed successfully"
}
```

### 4. Chat with Document
```
POST /chat
```
Send a query to chat with an uploaded document.

**Request Body:**
```json
{
  "document_id": "uuid",
  "query": "What is this document about?",
  "top_k": 5,
  "provider": "openai",
  "llm_model": "gpt-4o-mini",
  "api_key": "your-api-key"
}
```

**Response:**
```json
{
  "answer": "Based on the document...",
  "sources": ["relevant chunk 1", "relevant chunk 2"],
  "model_used": "gpt-4o-mini",
  "provider": "openai"
}
```

### 5. List Documents
```
GET /documents
```
Returns all uploaded documents.

### 6. Delete Document
```
DELETE /documents/{document_id}
```
Delete a document and its index.

## Frontend Configuration

### Environment Variables

Create a `.env` file in the Frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

### State Management

The frontend uses **Zustand** for state management with persistence to localStorage:

- **Documents**: List of uploaded documents
- **Selected Document**: Currently active document for chat
- **Config**: API keys and default settings

### API Service (`src/lib/api.ts`)

All API calls are centralized in the API service:

```typescript
import { getConfig, uploadDocument, chat, getDocuments, deleteDocument } from "@/lib/api";
```

### Store (`src/lib/store.ts`)

Access global state using the Zustand store:

```typescript
import { useAppStore } from "@/lib/store";

const documents = useAppStore((state) => state.documents);
const selectedDocument = useAppStore((state) => state.selectedDocument);
const config = useAppStore((state) => state.config);
```

## Running the Application

### Backend

```bash
cd Backend
pip install -r requirements.txt
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Features

1. **Upload Page**: Upload PDF documents with selectable embedding models
2. **Documents Page**: View, manage, and delete uploaded documents
3. **Chat Interface**: Chat with documents using RAG
4. **Config Page**: Configure API keys and default settings

## API Keys Required

- **OpenAI**: Get from https://platform.openai.com/api-keys
- **HuggingFace**: Get from https://huggingface.co/settings/tokens
