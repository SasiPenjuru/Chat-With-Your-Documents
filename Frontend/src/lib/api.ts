// API Service for RAG Backend Integration

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Types
export interface UploadResponse {
  document_id: string;
  filename: string;
  num_chunks: number;
  embedding_model: string;
  message: string;
}

export interface ChatRequest {
  document_id: string;
  query: string;
  top_k?: number;
  provider: string;
  llm_model: string;
  api_key: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
  model_used: string;
  provider: string;
}

export interface Document {
  document_id: string;
  filename: string;
  num_chunks: number;
  embedding_model: string;
}

export interface DocumentsResponse {
  documents: Document[];
}

export interface ConfigResponse {
  supported_providers: string[];
  embedding_models: { name: string; description: string }[];
  llm_models: {
    huggingface: { name: string; description: string }[];
    openai: { name: string; description: string }[];
  };
}

// API Functions

export async function getConfig(): Promise<ConfigResponse> {
  const response = await fetch(`${API_BASE_URL}/config`);
  if (!response.ok) {
    throw new Error("Failed to fetch configuration");
  }
  return response.json();
}

export async function uploadDocument(
  file: File,
  embeddingModel: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("embedding_model", embeddingModel);

  // Using XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error("Failed to parse response"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.detail || "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error occurred"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("POST", `${API_BASE_URL}/upload`);
    xhr.send(formData);
  });
}

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Chat request failed" }));
    throw new Error(error.detail || "Chat request failed");
  }

  return response.json();
}

export async function getDocuments(): Promise<DocumentsResponse> {
  const response = await fetch(`${API_BASE_URL}/documents`);
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json();
}

export async function deleteDocument(documentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Delete failed" }));
    throw new Error(error.detail || "Delete failed");
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
}
