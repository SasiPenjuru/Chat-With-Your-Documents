import os
import shutil
import uuid
import json
import faiss

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from RAG.pdf_text import extract_text_from_pdf
from RAG.chunking import chunk_text
from RAG.embed_store import embed_texts
from RAG.rag_answer import retrieve, generate_answer

app = FastAPI(title="RAG API", description="PDF upload and RAG-based chat API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
INDEX_DIR = "indexes"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(INDEX_DIR, exist_ok=True)

documents_store = {}  # In-memory document cache


# Request/Response Models
class ChatRequest(BaseModel):
    document_id: str
    query: str
    top_k: Optional[int] = 5
    provider: str
    llm_model: str
    api_key: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    model_used: str
    provider: str


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    num_chunks: int
    embedding_model: str
    message: str


class ConfigResponse(BaseModel):
    supported_providers: list[str]
    embedding_models: list[dict]
    llm_models: dict


@app.get("/")
async def root():
    return {"message": "RAG API is running", "docs": "/docs"}


@app.get("/config", response_model=ConfigResponse)
async def get_config():
    """Get available models and providers."""
    return ConfigResponse(
        supported_providers=["huggingface", "openai"],
        embedding_models=[
            {"name": "sentence-transformers/all-MiniLM-L6-v2", "description": "Fast, lightweight"},
            {"name": "sentence-transformers/all-mpnet-base-v2", "description": "Better quality"},
            {"name": "BAAI/bge-small-en-v1.5", "description": "High quality, small"},
            {"name": "BAAI/bge-base-en-v1.5", "description": "High quality, medium"},
        ],
        llm_models={
            "huggingface": [
                {"name": "Qwen/Qwen2.5-Coder-32B-Instruct", "description": "Good for code"},
                {"name": "meta-llama/Llama-3.2-3B-Instruct", "description": "Fast, lightweight"},
                {"name": "mistralai/Mistral-Nemo-Instruct-2407", "description": "High quality"},
                {"name": "microsoft/Phi-3.5-mini-instruct", "description": "Compact, efficient"},
            ],
            "openai": [
                {"name": "gpt-4o-mini", "description": "Fast, affordable"},
                {"name": "gpt-4o", "description": "Most capable"},
                {"name": "gpt-3.5-turbo", "description": "Legacy, fast"},
            ]
        }
    )


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...), embedding_model: str = Form(...)):
    """Upload PDF, extract text, chunk, and create embeddings."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    if not embedding_model or not embedding_model.strip():
        raise HTTPException(status_code=400, detail="Embedding model is required")
    
    embed_model = embedding_model.strip()
    document_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{document_id}.pdf")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")
    
    try:
        text = extract_text_from_pdf(file_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        chunks = chunk_text(text)
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not create chunks from PDF")
        
        index_path = os.path.join(INDEX_DIR, f"{document_id}.index")
        meta_path = os.path.join(INDEX_DIR, f"{document_id}_meta.json")
        
        vectors = embed_texts(chunks, model_name=embed_model)
        index = faiss.IndexFlatIP(vectors.shape[1])
        index.add(vectors)
        
        faiss.write_index(index, index_path)
        with open(meta_path, 'w', encoding='utf-8') as f:
            json.dump({"chunks": chunks, "embedding_model": embed_model}, f)
        
        documents_store[document_id] = {
            "filename": file.filename,
            "file_path": file_path,
            "index_path": index_path,
            "meta_path": meta_path,
            "chunks": chunks,
            "index": index,
            "embedding_model": embed_model
        }
        
        return UploadResponse(
            document_id=document_id,
            filename=file.filename,
            num_chunks=len(chunks),
            embedding_model=embed_model,
            message="Document uploaded and indexed successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {e}")


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with uploaded document using RAG."""
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    if not request.provider or request.provider not in ["huggingface", "openai"]:
        raise HTTPException(status_code=400, detail="Provider must be 'huggingface' or 'openai'")
    if not request.llm_model or not request.llm_model.strip():
        raise HTTPException(status_code=400, detail="LLM model is required")
    if not request.api_key or not request.api_key.strip():
        raise HTTPException(status_code=400, detail="API key is required")
    
    if request.document_id not in documents_store:
        index_path = os.path.join(INDEX_DIR, f"{request.document_id}.index")
        meta_path = os.path.join(INDEX_DIR, f"{request.document_id}_meta.json")
        
        if not os.path.exists(index_path) or not os.path.exists(meta_path):
            raise HTTPException(status_code=404, detail="Document not found")
        
        try:
            index = faiss.read_index(index_path)
            with open(meta_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            embed_model = metadata.get("embedding_model")
            if not embed_model:
                raise HTTPException(status_code=500, detail="Document missing embedding_model. Re-upload required.")
            
            documents_store[request.document_id] = {
                "chunks": metadata.get("chunks", []),
                "index": index,
                "embedding_model": embed_model
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load document: {e}")
    
    doc = documents_store[request.document_id]
    
    try:
        relevant_chunks = retrieve(
            request.query, doc["index"], doc["chunks"],
            top_k=request.top_k,
            embedding_model=doc["embedding_model"]
        )
        
        if not relevant_chunks:
            raise HTTPException(status_code=404, detail="No relevant content found")
        
        answer = generate_answer(
            request.query, relevant_chunks,
            provider=request.provider,
            llm_model=request.llm_model,
            api_key=request.api_key
        )
        
        return ChatResponse(
            answer=answer,
            sources=relevant_chunks,
            model_used=request.llm_model,
            provider=request.provider
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {e}")


@app.get("/documents")
async def list_documents():
    """List all uploaded documents."""
    return {"documents": [
        {
            "document_id": doc_id,
            "filename": data.get("filename", "Unknown"),
            "num_chunks": len(data.get("chunks", [])),
            "embedding_model": data.get("embedding_model", "Unknown")
        }
        for doc_id, data in documents_store.items()
    ]}


@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete document and its index."""
    if document_id not in documents_store:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = documents_store[document_id]
    for key in ["file_path", "index_path", "meta_path"]:
        path = doc.get(key)
        if path and os.path.exists(path):
            os.remove(path)
    
    del documents_store[document_id]
    return {"message": "Document deleted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)
